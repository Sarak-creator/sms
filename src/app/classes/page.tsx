'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import { ClassRoom } from '@/lib/mockData';
import {
  School,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  DoorOpen,
  GraduationCap,
  Users,
  Clock,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
  Calculator,
  SlidersHorizontal,
  CheckSquare,
  Square,
} from 'lucide-react';
import Link from 'next/link';

const EMPTY_CLASS_FORM: ClassRoom = {
  id: '',
  name: '',
  gradeLevel: 'GRADE_1',
  track: 'GENERAL',
  shift: 'MORNING',
  roomNumber: 'បន្ទប់ ១០១',
  homeroomTeacherId: '',
  homeroomTeacherName: '',
  totalStudents: 30,
  femaleStudents: 15,
  subjectDivisor: 21,
  semesterDivisor: 14,
  disabledColumnKeys: [],
};

const GRADE_INFO: Record<
  string,
  { numKm: string; labelKm: string; isPrimary: boolean; isLowerSec: boolean; isUpperSec: boolean }
> = {
  GRADE_1: { numKm: '១', labelKm: 'ថ្នាក់ទី ១', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_2: { numKm: '២', labelKm: 'ថ្នាក់ទី ២', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_3: { numKm: '៣', labelKm: 'ថ្នាក់ទី ៣', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_4: { numKm: '៤', labelKm: 'ថ្នាក់ទី ៤', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_5: { numKm: '៥', labelKm: 'ថ្នាក់ទី ៥', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_6: { numKm: '៦', labelKm: 'ថ្នាក់ទី ៦', isPrimary: true, isLowerSec: false, isUpperSec: false },
  GRADE_7: { numKm: '៧', labelKm: 'ថ្នាក់ទី ៧', isPrimary: false, isLowerSec: true, isUpperSec: false },
  GRADE_8: { numKm: '៨', labelKm: 'ថ្នាក់ទី ៨', isPrimary: false, isLowerSec: true, isUpperSec: false },
  GRADE_9: { numKm: '៩', labelKm: 'ថ្នាក់ទី ៩', isPrimary: false, isLowerSec: true, isUpperSec: false },
  GRADE_10: { numKm: '១០', labelKm: 'ថ្នាក់ទី ១០', isPrimary: false, isLowerSec: false, isUpperSec: true },
  GRADE_11: { numKm: '១១', labelKm: 'ថ្នាក់ទី ១១', isPrimary: false, isLowerSec: false, isUpperSec: true },
  GRADE_12: { numKm: '១២', labelKm: 'ថ្នាក់ទី ១២', isPrimary: false, isLowerSec: false, isUpperSec: true },
};

export default function ClassesPage() {
  const {
    school,
    classes,
    accessibleClasses,
    canAccessClass,
    isTeacher,
    hasPermission,
    addClass,
    updateClass,
    deleteClass,
    selectedClassId,
    setSelectedClassId,
    students,
    teachers,
    allCompetencyColumns,
    monthlySubjectGroups,
    disabledColumnsMap,
    toggleColumnForClass,
    setDisabledColumnsForClass,
    updateClassDivisor,
    language,
    t,
  } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'PRIMARY' | 'LOWER_SEC' | 'UPPER_SEC'>('ALL');
  const [specificGradeFilter, setSpecificGradeFilter] = useState<string>('ALL');
  const [trackFilter, setTrackFilter] = useState<string>('ALL');

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formData, setFormData] = useState<ClassRoom>(EMPTY_CLASS_FORM);
  const [formError, setFormError] = useState('');

  // Quick Subject & Divisor Configuration Modal State
  const [configTargetClass, setConfigTargetClass] = useState<ClassRoom | null>(null);
  const [configDivisor, setConfigDivisor] = useState<number>(21);
  const [configSemesterDivisor, setConfigSemesterDivisor] = useState<number>(14);
  const [configDisabledCols, setConfigDisabledCols] = useState<string[]>([]);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ClassRoom | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isPrimary = (grade: string) => GRADE_INFO[grade]?.isPrimary ?? false;
  const isLowerSec = (grade: string) => GRADE_INFO[grade]?.isLowerSec ?? false;
  const isUpperSec = (grade: string) => GRADE_INFO[grade]?.isUpperSec ?? false;

  // Quick config modal handler
  const handleOpenConfig = (cls: ClassRoom) => {
    setConfigTargetClass(cls);
    setConfigDivisor(cls.subjectDivisor || 21);
    setConfigSemesterDivisor(cls.semesterDivisor || 14);
    setConfigDisabledCols(cls.disabledColumnKeys || disabledColumnsMap[cls.id] || []);
  };

  const handleSaveConfig = () => {
    if (!configTargetClass) return;
    updateClass(configTargetClass.id, {
      subjectDivisor: configDivisor,
      semesterDivisor: configSemesterDivisor,
      disabledColumnKeys: configDisabledCols,
    });
    setDisabledColumnsForClass(configTargetClass.id, configDisabledCols);
    showToast(
      language === 'km'
        ? `បានរក្សាទុកមុខវិជ្ជា និងតួរចែក (${configDivisor}) សម្រាប់ថ្នាក់ "${configTargetClass.name}" ចូលក្នុង Database រួចរាល់!`
        : `Subject configuration and divisor (${configDivisor}) saved to database!`
    );
    setConfigTargetClass(null);
  };

  // Filter classes according to accessible scope for teachers
  const targetClasses = isTeacher ? accessibleClasses : classes;

  const filteredClasses = targetClasses.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.homeroomTeacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gradeLevel.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      levelFilter === 'ALL' ||
      (levelFilter === 'PRIMARY' && isPrimary(c.gradeLevel)) ||
      (levelFilter === 'LOWER_SEC' && isLowerSec(c.gradeLevel)) ||
      (levelFilter === 'UPPER_SEC' && isUpperSec(c.gradeLevel));

    const matchesSpecificGrade =
      specificGradeFilter === 'ALL' || c.gradeLevel === specificGradeFilter;

    const matchesTrack = trackFilter === 'ALL' || c.track === trackFilter;

    return matchesSearch && matchesLevel && matchesSpecificGrade && matchesTrack;
  });

  // KPI Metrics
  const primaryClassesCount = targetClasses.filter((c) => isPrimary(c.gradeLevel)).length;
  const secondaryClassesCount = targetClasses.length - primaryClassesCount;
  const totalStudentsCount = targetClasses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const femaleStudentsCount = targetClasses.reduce((sum, c) => sum + (c.femaleStudents || 0), 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('ADD');
    const defaultGrade: ClassRoom['gradeLevel'] = 'GRADE_1';
    const defaultTeacher =
      teachers.find((t) => t.cadre.includes('បឋមសិក្សា') || t.specialization.includes('បឋម')) ||
      teachers[0] || { civilServantId: '', khmerName: '' };

    setFormData({
      ...EMPTY_CLASS_FORM,
      id: `c-1-gen-${Date.now().toString().slice(-4)}`,
      name: 'ថ្នាក់ទី ១ A (បឋមសិក្សា)',
      gradeLevel: defaultGrade,
      track: 'GENERAL',
      roomNumber: 'បន្ទប់ ប.១០១',
      homeroomTeacherId: defaultTeacher.civilServantId,
      homeroomTeacherName: defaultTeacher.khmerName,
      subjectDivisor: 21,
      semesterDivisor: 14,
      disabledColumnKeys: [],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: ClassRoom) => {
    setModalMode('EDIT');
    setFormData({
      ...c,
      subjectDivisor: c.subjectDivisor || 21,
      semesterDivisor: c.semesterDivisor || 14,
      disabledColumnKeys: c.disabledColumnKeys || disabledColumnsMap[c.id] || [],
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Auto update class name suggestion based on grade & track
  const handleGradeOrTrackChange = (grade: ClassRoom['gradeLevel'], track: ClassRoom['track']) => {
    const info = GRADE_INFO[grade] || { numKm: '១', isPrimary: true };
    let suggestedName = '';

    if (info.isPrimary) {
      suggestedName = `ថ្នាក់ទី ${info.numKm} A (បឋមសិក្សា)`;
    } else if (grade === 'GRADE_7' || grade === 'GRADE_8' || grade === 'GRADE_9' || grade === 'GRADE_10') {
      suggestedName = `ថ្នាក់ទី ${info.numKm} A (ទូទៅ)`;
    } else {
      const trackText =
        track === 'SOCIAL_SCIENCE' ? 'សង្គម' : track === 'SCIENCE' ? 'វិទ្យាសាស្ត្រ' : 'ទូទៅ';
      suggestedName = `ថ្នាក់ទី ${info.numKm} ${trackText} ១`;
    }

    setFormData((prev) => ({
      ...prev,
      gradeLevel: grade,
      track: track,
      name: suggestedName,
    }));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះថ្នាក់រៀន!' : 'Please enter classroom name!');
      return;
    }

    if (modalMode === 'ADD') {
      const uniqueId = `c-${formData.gradeLevel.toLowerCase().replace('grade_', '')}-${Date.now()}`;
      addClass({
        ...formData,
        id: uniqueId,
      });
      showToast(
        language === 'km'
          ? `បានបង្កើតថ្នាក់រៀន "${formData.name}" ដោយជោគជ័យ!`
          : `Classroom "${formData.name}" created successfully!`
      );
    } else {
      updateClass(formData.id, formData);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលព័ត៌មានថ្នាក់ "${formData.name}" ដោយជោគជ័យ!`
          : `Classroom "${formData.name}" updated successfully!`
      );
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (classes.length <= 1) {
        showToast(
          language === 'km'
            ? 'មិនអាចលុបថ្នាក់ចុងក្រោយបានទេ! សាលាត្រូវមានយ៉ាងហោចណាស់ថ្នាក់មួយ។'
            : 'Cannot delete the only remaining classroom in the school.'
        );
        setDeleteTarget(null);
        return;
      }

      deleteClass(deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបថ្នាក់រៀន "${deleteTarget.name}" រួចរាល់!`
          : `Classroom "${deleteTarget.name}" deleted successfully!`
      );
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Teacher Scope Notice Banner */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-emerald-950 font-bold">
                {t('teacherScopeBadge')}
              </strong>
              <p className="text-slate-600 text-[11px] mt-0.5">
                {t('onlyAssignedClassNotice')}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg border border-emerald-200 text-[11px] shrink-0">
            {accessibleClasses.length} {language === 'km' ? 'ថ្នាក់ទទួលបន្ទុក' : 'Assigned Classes'}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <School className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {language === 'km' ? 'ការគ្រប់គ្រង និងបង្កើតថ្នាក់រៀន' : 'Classroom & Section Management'}
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {targetClasses.length} {language === 'km' ? 'ថ្នាក់' : 'Classes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'km'
              ? 'បង្កើត និងគ្រប់គ្រងថ្នាក់រៀនកម្រិតបឋមសិក្សា (ថ្នាក់ទី ១-៦) និងមធ្យមសិក្សា (ថ្នាក់ទី ៧-១២)'
              : 'Create and organize Primary (Grade 1-6) and Secondary (Grade 7-12) classrooms, sections, and homeroom teachers.'}
          </p>
        </div>

        {/* Action Controls */}
        {(!isTeacher || hasPermission('canManageClasses')) && (
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? '+ បង្កើតថ្នាក់រៀនថ្មី' : '+ Create Classroom'}</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
            <School className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">{language === 'km' ? 'សរុបថ្នាក់រៀន' : 'Total Classes'}</div>
            <div className="text-base font-black text-slate-800 font-mono">
              {classes.length} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'ថ្នាក់' : 'classes'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
            🎒
          </div>
          <div>
            <div className="text-[11px] text-emerald-800 font-bold">{language === 'km' ? 'ថ្នាក់បឋមសិក្សា' : 'Primary Classes'}</div>
            <div className="text-base font-black text-emerald-950 font-mono">
              {primaryClassesCount} <span className="text-xs font-normal text-emerald-700">{language === 'km' ? 'ថ្នាក់' : 'classes'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200/80 bg-gradient-to-br from-white to-blue-50/30 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
            🏫
          </div>
          <div>
            <div className="text-[11px] text-blue-800 font-bold">{language === 'km' ? 'ថ្នាក់មធ្យមសិក្សា' : 'Secondary Classes'}</div>
            <div className="text-base font-black text-blue-950 font-mono">
              {secondaryClassesCount} <span className="text-xs font-normal text-blue-700">{language === 'km' ? 'ថ្នាក់' : 'classes'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/30 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-purple-800 font-bold">{language === 'km' ? 'សរុបសិស្សទាំងអស់' : 'Total Enrolled'}</div>
            <div className="text-base font-black text-purple-950 font-mono">
              {totalStudentsCount} <span className="text-xs font-normal text-purple-700">({t('female')} {femaleStudentsCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Level Filter Tabs */}
          <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'កម្រិត:' : 'Level:'}</span>
          {[
            { id: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All' },
            { id: 'PRIMARY', labelKm: '🎒 បឋម (ទី១-៦)', labelEn: 'Primary (1-6)' },
            { id: 'LOWER_SEC', labelKm: '📘 អនុវិទ្យាល័យ (ទី៧-៩)', labelEn: 'Lower Sec (7-9)' },
            { id: 'UPPER_SEC', labelKm: '🏫 វិទ្យាល័យ (ទី១០-១២)', labelEn: 'Upper Sec (10-12)' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setLevelFilter(lvl.id as any);
                setSpecificGradeFilter('ALL');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                levelFilter === lvl.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {language === 'km' ? lvl.labelKm : lvl.labelEn}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Specific Grade Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{t('gradeLevelLabel')}:</span>
            <select
              value={specificGradeFilter}
              onChange={(e) => setSpecificGradeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('all')}</option>
              <optgroup label="🎒 កម្រិតបឋមសិក្សា">
                <option value="GRADE_1">ថ្នាក់ទី ១</option>
                <option value="GRADE_2">ថ្នាក់ទី ២</option>
                <option value="GRADE_3">ថ្នាក់ទី ៣</option>
                <option value="GRADE_4">ថ្នាក់ទី ៤</option>
                <option value="GRADE_5">ថ្នាក់ទី ៥</option>
                <option value="GRADE_6">ថ្នាក់ទី ៦</option>
              </optgroup>
              <optgroup label="📘 អនុវិទ្យាល័យ">
                <option value="GRADE_7">ថ្នាក់ទី ៧</option>
                <option value="GRADE_8">ថ្នាក់ទី ៨</option>
                <option value="GRADE_9">ថ្នាក់ទី ៩</option>
              </optgroup>
              <optgroup label="🏫 វិទ្យាល័យ">
                <option value="GRADE_10">ថ្នាក់ទី ១០</option>
                <option value="GRADE_11">ថ្នាក់ទី ១១</option>
                <option value="GRADE_12">ថ្នាក់ទី ១២</option>
              </optgroup>
            </select>
          </div>

          {/* Track Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{t('trackLabel')}:</span>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('all')}</option>
              <option value="GENERAL">{language === 'km' ? 'ចំណេះទូទៅ / បឋម' : 'General / Primary'}</option>
              <option value="SCIENCE">{language === 'km' ? 'វិទ្យាសាស្ត្រ (STEM)' : 'Science'}</option>
              <option value="SOCIAL_SCIENCE">{language === 'km' ? 'សង្គមវិទ្យា' : 'Social Science'}</option>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះថ្នាក់ បន្ទប់ ឬគ្រូ...' : 'Search class, room, or teacher...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClasses.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const isPri = isPrimary(cls.gradeLevel);

          const trackBadge =
            cls.track === 'SCIENCE'
              ? { text: language === 'km' ? 'វិទ្យាសាស្ត្រ (STEM)' : 'Science Track', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
              : cls.track === 'SOCIAL_SCIENCE'
              ? { text: language === 'km' ? 'សង្គមវិទ្យា' : 'Social Science', bg: 'bg-amber-50 text-amber-700 border-amber-200' }
              : { text: language === 'km' ? (isPri ? 'កម្មវិធីបឋមសិក្សា' : 'ចំណេះទូទៅ') : 'General Track', bg: 'bg-blue-50 text-blue-700 border-blue-200' };

          const gradeDisplay = GRADE_INFO[cls.gradeLevel]?.labelKm || cls.gradeLevel.replace('GRADE_', 'ថ្នាក់ទី ');

          return (
            <div
              key={cls.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 relative ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : isPri
                  ? 'border-emerald-200/90 hover:border-emerald-400'
                  : 'border-slate-200/80 hover:border-blue-300'
              }`}
            >
              {/* Top Title & Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 font-mono font-bold text-[10px] rounded-md ${
                      isPri ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {gradeDisplay}
                    </span>
                    <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md border ${trackBadge.bg}`}>
                      {trackBadge.text}
                    </span>
                    {isPri ? (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold rounded">
                        🎒 បឋម
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-bold rounded">
                        🏫 មធ្យម
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-800 truncate" title={cls.name}>
                    {cls.name}
                  </h3>
                </div>

                {isSelected && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-xs shrink-0">
                    {language === 'km' ? 'កំពុងជ្រើស' : 'Active'}
                  </span>
                )}
              </div>

              {/* Details Box */}
              <div className={`space-y-2 text-xs p-3.5 rounded-xl border ${
                isPri ? 'bg-emerald-50/40 border-emerald-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t('roomNumberLabel')}:</span>
                  </span>
                  <strong className="text-slate-800 font-bold">{cls.roomNumber}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{language === 'km' ? 'វេនសិក្សា:' : 'Shift:'}</span>
                  </span>
                  <span className="font-bold text-blue-700">
                    {cls.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t('homeroomTeacherLabel')}:</span>
                  </span>
                  <strong className="text-slate-800 font-bold truncate max-w-[160px]" title={cls.homeroomTeacherName}>
                    {cls.homeroomTeacherName || (language === 'km' ? 'មិនទាន់ចាត់តាំង' : 'Unassigned')}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t('kpiTotalStudents')}:</span>
                  </span>
                  {(() => {
                    const classStudents = students.filter((s) => s.classId === cls.id);
                    const totalEnrolled = classStudents.length;
                    const femaleEnrolled = classStudents.filter((s) => s.gender === 'FEMALE').length;
                    return (
                      <span className="font-bold text-slate-800">
                        {totalEnrolled} {t('studentCountUnit')} ({t('female')} {femaleEnrolled})
                      </span>
                    );
                  })()}
                </div>

                {/* Per-class Divisor and Examined Subjects Info */}
                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-xs">
                  <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{language === 'km' ? 'តួរចែកមធ្យមភាគ:' : 'Divisor:'}</span>
                  </span>
                  <span className="font-mono font-black text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    ÷ {cls.subjectDivisor || 21}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{language === 'km' ? 'មុខវិជ្ជាប្រឡង:' : 'Exam Subjects:'}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {Math.max(0, (allCompetencyColumns?.length || 21) - (cls.disabledColumnKeys?.length || disabledColumnsMap[cls.id]?.length || 0))}/{allCompetencyColumns?.length || 21} ជំនាញ
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700'
                  }`}
                >
                  <span>
                    {isSelected
                      ? language === 'km'
                        ? 'ថ្នាក់កំពុងមើល'
                        : 'Viewing'
                      : language === 'km'
                      ? 'ប្តូរមកថ្នាក់នេះ'
                      : 'Select Class'}
                  </span>
                  {!isSelected && <ArrowRight className="w-3 h-3" />}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenConfig(cls)}
                    className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-indigo-200 flex items-center gap-1"
                    title={language === 'km' ? 'កំណត់មុខវិជ្ជាប្រឡង និងតួរចែក' : 'Configure Subjects & Divisor'}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{language === 'km' ? 'មុខវិជ្ជា & តួរចែក' : 'Config'}</span>
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cls)}
                    className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                    title={language === 'km' ? 'កែសម្រួល' : 'Edit'}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cls)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                    title={language === 'km' ? 'លុបថ្នាក់រៀន' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យថ្នាក់រៀនដែលស្វែងរកទេ' : 'No classrooms found matching your criteria'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'km'
              ? 'សូមជ្រើសរើសកម្រិតថ្នាក់ផ្សេង ឬចុចបង្កើតថ្នាក់រៀនថ្មី។'
              : 'Try selecting another grade filter or click + Create Classroom.'}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT CLASSROOM                                    */}
      {/* ------------------------------------------------------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {modalMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {modalMode === 'ADD'
                      ? language === 'km'
                        ? 'បង្កើតថ្នាក់រៀនថ្មី (MoEYS)'
                        : 'Create New Classroom'
                      : language === 'km'
                      ? 'កែសម្រួលព័ត៌មានថ្នាក់រៀន'
                      : 'Edit Classroom Details'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {school.nameKhmer} • {school.academicYear}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Grade Level */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('gradeLevelLabel')} *</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) =>
                      handleGradeOrTrackChange(e.target.value as ClassRoom['gradeLevel'], formData.track)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <optgroup label={language === 'km' ? '🎒 កម្រិតបឋមសិក្សា (Primary School)' : 'Primary School'}>
                      <option value="GRADE_1">ថ្នាក់ទី ១ (Grade 1)</option>
                      <option value="GRADE_2">ថ្នាក់ទី ២ (Grade 2)</option>
                      <option value="GRADE_3">ថ្នាក់ទី ៣ (Grade 3)</option>
                      <option value="GRADE_4">ថ្នាក់ទី ៤ (Grade 4)</option>
                      <option value="GRADE_5">ថ្នាក់ទី ៥ (Grade 5)</option>
                      <option value="GRADE_6">ថ្នាក់ទី ៦ (Grade 6)</option>
                    </optgroup>
                    <optgroup label={language === 'km' ? '📘 អនុវិទ្យាល័យ (Lower Secondary)' : 'Lower Secondary'}>
                      <option value="GRADE_7">ថ្នាក់ទី ៧ (Grade 7)</option>
                      <option value="GRADE_8">ថ្នាក់ទី ៨ (Grade 8)</option>
                      <option value="GRADE_9">ថ្នាក់ទី ៩ (Grade 9)</option>
                    </optgroup>
                    <optgroup label={language === 'km' ? '🏫 វិទ្យាល័យ (Upper Secondary)' : 'Upper Secondary'}>
                      <option value="GRADE_10">ថ្នាក់ទី ១០ (Grade 10)</option>
                      <option value="GRADE_11">ថ្នាក់ទី ១១ (Grade 11)</option>
                      <option value="GRADE_12">ថ្នាក់ទី ១២ (Grade 12)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Track */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('trackLabel')} *</label>
                  <select
                    value={formData.track}
                    onChange={(e) =>
                      handleGradeOrTrackChange(formData.gradeLevel, e.target.value as ClassRoom['track'])
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GENERAL">
                      {isPrimary(formData.gradeLevel)
                        ? language === 'km'
                          ? 'កម្មវិធីបឋមសិក្សាទូទៅ'
                          : 'Primary General'
                        : language === 'km'
                        ? 'ចំណេះទូទៅ'
                        : 'General Track'}
                    </option>
                    <option value="SCIENCE">{language === 'km' ? 'វិទ្យាសាស្ត្រ (STEM)' : 'Science'}</option>
                    <option value="SOCIAL_SCIENCE">{language === 'km' ? 'សង្គមវិទ្យា' : 'Social Science'}</option>
                  </select>
                </div>
              </div>

              {/* Classroom Name */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {language === 'km' ? 'ឈ្មោះថ្នាក់រៀន *' : 'Classroom Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'km' ? 'ឧ. ថ្នាក់ទី ១ A ឬ ថ្នាក់ទី ១១ វិទ្យាសាស្ត្រ ១' : 'e.g. Grade 1 A or Grade 11 Science 1'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Room Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('roomNumberLabel')}</label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. បន្ទប់ ប.១០១' : 'e.g. Room 101'}
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Shift */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{language === 'km' ? 'វេនសិក្សា' : 'Shift'}</label>
                  <select
                    value={formData.shift}
                    onChange={(e) =>
                      setFormData({ ...formData, shift: e.target.value as 'MORNING' | 'AFTERNOON' })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="MORNING">{t('shiftMorning')}</option>
                    <option value="AFTERNOON">{t('shiftAfternoon')}</option>
                  </select>
                </div>
              </div>

              {/* Homeroom Teacher */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('homeroomTeacherLabel')}</label>
                <select
                  value={formData.homeroomTeacherId}
                  onChange={(e) => {
                    const selected = teachers.find((tch) => tch.civilServantId === e.target.value);
                    setFormData({
                      ...formData,
                      homeroomTeacherId: e.target.value,
                      homeroomTeacherName: selected ? selected.khmerName : '',
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'km' ? '-- មិនទាន់ចាត់តាំង --' : '-- Unassigned --'}</option>
                  <optgroup label={language === 'km' ? '🎒 គ្រូបង្រៀនបឋមសិក្សា (Primary Teachers)' : 'Primary Teachers'}>
                    {teachers
                      .filter(
                        (tch) =>
                          tch.cadre.includes('បឋមសិក្សា') ||
                          tch.specialization.includes('បឋម') ||
                          tch.specialization.includes('គរុកោសល្យ')
                      )
                      .map((tch) => (
                        <option key={tch.civilServantId} value={tch.civilServantId}>
                          {tch.khmerName} ({tch.civilServantId} - {tch.specialization})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={language === 'km' ? '🏫 គ្រូបង្រៀនមធ្យមសិក្សា (Secondary Teachers)' : 'Secondary Teachers'}>
                    {teachers
                      .filter(
                        (tch) =>
                          !tch.cadre.includes('បឋមសិក្សា') &&
                          !tch.specialization.includes('បឋម') &&
                          !tch.specialization.includes('គរុកោសល្យ')
                      )
                      .map((tch) => (
                        <option key={tch.civilServantId} value={tch.civilServantId}>
                          {tch.khmerName} ({tch.civilServantId} - {tch.specialization})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Total Students */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('kpiTotalStudents')}</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={formData.totalStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, totalStudents: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Female Students */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'សិស្សស្រី (Female)' : 'Female Students'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={formData.totalStudents}
                    required
                    value={formData.femaleStudents}
                    onChange={(e) =>
                      setFormData({ ...formData, femaleStudents: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Divisor Configuration */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'km' ? 'តួរចែកមធ្យមភាគប្រចាំខែ (Divisor) *' : 'Monthly Average Divisor *'}</span>
                  </label>
                  <span className="text-[11px] font-mono text-indigo-700 font-bold">
                    ពិន្ទុសរុប ÷ {formData.subjectDivisor || 21}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.subjectDivisor || 21}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectDivisor: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-24 px-3 py-1.5 bg-white border border-indigo-200 rounded-lg font-black font-mono text-center text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { val: 21, label: '២១ ជំនាញ (បឋម)' },
                      { val: 14, label: '១៤ មុខវិជ្ជា' },
                      { val: 9, label: '៩ មុខវិជ្ជា' },
                      { val: 7, label: '៧ មុខវិជ្ជា' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setFormData({ ...formData, subjectDivisor: p.val })}
                        className={`px-2 py-1 text-[11px] font-bold rounded cursor-pointer transition-colors ${
                          (formData.subjectDivisor || 21) === p.val
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <span>{language === 'km' ? 'តួរចែកឆមាស (Semester Divisor):' : 'Semester Divisor:'}</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.semesterDivisor || 14}
                    onChange={(e) =>
                      setFormData({ ...formData, semesterDivisor: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-16 px-2 py-1 bg-white border border-indigo-200 rounded font-mono font-bold text-center text-xs"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {modalMode === 'ADD'
                      ? language === 'km'
                        ? 'បង្កើតថ្នាក់រៀន'
                        : 'Create Class'
                      : language === 'km'
                      ? 'រក្សាទុកការកែប្រែ'
                      : 'Save Changes'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* QUICK SUBJECT & DIVISOR CONFIGURATION MODAL                     */}
      {/* ------------------------------------------------------------- */}
      {configTargetClass && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {language === 'km'
                      ? `កំណត់មុខវិជ្ជាប្រឡង និងតួរចែក — ${configTargetClass.name}`
                      : `Exam Subjects & Divisor Settings — ${configTargetClass.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'km'
                      ? 'ទិន្នន័យទាំងអស់នឹងរក្សាទុកក្នុង Database សម្រាប់ថ្នាក់រៀននេះដោយឡែក'
                      : 'Settings will be saved to Supabase Database specifically for this classroom'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfigTargetClass(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* 1. Divisor Box */}
              <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-indigo-950">
                        {language === 'km' ? 'តួរចែកមធ្យមភាគប្រចាំខែ (Monthly Divisor)' : 'Monthly Average Divisor'}
                      </div>
                      <div className="text-[11px] text-indigo-700">
                        {language === 'km'
                          ? 'ចំនួនសម្រាប់ចែករកមធ្យមភាគ (ពិន្ទុសរុប ÷ តួរចែក)'
                          : 'Divisor used to calculate monthly grade point average'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={configDivisor}
                      onChange={(e) => setConfigDivisor(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 px-2 py-1.5 text-center font-mono font-black text-sm bg-white border border-indigo-300 rounded-lg text-indigo-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Preset shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-indigo-800 font-bold mr-1">
                    {language === 'km' ? 'កម្រិតទូទៅ៖' : 'Presets:'}
                  </span>
                  {[
                    { val: Math.max(1, (allCompetencyColumns?.length || 21) - configDisabledCols.length), label: `${Math.max(1, (allCompetencyColumns?.length || 21) - configDisabledCols.length)} ជំនាញ (ស្វ័យប្រវត្តិ)` },
                    { val: 21, label: '២១ (បឋម MoEYS)' },
                    { val: 14, label: '១៤ (អនុ/វិទ្យាល័យ)' },
                    { val: 9, label: '៩ (អនុវិទ្យាល័យ)' },
                    { val: 7, label: '៧ (វិទ្យាល័យ)' },
                    { val: 5, label: '៥ មុខវិជ្ជា' },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setConfigDivisor(p.val)}
                      className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${
                        configDivisor === p.val
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Examined Subjects & Skills Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      {language === 'km' ? 'ជ្រើសរើសមុខវិជ្ជា ឬជំនាញដែលត្រូវប្រឡង' : 'Select Examined Competencies / Subjects'}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    ប្រឡង {Math.max(0, (allCompetencyColumns?.length || 21) - configDisabledCols.length)} / {allCompetencyColumns?.length || 21} ជំនាញ
                  </div>
                </div>

                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {(monthlySubjectGroups || []).map((group) => {
                    const groupColKeys = group.subColumns.map((c) => c.key);
                    const allDisabled = groupColKeys.every((k) => configDisabledCols.includes(k));

                    return (
                      <div key={group.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                        <div className="px-3 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{group.nameKhmer}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (allDisabled) {
                                setConfigDisabledCols((prev) => prev.filter((k) => !groupColKeys.includes(k)));
                              } else {
                                setConfigDisabledCols((prev) => Array.from(new Set([...prev, ...groupColKeys])));
                              }
                            }}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                              allDisabled
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700'
                            }`}
                          >
                            {allDisabled ? 'បើកក្រុមនេះ' : 'បិទក្រុមនេះ'}
                          </button>
                        </div>
                        <div className="p-2 divide-y divide-slate-100">
                          {group.subColumns.map((col) => {
                            const isDis = configDisabledCols.includes(col.key);
                            return (
                              <div
                                key={col.key}
                                onClick={() => {
                                  setConfigDisabledCols((prev) =>
                                    prev.includes(col.key)
                                      ? prev.filter((k) => k !== col.key)
                                      : [...prev, col.key]
                                  );
                                }}
                                className={`p-2 rounded-lg flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                  isDis
                                    ? 'bg-slate-100/70 text-slate-400 line-through'
                                    : 'hover:bg-blue-50 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  {isDis ? (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                  )}
                                  <span className="text-xs font-medium">{col.nameKhmer}</span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    isDis ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isDis ? 'មិនប្រឡង' : 'ប្រឡង'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setConfigTargetClass(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'km' ? 'រក្សាទុកក្នុង Database' : 'Save to Database'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION MODAL                                     */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                {language === 'km' ? 'បញ្ជាក់ការលុបថ្នាក់រៀន' : 'Confirm Class Deletion'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុប "${deleteTarget.name}" ចេញពីប្រព័ន្ធមែនទេ?`
                  : `Are you sure you want to remove classroom "${deleteTarget.name}"?`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
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
