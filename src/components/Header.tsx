'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSchool } from '@/lib/stateContext';
import {
  Menu,
  Printer,
  ShieldCheck,
  Settings,
  Users,
  ChevronDown,
  UserCheck,
  GraduationCap,
  BookOpen,
  Eye,
  Shield,
  Check,
  LogOut,
  LogIn,
} from 'lucide-react';

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
    users,
    currentUser,
    switchUserRole,
    logout,
    canAccessRoute,
  } = useSchool();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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

        {/* Users & Permissions Management Link */}
        <Link
          href="/users"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 cursor-pointer shadow-2xs"
          title={t('navUsers')}
        >
          <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="hidden lg:inline">{t('navUsers')}</span>
        </Link>

        {/* Settings Button */}
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 cursor-pointer shadow-2xs"
          title={t('navSettings')}
        >
          <Settings className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="hidden md:inline">{t('navSettings')}</span>
        </Link>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200/80 cursor-pointer shadow-2xs"
          title={t('print')}
        >
          <Printer className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="hidden md:inline">{t('print')}</span>
        </button>

        <div className="hidden sm:block h-5 w-px bg-slate-200"></div>

        {/* User Card & Role Switcher Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer text-left group border border-transparent hover:border-slate-200"
            title={t('switchUserLabel')}
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

              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>{t('switchUserLabel')}</span>
                <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                  {users.length} Users
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1">
                {users.map((u) => {
                  const isCur = u.id === currentUser?.id;
                  const roleBadge = getRoleBadge(u.role);
                  const RoleIcon = roleBadge.icon;

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUserRole(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isCur ? 'bg-blue-50/80 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-full bg-gradient-to-tr ${u.avatarColor} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                        >
                          {u.khmerName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold truncate text-slate-800">{u.khmerName}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <RoleIcon className="w-2.5 h-2.5" />
                            <span className="truncate">{roleBadge.text}</span>
                          </div>
                        </div>
                      </div>

                      {isCur && <Check className="w-4 h-4 text-blue-600 shrink-0 ml-1.5" />}
                    </button>
                  );
                })}
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
