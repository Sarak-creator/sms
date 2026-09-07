'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, Lock, Calculator } from 'lucide-react';
import { useSchool } from '@/lib/stateContext';

interface AccessDeniedProps {
  requiredPermission?: string;
  customMessage?: string;
}

export function AccessDenied({ requiredPermission, customMessage }: AccessDeniedProps) {
  const { currentUser, language, t } = useSchool();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 shadow-xl p-6 sm:p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Shield Icon Badge */}
        <div className="relative mx-auto w-20 h-20">
          <div className="w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h2 className="text-lg font-black text-slate-800">
            {t('accessDeniedTitle')}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {customMessage || t('accessDeniedDesc')}
          </p>
        </div>

        {/* Current User Context */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span>{language === 'km' ? 'គណនីបច្ចុប្បន្ន:' : 'Logged In User:'}</span>
            <strong className="text-slate-800 font-mono">@{currentUser.username}</strong>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>{language === 'km' ? 'តួនាទី:' : 'Role:'}</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[11px]">
              {t(`role_${currentUser.role}` as any) || currentUser.role}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>{language === 'km' ? 'សិទ្ធិអនុញ្ញាត:' : 'Allowed Scope:'}</span>
            <span className="text-emerald-700 font-semibold text-[11px]">
              {language === 'km' ? 'ទិន្នន័យថ្នាក់បន្ទុកតែប៉ុណ្ណោះ' : 'Assigned Classes Only'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/gradebook"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>{t('accessDeniedBtnBack')}</span>
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'km' ? 'ផ្ទាំងគ្រប់គ្រង' : 'Dashboard'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
