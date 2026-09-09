'use client';

import React, { useState, useMemo } from 'react';
import { useSchool } from '@/lib/stateContext';
import { StudentData } from '@/lib/schoolData';
import {
  Users,
  Search,
  Download,
  Upload,
  Eye,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  User,
  School,
  ArrowRightLeft,
  GraduationCap,
  Sparkles,
  CheckSquare,
  Square,
  Filter,
  Check,
  Building2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import ImportStudentsModal from '@/components/ImportStudentsModal';

const CAMBODIA_PROVINCES = [
  'រាជធានីភ្នំពេញ',
  'ខេត្តកណ្តាល',
  'ខេត្តកំពង់ចាម',
  'ខេត្តកំពង់ឆ្នាំង',
  'ខេត្តកំពង់ស្ពឺ',
  'ខេត្តកំពង់ធំ',
  'ខេត្តកំពត',
  'ខេត្តកែប',
  'ខេត្តកោះកុង',
  'ខេត្តក្រចេះ',
  'ខេត្តតាកែវ',
  'ខេត្តត្បូងឃ្មុំ',
  'ខេត្តបន្ទាយមានជ័យ',
  'ខេត្តបាត់ដំបង',
  'ខេត្តប៉ៃលិន',
  'ខេត្តពោធិ៍សាត់',
  'ខេត្តព្រះវិហារ',
  'ខេត្តព្រះសីហនុ',
  'ខេត្តព្រៃវែង',
  'ខេត្តមណ្ឌលគិរី',
  'ខេត្តរតនគិរី',
  'ខេត្តសៀមរាប',
  'ខេត្តស្ទឹងត្រែង',
  'ខេត្តស្វាយរៀង',
  'ខេត្តឧត្តរមានជ័យ',
];

const GRADE_ORDER: Record<string, number> = {
  GRADE_1: 1,
  GRADE_2: 2,
  GRADE_3: 3,
  GRADE_4: 4,
  GRADE_5: 5,
  GRADE_6: 6,
  GRADE_7: 7,
  GRADE_8: 8,
  GRADE_9: 9,
  GRADE_10: 10,
  GRADE_11: 11,
  GRADE_12: 12,
};

const NEXT_GRADE_MAP: Record<string, string> = {
  GRADE_1: 'GRADE_2',
  GRADE_2: 'GRADE_3',
  GRADE_3: 'GRADE_4',
  GRADE_4: 'GRADE_5',
  GRADE_5: 'GRADE_6',
  GRADE_6: 'GRADE_7',
  GRADE_7: 'GRADE_8',
  GRADE_8: 'GRADE_9',
  GRADE_9: 'GRADE_10',
  GRADE_10: 'GRADE_11',
  GRADE_11: 'GRADE_12',
  GRADE_12: 'GRADUATED',
};

const EMPTY_STUDENT_FORM: StudentData = {
  studentNationalId: '',
  rollNumber: 1,
  khmerName: '',
  latinName: '',
  gender: 'FEMALE',
  dob: new Date('2008-01-01'),
  pobProvince: 'រាជធានីភ្នំពេញ',
  pobDistrict: 'ខណ្ឌដូនពេញ',
  fatherName: '',
  fatherOccupation: '',
  motherName: '',
  motherOccupation: '',
  guardianPhone: '',
  classId: 'c-11-sci-1',
};

export default function StudentsPage() {
  const {
    school,
    classes,
    accessibleClasses,
    accessibleStudents,
    canAccessClass,
    isTeacher,
    hasPermission,
    selectedClassId,
    setSelectedClassId,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    transferStudents,
    transferSingleStudent,
    promoteStudents,
    exportToExcel,
    language,
    t,
  } = useSchool();

  const currentClass =
    (isTeacher ? accessibleClasses : classes).find((c) => c.id === selectedClassId) ||
    (isTeacher ? accessibleClasses[0] : classes[0]) ||
    classes[0];

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'FEMALE' | 'MALE'>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');

  // Multi-Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Dossier Modal
  const [selectedDossier, setSelectedDossier] = useState<StudentData | null>(null);

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formData, setFormData] = useState<StudentData>(EMPTY_STUDENT_FORM);
  const [formError, setFormError] = useState('');

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetStudents, setTransferTargetStudents] = useState<StudentData[]>([]);
  const [selectedTargetClassId, setSelectedTargetClassId] = useState<string>(
    (isTeacher ? accessibleClasses[0]?.id : classes[0]?.id) || ''
  );
  const [transferError, setTransferError] = useState('');

  // Promotion Modal State
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionTargetStudents, setPromotionTargetStudents] = useState<StudentData[]>([]);
  const [promotionType, setPromotionType] = useState<'PROMOTED' | 'RETAINED' | 'GRADUATED'>('PROMOTED');
  const [promotionTargetClassId, setPromotionTargetClassId] = useState<string>(
    (isTeacher ? accessibleClasses[0]?.id : classes[0]?.id) || ''
  );
  const [promotionError, setPromotionError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<StudentData | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Import Excel Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to find class by ID
  const getClassById = (id?: string) => {
    if (!id) return null;
    return classes.find((c) => c.id === id) || null;
  };

  // Base student list scoped to teacher's authorized access
  const baseStudentsPool = isTeacher ? accessibleStudents : students;

  // Filter students based on active filter criteria
  const filteredStudents = useMemo(() => {
    return baseStudentsPool.filter((s) => {
      const matchesSearch =
        s.khmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNationalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pobProvince.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.pobDistrict.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.motherName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
      const matchesProvince = provinceFilter === 'ALL' || s.pobProvince === provinceFilter;

      let matchesClass = true;
      if (classFilter === 'ALL') {
        matchesClass = true;
      } else if (classFilter === 'UNASSIGNED') {
        matchesClass = !s.classId;
      } else if (classFilter === 'GRADUATED') {
        matchesClass = s.classId === 'GRADUATED';
      } else {
        matchesClass = s.classId === classFilter;
      }

      return matchesSearch && matchesGender && matchesProvince && matchesClass;
    });
  }, [baseStudentsPool, searchQuery, genderFilter, provinceFilter, classFilter]);

  // Selection handlers
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.studentNationalId));
    }
  };

  const isAllVisibleSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.studentNationalId));

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormMode('ADD');
    const targetClassId = classFilter !== 'ALL' && classFilter !== 'UNASSIGNED' && classFilter !== 'GRADUATED'
      ? classFilter
      : selectedClassId || classes[0]?.id || 'c-11-sci-1';

    const classStudents = students.filter((s) => s.classId === targetClassId);
    const nextRoll = classStudents.length > 0 ? Math.max(...classStudents.map((s) => s.rollNumber || 0)) + 1 : 1;

    setFormData({
      ...EMPTY_STUDENT_FORM,
      classId: targetClassId,
      rollNumber: nextRoll,
      studentNationalId: `STU-2024-${String(students.length + 1).padStart(3, '0')}`,
    });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (stu: StudentData) => {
    setFormMode('EDIT');
    setFormData({ ...stu });
    setFormError('');
    setIsFormModalOpen(true);
  };

  // Submit Student Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.khmerName.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលគោត្តនាម-នាម!' : 'Please enter student Khmer Name!');
      return;
    }
    if (!formData.latinName.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលឈ្មោះឡាតាំង!' : 'Please enter student Latin Name!');
      return;
    }
    if (!formData.studentNationalId.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលអត្តលេខសិស្ស!' : 'Please enter National Student ID!');
      return;
    }

    if (formMode === 'ADD') {
      const exists = students.some((s) => s.studentNationalId === formData.studentNationalId);
      if (exists) {
        setFormError(
          language === 'km' ? 'អត្តលេខសិស្សនេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!' : 'This Student ID already exists!'
        );
        return;
      }
      addStudent(formData);
      showToast(
        language === 'km'
          ? `បានបញ្ចូលសិស្សថ្មី "${formData.khmerName}" ទៅក្នុងថ្នាក់ ${getClassById(formData.classId)?.name || 'ទូទៅ'} ដោយជោគជ័យ!`
          : `Student "${formData.latinName}" registered successfully in ${getClassById(formData.classId)?.name || 'General'}!`
      );
    } else {
      updateStudent(formData.studentNationalId, formData);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលព័ត៌មានសិស្ស "${formData.khmerName}" ដោយជោគជ័យ!`
          : `Student "${formData.latinName}" updated successfully!`
      );
    }

    setIsFormModalOpen(false);
  };

  // Open Transfer Modal for Single Student
  const handleOpenSingleTransfer = (stu: StudentData) => {
    setTransferTargetStudents([stu]);
    // Default to a different classroom than the student's current one
    const diffClass = classes.find((c) => c.id !== stu.classId) || classes[0];
    setSelectedTargetClassId(diffClass?.id || '');
    setTransferError('');
    setIsTransferModalOpen(true);
  };

  // Open Transfer Modal for Bulk Selected Students
  const handleOpenBulkTransfer = () => {
    const targetStudents = students.filter((s) => selectedStudentIds.includes(s.studentNationalId));
    if (targetStudents.length === 0) return;
    setTransferTargetStudents(targetStudents);
    const diffClass = classes.find((c) => c.id !== targetStudents[0]?.classId) || classes[0];
    setSelectedTargetClassId(diffClass?.id || '');
    setTransferError('');
    setIsTransferModalOpen(true);
  };

  // Confirm Student Transfer
  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetClassId) {
      setTransferError(language === 'km' ? 'សូមជ្រើសរើសថ្នាក់រៀនគោលដៅ!' : 'Please select a target classroom!');
      return;
    }

    const ids = transferTargetStudents.map((s) => s.studentNationalId);
    const targetClass = classes.find((c) => c.id === selectedTargetClassId);

    transferStudents(ids, selectedTargetClassId);

    showToast(
      language === 'km'
        ? `បានផ្ទេរសិស្ស ${ids.length} នាក់ ទៅកាន់ "${targetClass?.name}" ដោយជោគជ័យ!`
        : `Transferred ${ids.length} student(s) to "${targetClass?.name}" successfully!`
    );

    setSelectedStudentIds([]);
    setIsTransferModalOpen(false);
  };

  // Open Promotion Modal for Single or Bulk Students
  const handleOpenPromotion = (specificStudents?: StudentData[]) => {
    const targets = specificStudents || students.filter((s) => selectedStudentIds.includes(s.studentNationalId));
    if (targets.length === 0) {
      // Default to all students in current filtered class
      if (filteredStudents.length > 0) {
        setPromotionTargetStudents(filteredStudents);
      } else {
        return;
      }
    } else {
      setPromotionTargetStudents(targets);
    }

    // Determine candidate next grade level
    const firstStudent = targets[0] || filteredStudents[0];
    const currentCls = getClassById(firstStudent?.classId);
    const nextGrade = currentCls ? NEXT_GRADE_MAP[currentCls.gradeLevel] : 'GRADE_12';

    if (nextGrade === 'GRADUATED') {
      setPromotionType('GRADUATED');
      setPromotionTargetClassId('GRADUATED');
    } else {
      setPromotionType('PROMOTED');
      const candidateClass = classes.find((c) => c.gradeLevel === nextGrade) || classes[0];
      setPromotionTargetClassId(candidateClass?.id || classes[0]?.id || '');
    }

    setPromotionError('');
    setIsPromotionModalOpen(true);
  };

  // Confirm Promotion / Grade Advancement
  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (promotionType !== 'GRADUATED' && !promotionTargetClassId) {
      setPromotionError(language === 'km' ? 'សូមជ្រើសរើសថ្នាក់រៀនគោលដៅ!' : 'Please select target classroom!');
      return;
    }

    const ids = promotionTargetStudents.map((s) => s.studentNationalId);
    const targetClass = classes.find((c) => c.id === promotionTargetClassId);

    promoteStudents(ids, promotionTargetClassId, promotionType);

    showToast(
      language === 'km'
        ? promotionType === 'GRADUATED'
          ? `បានអនុម័តការបញ្ចប់ការសិក្សាសម្រាប់សិស្ស ${ids.length} នាក់ ដោយជោគជ័យ!`
          : promotionType === 'PROMOTED'
          ? `បានឡើងថ្នាក់សម្រាប់សិស្ស ${ids.length} នាក់ ទៅកាន់ "${targetClass?.name}" ដោយជោគជ័យ!`
          : `បានកំណត់ឱ្យសិស្ស ${ids.length} នាក់ នៅថ្នាក់ដដែល (${targetClass?.name})!`
        : `Academic advancement processed for ${ids.length} student(s)!`
    );

    setSelectedStudentIds([]);
    setIsPromotionModalOpen(false);
  };

  // Confirm Single Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteStudent(deleteTarget.studentNationalId);
      showToast(
        language === 'km'
          ? `បានលុបសិស្ស "${deleteTarget.khmerName}" ចេញពីបញ្ជីរាយនាមរួចរាល់!`
          : `Student "${deleteTarget.latinName}" removed from registry!`
      );
      setSelectedStudentIds((prev) => prev.filter((id) => id !== deleteTarget.studentNationalId));
      setDeleteTarget(null);
    }
  };

  // Confirm Bulk Delete
  const handleConfirmBulkDelete = () => {
    selectedStudentIds.forEach((id) => deleteStudent(id));
    showToast(
      language === 'km'
        ? `បានលុបសិស្សដែលបានជ្រើសរើសចំនួន ${selectedStudentIds.length} នាក់!`
        : `Removed ${selectedStudentIds.length} selected students!`
    );
    setSelectedStudentIds([]);
    setIsBulkDeleteModalOpen(false);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => {
      const cls = getClassById(s.classId);
      return {
        'No.': s.rollNumber,
        'National ID': s.studentNationalId,
        'Khmer Name': s.khmerName,
        'Latin Name': s.latinName,
        'Gender': s.gender === 'FEMALE' ? 'F' : 'M',
        'Classroom': cls ? cls.name : s.classId === 'GRADUATED' ? 'Graduated' : 'Unassigned',
        'Date of Birth': new Date(s.dob).toLocaleDateString('km-KH'),
        'POB Province': s.pobProvince,
        'POB District': s.pobDistrict,
        'Father Name': s.fatherName,
        'Father Occupation': s.fatherOccupation || '',
        'Mother Name': s.motherName,
        'Mother Occupation': s.motherOccupation || '',
        'Guardian Phone': s.guardianPhone,
      };
    });

    const activeFilterName = classFilter === 'ALL' ? 'All_Classes' : getClassById(classFilter)?.name || classFilter;
    exportToExcel(`MoEYS_Student_Roster_${activeFilterName}`, data);
  };

  // Candidate classes for promotion modal based on promotionType
  const candidatePromotionClasses = useMemo(() => {
    if (promotionType === 'GRADUATED') return [];
    if (promotionType === 'RETAINED') {
      return classes;
    }
    // Filter classes of next or current grade levels
    return classes;
  }, [classes, promotionType]);

  return (
    <div className="space-y-5 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold z-50 animate-in fade-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('studentRegistryTitle')}
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {students.length} {t('studentCountUnit')}
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
              {language === 'km' ? 'ស្រី' : 'Female'}: {students.filter((s) => s.gender === 'FEMALE').length} {t('studentCountUnit')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('studentRegistryDesc')} • {school.nameKhmer}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add New Student */}
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'km' ? 'បន្ថែមសិស្សថ្មី' : 'Add Student'}</span>
          </button>

          {/* Promote Grade Action */}
          <button
            onClick={() => handleOpenPromotion()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            title={language === 'km' ? 'ឡើងថ្នាក់ / បន្តការសិក្សា' : 'Promote Grade'}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'km' ? 'ឡើងថ្នាក់ / បន្តការសិក្សា' : 'Promote Grade'}</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            title={language === 'km' ? 'នាំចូលទិន្នន័យពី Excel' : 'Import Students from Excel'}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t('importExcel')}</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

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
            {accessibleStudents.length} {t('studentCountUnit')}
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Classroom Selector Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <School className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'km' ? 'ថ្នាក់រៀន:' : 'Class:'}</span>
            </span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[220px]"
            >
              <option value="ALL">
                {isTeacher
                  ? language === 'km' ? 'ថ្នាក់ទទួលបន្ទុកទាំងអស់' : 'All My Classes'
                  : language === 'km' ? 'ថ្នាក់រៀនទាំងអស់' : 'All Classrooms'}{' '}
                ({baseStudentsPool.length})
              </option>
              {(isTeacher ? accessibleClasses : classes).map((cls) => {
                const count = baseStudentsPool.filter((s) => s.classId === cls.id).length;
                return (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({count} {t('studentCountUnit')})
                  </option>
                );
              })}
              {!isTeacher && (
                <>
                  <option value="UNASSIGNED">
                    {language === 'km' ? '⚠️ មិនទាន់កំណត់ថ្នាក់' : '⚠️ Unassigned Class'} (
                    {students.filter((s) => !s.classId).length})
                  </option>
                  <option value="GRADUATED">
                    {language === 'km' ? '🎓 បញ្ចប់ការសិក្សា' : '🎓 Graduated'} (
                    {students.filter((s) => s.classId === 'GRADUATED').length})
                  </option>
                </>
              )}
            </select>
          </div>

          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-700 ml-1">{language === 'km' ? 'ភេទ:' : 'Gender:'}</span>
            {(['ALL', 'FEMALE', 'MALE'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  genderFilter === g
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g === 'ALL' ? t('all') : g === 'FEMALE' ? t('female') : t('male')}
              </button>
            ))}
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">{language === 'km' ? 'ខេត្ត:' : 'Province:'}</span>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer max-w-[150px]"
            >
              <option value="ALL">{t('all')}</option>
              {CAMBODIA_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះ អត្តលេខ ឬខេត្ត...' : 'Search name, ID, or province...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-100 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                {/* Master Select All Checkbox */}
                <th className="p-3 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title={isAllVisibleSelected ? 'Deselect All' : 'Select All'}
                  >
                    {isAllVisibleSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3 w-12 text-center">{t('rollNoHeader')}</th>
                <th className="p-3 w-28">{t('studentIdHeader')}</th>
                <th className="p-3">{t('studentNameHeader')}</th>
                <th className="p-3 w-16 text-center">{t('genderHeader')}</th>
                <th className="p-3 w-48">{t('classroomLabel')}</th>
                <th className="p-3 w-28">{t('dobLabel')}</th>
                <th className="p-3">{t('pobLabel')}</th>
                <th className="p-3">{t('guardianInfoLabel')}</th>
                <th className="p-3 w-44 text-center">{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const isSelected = selectedStudentIds.includes(s.studentNationalId);
                const assignedClass = getClassById(s.classId);

                return (
                  <tr
                    key={s.studentNationalId}
                    className={`transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 hover:bg-blue-50'
                        : idx % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/40 hover:bg-slate-50'
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectStudent(s.studentNationalId)}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Roll Number */}
                    <td className="p-3 text-center font-mono font-bold text-slate-600">
                      {s.rollNumber}
                    </td>

                    {/* Student National ID */}
                    <td className="p-3 font-mono text-slate-700 font-bold">
                      {s.studentNationalId}
                    </td>

                    {/* Student Name (Khmer & Latin) */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800 text-sm">
                        {language === 'en' ? s.latinName : s.khmerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {language === 'en' ? s.khmerName : s.latinName}
                      </div>
                    </td>

                    {/* Gender */}
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          s.gender === 'FEMALE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {s.gender === 'FEMALE' ? t('female') : t('male')}
                      </span>
                    </td>

                    {/* Classroom Allocation Badge */}
                    <td className="p-3">
                      {s.classId === 'GRADUATED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-lg border border-emerald-300">
                          <GraduationCap className="w-3 h-3" />
                          <span>{language === 'km' ? 'បញ្ចប់ការសិក្សា' : 'Graduated'}</span>
                        </span>
                      ) : assignedClass ? (
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span className="truncate max-w-[180px]" title={assignedClass.name}>
                              {assignedClass.name}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {assignedClass.roomNumber} • {assignedClass.shift === 'MORNING' ? t('shiftMorningShort') : t('shiftAfternoonShort')}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-md border border-amber-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{language === 'km' ? 'មិនទាន់កំណត់' : 'Unassigned'}</span>
                        </span>
                      )}
                    </td>

                    {/* Date of Birth */}
                    <td className="p-3 font-mono text-slate-600">
                      {new Date(s.dob).toLocaleDateString('km-KH')}
                    </td>

                    {/* Place of Birth */}
                    <td className="p-3 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[160px]" title={`${s.pobDistrict}, ${s.pobProvince}`}>
                          {s.pobDistrict}, {s.pobProvince}
                        </span>
                      </div>
                    </td>

                    {/* Guardian Information */}
                    <td className="p-3 text-slate-600">
                      <div className="text-[11px] flex items-center gap-1.5 flex-wrap">
                        <strong>{s.fatherName || s.motherName || 'N/A'}</strong>
                        {(s.fatherOccupation || s.motherOccupation) && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {s.fatherOccupation || s.motherOccupation}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-blue-600 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-2.5 h-2.5" />
                        <span>{s.guardianPhone || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Dossier */}
                        <button
                          onClick={() => setSelectedDossier(s)}
                          className="p-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title={t('viewDossierButton')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Transfer Button */}
                        <button
                          onClick={() => handleOpenSingleTransfer(s)}
                          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-purple-200/60"
                          title={language === 'km' ? 'ផ្ទេរថ្នាក់រៀន' : 'Transfer Class'}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Student */}
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          title={language === 'km' ? 'កែសម្រួល' : 'Edit'}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Student */}
                        <button
                          onClick={() => setDeleteTarget(s)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                          title={language === 'km' ? 'លុបសិស្ស' : 'Delete'}
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

      {/* Empty Filter State */}
      {filteredStudents.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យសិស្សដែលស្វែងរកទេ' : 'No students found matching your criteria'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'km'
              ? 'សូមជ្រើសរើសតម្រងថ្នាក់ផ្សេង ឬចុចបន្ថែមសិស្សថ្មីចូលក្នុងប្រព័ន្ធ។'
              : 'Try adjusting filters or register new students.'}
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* FLOATING BULK ACTIONS BAR (When 1 or more students selected)    */}
      {/* ------------------------------------------------------------- */}
      {selectedStudentIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4 z-40 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              {selectedStudentIds.length}
            </span>
            <span className="text-xs font-bold">
              {language === 'km' ? 'សិស្សត្រូវបានជ្រើសរើស' : 'Selected'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Transfer Button */}
            <button
              onClick={handleOpenBulkTransfer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ផ្ទេរថ្នាក់' : 'Transfer Class'}</span>
            </button>

            {/* Bulk Promote Button */}
            <button
              onClick={() => handleOpenPromotion()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ឡើងថ្នាក់' : 'Promote Grade'}</span>
            </button>

            {/* Bulk Delete Button */}
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'លុប' : 'Delete'}</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedStudentIds([])}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title={language === 'km' ? 'បោះបង់ការជ្រើស' : 'Clear Selection'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: TRANSFER STUDENT TO ANOTHER CLASSROOM                */}
      {/* ------------------------------------------------------------- */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {t('transferStudentTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'km' ? 'ផ្ទេរសិស្សរវាងថ្នាក់រៀនស្របតាមបទដ្ឋាន MoEYS' : 'Transfer students between classrooms'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
              {/* Selected Students Summary */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {language === 'km' ? 'សិស្សដែលត្រូវផ្ទេរ:' : 'Students to Transfer:'} ({transferTargetStudents.length} {t('studentCountUnit')})
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                  {transferTargetStudents.map((stu) => {
                    const currentCls = getClassById(stu.classId);
                    return (
                      <div key={stu.studentNationalId} className="flex items-center justify-between pt-1 first:pt-0">
                        <div>
                          <span className="font-bold text-slate-800">{stu.khmerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">({stu.studentNationalId})</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {currentCls ? currentCls.name : 'Unassigned'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Classroom Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {t('targetClassroom')} *
                </label>
                <select
                  value={selectedTargetClassId}
                  onChange={(e) => setSelectedTargetClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer text-xs"
                >
                  <option value="">{t('selectTargetClass')}</option>
                  {classes.map((cls) => {
                    const count = students.filter((s) => s.classId === cls.id).length;
                    return (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} • {cls.roomNumber} ({count} {t('studentCountUnit')})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Target Classroom Information Preview */}
              {selectedTargetClassId && (
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-200/80 space-y-1.5">
                  <div className="font-bold text-purple-900 text-xs">
                    {language === 'km' ? 'ព័ត៌មានថ្នាក់រៀនគោលដៅ:' : 'Target Classroom Information:'}
                  </div>
                  {(() => {
                    const targetCls = getClassById(selectedTargetClassId);
                    if (!targetCls) return null;
                    const count = students.filter((s) => s.classId === targetCls.id).length;
                    return (
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-purple-800">
                        <div>{language === 'km' ? 'បន្ទប់:' : 'Room:'} <strong>{targetCls.roomNumber}</strong></div>
                        <div>{language === 'km' ? 'វេន:' : 'Shift:'} <strong>{targetCls.shift === 'MORNING' ? t('shiftMorningShort') : t('shiftAfternoonShort')}</strong></div>
                        <div>{language === 'km' ? 'គ្រូបន្ទុក:' : 'Homeroom Teacher:'} <strong>{targetCls.homeroomTeacherName}</strong></div>
                        <div>{language === 'km' ? 'សិស្សបច្ចុប្បន្ន:' : 'Enrolled:'} <strong>{count} {t('studentCountUnit')}</strong></div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-md shadow-purple-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'បញ្ជាក់ការផ្ទេរ' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: GRADE PROMOTION / ACADEMIC ADVANCEMENT (ឡើងថ្នាក់)     */}
      {/* ------------------------------------------------------------- */}
      {isPromotionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {t('promoteGradeTitle')}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {language === 'km' ? 'ការបន្តការសិក្សាសម្រាប់ឆ្នាំសិក្សាថ្មី (MoEYS Standard)' : 'Academic year progression & promotion'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPromotionModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {promotionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{promotionError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPromotion} className="space-y-4 text-xs">
              {/* Promotion Type Selector */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {t('promotionType')} *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPromotionType('PROMOTED');
                      if (candidatePromotionClasses.length > 0) {
                        setPromotionTargetClassId(candidatePromotionClasses[0].id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      promotionType === 'PROMOTED'
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">🎓 {language === 'km' ? 'ឡើងថ្នាក់' : 'Promote'}</div>
                    <div className={`text-[10px] mt-0.5 ${promotionType === 'PROMOTED' ? 'text-amber-100' : 'text-slate-400'}`}>
                      {language === 'km' ? 'ឡើងមួយកម្រិតថ្នាក់' : 'To Next Grade'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromotionType('RETAINED');
                      if (candidatePromotionClasses.length > 0) {
                        setPromotionTargetClassId(candidatePromotionClasses[0].id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      promotionType === 'RETAINED'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">🔄 {language === 'km' ? 'ថ្នាក់ត្រួត' : 'Retain / Repeat'}</div>
                    <div className={`text-[10px] mt-0.5 ${promotionType === 'RETAINED' ? 'text-blue-100' : 'text-slate-400'}`}>
                      {language === 'km' ? 'នៅកម្រិតថ្នាក់ដដែល' : 'Repeat Grade'}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPromotionType('GRADUATED');
                      setPromotionTargetClassId('GRADUATED');
                    }}
                    className={`p-3 rounded-xl border text-left font-bold transition-all cursor-pointer ${
                      promotionType === 'GRADUATED'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-black">📜 {language === 'km' ? 'បញ្ចប់ការសិក្សា' : 'Graduated'}</div>
                    <div className={`text-[10px] mt-0.5 ${promotionType === 'GRADUATED' ? 'text-emerald-100' : 'text-slate-400'}`}>
                      {language === 'km' ? 'សិស្សថ្នាក់ទី១២' : 'Completed HS'}
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Classroom Selection (if not graduated) */}
              {promotionType !== 'GRADUATED' && (
                <div>
                  <label className="block text-slate-700 font-bold mb-1.5">
                    {t('targetClassroom')} *
                  </label>
                  <select
                    value={promotionTargetClassId}
                    onChange={(e) => setPromotionTargetClassId(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer text-xs"
                  >
                    <option value="">{t('selectTargetClass')}</option>
                    {candidatePromotionClasses.map((cls) => {
                      const count = students.filter((s) => s.classId === cls.id).length;
                      return (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} • {cls.roomNumber} ({count} {t('studentCountUnit')})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Target Students Summary */}
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  {language === 'km' ? 'សិស្សដែលត្រូវឡើងថ្នាក់:' : 'Students to Advance:'} ({promotionTargetStudents.length} {t('studentCountUnit')})
                </label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-h-36 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
                  {promotionTargetStudents.map((stu) => {
                    const currentCls = getClassById(stu.classId);
                    return (
                      <div key={stu.studentNationalId} className="flex items-center justify-between pt-1 first:pt-0">
                        <div>
                          <span className="font-bold text-slate-800">{stu.khmerName}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">({stu.studentNationalId})</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {currentCls ? currentCls.name : 'Unassigned'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPromotionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'អនុម័តការឡើងថ្នាក់' : 'Approve Promotion'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: VIEW STUDENT DOSSIER                                   */}
      {/* ------------------------------------------------------------- */}
      {selectedDossier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  {selectedDossier.khmerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">{selectedDossier.khmerName}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedDossier.latinName} • {selectedDossier.studentNationalId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDossier(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Classroom Assignment Section */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
              <span className="text-blue-900 block text-[10px] uppercase font-bold flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span>{t('classroomLabel')}</span>
              </span>
              {(() => {
                const assignedCls = getClassById(selectedDossier.classId);
                return assignedCls ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{assignedCls.name}</div>
                      <div className="text-xs text-slate-500">
                        {assignedCls.roomNumber} • {t('homeroomTeacherLabel')}: {assignedCls.homeroomTeacherName}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-600 text-white font-mono font-bold text-xs rounded-lg">
                      {t('rollNoHeader')} {selectedDossier.rollNumber}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-amber-700">
                    {language === 'km' ? 'មិនទាន់បានកំណត់ថ្នាក់រៀននៅឡើយទេ' : 'No classroom assigned yet'}
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('genderHeader')}</span>
                <span className="font-bold text-slate-800 text-sm">
                  {selectedDossier.gender === 'FEMALE' ? t('female') : t('male')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('dobLabel')}</span>
                <span className="font-bold text-slate-800 text-sm font-mono">
                  {new Date(selectedDossier.dob).toLocaleDateString('km-KH')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('pobLabel')}</span>
              <div className="font-bold text-slate-800">
                {selectedDossier.pobDistrict}, {selectedDossier.pobProvince}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('guardianInfoLabel')}</span>
              <div className="text-slate-700 flex items-center justify-between">
                <span>{t('fatherNameLabel')}: <strong>{selectedDossier.fatherName || '-'}</strong></span>
                {selectedDossier.fatherOccupation && (
                  <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {selectedDossier.fatherOccupation}
                  </span>
                )}
              </div>
              <div className="text-slate-700 flex items-center justify-between">
                <span>{t('motherNameLabel')}: <strong>{selectedDossier.motherName || '-'}</strong></span>
                {selectedDossier.motherOccupation && (
                  <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                    {selectedDossier.motherOccupation}
                  </span>
                )}
              </div>
              <div className="text-blue-700 font-mono font-bold pt-1 border-t border-slate-200/60">{t('phoneLabel')}: {selectedDossier.guardianPhone || '-'}</div>
            </div>

            <div className="pt-2 flex justify-between items-center gap-2">
              <button
                onClick={() => {
                  const target = selectedDossier;
                  setSelectedDossier(null);
                  handleOpenSingleTransfer(target);
                }}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ផ្ទេរថ្នាក់' : 'Transfer Class'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = selectedDossier;
                    setSelectedDossier(null);
                    handleOpenEdit(target);
                  }}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'km' ? 'កែសម្រួល' : 'Edit'}
                </button>
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
                >
                  {t('close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: ADD / EDIT STUDENT                                     */}
      {/* ------------------------------------------------------------- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {formMode === 'ADD' ? <Plus className="w-5 h-5" /> : <Pencil className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {formMode === 'ADD'
                      ? language === 'km'
                        ? 'បន្ថែមសិស្សថ្មី'
                        : 'Register New Student'
                      : language === 'km'
                      ? 'កែសម្រួលព័ត៌មានសិស្ស'
                      : 'Edit Student Details'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    {school.nameKhmer}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
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
            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Classroom Allocation Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {t('classroomLabel')} *
                </label>
                <select
                  value={formData.classId || ''}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} • {cls.roomNumber}
                    </option>
                  ))}
                  <option value="GRADUATED">{language === 'km' ? '🎓 បញ្ចប់ការសិក្សា' : '🎓 Graduated'}</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Khmer Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'គោត្តនាម-នាម *' : 'Khmer Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. សុខ ចាន់ថន' : 'e.g. SOK CHANTHORN'}
                    value={formData.khmerName}
                    onChange={(e) => setFormData({ ...formData, khmerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Latin Name */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឈ្មោះឡាតាំង *' : 'Latin Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SOK CHANTHORN"
                    value={formData.latinName}
                    onChange={(e) => setFormData({ ...formData, latinName: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Student National ID */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'អត្តលេខសិស្ស *' : 'Student ID *'}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={formMode === 'EDIT'}
                    placeholder="e.g. STU-2024-031"
                    value={formData.studentNationalId}
                    onChange={(e) => setFormData({ ...formData, studentNationalId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                {/* Roll Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('rollNoHeader')}</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('genderHeader')}</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FEMALE">{t('female')}</option>
                    <option value="MALE">{t('male')}</option>
                  </select>
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('dobLabel')}</label>
                <input
                  type="date"
                  required
                  value={new Date(formData.dob).toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, dob: new Date(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Place of Birth: Province & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ខេត្ត/រាជធានីកំណើត' : 'Birth Province'}
                  </label>
                  <select
                    value={formData.pobProvince}
                    onChange={(e) => setFormData({ ...formData, pobProvince: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CAMBODIA_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ស្រុក/ខណ្ឌកំណើត' : 'Birth District'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. ខណ្ឌដូនពេញ' : 'e.g. Daun Penh'}
                    value={formData.pobDistrict}
                    onChange={(e) => setFormData({ ...formData, pobDistrict: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('fatherNameLabel')}</label>
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'ឈ្មោះឪពុក' : "Father's name"}
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('fatherOccupationLabel')}</label>
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'មុខរបរឪពុក (ឧ. មន្ត្រីរាជការ, អាជីវករ...)' : "Father's occupation"}
                    value={formData.fatherOccupation || ''}
                    onChange={(e) => setFormData({ ...formData, fatherOccupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('motherNameLabel')}</label>
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'ឈ្មោះម្តាយ' : "Mother's name"}
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('motherOccupationLabel')}</label>
                  <input
                    type="text"
                    placeholder={language === 'km' ? 'មុខរបរម្តាយ (ឧ. មេផ្ទះ, អាជីវករ...)' : "Mother's occupation"}
                    value={formData.motherOccupation || ''}
                    onChange={(e) => setFormData({ ...formData, motherOccupation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('phoneLabel')}</label>
                <input
                  type="text"
                  placeholder="012 345 678"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {formMode === 'ADD'
                    ? language === 'km'
                      ? 'រក្សាទុកសិស្សថ្មី'
                      : 'Save Student'
                    : language === 'km'
                    ? 'ធ្វើបច្ចុប្បន្នភាព'
                    : 'Update Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 5: SINGLE DELETE CONFIRMATION                            */}
      {/* ------------------------------------------------------------- */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {language === 'km' ? 'បញ្ជាក់ការលុបសិស្ស' : 'Confirm Student Deletion'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបសិស្ស "${deleteTarget.khmerName}" (${deleteTarget.studentNationalId}) ចេញពីបញ្ជីរាយនាមមែនទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយវិញបានឡើយ។`
                  : `Are you sure you want to remove student "${deleteTarget.latinName}" (${deleteTarget.studentNationalId})?`}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-slate-800">{deleteTarget.khmerName}</span>
                <span className="text-[11px] text-slate-400 block font-mono">{deleteTarget.latinName}</span>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded-md border border-blue-200">
                {deleteTarget.studentNationalId}
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

      {/* ------------------------------------------------------------- */}
      {/* MODAL 6: BULK DELETE CONFIRMATION                              */}
      {/* ------------------------------------------------------------- */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-base text-slate-800">
                {language === 'km' ? 'បញ្ជាក់ការលុបសិស្សច្រើននាក់' : 'Confirm Bulk Student Deletion'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបសិស្សចំនួន ${selectedStudentIds.length} នាក់ ដែលបានជ្រើសរើសចេញពីប្រព័ន្ធមែនទេ?`
                  : `Are you sure you want to remove ${selectedStudentIds.length} selected students from the system?`}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/25 cursor-pointer"
              >
                {language === 'km' ? 'យល់ព្រមលុបទាំងអស់' : 'Confirm Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Students Excel Modal */}
      <ImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultClassId={classFilter !== 'ALL' && classFilter !== 'UNASSIGNED' && classFilter !== 'GRADUATED' ? classFilter : selectedClassId}
        onSuccess={(added, updated) => {
          showToast(
            language === 'km'
              ? `បាននាំចូលសិស្សថ្មី ${added} នាក់ និងកែប្រែ ${updated} នាក់ដោយជោគជ័យ!`
              : `Successfully imported ${added} new students and updated ${updated} existing!`
          );
        }}
      />
    </div>
  );
}
