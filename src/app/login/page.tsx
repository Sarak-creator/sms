'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSchool } from '@/lib/stateContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  Check,
  RefreshCw,
  X,
  Sparkles,
  Building2,
  HelpCircle,
  KeyRound,
  FileCheck2,
  ChevronRight,
  Globe2,
  Copy,
  ExternalLink,
  Layers,
  Trash2,
} from 'lucide-react';
import { DatabaseConfig, InitialSchoolSetupForm } from '@/lib/supabase/types';
import {
  getStoredDatabaseConfig,
  saveStoredDatabaseConfig,
  isSupabaseConfigured,
  fetchServerDatabaseConfig,
  generateShareableDatabaseLink,
  getSavedDatabaseProfiles,
  saveDatabaseProfile,
  removeDatabaseProfile,
  DatabaseProfile,
} from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const { school, updateSchool, currentUser, login, addUser, language, setLanguage, t, refreshFromSupabase } = useSchool();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Database Connection & Setup Wizard States
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [dbModalTab, setDbModalTab] = useState<'CONNECT' | 'PROFILES' | 'SHARE'>('CONNECT');
  const [savedProfiles, setSavedProfiles] = useState<DatabaseProfile[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [dbWizardStep, setDbWizardStep] = useState<'CONNECT_DB' | 'CREATING_TABLES' | 'REGISTER_FORM'>('CONNECT_DB');
  const [dbConfig, setDbConfig] = useState<DatabaseConfig>({
    databaseUrl: '',
    directUrl: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    isConnected: false,
  });

  const [dbLoading, setDbLoading] = useState(false);
  const [dbStatusMsg, setDbStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Initial School & Principal Setup Form for "Register"
  const [schoolForm, setSchoolForm] = useState<InitialSchoolSetupForm>({
    schoolNameKhmer: '',
    schoolNameEnglish: '',
    schoolCode: '',
    province: 'រាជធានីភ្នំពេញ',
    district: 'ខណ្ឌដូនពេញ',
    academicYear: '២០២៤ - ២០២៥',
    principalKhmerName: '',
    principalLatinName: '',
    principalPhone: '',
    principalEmail: '',
    principalUsername: 'principal',
    principalPassword: '',
  });

  // Load saved database configuration on mount (LocalStorage or Server Domain Discovery)
  useEffect(() => {
    const initDb = async () => {
      let saved = getStoredDatabaseConfig();
      if (!saved || !saved.supabaseUrl) {
        saved = await fetchServerDatabaseConfig();
      }
      if (saved && saved.supabaseUrl) {
        setDbConfig(saved);
        refreshFromSupabase();
      }
      setSavedProfiles(getSavedDatabaseProfiles());
    };
    initDb();
  }, []);

  const handleSwitchProfile = async (profile: DatabaseProfile) => {
    saveStoredDatabaseConfig(profile.config);
    setDbConfig(profile.config);
    setDbStatusMsg({
      type: 'success',
      text: language === 'km' ? `បានប្តូរទៅកាន់ Database "${profile.name}" ដោយជោគជ័យ!` : `Switched to "${profile.name}" successfully!`,
    });
    await refreshFromSupabase();
    setTimeout(() => {
      setIsDbModalOpen(false);
    }, 800);
  };

  const handleDeleteProfile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeDatabaseProfile(id);
    setSavedProfiles(getSavedDatabaseProfiles());
  };

  const handleCopyLink = () => {
    if (!dbConfig.supabaseUrl) return;
    const link = generateShareableDatabaseLink(dbConfig, school.nameKhmer || 'MoEYS High School');
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Handle Form Submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage(
        language === 'km'
          ? 'សូមបញ្ចូលឈ្មោះគណនី, អ៊ីមែល ឬអត្តលេខគ្រូ!'
          : 'Please enter username, email or Civil Servant ID!'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);

      if (res.success) {
        setSuccessToast(language === 'km' ? 'ចូលប្រព័ន្ធបានជោគជ័យ!' : 'Signed in successfully!');
        setTimeout(() => {
          router.push('/');
        }, 800);
      } else {
        if (res.error === 'ACCOUNT_SUSPENDED') {
          setErrorMessage(t('loginAccountInactive'));
        } else if (res.error === 'WRONG_PASSWORD') {
          setErrorMessage(t('loginFailedWrongPassword'));
        } else {
          setErrorMessage(
            language === 'km'
              ? 'រកមិនឃើញគណនីនេះទេ! សូមពិនិត្យឈ្មោះគណនី ឬចុច Connect Database ដើម្បីចុះឈ្មោះ។'
              : 'Account not found! Please check username or click Connect Database to register.'
          );
        }
      }
    }, 400);
  };

  // -------------------------------------------------------------
  // STEP 1: CONNECT NEW DATABASE & AUTO CREATE TABLES
  // -------------------------------------------------------------
  const handleConnectAndCreateTables = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbConfig.supabaseUrl.trim() || !dbConfig.supabaseAnonKey.trim()) {
      setDbStatusMsg({
        type: 'error',
        text: language === 'km'
          ? 'សូមបំពេញ NEXT_PUBLIC_SUPABASE_URL និង NEXT_PUBLIC_SUPABASE_ANON_KEY ជាមុនសិន!'
          : 'Please enter NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first!',
      });
      return;
    }

    setDbLoading(true);
    setDbStatusMsg({
      type: 'info',
      text: language === 'km'
        ? 'កំពុងភ្ជាប់ទៅ Supabase និងបង្កើត Tables ទាំងអស់ដោយស្វ័យប្រវត្តិ...'
        : 'Connecting to Supabase and automatically creating all tables...',
    });

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_TABLES',
          config: dbConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create tables in Supabase');
      }

      // Save database configuration
      const updatedConfig: DatabaseConfig = {
        ...dbConfig,
        isConnected: true,
        isInitialized: true,
        connectedAt: new Date().toISOString(),
      };

      setDbConfig(updatedConfig);
      saveStoredDatabaseConfig(updatedConfig);

      setDbStatusMsg({
        type: 'success',
        text: language === 'km'
          ? 'បង្កើត Tables ក្នុង Supabase ជោគជ័យ ១០០%! សូមបំពេញទម្រង់ចុះឈ្មោះសាលារៀន និងគណនីនាយកសាលា។'
          : 'All tables created in Supabase successfully! Please complete School and Principal registration.',
      });

      // Automatically transition to Register Form
      setTimeout(() => {
        setDbWizardStep('REGISTER_FORM');
      }, 1000);
    } catch (err: any) {
      setDbStatusMsg({
        type: 'error',
        text: err?.message || 'Database connection/table creation error',
      });
    } finally {
      setDbLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 2: SUBMIT REGISTRATION FORM (SAVE TO SUPABASE & RETURN TO LOGIN)
  // -------------------------------------------------------------
  const handleRegisterSchoolAndPrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    setDbLoading(true);
    setDbStatusMsg(null);

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REGISTER_SCHOOL',
          config: dbConfig,
          schoolData: schoolForm,
          principalData: schoolForm,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to register school and principal');
      }

      // Update school and add principal user in active local state
      updateSchool({
        nameKhmer: schoolForm.schoolNameKhmer,
        nameEnglish: schoolForm.schoolNameEnglish,
        code: schoolForm.schoolCode,
        province: schoolForm.province,
        district: schoolForm.district,
        principalName: schoolForm.principalKhmerName,
        phone: schoolForm.principalPhone,
        email: schoolForm.principalEmail,
      });

      if (data.principalUser) {
        addUser(data.principalUser);
      }

      // Reload fresh data from Supabase
      await refreshFromSupabase();

      // Prefill login form with registered username and password
      setIdentifier(schoolForm.principalUsername);
      setPassword(schoolForm.principalPassword);

      setSuccessToast(
        language === 'km'
          ? 'ចុះឈ្មោះសាលារៀន និងគណនីនាយកសាលាបានជោគជ័យ! សូមចុច "ចូលប្រព័ន្ធ" ដើម្បីចាប់ផ្តើម។'
          : 'School & Principal account registered successfully! Click "Sign In" to start.'
      );

      // Close wizard and return to login page
      setIsDbModalOpen(false);
      setDbWizardStep('CONNECT_DB');
    } catch (err: any) {
      setDbStatusMsg({
        type: 'error',
        text: err?.message || 'Registration error',
      });
    } finally {
      setDbLoading(false);
    }
  };

  // -------------------------------------------------------------
  // STEP 3: CONNECT EXISTING (OLD) DATABASE
  // -------------------------------------------------------------
  const handleConnectOldDatabase = async () => {
    if (!dbConfig.supabaseUrl.trim() || !dbConfig.supabaseAnonKey.trim()) {
      setDbStatusMsg({
        type: 'error',
        text: language === 'km'
          ? 'សូមបំពេញ NEXT_PUBLIC_SUPABASE_URL និង NEXT_PUBLIC_SUPABASE_ANON_KEY!'
          : 'Please enter NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY!',
      });
      return;
    }

    setDbLoading(true);
    setDbStatusMsg(null);

    try {
      const res = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONNECT_OLD_DATABASE',
          config: dbConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect to existing database');
      }

      const updatedConfig: DatabaseConfig = {
        ...dbConfig,
        isConnected: true,
        connectedAt: new Date().toISOString(),
      };

      setDbConfig(updatedConfig);
      saveStoredDatabaseConfig(updatedConfig);

      if (data.existingSchool) {
        updateSchool({
          nameKhmer: data.existingSchool.name_khmer,
          nameEnglish: data.existingSchool.name_english,
          code: data.existingSchool.code,
          province: data.existingSchool.province,
          district: data.existingSchool.district,
          principalName: data.existingSchool.principal_name,
        });
      }

      await refreshFromSupabase();

      setSuccessToast(
        language === 'km'
          ? 'បានតភ្ជាប់ទៅកាន់ Database ចាស់ដោយជោគជ័យ!'
          : 'Connected to existing database successfully!'
      );

      setTimeout(() => {
        setIsDbModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setDbStatusMsg({
        type: 'error',
        text: err?.message || 'Connection error',
      });
    } finally {
      setDbLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-between p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background Lighting Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Ministry branding & Database Connection + Language switcher */}
      <header className="flex items-center justify-between max-w-5xl w-full mx-auto z-10 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30">
            {language === 'km' ? 'អ.យ.ក' : 'MoEYS'}
          </div>
          <div>
            <div className="text-white font-bold text-xs sm:text-sm tracking-tight">
              {t('ministryName')}
            </div>
            <div className="text-blue-300/80 text-[11px] font-medium truncate">
              {language === 'en' ? (school.nameEnglish || 'Cambodian Public High School System') : (school.nameKhmer || 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា')}
            </div>
          </div>
        </div>

        {/* Right Controls: Database Connect Button & Language Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Database Connection Button */}
          <button
            type="button"
            onClick={() => {
              setIsDbModalOpen(true);
              setDbWizardStep('CONNECT_DB');
              setDbStatusMsg(null);
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
              dbConfig.isConnected
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {language === 'km' ? 'ភ្ជាប់ Supabase Database' : 'Connect Supabase'}
            </span>
            {dbConfig.isConnected ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 backdrop-blur-md">
            <button
              onClick={() => setLanguage('km')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'km'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇰🇭 ខ្មែរ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl w-full mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Col: Main Login Card */}
        <div className="lg:col-span-7 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-6">
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-3">
              <KeyRound className="w-3.5 h-3.5" />
              <span>MoEYS Digital Authentication</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">
              {t('loginTitle')}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Success Toast Banner */}
          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email / ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('usernameOrEmailOrId')}</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ឧ. principal, ឬ អ៊ីមែល"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('password')}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                >
                  {t('forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Database Status */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span>{t('rememberMe')}</span>
              </label>

              <div className="flex items-center gap-2">
                {dbConfig.isConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsDbModalOpen(true);
                      setDbModalTab('SHARE');
                    }}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-1 font-bold cursor-pointer border border-emerald-200 transition-colors"
                    title={language === 'km' ? 'ចម្លងតំណភ្ជាប់ចូលសាលាសម្រាប់ឧបករណ៍ផ្សេង' : 'Share 1-Click login link for other devices'}
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{language === 'km' ? 'Link ចូលសាលា' : 'Share Link'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsDbModalOpen(true);
                    setDbModalTab(savedProfiles.length > 1 ? 'PROFILES' : 'CONNECT');
                    setDbWizardStep('CONNECT_DB');
                  }}
                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Database className="w-3 h-3 text-blue-500" />
                  <span>{dbConfig.isConnected ? 'Supabase Connected' : 'Setup Database'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('signInButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Direct link to register or dashboard */}
          <div className="text-center pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setIsDbModalOpen(true);
                setDbWizardStep('CONNECT_DB');
              }}
              className="hover:text-blue-600 font-medium hover:underline inline-flex items-center gap-1 text-blue-600 cursor-pointer"
            >
              <span>+ {language === 'km' ? 'តភ្ជាប់ Database & ចុះឈ្មោះសាលាថ្មី' : 'Connect Database & Register School'}</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">MoEYS-SMS v1.0</span>
          </div>
        </div>

        {/* Right Col: System Features & Cloud Database Architecture Banner */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/80 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {language === 'km' ? 'ប្រព័ន្ធពពក Supabase' : 'Supabase Cloud Database'}
                </h3>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                dbConfig.isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {dbConfig.isConnected ? 'LIVE SYNC' : 'OFFLINE'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'km'
                ? 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជាត្រូវបានបង្កើតឡើងដោយតភ្ជាប់ទៅកាន់ Supabase PostgreSQL Live Cloud Database ១០០% ស្របតាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា។'
                : 'Cambodian Public High School Management System connects 100% directly to Supabase PostgreSQL Live Database adhering to MoEYS standards.'}
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'km' ? 'បង្កើត Tables ក្នុង Supabase ដោយស្វ័យប្រវត្តិ' : 'Automated Supabase table creation'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'km' ? 'គ្រប់គ្រងទិន្នន័យសិស្ស ពិន្ទុ និងអវត្តមាន' : 'Student, Gradebook & Attendance sync'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{language === 'km' ? 'សិទ្ធិ និងសុវត្ថិភាពទិន្នន័យ (Row Level Security)' : 'Row Level Security & RBAC control'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsDbModalOpen(true);
                setDbWizardStep('CONNECT_DB');
              }}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'កំណត់ការតភ្ជាប់ Database' : 'Configure Database'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-3 z-10">
        © {new Date().getFullYear()} {t('ministryName')} • {language === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា' : 'Cambodian High School Management System'}
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUPABASE DATABASE CONNECTION & REGISTRATION WIZARD     */}
      {/* ------------------------------------------------------------- */}
      {isDbModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                    <span>
                      {dbWizardStep === 'CONNECT_DB'
                        ? (language === 'km' ? 'ការកំណត់ភ្ជាប់ Supabase Database' : 'Connect Supabase Database')
                        : (language === 'km' ? 'ចុះឈ្មោះសាលារៀន និងគណនីនាយកសាលា' : 'School & Principal Registration')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/30 text-blue-200 font-mono border border-blue-400/30">
                      PostgreSQL
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {dbWizardStep === 'CONNECT_DB'
                      ? (language === 'km' ? 'ជំហានទី ១៖ បង្កើត Tables និងរក្សាទុក Configuration ក្នុង Database Table (No .env)' : 'Step 1: Auto-create tables & save configuration directly in Database Table')
                      : (language === 'km' ? 'ជំហានទី ២៖ ចុះឈ្មោះព័ត៌មានសាលារៀន និងបង្កើតគណនី Admin' : 'Step 2: Register school profile and principal account')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDbModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Notification Banner */}
            {dbStatusMsg && (
              <div
                className={`p-4 text-xs font-bold flex items-center gap-2 border-b ${
                  dbStatusMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : dbStatusMsg.type === 'error'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                {dbStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : dbStatusMsg.type === 'error' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 animate-spin" />
                )}
                <span>{dbStatusMsg.text}</span>
              </div>
            )}

            {/* Navigation Tabs for Database Management */}
            <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setDbModalTab('CONNECT')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  dbModalTab === 'CONNECT'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'តភ្ជាប់ថ្មី / ចាស់' : 'Connect / New DB'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSavedProfiles(getSavedDatabaseProfiles());
                  setDbModalTab('PROFILES');
                }}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  dbModalTab === 'PROFILES'
                    ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>
                  {language === 'km' ? 'បញ្ជី Database' : 'Database Profiles'}
                  {savedProfiles.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                      {savedProfiles.length}
                    </span>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDbModalTab('SHARE')}
                className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                  dbModalTab === 'SHARE'
                    ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'តំណភ្ជាប់ចូលសាលា (1-Click)' : '1-Click Share'}</span>
              </button>
            </div>

            {/* TAB 1: CONNECT NEW OR OLD DATABASE */}
            {dbModalTab === 'CONNECT' && (
              <>
                {/* ----------------------------------------------------------- */}
                {/* STEP 1: CONNECT NEW DATABASE & CREATE TABLES                */}
                {/* ----------------------------------------------------------- */}
                {dbWizardStep === 'CONNECT_DB' && (
                  <form onSubmit={handleConnectAndCreateTables} className="p-6 sm:p-7 space-y-5">
                <div className="space-y-4">
                  {/* Field 1: DATABASE_URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>DATABASE_URL (Connection Pooler)</span>
                      <span className="text-[10px] text-blue-600 font-semibold">Port 6543 / 5432</span>
                    </label>
                    <input
                      type="text"
                      placeholder="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
                      value={dbConfig.databaseUrl || ''}
                      onChange={(e) => setDbConfig({ ...dbConfig, databaseUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field 2: DIRECT_URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>DIRECT_URL (Direct Connection)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Port 5432</span>
                    </label>
                    <input
                      type="text"
                      placeholder="postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
                      value={dbConfig.directUrl || ''}
                      onChange={(e) => setDbConfig({ ...dbConfig, directUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Field 3: NEXT_PUBLIC_SUPABASE_URL */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>
                        NEXT_PUBLIC_SUPABASE_URL <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-rose-500 font-semibold">Required</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                      value={dbConfig.supabaseUrl}
                      onChange={(e) => setDbConfig({ ...dbConfig, supabaseUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Field 4: NEXT_PUBLIC_SUPABASE_ANON_KEY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>
                        NEXT_PUBLIC_SUPABASE_ANON_KEY <span className="text-rose-500">*</span>
                      </span>
                      <span className="text-[10px] text-rose-500 font-semibold">Required</span>
                    </label>
                    <input
                      type="text"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={dbConfig.supabaseAnonKey}
                      onChange={(e) => setDbConfig({ ...dbConfig, supabaseAnonKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Field 5: SUPABASE_SERVICE_ROLE_KEY */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>SUPABASE_SERVICE_ROLE_KEY</span>
                      <span className="text-[10px] text-amber-600 font-semibold">Admin Secret Key</span>
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={dbConfig.supabaseServiceRoleKey || ''}
                      onChange={(e) => setDbConfig({ ...dbConfig, supabaseServiceRoleKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Two Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                  {/* Connect New Database (Auto Create Tables) */}
                  <button
                    type="submit"
                    disabled={dbLoading}
                    className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {dbLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>{language === 'km' ? 'Connect New Database' : 'Connect New Database'}</span>
                      </>
                    )}
                  </button>

                  {/* Connect Old Database */}
                  <button
                    type="button"
                    onClick={handleConnectOldDatabase}
                    disabled={dbLoading}
                    className="w-full sm:w-1/2 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {dbLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Server className="w-4 h-4 text-emerald-400" />
                        <span>{language === 'km' ? 'Connect Old Database' : 'Connect Old Database'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ----------------------------------------------------------- */}
            {/* STEP 2: REGISTRATION FORM (SCHOOL & PRINCIPAL ADMIN)        */}
            {/* ----------------------------------------------------------- */}
            {dbWizardStep === 'REGISTER_FORM' && (
              <form onSubmit={handleRegisterSchoolAndPrincipal} className="p-6 sm:p-7 space-y-5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'km' ? 'Tables ត្រូវបានបង្កើតជោគជ័យ! សូមចុះឈ្មោះសាលារៀន' : 'Tables Created! Register Your School'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    {language === 'km'
                      ? 'ទិន្នន័យទាំងអស់នឹងត្រូវរក្សាទុកក្នុង Supabase ដោយផ្ទាល់។ ក្រោយពេលចុះឈ្មោះជោគជ័យ ប្រព័ន្ធនឹងបង្វែរមកទំព័រ Login វិញ។'
                      : 'All data will be saved directly into Supabase. You will return to the Login page upon completion.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* School Name Khmer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ឈ្មោះសាលា (ភាសាខ្មែរ)' : 'School Name (Khmer)'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ឧ. វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ"
                      value={schoolForm.schoolNameKhmer}
                      onChange={(e) => setSchoolForm({ ...schoolForm, schoolNameKhmer: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* School Name English */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ឈ្មោះសាលា (អង់គ្លេស)' : 'School Name (English)'}
                    </label>
                    <input
                      type="text"
                      placeholder="Hun Sen Wat Phnom High School"
                      value={schoolForm.schoolNameEnglish}
                      onChange={(e) => setSchoolForm({ ...schoolForm, schoolNameEnglish: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* School Code */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'លេខកូដសាលា (EMIS Code)' : 'School Code'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="SCH-KH-120101"
                      value={schoolForm.schoolCode}
                      onChange={(e) => setSchoolForm({ ...schoolForm, schoolCode: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Academic Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ឆ្នាំសិក្សា' : 'Academic Year'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="២០២៤ - ២០២៥"
                      value={schoolForm.academicYear}
                      onChange={(e) => setSchoolForm({ ...schoolForm, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Province */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'រាជធានី / ខេត្ត' : 'Province'}
                    </label>
                    <input
                      type="text"
                      placeholder="រាជធានីភ្នំពេញ"
                      value={schoolForm.province}
                      onChange={(e) => setSchoolForm({ ...schoolForm, province: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ក្រុង / ស្រុក / ខណ្ឌ' : 'District'}
                    </label>
                    <input
                      type="text"
                      placeholder="ខណ្ឌដូនពេញ"
                      value={schoolForm.district}
                      onChange={(e) => setSchoolForm({ ...schoolForm, district: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Principal Khmer Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'ឈ្មោះនាយកសាលា' : 'Principal Name (Khmer)'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="លោក ឈួន ម៉េងហ៊ាង"
                      value={schoolForm.principalKhmerName}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalKhmerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Principal Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      {language === 'km' ? 'លេខទូរស័ព្ទ' : 'Phone'}
                    </label>
                    <input
                      type="text"
                      placeholder="012 345 678"
                      value={schoolForm.principalPhone}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Principal Username for Login */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'km' ? 'ឈ្មោះគណនី Login (Username)' : 'Login Username'} <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="text"
                      placeholder="principal"
                      value={schoolForm.principalUsername}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalUsername: e.target.value })}
                      className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-xl text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Principal Password for Login */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'km' ? 'ពាក្យសម្ងាត់ Login (Password)' : 'Login Password'} <span className="text-rose-500">*</span></span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={schoolForm.principalPassword}
                      onChange={(e) => setSchoolForm({ ...schoolForm, principalPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-blue-50/50 border border-blue-300 rounded-xl text-xs font-bold text-blue-950 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Wizard Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setDbWizardStep('CONNECT_DB')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    ← {language === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
                  </button>

                  <button
                    type="submit"
                    disabled={dbLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {dbLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>{language === 'km' ? 'ចុះឈ្មោះ និងត្រឡប់ទៅ Login' : 'Register & Go to Login'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
              </>
            )}

            {/* TAB 2: DATABASE PROFILES (SWITCH BETWEEN DATABASES) */}
            {dbModalTab === 'PROFILES' && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      {language === 'km' ? 'Database ដែលបានរក្សាទុក (ប្តូរបានភ្លាមៗ)' : 'Saved Database Profiles (Instant Switch)'}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {language === 'km'
                        ? 'លោកអ្នកអាចប្តូរ Database ទៅកាន់សាលា ឬ Database ផ្សេងទៀតបានដោយគ្រាន់តែចុច Switch'
                        : 'Switch between school databases instantly without re-entering credentials.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDbModalTab('CONNECT');
                      setDbWizardStep('CONNECT_DB');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 cursor-pointer flex items-center gap-1"
                  >
                    + {language === 'km' ? 'តភ្ជាប់ថ្មី' : 'New DB'}
                  </button>
                </div>

                {savedProfiles.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <Database className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                    <p>{language === 'km' ? 'មិនទាន់មាន Database ផ្សេងទៀតត្រូវបានរក្សាទុកនៅឡើយទេ។' : 'No saved database profiles yet.'}</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {savedProfiles.map((p) => {
                      const isCurrent = dbConfig.supabaseUrl === p.config.supabaseUrl;
                      let host = '';
                      try {
                        host = new URL(p.config.supabaseUrl).hostname;
                      } catch {
                        host = p.config.supabaseUrl;
                      }

                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-400'
                              : 'bg-white hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent ? 'bg-blue-600 text-white font-bold' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Database className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 truncate">{p.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                    {language === 'km' ? 'កំពុងប្រើ' : 'Active'}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 truncate">{host}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {!isCurrent ? (
                              <button
                                type="button"
                                onClick={() => handleSwitchProfile(p)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                {language === 'km' ? 'ប្តូរប្រើ' : 'Switch'}
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{language === 'km' ? 'បច្ចុប្បន្ន' : 'Current'}</span>
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => handleDeleteProfile(e, p.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: 1-CLICK SHAREABLE LINK (NO VERCEL ENV) */}
            {dbModalTab === 'SHARE' && (
              <div className="p-6 space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-2">
                  <div className="font-bold flex items-center gap-2 text-emerald-900 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'km' ? 'តំណភ្ជាប់ Auto-Connect (មិនចាំបាច់ប្រើ Vercel Env)' : '1-Click Auto-Connect Link (Zero Vercel Env)'}</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {language === 'km'
                      ? 'ដោយសារលោកអ្នកផ្លាស់ប្ដូរ Database ញឹកញាប់ លោកអ្នកមិនបាច់ចូលទៅកែ .env ក្នុង Vercel ទេ។ គ្រាន់តែ Copy Link ខាងក្រោមនេះ ផ្ញើទៅកាន់លោកគ្រូអ្នកគ្រូ ឬបើកលើទូរសព្ទ/កុំព្យូទ័រថ្មី នោះ Database នឹងភ្ជាប់ដោយស្វ័យប្រវត្តិតែម្ដង!'
                      : 'Since you change databases frequently, you do not need to configure Vercel env variables. Simply share the 1-click link below to teachers or open it on any device to automatically connect!'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>{language === 'km' ? 'តំណភ្ជាប់ចូលសាលារៀនរបស់អ្នក៖' : 'Your 1-Click School Access Link:'}</span>
                    <span className="text-[10px] text-emerald-600 font-mono font-bold">Encrypted Config</span>
                  </label>
                  <div className="p-3 bg-slate-900 rounded-2xl text-slate-200 font-mono text-[11px] break-all select-all border border-slate-800 max-h-24 overflow-y-auto">
                    {dbConfig.supabaseUrl ? (
                      generateShareableDatabaseLink(dbConfig, school.nameKhmer || 'MoEYS High School')
                    ) : (
                      <span className="text-slate-500">{language === 'km' ? 'សូមតភ្ជាប់ Database ជាមុនសិន' : 'Please connect a database first'}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    disabled={!dbConfig.supabaseUrl}
                    className={`w-full sm:w-1/2 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                      copiedLink
                        ? 'bg-emerald-600 text-white shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>{language === 'km' ? 'បានចម្លងជោគជ័យ!' : 'Copied to Clipboard!'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{language === 'km' ? 'ចម្លងតំណភ្ជាប់ (Copy Link)' : 'Copy 1-Click Link'}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={dbConfig.supabaseUrl ? generateShareableDatabaseLink(dbConfig, school.nameKhmer || 'MoEYS High School') : '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-1/2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'សាកល្បងបើកក្នុង Tab ថ្មី' : 'Test in New Tab'}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: FORGOT PASSWORD */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                {t('forgotPassword')}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {language === 'km'
                  ? 'សូមទំនាក់ទំនងមកកាន់ការិយាល័យសិក្សា ឬនាយកដ្ឋាន IT ដើម្បីទទួលបានការកំណត់ពាក្យសម្ងាត់ឡើងវិញ។'
                  : 'Please contact the Academic Office or IT Department to reset your account password.'}
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-slate-800">
                {language === 'km' ? 'ព័ត៌មានទំនាក់ទំនងការិយាល័យសិក្សា៖' : 'Academic Office Contact:'}
              </div>
              <div>• {language === 'km' ? 'ទូរស័ព្ទ៖' : 'Phone:'} 023 724 118 / 012 889 901</div>
              <div>• {language === 'km' ? 'អ៊ីមែល៖' : 'Email:'} info@school.moeys.gov.kh</div>
            </div>
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {language === 'km' ? 'យល់ព្រម / បិទ' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
