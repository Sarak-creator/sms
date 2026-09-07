'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calculator,
  UserCheck,
  School,
  Users,
  Contact,
  GraduationCap,
  BookOpen,
  Bookmark,
  FileSpreadsheet,
  Calendar,
  Settings,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import { useSchool } from '@/lib/stateContext';

export function Sidebar() {
  const pathname = usePathname();
  const {
    school,
    classes,
    accessibleClasses,
    students,
    accessibleStudents,
    selectedClassId,
    setSelectedClassId,
    currentUser,
    canAccessRoute,
    isTeacher,
    isSidebarOpen,
    closeSidebar,
    language,
    t,
  } = useSchool();

  const allNavItems = [
    {
      label: t('navDashboard'),
      href: '/',
      icon: LayoutDashboard,
      badge: language === 'km' ? 'ស្ថិតិ' : 'KPI',
    },
    {
      label: t('navGradebook'),
      href: '/gradebook',
      icon: Calculator,
      badge: language === 'km' ? 'ពិន្ទុ' : 'Spreadsheet',
    },
    {
      label: t('navAttendance'),
      href: '/attendance',
      icon: UserCheck,
      badge: language === 'km' ? 'វត្តមាន' : '1-Click',
    },
    {
      label: t('navClasses'),
      href: '/classes',
      icon: School,
      badge: `${accessibleClasses.length} ` + (language === 'km' ? 'ថ្នាក់' : 'Classes'),
    },
    {
      label: t('navStudents'),
      href: '/students',
      icon: Users,
      badge: `${students.length} ` + (language === 'km' ? 'នាក់' : 'Students'),
    },
    {
      label: t('navGuardians'),
      href: '/guardians',
      icon: Contact,
      badge: language === 'km' ? 'អាណាព្យាបាល' : 'Parents',
    },
    {
      label: t('navTeachers'),
      href: '/teachers',
      icon: GraduationCap,
      badge: language === 'km' ? '១៨ម៉/សប្តាហ៍' : '18h/wk',
    },
    {
      label: t('navSpecializations'),
      href: '/specializations',
      icon: BookOpen,
      badge: language === 'km' ? 'ឯកទេស' : 'Subjects',
    },
    {
      label: t('navChapters'),
      href: '/chapters',
      icon: Bookmark,
      badge: language === 'km' ? 'ជំពូក' : 'Chapters',
    },
    {
      label: t('navReports'),
      href: '/reports',
      icon: FileSpreadsheet,
      badge: language === 'km' ? 'ទម្រង់ ក១' : 'MoEYS K1',
    },
    {
      label: language === 'km' ? 'ប្រតិទិន & ថ្ងៃឈប់សម្រាក' : 'Calendar & Holidays',
      href: '/calendar',
      icon: Calendar,
      badge: language === 'km' ? 'ឈប់សម្រាក' : 'Holidays',
    },
    {
      label: t('navUsers'),
      href: '/users',
      icon: UserCheck,
      badge: language === 'km' ? 'សិទ្ធិ' : 'RBAC',
    },
    {
      label: t('navSettings'),
      href: '/settings',
      icon: Settings,
      badge: language === 'km' ? 'កំណត់' : 'Config',
    },
  ];

  // Filter navigation items strictly based on role-based access control
  const navItems = allNavItems.filter((item) => canAccessRoute(item.href));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-72 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40 shrink-0">
        <Link href="/" className="flex items-center gap-3.5 min-w-0 group" onClick={closeSidebar}>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-black text-lg sm:text-xl ring-2 ring-blue-400/30 shrink-0 group-hover:scale-105 transition-transform">
            {language === 'km' ? 'អ.យ.ក' : 'MoEYS'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-xs sm:text-sm text-white truncate leading-tight tracking-tight">
              {t('ministryName')}
            </h1>
            <p className="text-[11px] sm:text-xs text-blue-300/80 font-medium truncate mt-0.5">
              {language === 'en' ? school.nameEnglish : school.nameKhmer}
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Class Selector Switcher */}
      <div className="p-3.5 border-b border-slate-800/60 bg-slate-950/20 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t('selectClassLabel')}
          </label>
          {!isTeacher && (
            <Link
              href="/classes"
              onClick={closeSidebar}
              className="text-[10px] bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded font-bold transition-colors inline-flex items-center gap-1"
              title={t('createClassroom')}
            >
              <Plus className="w-2.5 h-2.5" />
              <span>{language === 'km' ? 'គ្រប់គ្រង' : 'Manage'}</span>
            </Link>
          )}
        </div>
        <div className="relative">
          {accessibleClasses.length > 0 ? (
            <>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  closeSidebar();
                }}
                className="w-full bg-slate-800/90 text-slate-200 text-xs rounded-lg pl-3 pr-8 py-2 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer transition-colors appearance-none"
              >
                {accessibleClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shift === 'MORNING' ? t('shiftMorningShort') : t('shiftAfternoonShort')})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </>
          ) : (
            <div className="w-full bg-slate-800/50 text-slate-400 text-[11px] rounded-lg px-3 py-2 border border-slate-700/40 italic">
              {language === 'km' ? 'គ្មានថ្នាក់ចាត់តាំង' : 'No assigned class'}
            </div>
          )}
        </div>
        {isTeacher && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
            <span className="truncate">{t('teacherScopeBadge')}</span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {t('navMainModules')}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeSidebar}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold ring-1 ring-blue-400/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Academic Status Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/50 shrink-0">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-200">{t('systemStatusNormal')}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">{language === 'km' ? 'ជំនាន់ ១.០' : 'v1.0 (MoEYS)'}</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {t('principalNameLabel')}: <span className="text-slate-200 font-semibold">{school.principalName}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sticky Sidebar (Pinned to Left Viewport) */}
      <aside className="hidden lg:flex shrink-0 h-screen sticky top-0 border-r border-slate-800/80 no-print z-30">
        {sidebarContent}
      </aside>

      {/* Mobile/Tablet Drawer Backdrop & Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden no-print flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Slide-out Sidebar Drawer */}
          <div className="relative z-50 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
