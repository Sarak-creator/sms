'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import { SpecializationData } from '@/lib/schoolData';
import { MonthlySubjectGroupDef, CompetencyColumnDef } from '@/lib/monthlyGradebookData';
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Clock,
  Building,
  Layers,
  Sparkles,
  Users,
  LayoutGrid,
  List,
  Star,
  Award,
  Sliders,
  Check,
  Tag,
  Boxes,
  HelpCircle,
} from 'lucide-react';

const EMPTY_SUBJECT_FORM: SpecializationData = {
  id: '',
  code: '',
  nameKhmer: '',
  nameEnglish: '',
  category: 'STEM',
  department: 'ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពិត',
  standardWeeklyHours: 4,
  coefficient: 1.0,
  maxScore: 100,
  passingScore: 50,
  isCore: false,
  description: '',
};

const EMPTY_GROUP_FORM: MonthlySubjectGroupDef = {
  id: '',
  nameKhmer: '',
  nameEnglish: '',
  headerBg: 'bg-blue-50 border-t-4 border-blue-500',
  headerText: 'text-blue-950 font-black',
  badgeBg: 'bg-blue-100 text-blue-900',
  subHeaderBg: 'bg-blue-100 text-blue-950',
  cellBg: 'bg-blue-50',
  subColumns: [],
};

const EMPTY_SKILL_FORM: CompetencyColumnDef = {
  key: '',
  nameKhmer: '',
  nameEnglish: '',
  maxScore: 100,
};

import { AccessDenied } from '@/components/AccessDenied';

