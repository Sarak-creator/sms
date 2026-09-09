'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSchool } from '@/lib/stateContext';
import {
  Menu,
  ShieldCheck,
  Users,
  ChevronDown,
  UserCheck,
  GraduationCap,
  BookOpen,
  Eye,
  Shield,
  LogOut,
  LogIn,
  Palette,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';
import { COLOR_PALETTES } from '@/lib/theme';

export function Header() {
  const router = useRouter();
  const {
    school,
    classes,
    selectedClassId,
    toggleSidebar,
    language,
    setLanguage,
    t,
    currentUser,
    logout,
    canAccessRoute,
    themeMode,
    setThemeMode,
    colorPalette,
    setColorPalette,
  } = useSchool();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PRINCIPAL':
        return {
          icon: ShieldCheck,
          text: t('rolePrincipal'),
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'ACADEMIC_OFFICER':
        return {
          icon: Shield,
          text: t('roleAcademicOfficer'),
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'HOMEROOM_TEACHER':
        return {
          icon: GraduationCap,
          text: t('roleHomeroomTeacher'),
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'SUBJECT_TEACHER':
        return {
          icon: BookOpen,
          text: t('roleSubjectTeacher'),
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      case 'STAFF_VIEWER':
      default:
        return {
          icon: Eye,
          text: t('roleStaffViewer'),
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  const currentRoleInfo = getRoleBadge(currentUser?.role || 'PRINCIPAL');
  const CurrentRoleIcon = currentRoleInfo.icon;

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs no-print">
      {/* Left: Mobile Hamburger & Context Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label={t('selectClassLabel')}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Current Context Breadcrumb */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs truncate">
          <span className="hidden md:inline font-semibold text-slate-500 truncate">{school.province}</span>
          <span className="hidden md:inline text-slate-300">/</span>
          <span className="font-semibold text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">
            {language === 'en' ? school.nameEnglish : school.nameKhmer}
          </span>
          <span className="text-slate-300">/</span>
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-200 shrink-0">
            {currentClass?.name || t('selectClassLabel')}
          </span>
          {currentClass && (
            <span className="hidden sm:flex px-2 py-0.5 bg-emerald-50 text-emerald-700 font-medium text-[11px] rounded-full border border-emerald-200 items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {currentClass.shift === 'MORNING' ? t('shiftMorningShort') : t('shiftAfternoonShort')}
            </span>
          )}
        </div>
      </div>

      {/* Action Controls & User Profile & Language Switcher */}
      <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
        {/* Language Switcher Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setLanguage('km')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              language === 'km'
                ? 'bg-white text-blue-700 shadow-xs font-bold ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="ប្តូរទៅភាសាខ្មែរ (Switch to Khmer)"
          >
            <span className="text-sm leading-none">🇰🇭</span>
            <span className="hidden sm:inline">ខ្មែរ</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              language === 'en'
                ? 'bg-white text-blue-700 shadow-xs font-bold ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Switch to English (ប្តូរទៅភាសាអង់គ្លេស)"
          >
            <span className="text-sm leading-none">🇬🇧</span>
            <span className="hidden sm:inline">ENG</span>
          </button>
        </div>

        {/* Quick Theme & Color Palette Selector */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 text-slate-700 transition-colors cursor-pointer text-xs font-bold"
            title={language === 'km' ? 'ប្តូរពណ៌ និងរចនាបថ' : 'Customize Theme & Colors'}
          >
            <Palette className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="hidden lg:inline text-[11px]">
              {language === 'km' ? 'ពណ៌ & រចនាបថ' : 'Theme'}
            </span>
            <div
              className="w-2.5 h-2.5 rounded-full border border-white shadow-xs shrink-0"
              style={{
                backgroundColor:
                  COLOR_PALETTES.find((p) => p.id === colorPalette)?.primaryColor || '#2563eb',
              }}
            />
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 space-y-3.5">
              {/* Theme Mode Segmented Controller */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>{t('themeModeLabel')}</span>
                  <span className="text-[9px] text-blue-600 font-semibold lowercase">
                    {themeMode}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t('themeLight').split(' ')[0]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{t('themeDark').split(' ')[0]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('system')}
                    className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'km' ? 'ស្វ័យប្រវត្ត' : 'System'}</span>
                  </button>
                </div>
              </div>

              {/* Color Palettes List */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  {t('colorPaletteLabel')}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {COLOR_PALETTES.map((p) => {
                    const isSelected = colorPalette === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setColorPalette(p.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center shadow-xs border border-white"
                          style={{ backgroundColor: p.primaryColor }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`text-[11px] font-bold truncate leading-tight ${
                              isSelected ? 'text-blue-950' : 'text-slate-800'
                            }`}
                          >
                            {language === 'km' ? p.nameKhmer.split('(')[0] : p.nameEnglish.split('&')[0]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Link to full settings */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <Link
                  href="/settings"
                  onClick={() => setIsThemeMenuOpen(false)}
                  className="text-blue-600 hover:text-blue-800 font-bold transition-colors"
                >
                  {language === 'km' ? '⚙️ ការកំណត់កម្រិតខ្ពស់' : '⚙️ Advanced Settings'}
                </Link>
                <span className="text-[10px] text-slate-400 font-mono">v1.0 MoEYS</span>
              </div>
            </div>
          )}
        </div>

        {/* User Card & Role Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left group border border-transparent hover:border-slate-200"
            title={currentUser?.khmerName || t('currentUserLabel')}
          >
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-tr ${
                currentUser?.avatarColor || 'from-blue-600 to-indigo-600'
              } text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 shrink-0 shadow-xs`}
            >
              {currentUser?.khmerName ? currentUser.khmerName.charAt(0) : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                <span>{currentUser?.khmerName || school.principalName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform" />
              </div>
              <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                <CurrentRoleIcon className="w-3 h-3" />
                <span>{currentRoleInfo.text}</span>
              </div>
            </div>
          </button>

          {/* User Switcher Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('currentUserLabel')}
                </div>
                <div className="font-bold text-xs text-slate-800 mt-0.5">
                  {currentUser?.khmerName} ({currentUser?.latinName})
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {currentUser?.email}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-1 space-y-1">
                {canAccessRoute('/users') && (
                  <Link
                    href="/users"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="w-full py-1.5 px-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ និងសិទ្ធិ' : 'Manage All Users & RBAC'}</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsUserMenuOpen(false);
                    router.push('/login');
                  }}
                  className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logoutButton')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
