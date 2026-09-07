'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import { TeacherData } from '@/lib/schoolData';
import {
  GraduationCap,
  Clock,
  Phone,
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  AlertTriangle,
  User,
  BookOpen,
  Briefcase,
  Layers,
  UserCheck,
  Shield,
} from 'lucide-react';

const CADRE_GROUPS = [
  {
    groupNameKm: '🎒 ក្របខ័ណ្ឌគ្រូបឋមសិក្សា (Primary School Cadres)',
    groupNameEn: 'Primary School Cadres',
    options: [
      'គ្រូបឋមសិក្សា (ខ.២.១)',
      'គ្រូបឋមសិក្សា (ខ.២.២)',
      'គ្រូបឋមសិក្សា (ខ.២.៣)',
      'គ្រូបឋមសិក្សា (ខ.២.៤)',
      'គ្រូបឋមសិក្សាជាន់ខ្ពស់ / បរិញ្ញាបត្រ (ក.២.១)',
      'គ្រូបឋមសិក្សាជាន់ខ្ពស់ / បរិញ្ញាបត្រ (ក.២.២)',
      'គ្រូបឋមសិក្សាជាន់ខ្ពស់ / បរិញ្ញាបត្រ (ក.២.៣)',
      'គ្រូបឋមសិក្សា (គ.១.១)',
      'គ្រូបឋមសិក្សា (គ.១.២)',
      'គ្រូបង្រៀនជាប់កិច្ចសន្យាបឋមសិក្សា',
      'គរុសិស្សបឋមសិក្សា',
    ],
  },
  {
    groupNameKm: '🏫 ក្របខ័ណ្ឌគ្រូមធ្យមសិក្សា (Secondary School Cadres)',
    groupNameEn: 'Secondary School Cadres',
    options: [
      'គ្រូមធ្យមសិក្សាទុតិយភូមិ (ក.១.១)',
      'គ្រូមធ្យមសិក្សាទុតិយភូមិ (ក.១.២)',
      'គ្រូមធ្យមសិក្សាទុតិយភូមិ (ក.១.៣)',
      'គ្រូមធ្យមសិក្សាទុតិយភូមិ (ក.១.៤)',
      'គ្រូមធ្យមសិក្សាបឋមភូមិ (ខ.១.១)',
      'គ្រូមធ្យមសិក្សាបឋមភូមិ (ខ.១.២)',
      'គ្រូមធ្យមសិក្សាបឋមភូមិ (ខ.១.៣)',
      'គ្រូមធ្យមសិក្សាបឋមភូមិ (ខ.១.៤)',
    ],
  },
  {
    groupNameKm: '🏢 ក្របខ័ណ្ឌផ្សេងៗ (Other Cadres)',
    groupNameEn: 'Other Cadres',
    options: [
      'គ្រូមត្តេយ្យសិក្សា (ខ.៣ / គ.២)',
      'មន្ត្រីរដ្ឋបាលអប់រំ / បុគ្គលិកអប់រំ',
    ],
  },
];

const CADRE_OPTIONS = CADRE_GROUPS.flatMap((g) => g.options);

const EMPTY_FORM: TeacherData = {
  civilServantId: '',
  khmerName: '',
  latinName: '',
  gender: 'MALE',
  cadre: 'គ្រូបឋមសិក្សា (ខ.២.១)',
  specialization: 'គរុកោសល្យបឋមសិក្សា (ទូទៅ/គ្រប់មុខវិជ្ជា)',
  standardQuota: 18,
  assignedShift: 'MORNING',
  phoneNumber: '',
  dob: new Date('1988-01-01'),
};

import Link from 'next/link';
import { AccessDenied } from '@/components/AccessDenied';