export default function SpecializationsPage() {
  const {
    school,
    specializations,
    addSpecialization,
    updateSpecialization,
    deleteSpecialization,
    monthlySubjectGroups,
    allCompetencyColumns,
    addSubjectGroup,
    updateSubjectGroup,
    deleteSubjectGroup,
    addSkillToGroup,
    updateSkillInGroup,
    deleteSkillFromGroup,
    teachers,
    canAccessRoute,
    language,
    t,
  } = useSchool();

  if (!canAccessRoute('/specializations')) {
    return <AccessDenied />;
  }

  // Active Main Tab: 'CURRICULUM_SUBJECTS' (មុខវិជ្ជា & មេគុណ) vs 'COMPETENCY_SKILLS' (មុខវិជ្ជា & ជំនាញប្រឡងប្រចាំខែ)
  const [activeMainTab, setActiveMainTab] = useState<'CURRICULUM_SUBJECTS' | 'COMPETENCY_SKILLS'>('CURRICULUM_SUBJECTS');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewLayout, setViewLayout] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State for Curriculum Subject (Add / Edit)
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectModalMode, setSubjectModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [subjectFormData, setSubjectFormData] = useState<SpecializationData>(EMPTY_SUBJECT_FORM);
  const [subjectFormError, setSubjectFormError] = useState('');

  // Modal State for Subject Group (Add / Edit)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupModalMode, setGroupModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [groupFormData, setGroupFormData] = useState<MonthlySubjectGroupDef>(EMPTY_GROUP_FORM);
  const [groupFormError, setGroupFormError] = useState('');

  // Modal State for Skill / Competency Column (Add / Edit)
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillModalMode, setSkillModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [targetGroupId, setTargetGroupId] = useState<string>('');
  const [skillFormData, setSkillFormData] = useState<CompetencyColumnDef>(EMPTY_SKILL_FORM);
  const [skillFormError, setSkillFormError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'SUBJECT' | 'GROUP' | 'SKILL';
    id: string;
    name: string;
    groupId?: string;
  } | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter Curriculum Subjects
  const filteredSpecializations = specializations.filter((spec) => {
    const matchesSearch =
      spec.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (categoryFilter === 'ALL') return matchesSearch;
    if (categoryFilter === 'CORE') return matchesSearch && spec.isCore;
    return matchesSearch && spec.category === categoryFilter;
  });

  // Filter Competency Subject Groups & Skills
  const filteredSubjectGroups = monthlySubjectGroups.filter((group) => {
    const matchesGroup =
      group.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.id.toLowerCase().includes(searchQuery.toLowerCase());
    const hasMatchingSkill = group.subColumns.some(
      (c) =>
        c.nameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.key.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesGroup || hasMatchingSkill;
  });

  // KPI Metrics
  const totalSubjects = specializations.length;
  const totalGroups = monthlySubjectGroups.length;
  const totalSkills = allCompetencyColumns.length;
  const coreSubjectsCount = specializations.filter((s) => s.isCore).length;

  // -------------------------------------------------------------
  // HANDLERS: Curriculum Subject Add / Edit / Delete
  // -------------------------------------------------------------
  const handleOpenAddSubject = () => {
    setSubjectModalMode('ADD');
    setSubjectFormData({
      ...EMPTY_SUBJECT_FORM,
      id: '',
      code: '',
    });
    setSubjectFormError('');
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (spec: SpecializationData) => {
    setSubjectModalMode('EDIT');
    setSubjectFormData({
      ...EMPTY_SUBJECT_FORM,
      ...spec,
      coefficient: spec.coefficient ?? 1.0,
      maxScore: spec.maxScore ?? 100,
      passingScore: spec.passingScore ?? 50,
      isCore: spec.isCore ?? false,
    });
    setSubjectFormError('');
    setIsSubjectModalOpen(true);
  };

  const handleSubmitSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.nameKhmer.trim()) {
      setSubjectFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះមុខវិជ្ជាជាភាសាខ្មែរ!' : 'Please enter Khmer subject name!');
      return;
    }
    if (!subjectFormData.code.trim()) {
      setSubjectFormError(language === 'km' ? 'សូមបញ្ចូលកូដមុខវិជ្ជា!' : 'Please enter subject code!');
      return;
    }

    const upperCode = subjectFormData.code.toUpperCase().trim();

    if (subjectModalMode === 'ADD') {
      const exists = specializations.some((s) => s.code.toUpperCase() === upperCode);
      if (exists) {
        setSubjectFormError(language === 'km' ? 'កូដមុខវិជ្ជានេះមានរួចហើយក្នុងប្រព័ន្ធ!' : 'This subject code already exists!');
        return;
      }
      addSpecialization({
        ...subjectFormData,
        id: upperCode,
        code: upperCode,
        coefficient: Number(subjectFormData.coefficient) || 1.0,
        maxScore: Number(subjectFormData.maxScore) || 100,
        passingScore: Number(subjectFormData.passingScore) || 50,
      });
      showToast(
        language === 'km'
          ? `បានបន្ថែមមុខវិជ្ជាថ្មី "${subjectFormData.nameKhmer}" (កូដ: ${upperCode}) ដោយជោគជ័យ!`
          : `Subject "${subjectFormData.nameEnglish || subjectFormData.nameKhmer}" (${upperCode}) added successfully!`
      );
    } else {
      updateSpecialization(subjectFormData.code, {
        ...subjectFormData,
        coefficient: Number(subjectFormData.coefficient) || 1.0,
        maxScore: Number(subjectFormData.maxScore) || 100,
        passingScore: Number(subjectFormData.passingScore) || 50,
      });
      showToast(
        language === 'km'
          ? `បានកែសម្រួលព័ត៌មានមុខវិជ្ជា "${subjectFormData.nameKhmer}" ដោយជោគជ័យ!`
          : `Subject "${subjectFormData.nameEnglish || subjectFormData.nameKhmer}" updated successfully!`
      );
    }

    setIsSubjectModalOpen(false);
  };

  // -------------------------------------------------------------
  // HANDLERS: Subject Group (Monthly) Add / Edit / Delete
  // -------------------------------------------------------------
  const handleOpenAddGroup = () => {
    setGroupModalMode('ADD');
    setGroupFormData({
      ...EMPTY_GROUP_FORM,
      id: '',
      subColumns: [],
    });
    setGroupFormError('');
    setIsGroupModalOpen(true);
  };

  const handleOpenEditGroup = (group: MonthlySubjectGroupDef) => {
    setGroupModalMode('EDIT');
    setGroupFormData({ ...group });
    setGroupFormError('');
    setIsGroupModalOpen(true);
  };

  const handleSubmitGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.nameKhmer.trim()) {
      setGroupFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះក្រុមមុខវិជ្ជាជាភាសាខ្មែរ!' : 'Please enter Khmer group name!');
      return;
    }
    if (!groupFormData.id.trim()) {
      setGroupFormError(language === 'km' ? 'សូមបញ្ចូលកូដសម្គាល់ក្រុម!' : 'Please enter group identifier ID!');
      return;
    }

    const cleanId = groupFormData.id.toUpperCase().trim().replace(/\s+/g, '_');

    if (groupModalMode === 'ADD') {
      const exists = monthlySubjectGroups.some((g) => g.id.toUpperCase() === cleanId);
      if (exists) {
        setGroupFormError(language === 'km' ? 'កូដក្រុមនេះមានរួចហើយ!' : 'This group ID already exists!');
        return;
      }
      addSubjectGroup({
        ...groupFormData,
        id: cleanId,
      });
      showToast(
        language === 'km'
          ? `បានបន្ថែមក្រុមមុខវិជ្ជាថ្មី "${groupFormData.nameKhmer}" (${cleanId}) ដោយជោគជ័យ!`
          : `Subject Group "${groupFormData.nameKhmer}" added successfully!`
      );
    } else {
      updateSubjectGroup(groupFormData.id, groupFormData);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលក្រុមមុខវិជ្ជា "${groupFormData.nameKhmer}" ដោយជោគជ័យ!`
          : `Subject Group "${groupFormData.nameKhmer}" updated successfully!`
      );
    }

    setIsGroupModalOpen(false);
  };

  // -------------------------------------------------------------
  // HANDLERS: Skill / Competency Column Add / Edit / Delete
  // -------------------------------------------------------------
  const handleOpenAddSkill = (groupId: string) => {
    setSkillModalMode('ADD');
    setTargetGroupId(groupId);
    setSkillFormData({
      ...EMPTY_SKILL_FORM,
      key: '',
    });
    setSkillFormError('');
    setIsSkillModalOpen(true);
  };

  const handleOpenEditSkill = (groupId: string, skill: CompetencyColumnDef) => {
    setSkillModalMode('EDIT');
    setTargetGroupId(groupId);
    setSkillFormData({ ...skill });
    setSkillFormError('');
    setIsSkillModalOpen(true);
  };

  const handleSubmitSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillFormData.nameKhmer.trim()) {
      setSkillFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះជំនាញជាភាសាខ្មែរ!' : 'Please enter skill name in Khmer!');
      return;
    }
    if (!skillFormData.key.trim()) {
      setSkillFormError(language === 'km' ? 'សូមបញ្ចូលកូដជំនាញ (Key)!' : 'Please enter unique skill key!');
      return;
    }

    const cleanKey = skillFormData.key.toLowerCase().trim().replace(/\s+/g, '_');

    if (skillModalMode === 'ADD') {
      const allKeys = allCompetencyColumns.map((c) => c.key);
      if (allKeys.includes(cleanKey)) {
        setSkillFormError(language === 'km' ? 'កូដជំនាញ (Key) នេះមានរួចហើយ សូមប្រើកូដផ្សេង!' : 'This skill key already exists!');
        return;
      }
      addSkillToGroup(targetGroupId, {
        ...skillFormData,
        key: cleanKey,
        maxScore: Number(skillFormData.maxScore) || 100,
      });
      showToast(
        language === 'km'
          ? `បានបន្ថែមជំនាញថ្មី "${skillFormData.nameKhmer}" ដោយជោគជ័យ!`
          : `Skill "${skillFormData.nameKhmer}" added successfully!`
      );
    } else {
      updateSkillInGroup(targetGroupId, skillFormData.key, {
        ...skillFormData,
        maxScore: Number(skillFormData.maxScore) || 100,
      });
      showToast(
        language === 'km'
          ? `បានកែសម្រួលជំនាញ "${skillFormData.nameKhmer}" ដោយជោគជ័យ!`
          : `Skill "${skillFormData.nameKhmer}" updated successfully!`
      );
    }

    setIsSkillModalOpen(false);
  };

  // -------------------------------------------------------------
  // HANDLER: Master Delete Confirmation
  // -------------------------------------------------------------
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'SUBJECT') {
      deleteSpecialization(deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបមុខវិជ្ជា "${deleteTarget.name}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Subject "${deleteTarget.name}" deleted successfully!`
      );
    } else if (deleteTarget.type === 'GROUP') {
      deleteSubjectGroup(deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបក្រុមមុខវិជ្ជា "${deleteTarget.name}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Subject group "${deleteTarget.name}" deleted successfully!`
      );
    } else if (deleteTarget.type === 'SKILL' && deleteTarget.groupId) {
      deleteSkillFromGroup(deleteTarget.groupId, deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបជំនាញ "${deleteTarget.name}" ចេញពីប្រព័ន្ធរួចរាល់!`
          : `Skill "${deleteTarget.name}" deleted successfully!`
      );
    }

    setDeleteTarget(null);
  };

  // Helper to count teachers by specialization name
  const countTeachersForSpec = (specName: string) => {
    return teachers.filter(
      (t) => t.specialization.includes(specName) || specName.includes(t.specialization)
    ).length;
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'PRIMARY':
        return { text: '🎒 បឋមសិក្សា', bg: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold' };
      case 'STEM':
        return { text: 'STEM (វិទ្យាសាស្ត្រពិត)', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SOCIAL':
        return { text: 'វិទ្យាសាស្ត្រសង្គម', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'LANGUAGE':
        return { text: 'ភាសា & អក្សរសាស្ត្រ', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { text: 'អនុវត្ត/កីឡា/ICT', bg: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
  };

  const getCoefficientBadge = (coef: number = 1.0) => {
    if (coef >= 3.0) {
      return 'bg-purple-100 text-purple-800 border-purple-300 font-black';
    }
    if (coef >= 2.0) {
      return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
    }
    if (coef >= 1.5) {
      return 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {language === 'km' ? 'ការគ្រប់គ្រងមុខវិជ្ជា និងជំនាញ' : 'Subjects & Skills Management'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'km'
                  ? 'កំណត់ បន្ថែម និងកែប្រែ មុខវិជ្ជាធំៗ មេគុណពិន្ទុ និងជំនាញ/សមត្ថភាពរងតាមស្តង់ដារ MoEYS'
                  : 'Manage subjects, coefficients, and competency skills according to MoEYS standards.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {activeMainTab === 'CURRICULUM_SUBJECTS' ? (
            <button
              onClick={handleOpenAddSubject}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? '+ បន្ថែមមុខវិជ្ជាថ្មី' : '+ Add New Subject'}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddGroup}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'km' ? '+ បន្ថែមក្រុមមុខវិជ្ជាថ្មី' : '+ Add Subject Group'}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              {language === 'km' ? 'សរុបមុខវិជ្ជា' : 'Total Subjects'}
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {totalSubjects} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'មុខ' : 'subs'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              {language === 'km' ? 'សរុបជំនាញប្រឡង' : 'Competency Skills'}
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {totalSkills} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'ជំនាញ' : 'skills'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              {language === 'km' ? 'ក្រុមមុខវិជ្ជាធំ' : 'Subject Groups'}
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {totalGroups} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'ក្រុម' : 'groups'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-bold">
              {language === 'km' ? 'មុខវិជ្ជាស្នូល' : 'Core Subjects'}
            </div>
            <div className="text-lg font-black text-slate-900 font-mono">
              {coreSubjectsCount} <span className="text-xs font-normal text-slate-500">{language === 'km' ? 'មុខ' : 'core'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveMainTab('CURRICULUM_SUBJECTS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'CURRICULUM_SUBJECTS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{language === 'km' ? '១. មុខវិជ្ជាកម្មវិធីសិក្សា & មេគុណពិន្ទុ' : '1. Curriculum Subjects & Coefficients'}</span>
        </button>

        <button
          onClick={() => setActiveMainTab('COMPETENCY_SKILLS')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeMainTab === 'COMPETENCY_SKILLS'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{language === 'km' ? '២. មុខវិជ្ជាធំ & ជំនាញប្រឡងប្រចាំខែ (Skills)' : '2. Subject Groups & Monthly Competency Skills'}</span>
        </button>
      </div>

      {/* ============================================================= */}
      {/* SECTION 1: CURRICULUM SUBJECTS & COEFFICIENTS                 */}
      {/* ============================================================= */}
      {activeMainTab === 'CURRICULUM_SUBJECTS' && (
        <div className="space-y-5">
          {/* Filter & Search Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'ជំពូក/ក្រុម:' : 'Category:'}</span>
              {[
                { id: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All' },
                { id: 'PRIMARY', labelKm: '🎒 បឋមសិក្សា', labelEn: 'Primary' },
                { id: 'STEM', labelKm: 'វិទ្យាសាស្ត្រពិត (STEM)', labelEn: 'STEM' },
                { id: 'SOCIAL', labelKm: 'វិទ្យាសាស្ត្រសង្គម', labelEn: 'Social Science' },
                { id: 'LANGUAGE', labelKm: 'ភាសា', labelEn: 'Languages' },
                { id: 'APPLIED', labelKm: 'អនុវត្ត & ICT', labelEn: 'Applied & ICT' },
                { id: 'CORE', labelKm: '⭐ មុខវិជ្ជាស្នូល', labelEn: 'Core Only' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'km' ? cat.labelKm : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Field & View Switcher */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះមុខវិជ្ជា កូដ...' : 'Search subject, code...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewLayout('GRID')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewLayout === 'GRID' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewLayout('TABLE')}
                  className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                    viewLayout === 'TABLE' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout View */}
          {viewLayout === 'GRID' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSpecializations.map((spec) => {
                const teacherCount = countTeachersForSpec(spec.nameKhmer);
                const categoryBadge = getCategoryBadge(spec.category);
                const coef = spec.coefficient ?? 1.0;

                return (
                  <div
                    key={spec.code}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-4 relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header & Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded-md">
                            {spec.code}
                          </span>
                          <span className={`px-2 py-0.5 font-bold text-[10px] rounded-md border ${categoryBadge.bg}`}>
                            {categoryBadge.text}
                          </span>
                          {spec.isCore && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white font-bold text-[10px] rounded-md flex items-center gap-1 shadow-xs">
                              <Star className="w-3 h-3 fill-white" />
                              <span>{language === 'km' ? 'ស្នូល' : 'Core'}</span>
                            </span>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 text-xs rounded-md border ${getCoefficientBadge(
                            coef
                          )}`}
                        >
                          {language === 'km' ? 'មេគុណ' : 'Coef'} x{coef}
                        </span>
                      </div>

                      {/* Subject Name */}
                      <h3 className="font-bold text-base text-slate-900">
                        {spec.nameKhmer}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {spec.nameEnglish}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mt-2.5">
                        {spec.description || 'មុខវិជ្ជាស្តង់ដារកម្មវិធីសិក្សាជាតិ ក្រសួងអប់រំ យុវជន និងកីឡា'}
                      </p>

                      {/* Details Meta Box */}
                      <div className="mt-3 space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('departmentLabel')}:</span>
                          </span>
                          <strong className="text-slate-800 font-bold truncate max-w-[180px]">{spec.department}</strong>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{t('weeklyHoursLabel')}:</span>
                          </span>
                          <span className="font-bold text-blue-700 font-mono">
                            {spec.standardWeeklyHours} {language === 'km' ? 'ម៉ោង/សប្តាហ៍' : 'h/wk'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/60">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{language === 'km' ? 'ពិន្ទុពេញ / ជាប់:' : 'Max / Pass Score:'}</span>
                          </span>
                          <span className="font-bold text-slate-800 font-mono">
                            {spec.maxScore ?? 100} / <span className="text-emerald-600">{spec.passingScore ?? 50}</span>
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{language === 'km' ? 'គ្រូបង្រៀនសកម្ម:' : 'Active Teachers:'}</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {teacherCount} {language === 'km' ? 'រូប' : 'teachers'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {language === 'km' ? 'កូដ:' : 'Code:'} <strong className="font-mono text-slate-700">{spec.code}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditSubject(spec)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>{language === 'km' ? 'កែប្រែ' : 'Edit'}</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: 'SUBJECT', id: spec.code, name: spec.nameKhmer })}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                          title={language === 'km' ? 'លុបមុខវិជ្ជា' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Layout View */
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold">
                      <th className="p-3.5 text-center w-12">#</th>
                      <th className="p-3.5">កូដ</th>
                      <th className="p-3.5">ឈ្មោះមុខវិជ្ជា (ខ្មែរ)</th>
                      <th className="p-3.5">English Name</th>
                      <th className="p-3.5">ជំពូក</th>
                      <th className="p-3.5 text-center">មេគុណ</th>
                      <th className="p-3.5 text-center">ម៉ោង/សប្តាហ៍</th>
                      <th className="p-3.5 text-center">ពិន្ទុពេញ/ជាប់</th>
                      <th className="p-3.5 text-center">មុខវិជ្ជាស្នូល</th>
                      <th className="p-3.5">ដេប៉ាតឺម៉ង់</th>
                      <th className="p-3.5 text-center">សកម្មភាព</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSpecializations.map((spec, idx) => {
                      const categoryBadge = getCategoryBadge(spec.category);
                      const coef = spec.coefficient ?? 1.0;

                      return (
                        <tr key={spec.code} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-3.5 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">{spec.code}</td>
                          <td className="p-3.5 font-bold text-slate-900">{spec.nameKhmer}</td>
                          <td className="p-3.5 font-mono text-slate-600">{spec.nameEnglish}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${categoryBadge.bg}`}>
                              {categoryBadge.text}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`px-2 py-0.5 text-xs rounded-md border ${getCoefficientBadge(coef)}`}>
                              x{coef}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-mono font-bold text-blue-700">
                            {spec.standardWeeklyHours} ម៉ោង
                          </td>
                          <td className="p-3.5 text-center font-mono">
                            <strong>{spec.maxScore ?? 100}</strong> / <span className="text-emerald-700 font-bold">{spec.passingScore ?? 50}</span>
                          </td>
                          <td className="p-3.5 text-center">
                            {spec.isCore ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] border border-amber-300">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>ស្នូល</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-700">{spec.department}</td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditSubject(spec)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="កែប្រែ"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'SUBJECT', id: spec.code, name: spec.nameKhmer })}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                                title="លុប"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 2: MONTHLY COMPETENCY SUBJECT GROUPS & SKILLS         */}
      {/* ============================================================= */}
      {activeMainTab === 'COMPETENCY_SKILLS' && (
        <div className="space-y-5">
          {/* Top Info Alert */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-blue-950">ការចាត់ចែងក្រុមមុខវិជ្ជាធំ និងជំនាញរងប្រចាំខែ (Monthly Competencies)</h4>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                អ្នកអាចបន្ថែម ឬកែប្រែជំនាញរងក្នុងមុខវិជ្ជានីមួយៗ (ឧ. <em>សមត្ថភាពស្ដាប់, សរសេរ, អាន, ពិជគណិត, ធរណីមាត្រ...</em>)។ រាល់ការកែប្រែនឹងបង្ហាញក្នុងតារាង Gradebook និងរបាយការណ៍ស្វ័យប្រវត្តិ។
              </p>
            </div>
          </div>

          {/* Subject Groups Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredSubjectGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Group Header */}
                  <div className={`p-4 ${group.headerBg} flex items-center justify-between gap-3 border-b border-slate-200`}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white/90 shadow-xs flex items-center justify-center font-mono font-bold text-xs text-slate-900 border border-slate-200">
                        {group.id}
                      </div>
                      <div>
                        <h3 className={`font-black text-sm ${group.headerText}`}>{group.nameKhmer}</h3>
                        <p className="text-[11px] text-slate-600 font-mono">{group.nameEnglish}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${group.badgeBg}`}>
                        {group.subColumns.length} ជំនាញ
                      </span>
                      <button
                        onClick={() => handleOpenEditGroup(group)}
                        className="p-1.5 bg-white/80 hover:bg-white text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                        title="កែប្រែក្រុមមុខវិជ្ជា"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'GROUP', id: group.id, name: group.nameKhmer })}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                        title="លុបក្រុមមុខវិជ្ជា"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Skills Sub-Columns List */}
                  <div className="p-4 space-y-2.5 bg-slate-50/40">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1 mb-1">
                      <span>បញ្ជីជំនាញ / សមត្ថភាពរង</span>
                      <span>ពិន្ទុពេញ (Max)</span>
                    </div>

                    {group.subColumns.map((col, idx) => (
                      <div
                        key={col.key}
                        className="p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 shadow-xs hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{col.nameKhmer}</div>
                            <div className="text-[10px] text-slate-500 font-mono truncate">
                              {col.nameEnglish} • <span className="text-slate-400">key: {col.key}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold text-xs rounded-md border border-slate-200">
                            {col.maxScore}
                          </span>
                          <button
                            onClick={() => handleOpenEditSkill(group.id, col)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            title="កែប្រែជំនាញ"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                type: 'SKILL',
                                id: col.key,
                                name: col.nameKhmer,
                                groupId: group.id,
                              })
                            }
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                            title="លុបជំនាញ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {group.subColumns.length === 0 && (
                      <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                        មិនទាន់មានជំនាញក្នុងក្រុមមុខវិជ្ជានេះទេ
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Add Skill Action */}
                <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenAddSkill(group.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-blue-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ បន្ថែមជំនាញក្នុង {group.nameKhmer}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT CURRICULUM SUBJECT                         */}
      {/* ------------------------------------------------------------- */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {subjectModalMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {subjectModalMode === 'ADD'
                      ? language === 'km'
                        ? 'បន្ថែមមុខវិជ្ជាថ្មី'
                        : 'Add New Subject'
                      : language === 'km'
                      ? 'កែប្រែព័ត៌មានមុខវិជ្ជា'
                      : 'Edit Subject Details'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {school.nameKhmer} • {school.academicYear}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {subjectFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{subjectFormError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitSubject} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Khmer Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះមុខវិជ្ជា (ខ្មែរ) *' : 'Khmer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. គណិតវិទ្យា' : 'e.g. Mathematics'}
                    value={subjectFormData.nameKhmer}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, nameKhmer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះជាអង់គ្លេស' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={subjectFormData.nameEnglish}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, nameEnglish: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Code */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'កូដមុខវិជ្ជា *' : 'Subject Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={subjectModalMode === 'EDIT'}
                    placeholder="e.g. MATH, HIST, AGRI"
                    value={subjectFormData.code}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ជំពូកមុខវិជ្ជា' : 'Category'}
                  </label>
                  <select
                    value={subjectFormData.category}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PRIMARY">🎒 បឋមសិក្សា (Primary Education)</option>
                    <option value="STEM">STEM (វិទ្យាសាស្ត្រពិត)</option>
                    <option value="SOCIAL">វិទ្យាសាស្ត្រសង្គម</option>
                    <option value="LANGUAGE">ភាសា & អក្សរសាស្ត្រ</option>
                    <option value="APPLIED">អនុវត្ត និងបច្ចេកវិទ្យា</option>
                  </select>
                </div>

                {/* Coefficient */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'មេគុណពិន្ទុ (Coef)' : 'Coefficient'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    required
                    value={subjectFormData.coefficient ?? 1.0}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, coefficient: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Standard Hours */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ម៉ោងបង្រៀន/សប្តាហ៍' : 'Hours/Week'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={subjectFormData.standardWeeklyHours}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, standardWeeklyHours: parseInt(e.target.value) || 2 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Max Score */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ពិន្ទុពេញ (Max Score)' : 'Max Score'}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={subjectFormData.maxScore ?? 100}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, maxScore: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Passing Score */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ពិន្ទុជាប់ (Pass Score)' : 'Pass Score'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={subjectFormData.passingScore ?? 50}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, passingScore: parseInt(e.target.value) || 50 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Core Subject Checkbox */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{language === 'km' ? 'កំណត់ជាមុខវិជ្ជាស្នូល (Core Subject)' : 'Set as Core MoEYS Subject'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {language === 'km'
                      ? 'មុខវិជ្ជាស្នូលត្រូវបានប្រើប្រាស់សម្រាប់ចំណាត់ថ្នាក់ពិសេស និងលក្ខខណ្ឌឡើងថ្នាក់'
                      : 'Core subjects are prioritized for ranking ties and graduation criteria.'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subjectFormData.isCore ?? false}
                    onChange={(e) => setSubjectFormData({ ...subjectFormData, isCore: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Department */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('departmentLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'km' ? 'ឧ. ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពិត' : 'e.g. Science Department'}
                  value={subjectFormData.department}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {language === 'km' ? 'ពិពណ៌នាសង្ខេប / កម្មវិធីសិក្សា' : 'Description / Curriculum Scope'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'km' ? 'ខ្លឹមសារសង្ខេបនៃមុខវិជ្ជា...' : 'Brief curriculum overview...'}
                  value={subjectFormData.description}
                  onChange={(e) => setSubjectFormData({ ...subjectFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {subjectModalMode === 'ADD'
                      ? language === 'km'
                        ? 'រក្សាទុកមុខវិជ្ជា'
                        : 'Save Subject'
                      : language === 'km'
                      ? 'ធ្វើបច្ចុប្បន្នភាព'
                      : 'Update Details'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT SUBJECT GROUP (MONTHLY)                    */}
      {/* ------------------------------------------------------------- */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  {groupModalMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {groupModalMode === 'ADD' ? 'បន្ថែមក្រុមមុខវិជ្ជាធំថ្មី' : 'កែសម្រួលក្រុមមុខវិជ្ជា'}
                  </h3>
                  <p className="text-xs text-slate-500">ក្រុមមុខវិជ្ជាសម្រាប់តារាងពិន្ទុប្រចាំខែ</p>
                </div>
              </div>
              <button
                onClick={() => setIsGroupModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {groupFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{groupFormError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitGroup} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះក្រុមមុខវិជ្ជា (ខ្មែរ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. ភាសាខ្មែរ, គណិតវិទ្យា, វិចិត្រសិល្បៈ"
                  value={groupFormData.nameKhmer}
                  onChange={(e) => setGroupFormData({ ...groupFormData, nameKhmer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះជាភាសាអង់គ្លេស
                </label>
                <input
                  type="text"
                  placeholder="e.g. Khmer Language, Fine Arts"
                  value={groupFormData.nameEnglish}
                  onChange={(e) => setGroupFormData({ ...groupFormData, nameEnglish: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  កូដសម្គាល់ក្រុម (Group ID) *
                </label>
                <input
                  type="text"
                  required
                  disabled={groupModalMode === 'EDIT'}
                  placeholder="e.g. KHM, MATH, ARTS"
                  value={groupFormData.id}
                  onChange={(e) => setGroupFormData({ ...groupFormData, id: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{groupModalMode === 'ADD' ? 'រក្សាទុកក្រុមថ្មី' : 'ធ្វើបច្ចុប្បន្នភាព'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: ADD / EDIT COMPETENCY SKILL                           */}
      {/* ------------------------------------------------------------- */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  {skillModalMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {skillModalMode === 'ADD' ? 'បន្ថែមជំនាញថ្មី (Add Skill)' : 'កែសម្រួលជំនាញ (Edit Skill)'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ក្រុម៖ <strong className="text-blue-700">{targetGroupId}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {skillFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{skillFormError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះជំនាញ / សមត្ថភាព (ខ្មែរ) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. សមត្ថភាពស្ដាប់, ពិជគណិត, ការអនុវត្ត..."
                  value={skillFormData.nameKhmer}
                  onChange={(e) => setSkillFormData({ ...skillFormData, nameKhmer: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  ឈ្មោះជាភាសាអង់គ្លេស
                </label>
                <input
                  type="text"
                  placeholder="e.g. Listening, Algebra, Sports Practice"
                  value={skillFormData.nameEnglish}
                  onChange={(e) => setSkillFormData({ ...skillFormData, nameEnglish: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    កូដសម្គាល់ជំនាញ (Key) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={skillModalMode === 'EDIT'}
                    placeholder="e.g. khm_listen, math_alg"
                    value={skillFormData.key}
                    onChange={(e) => setSkillFormData({ ...skillFormData, key: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    ពិន្ទុពេញ (Max Score) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={skillFormData.maxScore}
                    onChange={(e) => setSkillFormData({ ...skillFormData, maxScore: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{skillModalMode === 'ADD' ? 'រក្សាទុកជំនាញ' : 'ធ្វើបច្ចុប្បន្នភាព'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: DELETE CONFIRMATION                                   */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-900">
                {deleteTarget.type === 'SUBJECT'
                  ? 'បញ្ជាក់ការលុបមុខវិជ្ជា'
                  : deleteTarget.type === 'GROUP'
                  ? 'បញ្ជាក់ការលុបក្រុមមុខវិជ្ជា'
                  : 'បញ្ជាក់ការលុបជំនាញ'}
              </h3>
              <p className="text-xs text-slate-600">
                តើអ្នកពិតជាចង់លុប <strong>"{deleteTarget.name}"</strong> ({deleteTarget.id}) ចេញពីប្រព័ន្ធមែនទេ?
              </p>
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/25 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'យល់ព្រមលុប' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
