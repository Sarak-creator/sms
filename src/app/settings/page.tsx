'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/stateContext';
import {
  Settings,
  School,
  Calculator,
  Clock,
  Globe,
  Database,
  Save,
  CheckCircle2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  Award,
  AlertTriangle,
  Info,
  Sliders,
  Check,
  Star,
  Plus,
  Pencil,
  ArrowRight,
  XCircle,
  CalendarCheck,
  CalendarX,
  Palette,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { ALL_COMPETENCY_COLUMNS, MONTHLY_SUBJECT_GROUPS, MONTHLY_ACADEMIC_MONTHS, ALL_CALENDAR_MONTHS, AcademicMonthDef } from '@/lib/monthlyGradebookData';
import { COLOR_PALETTES } from '@/lib/theme';
import { AccessDenied } from '@/components/AccessDenied';

export default function SettingsPage() {
  const {
    school,
    updateSchool,
    academicMonths,
    updateAcademicMonth,
    setMonthSemester,
    toggleMonthExamStatus,
    setMonthExamStatus,
    setAcademicMonths,
    classes,
    teachers,
    students,
    specializations,
    chapters,
    language,
    setLanguage,
    t,
    themeMode,
    setThemeMode,
    colorPalette,
    setColorPalette,
    exportSystemData,
    importSystemData,
    resetToDefaults,
    hasPermission,
    canAccessRoute,
    clearAllTestData,
    isSupabaseConnected,
    refreshFromSupabase,
  } = useSchool();

  if (!canAccessRoute('/settings') && !hasPermission('canEditSchoolInfo')) {
    return <AccessDenied />;
  }

  // Active Tab: 'SCHOOL_PROFILE' | 'GRADING' | 'SCHEDULES' | 'PREFERENCES' | 'BACKUP'
  const [activeTab, setActiveTab] = useState<
    'SCHOOL_PROFILE' | 'GRADING' | 'SCHEDULES' | 'PREFERENCES' | 'BACKUP'
  >('SCHOOL_PROFILE');

  // Form state for school profile
  const [formData, setFormData] = useState({
    nameKhmer: school.nameKhmer || '',
    nameEnglish: school.nameEnglish || '',
    code: school.code || '',
    province: school.province || '',
    district: school.district || '',
    principalName: school.principalName || '',
    academicYear: school.academicYear || '',
    phone: school.phone || '023 724 118',
    email: school.email || 'info@watphnom-hs.moeys.gov.kh',
    address: school.address || 'ផ្លូវលេខ ៩២ សង្កាត់វត្តភ្នំ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ',
  });

  // Settings preferences from school.settings in Supabase
  const [defaultDivisor, setDefaultDivisor] = useState<number>(school.settings?.defaultDivisor ?? 21);
  const [passingThreshold, setPassingThreshold] = useState<number>(school.settings?.passingThreshold ?? 50);
  const [autoCalculateRank, setAutoCalculateRank] = useState<boolean>(school.settings?.autoCalculateRank ?? true);
  const [autoSaveAlert, setAutoSaveAlert] = useState<boolean>(school.settings?.autoSaveAlert ?? true);

  // UI Toasts & Modals
  const [saveToast, setSaveToast] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearTestModalOpen, setClearTestModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchool({
      ...formData,
      settings: {
        ...school.settings,
        defaultDivisor,
        passingThreshold,
        autoCalculateRank,
        autoSaveAlert,
        academicMonths,
      },
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSavePreferences = () => {
    updateSchool({
      ...school,
      ...formData,
      settings: {
        ...school.settings,
        defaultDivisor,
        passingThreshold,
        autoCalculateRank,
        autoSaveAlert,
        academicMonths,
        themeMode,
        colorPalette,
      },
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleResetConfirm = () => {
    resetToDefaults();
    setResetModalOpen(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const success = importSystemData(parsed);
        if (success) {
          setImportStatus('ជោគជ័យ៖ ទិន្នន័យត្រូវបានផ្ទុក និងស្តារឡើងវិញដោយជោគជ័យ!');
          if (parsed.school) {
            setFormData({
              nameKhmer: parsed.school.nameKhmer || '',
              nameEnglish: parsed.school.nameEnglish || '',
              code: parsed.school.code || '',
              province: parsed.school.province || '',
              district: parsed.school.district || '',
              principalName: parsed.school.principalName || '',
              academicYear: parsed.school.academicYear || '',
              phone: parsed.school.phone || '',
              email: parsed.school.email || '',
              address: parsed.school.address || '',
            });
          }
        } else {
          setImportStatus('បរាជ័យ៖ ទម្រង់ឯកសារ JSON មិនត្រឹមត្រូវ!');
        }
      } catch (err) {
        setImportStatus('បរាជ័យ៖ មិនអាចអានឯកសារបានឡើយ!');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 🧭 Top Banner & Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">{t('settingsTitle')}</h1>
            <span className="px-2.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-full">
              MoEYS Standard Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{t('settingsDesc')}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportSystemData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'km' ? 'បម្រុងទុកទិន្នន័យ (JSON)' : 'Export Backup'}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('settingsSavedSuccess')}</span>
        </div>
      )}

      {/* 🗂️ Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('SCHOOL_PROFILE')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'SCHOOL_PROFILE'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <School className="w-4 h-4" />
          <span>{t('tabSchoolProfile')}</span>
        </button>

        <button
          onClick={() => setActiveTab('GRADING')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'GRADING'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{t('tabGradingConfig')}</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEDULES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'SCHEDULES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('tabSchedulesConfig')}</span>
        </button>

        <button
          onClick={() => setActiveTab('PREFERENCES')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'PREFERENCES'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{t('tabPreferencesConfig')}</span>
        </button>

        <button
          onClick={() => setActiveTab('BACKUP')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'BACKUP'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{t('tabBackupRestoreConfig')}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 🏫 TAB 1: SCHOOL PROFILE SETTINGS                             */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'SCHOOL_PROFILE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">ព័ត៌មានអត្តសញ្ញាណសាលារៀន</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ព័ត៌មាននេះនឹងត្រូវបានប្រើប្រាស់នៅលើក្បាលលិខិត បឋមកថា និងរបាយការណ៍ផ្លូវការ MoEYS
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
                ទម្រង់ផ្លូវការ
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះសាលារៀន (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameKhmer}
                    onChange={(e) => setFormData({ ...formData, nameKhmer: e.target.value })}
                    placeholder="វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះសាលារៀន (អក្សរឡាតាំង / English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameEnglish}
                    onChange={(e) => setFormData({ ...formData, nameEnglish: e.target.value })}
                    placeholder="Hun Sen Wat Phnom High School"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    កូដសាលារៀន (EMIS / MoEYS Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SCH-KH-120101"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឆ្នាំសិក្សា (Academic Year) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    placeholder="២០២៤ - ២០២៥"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    រាជធានី / ខេត្ត <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    placeholder="រាជធានីភ្នំពេញ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ក្រុង / ស្រុក / ខណ្ឌ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="ខណ្ឌដូនពេញ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ឈ្មោះនាយកសាលា (Principal Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="លោក ឈួន ម៉េងហ៊ាង"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    លេខទូរស័ព្ទទំនាក់ទំនង (Phone)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="023 724 118"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    អ៊ីមែលផ្លូវការ (Official Email)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@watphnom-hs.moeys.gov.kh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    អាសយដ្ឋានទីតាំងសាលា (School Address)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="ផ្លូវលេខ ៩២ សង្កាត់វត្តភ្នំ ខណ្ឌដូនពេញ រាជធានីភ្នំពេញ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('saveSettingsButton')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview of School Official Letterhead */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>គំរូបឋមកថាផ្លូវការ MoEYS Preview</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                ទិដ្ឋភាពដែលបង្ហាញនៅលើរបាយការណ៍ ក្បាលទំព័រ និងសៀវភៅតាមដានការសិក្សាពេលបោះពុម្ព៖
              </p>

              <div className="bg-white text-slate-900 p-4 rounded-xl shadow-md border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-start text-[11px] leading-tight">
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs">{t('ministryName')}</div>
                    <div className="text-slate-600">មន្ទីរអប់រំ យុវជន និងកីឡា {formData.province}</div>
                    <div className="font-black text-blue-900">{formData.nameKhmer}</div>
                    <div className="text-[10px] font-mono text-slate-500">កូដ៖ {formData.code}</div>
                  </div>
                  <div className="text-center font-bold text-[10px]">
                    <div>ព្រះរាជាណាចក្រកម្ពុជា</div>
                    <div>ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                    <div className="text-slate-400 font-serif">🙣 🙡 🙢 🙠</div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2 text-center">
                  <div className="font-bold text-[11px] text-slate-800">
                    ឆ្នាំសិក្សា {formData.academicYear}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    នាយកសាលា៖ <strong className="text-slate-800">{formData.principalName}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>ស្ថានភាពទូទៅនៃសាលារៀន</span>
              </h3>
              <div className="divide-y divide-slate-100">
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">ចំនួនថ្នាក់រៀនសរុប៖</span>
                  <span className="font-mono font-bold text-slate-800">{classes.length} ថ្នាក់</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">ចំនួនសិស្សសរុប៖</span>
                  <span className="font-mono font-bold text-slate-800">{students.length} នាក់</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">ចំនួនបុគ្គលិកគ្រូបង្រៀន៖</span>
                  <span className="font-mono font-bold text-slate-800">{teachers.length} នាក់</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">មុខវិជ្ជា និងឯកទេស៖</span>
                  <span className="font-mono font-bold text-slate-800">{specializations.length} មុខ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📊 TAB 2: GRADING BENCHMARKS & EVALUATION STANDARDS           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'GRADING' && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>MoEYS National Academic Grading Engine</span>
              </div>
              <h2 className="text-base font-black mt-1">កម្រិតស្តង់ដារវាយតម្លៃ និងនិទ្ទេសផ្លូវការ MoEYS</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                ផ្អែកលើសារាចរណែនាំ និងបទដ្ឋានស្តង់ដារជាតិរបស់ក្រសួងអប់រំ យុវជន និងកីឡា
                ក្នុងការគណនាមធ្យមភាគប្រចាំខែ ពិន្ទុឆមាស និងការវាយតម្លៃសិស្សានុសិស្ស។
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center shrink-0">
              <div className="text-[11px] text-slate-300 font-medium">ពិន្ទុមធ្យមជាប់</div>
              <div className="text-2xl font-black text-amber-300 font-mono">&ge; ៥០.០០%</div>
            </div>
          </div>

          {/* MoEYS Benchmark Letter Grade Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>តារាងកម្រិតនិទ្ទេស និងការវាយតម្លៃផ្លូវការ (MoEYS Grade Scale)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900 text-slate-100 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3 text-center w-20">និទ្ទេស</th>
                    <th className="p-3 w-36">កម្រិតពិន្ទុ (%)</th>
                    <th className="p-3">ការវាយតម្លៃជាភាសាខ្មែរ</th>
                    <th className="p-3">ការវាយតម្លៃជាភាសាអង់គ្លេស</th>
                    <th className="p-3 text-center w-24">GPA (៤.០)</th>
                    <th className="p-3 text-center w-28">ស្ថានភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50">
                    <td className="p-3 text-center font-black font-mono text-base text-emerald-800">A</td>
                    <td className="p-3 font-mono font-bold text-slate-800">៨៥.០០% - ១០០%</td>
                    <td className="p-3 font-bold text-emerald-900">ល្អប្រសើរ (Excellent)</td>
                    <td className="p-3 text-slate-700">Outstanding Academic Mastery</td>
                    <td className="p-3 text-center font-mono font-bold">៤.០</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">
                        ជាប់ / ជាប់កិត្តិយស
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-blue-50/40 hover:bg-blue-50">
                    <td className="p-3 text-center font-black font-mono text-base text-blue-800">B</td>
                    <td className="p-3 font-mono font-bold text-slate-800">៨០.០០% - ៨៤.៩៩%</td>
                    <td className="p-3 font-bold text-blue-900">ល្អណាស់ (Very Good)</td>
                    <td className="p-3 text-slate-700">Very Good Competency</td>
                    <td className="p-3 text-center font-mono font-bold">៣.៥</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[10px]">
                        ជាប់
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-sky-50/40 hover:bg-sky-50">
                    <td className="p-3 text-center font-black font-mono text-base text-sky-800">C</td>
                    <td className="p-3 font-mono font-bold text-slate-800">៧០.០០% - ៧៩.៩៩%</td>
                    <td className="p-3 font-bold text-sky-900">ល្អ (Good)</td>
                    <td className="p-3 text-slate-700">Good Achievement</td>
                    <td className="p-3 text-center font-mono font-bold">៣.០</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded font-bold text-[10px]">
                        ជាប់
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-amber-50/40 hover:bg-amber-50">
                    <td className="p-3 text-center font-black font-mono text-base text-amber-800">D</td>
                    <td className="p-3 font-mono font-bold text-slate-800">៦០.០០% - ៦៩.៩៩%</td>
                    <td className="p-3 font-bold text-amber-900">ល្អបង្គួរ (Fairly Good)</td>
                    <td className="p-3 text-slate-700">Satisfactory Standard</td>
                    <td className="p-3 text-center font-mono font-bold">២.០</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">
                        ជាប់
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-orange-50/40 hover:bg-orange-50">
                    <td className="p-3 text-center font-black font-mono text-base text-orange-800">E</td>
                    <td className="p-3 font-mono font-bold text-slate-800">៥០.០០% - ៥៩.៩៩%</td>
                    <td className="p-3 font-bold text-orange-900">មធ្យម (ជាប់) (Average)</td>
                    <td className="p-3 text-slate-700">Passing Benchmark</td>
                    <td className="p-3 text-center font-mono font-bold">១.០</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded font-bold text-[10px]">
                        ជាប់
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-rose-50/50 hover:bg-rose-50">
                    <td className="p-3 text-center font-black font-mono text-base text-rose-800">F</td>
                    <td className="p-3 font-mono font-bold text-slate-800">&lt; ៥០.០០%</td>
                    <td className="p-3 font-bold text-rose-900">ខ្សោយ (ធ្លាក់) (Poor/Fail)</td>
                    <td className="p-3 text-slate-700">Below Minimum Standard</td>
                    <td className="p-3 text-center font-mono font-bold">០.០</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                        ធ្លាក់
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulas and Divisors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>រូបមន្តគណនាមធ្យមភាគប្រចាំខែ (Monthly Average Formula)</span>
              </h3>
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl font-mono text-xs text-blue-950 font-bold leading-relaxed">
                មធ្យមភាគប្រចាំខែ = ពិន្ទុសរុបគ្រប់មុខវិជ្ជា/ជំនាញ ÷ ចំនួនតួរចែក
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                តួរចែកអាចកំណត់បានដោយសេរីនៅក្នុងទំព័រ Gradebook និង Reports ដូចជា <strong>21 ជំនាញ</strong> (ស្តង់ដារពេញលេញ), <strong>7 មុខវិជ្ជា</strong> ឬ <strong>9 មុខវិជ្ជា</strong> ទៅតាមកម្រិតថ្នាក់។
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>រូបមន្តគណនាពិន្ទុឆមាសផ្លូវការ (Semester Score Formula)</span>
              </h3>
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl font-mono text-xs text-indigo-950 font-bold leading-relaxed">
                ពិន្ទុមុខវិជ្ជាឆមាស = (មធ្យមភាគប្រចាំខែ + (ពិន្ទុប្រឡងឆមាស × ២)) ÷ ៣
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                ពិន្ទុសរុបគុណមេគុណ = ពិន្ទុមុខវិជ្ជាឆមាស × មេគុណមុខវិជ្ជា (ឧ. គណិតវិទ្យា × ២, ភាសាខ្មែរ × ២, រូបវិទ្យា × ១.៥)។
              </p>
            </div>
          </div>

          {/* Curriculum Subjects & Coefficients Summary Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>បញ្ជីមុខវិជ្ជា និងមេគុណពិន្ទុក្នុងប្រព័ន្ធ ({specializations.length} មុខវិជ្ជា)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  អ្នកអាចបន្ថែម កែប្រែ ឬលុបមុខវិជ្ជា និងមេគុណពិន្ទុបានយ៉ាងងាយស្រួល
                </p>
              </div>

              <Link
                href="/specializations"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>គ្រប់គ្រង/បន្ថែមមុខវិជ្ជាថ្មី</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specializations.map((s) => (
                <div
                  key={s.code}
                  className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 hover:border-blue-300 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.2 bg-slate-900 text-white font-mono text-[9px] font-bold rounded">
                        {s.code}
                      </span>
                      {s.isCore && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold text-[9px] rounded flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>ស្នូល</span>
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-800 truncate">{s.nameKhmer}</div>
                    <div className="text-[10px] text-slate-500 font-mono truncate">{s.nameEnglish}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold text-xs rounded-md">
                      x{s.coefficient ?? 1.0}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 font-mono">
                      {s.standardWeeklyHours} ម៉/សប្តាហ៍
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🕒 TAB 3: SHIFTS & ACADEMIC SCHEDULES                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'SCHEDULES' && (
        <div className="space-y-6">
          {/* Calendar & Holidays Navigation Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-sm">ប្រតិទិន និងថ្ងៃឈប់សម្រាកផ្លូវការ MoEYS</h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  ពិនិត្យ និងគ្រប់គ្រងថ្ងៃឈប់សម្រាកបុណ្យជាតិ ការប្រឡងឆមាស និងវិស្សមកាលសិក្សា
                </p>
              </div>
            </div>
            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <span>បើកទំព័រប្រតិទិន</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Morning Shift */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{t('shiftMorning')}</h3>
                    <p className="text-xs text-slate-500">វេនសិក្សាពេលព្រឹក</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-lg">
                  ០៧:០០ - ១១:០០
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ១៖</span>
                  <span className="font-mono font-bold text-slate-800">០៧:០០ - ០៧:៥០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ២៖</span>
                  <span className="font-mono font-bold text-slate-800">០៧:៥០ - ០៨:៤០</span>
                </div>
                <div className="p-2.5 bg-blue-50/50 rounded-lg flex justify-between text-blue-900 font-medium">
                  <span>ម៉ោងចេញលេង (Recess)៖</span>
                  <span className="font-mono font-bold">០៨:៤០ - ០៩:១០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ៣៖</span>
                  <span className="font-mono font-bold text-slate-800">០៩:១០ - ១០:០០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ៤៖</span>
                  <span className="font-mono font-bold text-slate-800">១០:០០ - ១១:០០</span>
                </div>
              </div>
            </div>

            {/* Afternoon Shift */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{t('shiftAfternoon')}</h3>
                    <p className="text-xs text-slate-500">វេនសិក្សាពេលរសៀល</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-900 font-bold text-xs rounded-lg">
                  ១៣:០០ - ១៧:០០
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ១៖</span>
                  <span className="font-mono font-bold text-slate-800">១៣:០០ - ១៣:៥០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ២៖</span>
                  <span className="font-mono font-bold text-slate-800">១៣:៥០ - ១៤:៤០</span>
                </div>
                <div className="p-2.5 bg-blue-50/50 rounded-lg flex justify-between text-blue-900 font-medium">
                  <span>ម៉ោងចេញលេង (Recess)៖</span>
                  <span className="font-mono font-bold">១៤:៤០ - ១៥:១០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ៣៖</span>
                  <span className="font-mono font-bold text-slate-800">១៥:១០ - ១៦:០០</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between">
                  <span className="text-slate-600">ម៉ោងទី ៤៖</span>
                  <span className="font-mono font-bold text-slate-800">១៦:០០ - ១៧:០០</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📅 Interactive Academic Months & Semester Allocation Configuration */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>កំណត់ខែសិក្សាសម្រាប់ ឆមាសទី ១ និង ឆមាសទី ២</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  លោកគ្រូ-អ្នកគ្រូអាចជ្រើសរើសខែសម្រាប់ឆមាសនីមួយៗ (ឆមាសទី ១ ឬ ឆមាសទី ២) ឬជ្រើសរើសឈ្មោះខែតាមប្រតិទិនជាក់ស្តែង
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500 mr-1">គំរូរហ័ស៖</span>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicMonths(MONTHLY_ACADEMIC_MONTHS);
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2500);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  ស្តង់ដារ MoEYS (តុលា - កក្កដា)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const novMonths: AcademicMonthDef[] = [
                      { index: 1, nameKhmer: 'ខែវិច្ឆិកា', nameEnglish: 'November', semester: 1 },
                      { index: 2, nameKhmer: 'ខែធ្នូ', nameEnglish: 'December', semester: 1 },
                      { index: 3, nameKhmer: 'ខែមករា', nameEnglish: 'January', semester: 1 },
                      { index: 4, nameKhmer: 'ខែកុម្ភៈ', nameEnglish: 'February', semester: 1 },
                      { index: 5, nameKhmer: 'ខែមីនា', nameEnglish: 'March', semester: 1 },
                      { index: 6, nameKhmer: 'ខែមេសា', nameEnglish: 'April', semester: 2 },
                      { index: 7, nameKhmer: 'ខែឧសភា', nameEnglish: 'May', semester: 2 },
                      { index: 8, nameKhmer: 'ខែមិថុនា', nameEnglish: 'June', semester: 2 },
                      { index: 9, nameKhmer: 'ខែកក្កដា', nameEnglish: 'July', semester: 2 },
                      { index: 10, nameKhmer: 'ខែសីហា', nameEnglish: 'August', semester: 2 },
                    ];
                    setAcademicMonths(novMonths);
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2500);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors cursor-pointer"
                >
                  គំរូ វិច្ឆិកា - សីហា
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const janMonths: AcademicMonthDef[] = [
                      { index: 1, nameKhmer: 'ខែមករា', nameEnglish: 'January', semester: 1 },
                      { index: 2, nameKhmer: 'ខែកុម្ភៈ', nameEnglish: 'February', semester: 1 },
                      { index: 3, nameKhmer: 'ខែមីនា', nameEnglish: 'March', semester: 1 },
                      { index: 4, nameKhmer: 'ខែមេសា', nameEnglish: 'April', semester: 1 },
                      { index: 5, nameKhmer: 'ខែឧសភា', nameEnglish: 'May', semester: 1 },
                      { index: 6, nameKhmer: 'ខែមិថុនា', nameEnglish: 'June', semester: 2 },
                      { index: 7, nameKhmer: 'ខែកក្កដា', nameEnglish: 'July', semester: 2 },
                      { index: 8, nameKhmer: 'ខែសីហា', nameEnglish: 'August', semester: 2 },
                      { index: 9, nameKhmer: 'ខែកញ្ញា', nameEnglish: 'September', semester: 2 },
                      { index: 10, nameKhmer: 'ខែតុលា', nameEnglish: 'October', semester: 2 },
                    ];
                    setAcademicMonths(janMonths);
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2500);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg transition-colors cursor-pointer"
                >
                  គំរូ មករា - តុលា
                </button>
              </div>
            </div>

            {/* Semester Summary Counts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Semester 1 Summary */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    <span>ឆមាសទី ១ (Semester 1)</span>
                  </div>
                  <div className="text-[11px] text-blue-800 mt-1 font-medium">
                    {academicMonths
                      .filter((m) => m.semester === 1)
                      .map((m) => (m.isExamMonth === false ? `${m.nameKhmer} (មិនប្រឡង)` : m.nameKhmer))
                      .join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                    {academicMonths.filter((m) => m.semester === 1).length} ខែ
                  </span>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    ប្រឡង {academicMonths.filter((m) => m.semester === 1 && m.isExamMonth !== false).length} ខែ
                  </div>
                </div>
              </div>

              {/* Semester 2 Summary */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                    <span>ឆមាសទី ២ (Semester 2)</span>
                  </div>
                  <div className="text-[11px] text-indigo-800 mt-1 font-medium">
                    {academicMonths
                      .filter((m) => m.semester === 2)
                      .map((m) => (m.isExamMonth === false ? `${m.nameKhmer} (មិនប្រឡង)` : m.nameKhmer))
                      .join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-indigo-600 text-white font-mono font-bold text-xs rounded-lg shadow-2xs">
                    {academicMonths.filter((m) => m.semester === 2).length} ខែ
                  </span>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">
                    ប្រឡង {academicMonths.filter((m) => m.semester === 2 && m.isExamMonth !== false).length} ខែ
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions for Exam Months */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <span>កំណត់ស្ថានភាពប្រឡងប្រចាំខែ (Exam vs Non-Exam Months)៖</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAcademicMonths(academicMonths.map((m) => ({ ...m, isExamMonth: true })));
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  ✅ បើកប្រឡងគ្រប់ខែ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAcademicMonths(
                      academicMonths.map((m) =>
                        m.nameKhmer.includes('មេសា') || m.nameEnglish.toLowerCase().includes('april')
                          ? { ...m, isExamMonth: false }
                          : m
                      )
                    );
                    setSaveToast(true);
                    setTimeout(() => setSaveToast(false), 2000);
                  }}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  🚫 បិទប្រឡងខែមេសា (ចូលឆ្នាំ)
                </button>
              </div>
            </div>

            {/* 10-Month Interactive Config Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {academicMonths.map((m) => {
                const isSem1 = m.semester === 1;
                const isExamActive = m.isExamMonth !== false;

                return (
                  <div
                    key={m.index}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      !isExamActive
                        ? 'bg-slate-100/70 border-slate-300 opacity-90 shadow-2xs'
                        : isSem1
                        ? 'bg-blue-50/40 border-blue-200/90 shadow-2xs'
                        : 'bg-indigo-50/40 border-indigo-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                        ខែទី {m.index}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          !isExamActive
                            ? 'bg-slate-200 text-slate-600'
                            : isSem1
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        ឆមាសទី {m.semester}
                      </span>
                    </div>

                    {/* Month Name Dropdown Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        ជ្រើសរើសខែ៖
                      </label>
                      <select
                        value={m.nameKhmer}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const found = ALL_CALENDAR_MONTHS.find((c) => c.nameKhmer === selectedName);
                          updateAcademicMonth(m.index, {
                            nameKhmer: selectedName,
                            nameEnglish: found?.nameEnglish || m.nameEnglish,
                          });
                          setSaveToast(true);
                          setTimeout(() => setSaveToast(false), 2000);
                        }}
                        className={`w-full px-2.5 py-1.5 bg-white text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs ${
                          !isExamActive ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}
                      >
                        {ALL_CALENDAR_MONTHS.map((cal) => (
                          <option key={cal.nameKhmer} value={cal.nameKhmer}>
                            {cal.nameKhmer} ({cal.nameEnglish})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Semester 1 vs 2 Toggle Pill */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        ឆមាស៖
                      </label>
                      <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => {
                            setMonthSemester(m.index, 1);
                            setSaveToast(true);
                            setTimeout(() => setSaveToast(false), 2000);
                          }}
                          className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                            m.semester === 1
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ឆមាស ១
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMonthSemester(m.index, 2);
                            setSaveToast(true);
                            setTimeout(() => setSaveToast(false), 2000);
                          }}
                          className={`py-1 rounded-md transition-all cursor-pointer text-center ${
                            m.semester === 2
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ឆមាស ២
                        </button>
                      </div>
                    </div>

                    {/* Exam vs Non-Exam Toggle */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">
                        ស្ថានភាពប្រឡង៖
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          toggleMonthExamStatus(m.index);
                          setSaveToast(true);
                          setTimeout(() => setSaveToast(false), 2000);
                        }}
                        className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                          isExamActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        {isExamActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ប្រឡងប្រចាំខែ</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>មិនប្រឡង / វិស្សមកាល</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🌐 TAB 4: SYSTEM PREFERENCES & DISPLAY                        */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'PREFERENCES' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-900">ចំណង់ចំណូលចិត្តប្រព័ន្ធ និងការបង្ហាញ (System Preferences)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              កំណត់រូបរាងផ្ទៃកម្មវិធី ក្ដារពណ៌ ភាសា និងដំណើរការគណនាស្វ័យប្រវត្តិនៃប្រព័ន្ធ
            </p>
          </div>

          <div className="space-y-6 max-w-4xl">
            {/* 🎨 Section A: Theme & Color Palette Customizer */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/90 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {t('themeCustomizerTitle')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('colorPaletteSubtitle')}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 bg-white text-blue-700 rounded-lg border border-blue-200 shadow-2xs">
                  {COLOR_PALETTES.find((p) => p.id === colorPalette)?.nameKhmer.split('(')[0] || 'MoEYS'}
                </span>
              </div>

              {/* Theme Mode Selector (Light, Dark, System) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('themeModeLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                      <Sun className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">{t('themeLight')}</div>
                      <div className="text-[10px] text-slate-500">ភ្លឺ ច្បាស់ ផ្លូវការ</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">{t('themeDark')}</div>
                      <div className="text-[10px] text-slate-500">ស្រទន់ភ្នែក ពេលយប់</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemeMode('system')}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900">{t('themeSystem')}</div>
                      <div className="text-[10px] text-slate-500">តាមការកំណត់ OS</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Color Palettes Grid (6 Palettes) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t('colorPaletteLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = colorPalette === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setColorPalette(p.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                          isSelected
                            ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-700 shadow-2xs'
                        }`}
                      >
                        {/* Header swatch strip */}
                        <div
                          className={`h-2 -mx-3.5 -mt-3.5 mb-3 bg-gradient-to-r ${p.gradientClass}`}
                        />

                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded-full border border-white shadow-xs shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: p.primaryColor }}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <div
                              className="w-3.5 h-3.5 rounded-full border border-white shadow-xs shrink-0"
                              style={{ backgroundColor: p.accentColor }}
                              title="Accent Color"
                            />
                          </div>

                          {isSelected && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                              សកម្ម (Active)
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5">
                          <div className="text-xs font-bold text-slate-900 leading-snug">
                            {language === 'km' ? p.nameKhmer : p.nameEnglish}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                            {language === 'km' ? p.descriptionKhmer : p.descriptionEnglish}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('previewControls')}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('sampleButton')}</span>
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <span>ប៊ូតុងបន្ទាប់បន្សំ</span>
                  </button>

                  <span className="px-3 py-1 bg-blue-100 text-blue-800 font-bold text-xs rounded-full border border-blue-200 flex items-center gap-1.5">
                    <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                    <span>{t('sampleBadge')}</span>
                  </span>

                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-[11px] font-semibold text-slate-400">ប្រអប់បញ្ចូល៖</span>
                    <input
                      type="text"
                      readOnly
                      value="វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ"
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 w-44"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Language Selection */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>ភាសាលំនាំដើម (System Language)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ជ្រើសរើសភាសាខ្មែរ 🇰🇭 ឬ ភាសាអង់គ្លេស 🇬🇧 សម្រាប់ផ្ទៃកម្មវិធីទាំងមូល
                </p>
              </div>

              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs">
                <button
                  onClick={() => setLanguage('km')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    language === 'km'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇰🇭</span>
                  <span>ខ្មែរ</span>
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    language === 'en'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Auto Calculation Setting */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>ការគណនាចំណាត់ថ្នាក់ និងនិទ្ទេសស្វ័យប្រវត្ត (Auto-Rank)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  គណនាចំណាត់ថ្នាក់សិស្ស និងនិទ្ទេស A-F ដោយស្វ័យប្រវត្តភ្លាមៗពេលកែប្រែពិន្ទុ
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoCalculateRank}
                  onChange={(e) => setAutoCalculateRank(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Default Divisor Setting */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    <span>តួរចែកពិន្ទុលំនាំដើមរបស់សាលារៀន (Default School Divisor)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    កំណត់តួរចែកមធ្យមភាគប្រចាំខែលំនាំដើមសម្រាប់ថ្នាក់រៀនថ្មី (ឧ. ២១ ជំនាញ ឬ ៧, ៩, ១៤ មុខវិជ្ជា)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={defaultDivisor}
                    onChange={(e) => setDefaultDivisor(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 px-3 py-1.5 bg-white text-xs font-mono font-bold text-blue-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600">តួរចែក</span>
                </div>
              </div>

              {/* Quick Presets for Divisor */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 mr-1">គំរូរហ័ស៖</span>
                {[
                  { label: '២១ ជំនាញ (បឋម/អនុវិទ្យាល័យ)', val: 21 },
                  { label: '១៤ មុខវិជ្ជា (ឆមាស)', val: 14 },
                  { label: '៩ មុខវិជ្ជា (អនុវិទ្យាល័យ)', val: 9 },
                  { label: '៧ មុខវិជ្ជា (វិទ្យាល័យ)', val: 7 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setDefaultDivisor(p.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      defaultDivisor === p.val
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum Passing Threshold */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>ពិន្ទុមធ្យមភាគជាប់កម្រិតទាបបំផុត (Passing Threshold %)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ភាគរយពិន្ទុអប្បបរមាដើម្បីចាត់ទុកថាសិស្សជាប់ ឬឡើងថ្នាក់ (ស្តង់ដារ MoEYS &ge; ៥០.០០%)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={passingThreshold}
                    onChange={(e) => setPassingThreshold(Math.max(1, Math.min(100, Number(e.target.value) || 50)))}
                    className="w-20 px-3 py-1.5 bg-white text-xs font-mono font-bold text-emerald-900 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs font-bold text-slate-600">%</span>
                </div>
              </div>

              {/* Quick Presets for Passing */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-500 mr-1">គំរូរហ័ស៖</span>
                {[
                  { label: '៥០% (MoEYS Standard)', val: 50 },
                  { label: '៦០% (កម្រិតខ្ពស់)', val: 60 },
                  { label: '៤៥% (កម្រិតសម្រាល)', val: 45 },
                ].map((p) => (
                  <button
                    key={p.val}
                    type="button"
                    onClick={() => setPassingThreshold(p.val)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      passingThreshold === p.val
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Save Preferences Button to Database */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>រក្សាទុកការកំណត់ប្រព័ន្ធទៅក្នុង Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 💾 TAB 5: BACKUP & RESTORE DATA                               */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'BACKUP' && (
        <div className="space-y-6">
          {importStatus && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span>{importStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Export Backup Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">ទាញយកទិន្នន័យបម្រុងទុក (Export Backup)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ទាញយកទិន្នន័យទាំងមូលនៃសាលារៀន (សិស្ស, គ្រូ, ពិន្ទុ, វត្តមាន, ថ្នាក់រៀន) ជាឯកសារ JSON
                  ដើម្បីទុកជាឯកសារយោង ឬផ្ទេរទៅកុំព្យូទ័រផ្សេង។
                </p>
              </div>

              <button
                onClick={exportSystemData}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ទាញយក Backup (.json)</span>
              </button>
            </div>

            {/* 2. Import Restore Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">ស្តារទិន្នន័យឡើងវិញ (Restore Data)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ជ្រើសរើសឯកសារ Backup (.json) ដើម្បីផ្ទុកទិន្នន័យដែលបានរក្សាទុកពីមុនមកប្រើប្រាស់ក្នុងប្រព័ន្ធឡើងវិញ។
                </p>
              </div>

              <div>
                <label className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>ជ្រើសរើសឯកសារ JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 3. Reset Defaults Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 text-sm">ទិន្នន័យគំរូ MoEYS (Reset Defaults)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  កំណត់ប្រព័ន្ធឡើងវិញទៅកាន់ទិន្នន័យគំរូស្តង់ដារ MoEYS (សិស្ស ៣០ នាក់, គ្រូ ៦ នាក់, ថ្នាក់ ៣)។
                </p>
              </div>

              <button
                onClick={() => setResetModalOpen(true)}
                className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('resetDefaults')}</span>
              </button>
            </div>

            {/* 4. Clear All Test Data & Clean Supabase Database */}
            <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4 flex flex-col justify-between bg-rose-50/20">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-rose-950 text-sm">លុបទិន្នន័យតេស្តទាំងអស់ (Clean DB)</h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Supabase Live
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  លុបទិន្នន័យសាកល្បងទាំងអស់ចេញពីប្រព័ន្ធ និងសម្អាតតារាងក្នុង Supabase PostgreSQL Database ដើម្បីចាប់ផ្តើមបញ្ចូលទិន្នន័យជាក់ស្តែង។
                </p>
              </div>

              <button
                onClick={() => setClearTestModalOpen(true)}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database className="w-4 h-4" />
                <span>លុបទិន្នន័យតេស្ត និងសម្អាត Supabase</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">បញ្ជាក់ការកំណត់ទៅទិន្នន័យគំរូដើម</h3>
                <p className="text-xs text-slate-500">តើអ្នកពិតជាចង់កំណត់ទិន្នន័យទាំងអស់ឡើងវិញមែនទេ?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              រាល់ការកែប្រែពិន្ទុ បញ្ជីវត្តមាន និងព័ត៌មានដែលបានកែប្រែ នឹងត្រូវត្រឡប់ទៅជាទិន្នន័យដើមរបស់ក្រសួងអប់រំវិញ។
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={handleResetConfirm}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                យល់ព្រម កំណត់ឡើងវិញ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Clear Test Data & Wipe Supabase Modal */}
      {clearTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">លុបទិន្នន័យតេស្ត និងសម្អាត Supabase</h3>
                <p className="text-xs text-slate-500">ដំណើរការនេះនឹងលុបទិន្នន័យសាកល្បងទាំងអស់ចេញទាំងស្រុង</p>
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed bg-rose-50 p-3 rounded-xl border border-rose-200 space-y-1">
              <div className="font-bold text-rose-900">ទិន្នន័យដែលនឹងត្រូវសម្អាត៖</div>
              <ul className="list-disc list-inside space-y-0.5 text-rose-800">
                <li>សិស្សសាកល្បង និងពិន្ទុទាំងអស់</li>
                <li>បញ្ជីវត្តមានសាកល្បង</li>
                <li>ពិន្ទុប្រចាំខែ និងឆមាសទាំងអស់</li>
              </ul>
              <div className="text-[11px] text-slate-600 pt-1">
                ប្រព័ន្ធនឹងដំណើរការភ្ជាប់ទៅកាន់ Supabase ផ្ទាល់ដោយគ្មាន Test Data ឡើយ។
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setClearTestModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                onClick={async () => {
                  await clearAllTestData();
                  setClearTestModalOpen(false);
                  setSaveToast(true);
                  setTimeout(() => setSaveToast(false), 3000);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer font-bold"
              >
                យល់ព្រម លុបនិងសម្អាត
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