export default function TeachersPage() {
  const {
    school,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    specializations,
    users,
    hasPermission,
    canAccessRoute,
    language,
    t,
  } = useSchool();

  if (!canAccessRoute('/teachers') && !hasPermission('canManageTeachers')) {
    return <AccessDenied />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'PRIMARY' | 'SECONDARY'>('ALL');
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'AFTERNOON'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formData, setFormData] = useState<TeacherData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<TeacherData | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isPrimaryTeacher = (tch: TeacherData) => {
    return (
      tch.cadre.includes('បឋមសិក្សា') ||
      tch.specialization.includes('បឋម') ||
      tch.specialization.includes('គរុកោសល្យ')
    );
  };

  // Filter teachers
  const filteredTeachers = teachers.filter((tch) => {
    const isPri = isPrimaryTeacher(tch);
    const matchesLevel =
      levelFilter === 'ALL' ||
      (levelFilter === 'PRIMARY' && isPri) ||
      (levelFilter === 'SECONDARY' && !isPri);
    const matchesSearch =
      tch.khmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.civilServantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tch.cadre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = shiftFilter === 'ALL' || tch.assignedShift === shiftFilter;
    const matchesSubject = subjectFilter === 'ALL' || tch.specialization === subjectFilter;
    return matchesLevel && matchesSearch && matchesShift && matchesSubject;
  });

  // KPI Metrics
  const primaryTeachersCount = teachers.filter(isPrimaryTeacher).length;
  const secondaryTeachersCount = teachers.length - primaryTeachersCount;

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('ADD');
    const randomIdNumber = Math.floor(10000 + Math.random() * 90000);
    setFormData({
      ...EMPTY_FORM,
      civilServantId: `T-${randomIdNumber}`,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tch: TeacherData) => {
    setModalMode('EDIT');
    setFormData({ ...tch });
    setFormError('');
    setIsModalOpen(true);
  };

  // Submit Form (Add or Edit)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.khmerName.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលគោត្តនាម-នាម!' : 'Please enter Khmer Name!');
      return;
    }
    if (!formData.latinName.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះឡាតាំង!' : 'Please enter Latin Name!');
      return;
    }
    if (!formData.civilServantId.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលអត្តលេខមន្ត្រីរាជការ!' : 'Please enter Civil Servant ID!');
      return;
    }

    if (modalMode === 'ADD') {
      // Check ID duplicate
      const exists = teachers.some((t) => t.civilServantId === formData.civilServantId);
      if (exists) {
        setFormError(
          language === 'km' ? 'អត្តលេខនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!' : 'This Civil Servant ID already exists!'
        );
        return;
      }
      addTeacher(formData);
      showToast(
        language === 'km'
          ? `បានបន្ថែមគ្រូបង្រៀន "${formData.khmerName}" ដោយជោគជ័យ!`
          : `Teacher "${formData.latinName}" added successfully!`
      );
    } else {
      updateTeacher(formData.civilServantId, formData);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលព័ត៌មានគ្រូ "${formData.khmerName}" ដោយជោគជ័យ!`
          : `Teacher "${formData.latinName}" updated successfully!`
      );
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteTeacher(deleteTarget.civilServantId);
      showToast(
        language === 'km'
          ? `បានលុបគ្រូបង្រៀន "${deleteTarget.khmerName}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Teacher "${deleteTarget.latinName}" deleted successfully!`
      );
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('teacherWorkloadTitle')}
            </h1>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
              {teachers.length} {t('studentCountUnit')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'km'
              ? 'គ្រប់គ្រងគ្រូបង្រៀនកម្រិតបឋមសិក្សា និងមធ្យមសិក្សា ក្របខ័ណ្ឌ និងបន្ទុកម៉ោងបង្រៀន'
              : 'Manage Primary & Secondary school teachers, civil servant cadres, and teaching quotas'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'km' ? 'បន្ថែមគ្រូបង្រៀន' : 'Add New Teacher'}</span>
          </button>
          <div className="px-3.5 py-2 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{language === 'km' ? 'ស្តង់ដារ MoEYS: ១៦-១៨ ម៉ោង' : 'MoEYS: 16-18h/wk'}</span>
          </div>
        </div>
      </div>

      {/* Level Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
              👥
            </div>
            <div>
              <div className="text-[11px] text-slate-500 font-bold">{language === 'km' ? 'សរុបគ្រូបង្រៀន' : 'Total Teachers'}</div>
              <div className="text-base font-black text-slate-800 font-mono">{teachers.length} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'នាក់' : 'staff'}</span></div>
            </div>
          </div>
          <button
            onClick={() => setLevelFilter('ALL')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              levelFilter === 'ALL' ? 'bg-indigo-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'km' ? 'មើលទាំងអស់' : 'View All'}
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              🎒
            </div>
            <div>
              <div className="text-[11px] text-emerald-800 font-bold">{language === 'km' ? 'គ្រូបឋមសិក្សា' : 'Primary Teachers'}</div>
              <div className="text-base font-black text-emerald-900 font-mono">{primaryTeachersCount} <span className="text-xs font-normal text-emerald-700">{language === 'km' ? 'នាក់' : 'staff'}</span></div>
            </div>
          </div>
          <button
            onClick={() => setLevelFilter('PRIMARY')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              levelFilter === 'PRIMARY' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
            }`}
          >
            {language === 'km' ? 'ចម្រាញ់បឋម' : 'Filter Primary'}
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
              🏫
            </div>
            <div>
              <div className="text-[11px] text-blue-800 font-bold">{language === 'km' ? 'គ្រូមធ្យមសិក្សា' : 'Secondary Teachers'}</div>
              <div className="text-base font-black text-blue-900 font-mono">{secondaryTeachersCount} <span className="text-xs font-normal text-blue-700">{language === 'km' ? 'នាក់' : 'staff'}</span></div>
            </div>
          </div>
          <button
            onClick={() => setLevelFilter('SECONDARY')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              levelFilter === 'SECONDARY' ? 'bg-blue-600 text-white shadow-2xs' : 'bg-blue-100/70 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {language === 'km' ? 'ចម្រាញ់មធ្យម' : 'Filter Secondary'}
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter Tabs */}
          <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'កម្រិត:' : 'Level:'}</span>
          {[
            { id: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All' },
            { id: 'PRIMARY', labelKm: '🎒 បឋមសិក្សា', labelEn: 'Primary' },
            { id: 'SECONDARY', labelKm: '🏫 មធ្យមសិក្សា', labelEn: 'Secondary' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setLevelFilter(lvl.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                levelFilter === lvl.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'km' ? lvl.labelKm : lvl.labelEn}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Shift Filter */}
          <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'វេន:' : 'Shift:'}</span>
          {(['ALL', 'MORNING', 'AFTERNOON'] as const).map((sh) => (
            <button
              key={sh}
              onClick={() => setShiftFilter(sh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === sh
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sh === 'ALL'
                ? t('all')
                : sh === 'MORNING'
                ? t('shiftMorningShort')
                : t('shiftAfternoonShort')}
            </button>
          ))}

          {/* Subject Filter Dropdown */}
          <div className="ml-2 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{t('specializationLabel')}:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer max-w-[200px]"
            >
              <option value="ALL">{t('all')}</option>
              <optgroup label={language === 'km' ? '🎒 ឯកទេសបឋមសិក្សា' : 'Primary Specializations'}>
                {specializations
                  .filter((s) => s.category === 'PRIMARY' || s.nameKhmer.includes('បឋម'))
                  .map((spec) => (
                    <option key={spec.code} value={spec.nameKhmer}>
                      {spec.nameKhmer}
                    </option>
                  ))}
              </optgroup>
              <optgroup label={language === 'km' ? '🏫 ឯកទេសមធ្យមសិក្សា' : 'Secondary Specializations'}>
                {specializations
                  .filter((s) => s.category !== 'PRIMARY' && !s.nameKhmer.includes('បឋម'))
                  .map((spec) => (
                    <option key={spec.code} value={spec.nameKhmer}>
                      {spec.nameKhmer}
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះ, ក្របខ័ណ្ឌ ឬឯកទេស...' : 'Search teacher name, cadre, specialization...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeachers.map((tch) => {
          const isPri = isPrimaryTeacher(tch);
          const quotaStatus =
            tch.standardQuota >= 16 && tch.standardQuota <= 18
              ? language === 'km' ? 'ស្តង់ដារ MoEYS' : 'MoEYS Standard'
              : tch.standardQuota > 18
              ? language === 'km' ? 'លើសបន្ទុក' : 'Overload'
              : language === 'km' ? 'ក្រោមបន្ទុក' : 'Underload';

          return (
            <div
              key={tch.civilServantId}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 relative group ${
                isPri
                  ? 'border-emerald-200/90 hover:border-emerald-400'
                  : 'border-slate-200/80 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold text-base shadow-md shrink-0 ${
                    isPri
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
                      : 'bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-indigo-500/20'
                  }`}>
                    {tch.khmerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-800 truncate">
                        {language === 'en' ? tch.latinName : tch.khmerName}
                      </h3>
                      {isPri ? (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded shrink-0">
                          បឋម
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-bold rounded shrink-0">
                          មធ្យម
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      {language === 'en' ? tch.khmerName : tch.latinName}
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono font-bold text-[10px] rounded-md border border-slate-200 shrink-0">
                  {tch.civilServantId}
                </span>
              </div>

              {/* Specialization & Cadre */}
              <div className={`space-y-1.5 text-xs p-3 rounded-xl border ${
                isPri ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-start justify-between text-slate-600 gap-2">
                  <span className="shrink-0">{t('specializationLabel')}:</span>
                  <strong className="text-slate-800 font-bold text-right truncate" title={tch.specialization}>
                    {tch.specialization}
                  </strong>
                </div>
                <div className="flex items-start justify-between text-slate-600 gap-2">
                  <span className="shrink-0">{t('cadreLabel')}:</span>
                  <span className="text-[11px] text-slate-700 font-medium text-right truncate max-w-[170px]" title={tch.cadre}>
                    {tch.cadre}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{t('shiftLabel')}:</span>
                  <span className="text-emerald-700 font-bold">
                    {tch.assignedShift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
                  </span>
                </div>
              </div>

              {/* Teaching Quota Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">{t('workloadQuotaLabel')}:</span>
                  <span className={`font-mono font-black ${isPri ? 'text-emerald-700' : 'text-indigo-700'}`}>
                    {tch.standardQuota} {t('hoursPerWeekUnit')}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isPri ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, (tch.standardQuota / 20) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Min 16h</span>
                  <span className="text-emerald-600 font-bold">{quotaStatus}</span>
                  <span>Max 18h</span>
                </div>
              </div>

              {/* Contact & Active Status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{tch.phoneNumber || '012 xxx xxx'}</span>
                </div>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'km' ? 'កិច្ចសន្យាសកម្ម' : 'Active Status'}</span>
                </span>
              </div>

              {/* Linked User Account / RBAC Badge */}
              {(() => {
                const linkedUser = users.find((u) => u.teacherId === tch.civilServantId);
                return (
                  <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0 ${
                        linkedUser ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}>
                        <UserCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        {linkedUser ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-800 font-mono text-[11px] truncate">
                              @{linkedUser.username}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                              {t(`role_${linkedUser.role}` as any) || linkedUser.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            {language === 'km' ? 'មិនទាន់មានគណនី User' : 'No User Account linked'}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/users"
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline shrink-0"
                    >
                      {linkedUser
                        ? language === 'km' ? 'សិទ្ធិប្រើប្រាស់ →' : 'Permissions →'
                        : language === 'km' ? '+ បង្កើត User' : '+ Create User'}
                    </Link>
                  </div>
                );
              })()}

              {/* Action Buttons: Edit & Delete */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(tch)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title={language === 'km' ? 'កែសម្រួលព័ត៌មានគ្រូ' : 'Edit Teacher'}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(tch)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                  title={language === 'km' ? 'លុបគ្រូបង្រៀន' : 'Delete Teacher'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'លុប' : 'Delete'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យគ្រូបង្រៀនដែលស្វែងរកទេ' : 'No teachers found matching your criteria'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'km' ? 'សូមព្យាយាមស្វែងរកជាមួយពាក្យគន្លឹះផ្សេង ឬចុចបន្ថែមគ្រូបង្រៀនថ្មី។' : 'Try searching with another keyword or click Add New Teacher.'}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT TEACHER                                     */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  {modalMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {modalMode === 'ADD'
                      ? language === 'km'
                        ? 'បន្ថែមគ្រូបង្រៀនថ្មី'
                        : 'Add New Teacher'
                      : language === 'km'
                      ? 'កែសម្រួលព័ត៌មានគ្រូបង្រៀន'
                      : 'Edit Teacher Information'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'km' ? 'គ្រប់គ្រងអត្តលេខ ក្របខណ្ឌ និងបន្ទុកម៉ោង' : 'Manage civil servant ID, cadre, and workload'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Khmer Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'គោត្តនាម-នាម *' : 'Khmer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. សេង វណ្ណឌី' : 'e.g. SENG VANDY'}
                    value={formData.khmerName}
                    onChange={(e) => setFormData({ ...formData, khmerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Latin Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះឡាតាំង (Latin Name) *' : 'Latin Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SENG VANDY"
                    value={formData.latinName}
                    onChange={(e) => setFormData({ ...formData, latinName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Civil Servant ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'អត្តលេខមន្ត្រីរាជការ *' : 'Civil Servant ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={modalMode === 'EDIT'}
                    placeholder="e.g. T-019842"
                    value={formData.civilServantId}
                    onChange={(e) => setFormData({ ...formData, civilServantId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('genderHeader')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MALE">{t('male')}</option>
                    <option value="FEMALE">{t('female')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Specialization */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('specializationLabel')}</label>
                  <select
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <optgroup label={language === 'km' ? '🎒 ឯកទេសបង្រៀនបឋមសិក្សា (Primary)' : 'Primary Specializations'}>
                      {specializations
                        .filter((s) => s.category === 'PRIMARY' || s.nameKhmer.includes('បឋម'))
                        .map((spec) => (
                          <option key={spec.code} value={spec.nameKhmer}>
                            {spec.nameKhmer} ({spec.code})
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label={language === 'km' ? '🏫 ឯកទេសបង្រៀនមធ្យមសិក្សា (Secondary)' : 'Secondary Specializations'}>
                      {specializations
                        .filter((s) => s.category !== 'PRIMARY' && !s.nameKhmer.includes('បឋម'))
                        .map((spec) => (
                          <option key={spec.code} value={spec.nameKhmer}>
                            {spec.nameKhmer} ({spec.code})
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>

                {/* Assigned Shift */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('shiftLabel')}</label>
                  <select
                    value={formData.assignedShift}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedShift: e.target.value as 'MORNING' | 'AFTERNOON' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="MORNING">{t('shiftMorning')}</option>
                    <option value="AFTERNOON">{t('shiftAfternoon')}</option>
                  </select>
                </div>
              </div>

              {/* Civil Servant Cadre */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('cadreLabel')}</label>
                <select
                  value={formData.cadre}
                  onChange={(e) => setFormData({ ...formData, cadre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CADRE_GROUPS.map((group) => (
                    <optgroup key={group.groupNameKm} label={language === 'km' ? group.groupNameKm : group.groupNameEn}>
                      {group.options.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Standard Workload Quota */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'បន្ទុកម៉ោងបង្រៀន (១៦-១៨ ម៉/សប្តាហ៍)' : 'Workload (16-18h/wk)'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="30"
                    required
                    value={formData.standardQuota}
                    onChange={(e) => setFormData({ ...formData, standardQuota: parseInt(e.target.value) || 18 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('phoneLabel')}</label>
                  <input
                    type="text"
                    placeholder="012 889 901"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  {modalMode === 'ADD'
                    ? language === 'km'
                      ? 'រក្សាទុកគ្រូថ្មី'
                      : 'Save Teacher'
                    : language === 'km'
                    ? 'ធ្វើបច្ចុប្បន្នភាព'
                    : 'Update Information'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE CONFIRMATION                                     */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {language === 'km' ? 'បញ្ជាក់ការលុបគ្រូបង្រៀន' : 'Confirm Teacher Deletion'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបលោកគ្រូ/អ្នកគ្រូ "${deleteTarget.khmerName}" (${deleteTarget.civilServantId}) ចេញពីប្រព័ន្ធមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។`
                  : `Are you sure you want to remove teacher "${deleteTarget.latinName}" (${deleteTarget.civilServantId}) from the system? This action cannot be undone.`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">{deleteTarget.khmerName}</span>
                <span className="text-[11px] text-slate-400 block font-mono">{deleteTarget.latinName}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded-md border border-blue-200">
                {deleteTarget.specialization}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                {language === 'km' ? 'យល់ព្រមលុប' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
