'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSchool } from '@/lib/stateContext';
import {
  FileSpreadsheet,
  Save,
  Download,
  Search,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Printer,
  Award,
  ChevronRight,
  ChevronDown,
  Calculator,
  SlidersHorizontal,
  CheckSquare,
  Square,
  X,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react';
import {
  MONTHLY_SUBJECT_GROUPS,
  ALL_COMPETENCY_COLUMNS,
  MONTHLY_ACADEMIC_MONTHS,
  SEMESTER_EXAM_SUBJECTS,
  generateInitialMonthlyCompetencyScores,
  computeMonthlyStudentRecords,
  computeGradeStatistics,
  computeSemesterGradebookRecords,
  computeSemesterGradeStatistics,
  computeAnnualGradebookRecords,
  computeAnnualGradeStatistics,
  StudentMonthlyCompetencyRecord,
  StudentSemesterGradebookRecord,
  StudentAnnualGradebookRecord,
  DomainGrades,
} from '@/lib/monthlyGradebookData';

export default function GradebookPage() {
  const {
    school,
    academicMonths,
    classes,
    accessibleClasses,
    canAccessClass,
    isTeacher,
    currentUser,
    selectedClassId,
    setSelectedClassId,
    students,
    selectedSubjectCode,
    setSelectedSubjectCode,
    subjectRules,
    monthlySubjectGroups,
    allCompetencyColumns,
    monthlyScoresMap,
    updateMonthlyCompetencyScore,
    semesterExamScoresMap,
    updateSemesterExamScore,
    customDomainGradesMap,
    updateDomainGrade,
    customAnnualDomainGradesMap,
    updateAnnualDomainGrade,
    semesterRemarksMap,
    updateSemesterRemark,
    annualRemarksMap,
    updateAnnualRemark,
    updateScore,
    computedStudentRecords,
    disabledColumnsMap,
    toggleColumnForClass,
    setDisabledColumnsForClass,
    updateClassDivisor,
    exportToExcel,
    language,
    t,
  } = useSchool();

  // Mode: 'ANNUAL_GRADEBOOK' | 'SEMESTER_GRADEBOOK' | 'MONTHLY_COMPETENCY' | 'SUBJECT_SEMESTER'
  const [viewMode, setViewMode] = useState<'ANNUAL_GRADEBOOK' | 'SEMESTER_GRADEBOOK' | 'MONTHLY_COMPETENCY' | 'SUBJECT_SEMESTER'>('ANNUAL_GRADEBOOK');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

  // Remarks Map for Monthly: studentId -> remarks string
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  const targetClasses = isTeacher ? accessibleClasses : classes;
  const currentClass =
    targetClasses.find((c) => c.id === selectedClassId) ||
    targetClasses[0] ||
    classes[0];
  const currentRule = subjectRules.find((r) => r.subjectCode === selectedSubjectCode) || subjectRules[0];
  const currentMonthObj = academicMonths.find((m) => m.index === selectedMonthIndex) || academicMonths[0];

  // Grid input refs for 2D keyboard navigation
  const monthlyInputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const semesterInputRefs = useRef<(HTMLInputElement | null)[][]>([]);
  const subjectInputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  // Disabled columns for current selected class
  const disabledColKeys = useMemo(() => {
    return disabledColumnsMap[selectedClassId] || currentClass?.disabledColumnKeys || [];
  }, [disabledColumnsMap, selectedClassId, currentClass?.disabledColumnKeys]);

  // Active competency columns filtered by current class's disabled keys
  const activeCompetencyColumns = useMemo(() => {
    return (allCompetencyColumns || ALL_COMPETENCY_COLUMNS).filter((c) => !disabledColKeys.includes(c.key));
  }, [allCompetencyColumns, disabledColKeys]);

  // Active subject groups with only active sub-columns
  const activeSubjectGroups = useMemo(() => {
    return (monthlySubjectGroups || MONTHLY_SUBJECT_GROUPS).map((group) => ({
      ...group,
      subColumns: group.subColumns.filter((col) => !disabledColKeys.includes(col.key)),
    })).filter((group) => group.subColumns.length > 0);
  }, [monthlySubjectGroups, disabledColKeys]);

  // Filter students strictly by selected class
  const classStudents = useMemo(() => {
    return students.filter((s) => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Subject Divisor state for calculating average (loaded from selected classroom's database record)
  const [divisorInput, setDivisorInput] = useState<string>(
    String(currentClass?.subjectDivisor || activeCompetencyColumns.length || 21)
  );
  const [semesterDivisorInput, setSemesterDivisorInput] = useState<string>(
    String(currentClass?.semesterDivisor || SEMESTER_EXAM_SUBJECTS.length)
  );
  const [annualSem1DivisorInput, setAnnualSem1DivisorInput] = useState<string>(String(SEMESTER_EXAM_SUBJECTS.length));
  const [annualSem2DivisorInput, setAnnualSem2DivisorInput] = useState<string>(String(SEMESTER_EXAM_SUBJECTS.length));

  // Sync divisor when active columns or selected class change
  useEffect(() => {
    if (currentClass?.subjectDivisor) {
      setDivisorInput(String(currentClass.subjectDivisor));
    } else {
      setDivisorInput(String(activeCompetencyColumns.length || 21));
    }
    if (currentClass?.semesterDivisor) {
      setSemesterDivisorInput(String(currentClass.semesterDivisor));
    }
  }, [selectedClassId, currentClass?.subjectDivisor, currentClass?.semesterDivisor, disabledColKeys.length]);

  const subjectDivisor = useMemo(() => {
    const num = parseFloat(divisorInput);
    return !isNaN(num) && num > 0 ? num : (activeCompetencyColumns.length || 1);
  }, [divisorInput, activeCompetencyColumns.length]);

  const semesterSubjectDivisor = useMemo(() => {
    const num = parseFloat(semesterDivisorInput);
    return !isNaN(num) && num > 0 ? num : SEMESTER_EXAM_SUBJECTS.length;
  }, [semesterDivisorInput]);

  // Current month's scores dictionary
  const currentMonthScores = (monthlyScoresMap && monthlyScoresMap[selectedMonthIndex]) || {};

  // Computed records for the selected month with active columns filter
  const computedMonthlyRecords = useMemo(() => {
    const activeKeys = activeCompetencyColumns.map((c) => c.key);
    return computeMonthlyStudentRecords(
      classStudents,
      currentMonthScores,
      remarksMap,
      subjectDivisor,
      activeKeys
    );
  }, [classStudents, currentMonthScores, remarksMap, subjectDivisor, activeCompetencyColumns]);

  // Filtered monthly records by search
  const filteredMonthlyRecords = useMemo(() => {
    if (!searchQuery.trim()) return computedMonthlyRecords;
    const q = searchQuery.toLowerCase();
    return computedMonthlyRecords.filter(
      (r) =>
        r.student.khmerName.toLowerCase().includes(q) ||
        r.student.latinName.toLowerCase().includes(q) ||
        r.student.studentNationalId.toLowerCase().includes(q)
    );
  }, [computedMonthlyRecords, searchQuery]);

  // Overall Statistics for monthly view
  const gradeStats = useMemo(() => {
    return computeGradeStatistics(computedMonthlyRecords);
  }, [computedMonthlyRecords]);

  // Semester Gradebook computations
  const currentSemesterExamScores = (semesterExamScoresMap && semesterExamScoresMap[selectedSemester]) || {};
  const currentSemesterDomainGrades = (customDomainGradesMap && customDomainGradesMap[selectedSemester]) || {};
  const currentSemesterRemarks = (semesterRemarksMap && semesterRemarksMap[selectedSemester]) || {};

  const computedSemesterRecords = useMemo(() => {
    return computeSemesterGradebookRecords(
      classStudents,
      currentSemesterExamScores,
      monthlyScoresMap || {},
      academicMonths,
      selectedSemester,
      semesterSubjectDivisor,
      currentSemesterDomainGrades,
      currentSemesterRemarks
    );
  }, [
    classStudents,
    currentSemesterExamScores,
    monthlyScoresMap,
    academicMonths,
    selectedSemester,
    semesterSubjectDivisor,
    currentSemesterDomainGrades,
    currentSemesterRemarks,
  ]);

  const filteredSemesterRecords = useMemo(() => {
    if (!searchQuery.trim()) return computedSemesterRecords;
    const q = searchQuery.toLowerCase();
    return computedSemesterRecords.filter(
      (r) =>
        r.student.khmerName.toLowerCase().includes(q) ||
        r.student.latinName.toLowerCase().includes(q) ||
        r.student.studentNationalId.toLowerCase().includes(q)
    );
  }, [computedSemesterRecords, searchQuery]);

  const semesterGradeStats = useMemo(() => {
    return computeSemesterGradeStatistics(computedSemesterRecords);
  }, [computedSemesterRecords]);

  // Annual Gradebook computations
  const annualSem1Divisor = useMemo(() => {
    const num = parseFloat(annualSem1DivisorInput);
    return !isNaN(num) && num > 0 ? num : SEMESTER_EXAM_SUBJECTS.length;
  }, [annualSem1DivisorInput]);

  const annualSem2Divisor = useMemo(() => {
    const num = parseFloat(annualSem2DivisorInput);
    return !isNaN(num) && num > 0 ? num : SEMESTER_EXAM_SUBJECTS.length;
  }, [annualSem2DivisorInput]);

  const computedAnnualRecords = useMemo(() => {
    return computeAnnualGradebookRecords(
      classStudents,
      semesterExamScoresMap || {},
      monthlyScoresMap || {},
      academicMonths,
      annualSem1Divisor,
      annualSem2Divisor,
      customAnnualDomainGradesMap || {},
      annualRemarksMap || {}
    );
  }, [
    classStudents,
    semesterExamScoresMap,
    monthlyScoresMap,
    academicMonths,
    annualSem1Divisor,
    annualSem2Divisor,
    customAnnualDomainGradesMap,
    annualRemarksMap,
  ]);

  const filteredAnnualRecords = useMemo(() => {
    if (!searchQuery.trim()) return computedAnnualRecords;
    const q = searchQuery.toLowerCase();
    return computedAnnualRecords.filter(
      (r) =>
        r.student.khmerName.toLowerCase().includes(q) ||
        r.student.latinName.toLowerCase().includes(q) ||
        r.student.studentNationalId.toLowerCase().includes(q)
    );
  }, [computedAnnualRecords, searchQuery]);

  const annualGradeStats = useMemo(() => {
    return computeAnnualGradeStatistics(computedAnnualRecords);
  }, [computedAnnualRecords]);

  // Filtered records for single subject view
  const filteredSubjectRecords = useMemo(() => {
    return computedStudentRecords.filter(
      (r) =>
        r.student.khmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.student.studentNationalId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [computedStudentRecords, searchQuery]);

  // Update a specific competency score in real time
  const handleScoreChange = (studentId: string, colKey: string, value: number) => {
    updateMonthlyCompetencyScore(selectedMonthIndex, studentId, colKey, value);
  };

  // Update a specific semester exam score
  const handleSemesterScoreChange = (studentId: string, subjectKey: string, value: number) => {
    updateSemesterExamScore(selectedSemester, studentId, subjectKey, value);
  };

  // Update a domain grade
  const handleDomainGradeChange = (studentId: string, domain: keyof DomainGrades, grade: string) => {
    updateDomainGrade(selectedSemester, studentId, domain, grade);
  };

  // Update annual domain grade
  const handleAnnualDomainGradeChange = (studentId: string, domain: keyof DomainGrades, grade: string) => {
    updateAnnualDomainGrade(studentId, domain, grade);
  };

  // Update semester remark
  const handleSemesterRemarkChange = (studentId: string, remark: string) => {
    updateSemesterRemark(selectedSemester, studentId, remark);
  };

  // Update annual remark
  const handleAnnualRemarkChange = (studentId: string, remark: string) => {
    updateAnnualRemark(studentId, remark);
  };

  // Update remarks
  const handleRemarksChange = (studentId: string, text: string) => {
    setRemarksMap((prev) => ({
      ...prev,
      [studentId]: text,
    }));
  };

  // 2D Keyboard navigation for monthly competency grid
  const handleMonthlyKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    colIdx: number,
    totalCols: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextRow = Math.min(filteredMonthlyRecords.length - 1, studentIdx + 1);
      monthlyInputRefs.current[nextRow]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = Math.max(0, studentIdx - 1);
      monthlyInputRefs.current[prevRow]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      if (e.key === 'ArrowRight' && e.currentTarget.selectionStart !== e.currentTarget.value.length) {
        return;
      }
      e.preventDefault();
      if (colIdx < totalCols - 1) {
        monthlyInputRefs.current[studentIdx]?.[colIdx + 1]?.focus();
      } else if (studentIdx < filteredMonthlyRecords.length - 1) {
        monthlyInputRefs.current[studentIdx + 1]?.[0]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.currentTarget.selectionStart !== 0) {
        return;
      }
      e.preventDefault();
      if (colIdx > 0) {
        monthlyInputRefs.current[studentIdx]?.[colIdx - 1]?.focus();
      } else if (studentIdx > 0) {
        monthlyInputRefs.current[studentIdx - 1]?.[totalCols - 1]?.focus();
      }
    }
  };

  // 2D Keyboard navigation for semester grid
  const handleSemesterKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    studentIdx: number,
    colIdx: number,
    totalCols: number
  ) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
      const nextRow = Math.min(filteredSemesterRecords.length - 1, studentIdx + 1);
      semesterInputRefs.current[nextRow]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = Math.max(0, studentIdx - 1);
      semesterInputRefs.current[prevRow]?.[colIdx]?.focus();
    } else if (e.key === 'ArrowRight' || e.key === 'Tab') {
      if (e.key === 'ArrowRight' && e.currentTarget.selectionStart !== e.currentTarget.value.length) {
        return;
      }
      e.preventDefault();
      if (colIdx < totalCols - 1) {
        semesterInputRefs.current[studentIdx]?.[colIdx + 1]?.focus();
      } else if (studentIdx < filteredSemesterRecords.length - 1) {
        semesterInputRefs.current[studentIdx + 1]?.[0]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (e.currentTarget.selectionStart !== 0) {
        return;
      }
      e.preventDefault();
      if (colIdx > 0) {
        semesterInputRefs.current[studentIdx]?.[colIdx - 1]?.focus();
      } else if (studentIdx > 0) {
        semesterInputRefs.current[studentIdx - 1]?.[totalCols - 1]?.focus();
      }
    }
  };

  // Export Annual Gradebook to Excel
  const handleExportAnnualExcel = () => {
    const data = computedAnnualRecords.map((r, idx) => {
      return {
        'ល.រ': idx + 1,
        'អត្តលេខ': r.student.studentNationalId,
        'គោត្តនាម និងនាម': r.student.khmerName,
        'ភេទ': r.student.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស',
        'មធ្យមភាគប្រចាំឆមាស១': r.semester1Average,
        'មធ្យមភាគប្រចាំឆមាស២': r.semester2Average,
        'មធ្យមភាគប្រចាំឆ្នាំ': r.annualAverage,
        'ចំណាត់ថ្នាក់': r.rank,
        'និទ្ទេសចំណេះដឹង': r.domainGrades.knowledge,
        'និទ្ទេសបំណិន-ចំណេះធ្វើ': r.domainGrades.skills,
        'និទ្ទេសតម្លៃ-សីលធម៌': r.domainGrades.values,
        'និទ្ទេសសាមគ្គីភាព-ការចូលរួម': r.domainGrades.participation,
        'លទ្ធផល': r.outcome,
        'សេចក្ដីផ្សេងៗ': r.remarks || r.outcome,
      };
    });

    exportToExcel(`តារាងលទ្ធផលប្រចាំឆ្នាំ_${currentClass?.name || ''}`, data);
  };

  // Export Semester Gradebook to Excel
  const handleExportSemesterExcel = () => {
    const data = computedSemesterRecords.map((r, idx) => {
      const row: Record<string, any> = {
        'ល.រ': idx + 1,
        'អត្តលេខ': r.student.studentNationalId,
        'គោត្តនាម និងនាម': r.student.khmerName,
        'ភេទ': r.student.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស',
      };

      SEMESTER_EXAM_SUBJECTS.forEach((subj) => {
        row[subj.nameKhmer] = r.examScores[subj.key] ?? 0;
      });

      row['ពិន្ទុសរុប'] = r.totalExamScore;
      row['មធ្យមភាគប្រឡងឆមាស'] = r.examAverage;
      row['មធ្យមភាគប្រចាំខែ'] = r.monthlyAverage;
      row['មធ្យមភាគប្រចាំឆមាស'] = r.semesterAverage;
      row['ចំណាត់ថ្នាក់'] = r.rank;
      row['និទ្ទេសចំណេះដឹង'] = r.domainGrades.knowledge;
      row['និទ្ទេសបំណិន-ចំណេះធ្វើ'] = r.domainGrades.skills;
      row['និទ្ទេសតម្លៃ-សីលធម៌'] = r.domainGrades.values;
      row['និទ្ទេសសាមគ្គីភាព-ការចូលរួម'] = r.domainGrades.participation;
      row['សេចក្ដីផ្សេងៗ'] = r.remarks || (r.isPassing ? 'ឡើងថ្នាក់' : 'ប្រឡងសង');

      return row;
    });

    exportToExcel(`តារាងពិន្ទុប្រចាំឆមាសទី${selectedSemester}_${currentClass?.name || ''}`, data);
  };

  // Export Monthly Gradebook to Excel
  const handleExportMonthlyExcel = () => {
    const data = computedMonthlyRecords.map((r, idx) => {
      const row: Record<string, any> = {
        'ល.រ': idx + 1,
        'អត្តលេខ': r.student.studentNationalId,
        'គោត្តនាម និងនាម': r.student.khmerName,
        'អក្សរឡាតាំង': r.student.latinName,
        'ភេទ': r.student.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស',
      };

      // Add each active subject & competency
      activeSubjectGroups.forEach((group) => {
        group.subColumns.forEach((col) => {
          const colLabel = `${group.nameKhmer} - ${col.nameKhmer}`;
          row[colLabel] = r.scores[col.key] ?? 0;
        });
      });

      row['ពិន្ទុសរុប'] = r.totalScore;
      row['មធ្យមភាគ'] = r.averageScore;
      row['ចំណាត់ថ្នាក់'] = r.rank;
      row['និទ្ទេស'] = r.gradeLetter;
      row['ការវាយតម្លៃ'] = r.gradeLabelKhmer;
      row['សេចក្ដីផ្សេងៗ'] = r.remarks;

      return row;
    });

    exportToExcel(`តារាងពិន្ទុប្រចាំខែ_${currentMonthObj?.nameKhmer || ''}_${currentClass?.name || ''}`, data);
  };

  // Export Single Subject Grid
  const handleExportSubjectExcel = () => {
    const data = filteredSubjectRecords.map((r) => {
      const subScore = r.scoresBySubject[selectedSubjectCode] || { monthly: [0, 0, 0, 0, 0], exam: 0 };
      const validMonthly = subScore.monthly.filter((v) => v > 0);
      const monthlyAvg = validMonthly.length > 0 ? validMonthly.reduce((a, b) => a + b, 0) / validMonthly.length : 0;
      const semScore = (monthlyAvg + subScore.exam * 2) / 3;

      return {
        'No.': r.student.rollNumber,
        'National ID': r.student.studentNationalId,
        'Khmer Name': r.student.khmerName,
        'Latin Name': r.student.latinName,
        'Gender': r.student.gender === 'FEMALE' ? 'F' : 'M',
        'Oct (M1)': subScore.monthly[0],
        'Nov (M2)': subScore.monthly[1],
        'Dec (M3)': subScore.monthly[2],
        'Jan (M4)': subScore.monthly[3],
        'Feb (M5)': subScore.monthly[4],
        'Monthly Avg': Number(monthlyAvg.toFixed(2)),
        'Exam Score': subScore.exam,
        'Semester Score': Number(semScore.toFixed(2)),
        'Coeff': currentRule?.coefficient || 1,
        'Weighted Total': Number((semScore * (currentRule?.coefficient || 1)).toFixed(2)),
        'Grade': r.rankInfo.letterGrade.letter,
      };
    });

    exportToExcel(`MoEYS_Subject_${currentClass?.name || ''}_${currentRule?.nameEnglish || ''}`, data);
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Teacher Scope Notice / Unassigned Class Alert */}
      {isTeacher && (
        <div className="space-y-2 no-print">
          {accessibleClasses.length === 0 ? (
            <div className="bg-amber-500/10 border border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                ⚠️
              </div>
              <div className="flex-1">
                <strong className="font-bold">{t('accessDeniedTitle')}</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {t('noAssignedClassesWarning')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
                  ✓
                </div>
                <div>
                  <strong className="text-emerald-950 font-bold">
                    {t('teacherScopeBadge')}: <span className="text-emerald-700 underline">{currentClass?.name || 'ថ្នាក់រៀន'}</span>
                  </strong>
                  <p className="text-slate-500 text-[11px]">
                    {t('onlyAssignedClassNotice')}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-emerald-800 font-bold rounded-lg border border-emerald-200 text-[11px] shrink-0 font-mono">
                @{currentUser.username}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 🧭 Top Bar & Navigation (Hidden on Print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-900">
              {viewMode === 'ANNUAL_GRADEBOOK'
                ? 'តារាងលទ្ធផលប្រចាំឆ្នាំ (MoEYS Standard)'
                : viewMode === 'SEMESTER_GRADEBOOK'
                ? 'តារាងពិន្ទុប្រចាំឆមាស (MoEYS Standard)'
                : viewMode === 'MONTHLY_COMPETENCY'
                ? 'តារាងពិន្ទុប្រចាំខែ (MoEYS Standard)'
                : t('gradebookHeaderTitle')}
            </h1>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {language === 'km' ? 'គណនាស្វ័យប្រវត្ត' : 'Auto-Computed'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {viewMode === 'ANNUAL_GRADEBOOK'
              ? `លទ្ធផល និងការវាយតម្លៃការសិក្សាប្រចាំឆ្នាំសម្រាប់ ${currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា ${school.academicYear}`
              : viewMode === 'SEMESTER_GRADEBOOK'
              ? `បញ្ចូលពិន្ទុប្រឡងឆមាស និងការវាយតម្លៃតាមផ្នែកសម្រាប់ ${currentClass?.name || 'ថ្នាក់រៀន'} • ឆមាសទី ${selectedSemester}`
              : viewMode === 'MONTHLY_COMPETENCY'
              ? `បញ្ចូលពិន្ទុតាមជំនាញ និងសមត្ថភាពសម្រាប់ ${currentClass?.name || 'ថ្នាក់រៀន'} • ${currentMonthObj?.nameKhmer || 'ខែសិក្សា'}`
              : t('gradebookHeaderDesc')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={triggerSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('save')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print')}</span>
          </button>
          <button
            onClick={
              viewMode === 'ANNUAL_GRADEBOOK'
                ? handleExportAnnualExcel
                : viewMode === 'SEMESTER_GRADEBOOK'
                ? handleExportSemesterExcel
                : viewMode === 'MONTHLY_COMPETENCY'
                ? handleExportMonthlyExcel
                : handleExportSubjectExcel
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('savedToastSuccess')}</span>
        </div>
      )}

      {/* 🎛️ View Mode Switcher & Filter Toolbar (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs space-y-4 no-print">
        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setViewMode('ANNUAL_GRADEBOOK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ANNUAL_GRADEBOOK'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>តារាងលទ្ធផលប្រចាំឆ្នាំ (Annual Results)</span>
            </button>
            <button
              onClick={() => setViewMode('SEMESTER_GRADEBOOK')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'SEMESTER_GRADEBOOK'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>តារាងពិន្ទុប្រចាំឆមាស (១៤ មុខវិជ្ជា)</span>
            </button>
            <button
              onClick={() => setViewMode('MONTHLY_COMPETENCY')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'MONTHLY_COMPETENCY'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>តារាងពិន្ទុប្រចាំខែ (គ្រប់ជំនាញ)</span>
            </button>
            <button
              onClick={() => setViewMode('SUBJECT_SEMESTER')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'SUBJECT_SEMESTER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>តារាងតាមមុខវិជ្ជា & ឆមាស</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* Annual Results Toolbar */}
        {viewMode === 'ANNUAL_GRADEBOOK' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>តួរចែកឆមាសទី១៖</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={annualSem1DivisorInput}
                  onChange={(e) => setAnnualSem1DivisorInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="14"
                />
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>តួរចែកឆមាសទី២៖</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={annualSem2DivisorInput}
                  onChange={(e) => setAnnualSem2DivisorInput(e.target.value)}
                  className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="14"
                />
              </div>
            </div>

            {/* Formula badge and student count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-md font-mono text-[11px] font-bold shadow-2xs">
                រូបមន្ត៖ (មធ្យមភាគ ឆ.១ + មធ្យមភាគ ឆ.២) ÷ ២ = មធ្យមភាគប្រចាំឆ្នាំ
              </span>
              <span>•</span>
              <span>សិស្សសរុប៖ <strong className="text-slate-900 font-mono">{filteredAnnualRecords.length}</strong> នាក់</span>
            </div>
          </div>
        )}

        {/* Month Dropdown Selector & Subject Divisor (Only in Monthly Competency View) */}
        {viewMode === 'MONTHLY_COMPETENCY' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-4">
              {/* 1. Month Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>ជ្រើសរើសខែសិក្សា៖</span>
                </label>

                <div className="relative">
                  <select
                    value={selectedMonthIndex}
                    onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                    className="pl-3 pr-9 py-2 bg-white text-xs font-bold text-slate-900 rounded-lg border border-slate-300 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none min-w-[190px]"
                  >
                    {academicMonths.map((m) => (
                      <option key={m.index} value={m.index}>
                        {m.nameKhmer} (ខែទី {m.index} • ឆមាសទី {m.semester}){m.isExamMonth === false ? ' 🚫 [មិនប្រឡង]' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 2. 🔢 Textbox សម្រាប់បញ្ចូលចំនួនមុខវិជ្ជា/តួរចែករកមធ្យមភាគ */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'en' ? 'Subject Count (Divisor):' : 'ចំនួនមុខវិជ្ជា (តួរចែកមធ្យមភាគ)៖'}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={divisorInput}
                    onChange={(e) => {
                      setDivisorInput(e.target.value);
                      const num = parseFloat(e.target.value);
                      if (!isNaN(num) && num > 0 && selectedClassId) {
                        updateClassDivisor(selectedClassId, num);
                      }
                    }}
                    placeholder="21"
                    title="បញ្ចូលចំនួនមុខវិជ្ជា ឬតួរចែកសម្រាប់គណនាមធ្យមភាគ (ពិន្ទុសរុប ÷ តួរចែក)"
                    className="w-16 px-2 py-1 text-center font-mono font-black text-xs text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  {/* Preset Buttons */}
                  <div className="hidden sm:flex items-center gap-1">
                    {[
                      { val: String(activeCompetencyColumns.length), label: `${activeCompetencyColumns.length} ជំនាញ` },
                      { val: '7', label: '7 មុខវិជ្ជា' },
                      { val: '9', label: '9 មុខវិជ្ជា' },
                      { val: '10', label: '10 មុខវិជ្ជា' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => {
                          setDivisorInput(p.val);
                          const num = parseFloat(p.val);
                          if (!isNaN(num) && num > 0 && selectedClassId) {
                            updateClassDivisor(selectedClassId, num);
                          }
                        }}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                          divisorInput === p.val
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. ⚙️ កំណត់មុខវិជ្ជាប្រឡងក្នុងថ្នាក់ (Disable/Enable Non-examined Subjects) */}
              <button
                type="button"
                onClick={() => setIsColumnModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-xs cursor-pointer ${
                  disabledColKeys.length > 0
                    ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="ជ្រើសរើស ឬបិទមុខវិជ្ជា/ជំនាញដែលមិនត្រូវប្រឡងក្នុងថ្នាក់នេះ"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>មុខវិជ្ជាប្រឡង ({activeCompetencyColumns.length}/{ALL_COMPETENCY_COLUMNS.length})</span>
                {disabledColKeys.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-mono font-bold">
                    បិទ {disabledColKeys.length}
                  </span>
                )}
              </button>
            </div>

            {/* Formula badge, non-exam status and student count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-md font-mono text-[11px] font-bold shadow-2xs">
                រូបមន្ត៖ ពិន្ទុសរុប ÷ <strong className="text-amber-700 font-black">{subjectDivisor}</strong> = មធ្យមភាគ
              </span>
              <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-md font-bold flex items-center gap-1.5">
                <span>{currentMonthObj?.nameKhmer || 'ខែសិក្សា'}</span>
                {currentMonthObj?.isExamMonth === false && (
                  <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 border border-rose-300 rounded text-[10px] font-bold">
                    🚫 មិនប្រឡង
                  </span>
                )}
              </span>
              <span>•</span>
              <span>សិស្សសរុប៖ <strong className="text-slate-900 font-mono">{filteredMonthlyRecords.length}</strong> នាក់</span>
            </div>

            {/* Non-Exam Month Notice Banner */}
            {currentMonthObj?.isExamMonth === false && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚫</span>
                  <div>
                    <strong className="font-bold text-rose-950">ខែមិនប្រឡង / វិស្សមកាល៖</strong>{' '}
                    ខែ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'} ត្រូវបានកំណត់ជា <em>"មិនប្រឡងប្រចាំខែ"</em> នៅក្នុងការកំណត់ប្រព័ន្ធ។
                  </div>
                </div>
                <Link
                  href="/settings"
                  className="shrink-0 px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded-lg font-bold text-[11px] transition-all shadow-xs"
                >
                  ⚙️ ប្ដូរការកំណត់ខែ
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Semester Dropdown Selector & Divisor (Only in Semester Gradebook View) */}
        {viewMode === 'SEMESTER_GRADEBOOK' && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
            <div className="flex flex-wrap items-center gap-4">
              {/* 1. Semester Selector Buttons */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>ជ្រើសរើសឆមាស៖</span>
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300 shadow-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedSemester(1)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedSemester === 1
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ឆមាសទី ១ (Semester 1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSemester(2)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      selectedSemester === 2
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    ឆមាសទី ២ (Semester 2)
                  </button>
                </div>
              </div>

              {/* 2. Divisor Textbox */}
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'en' ? 'Exam Divisor:' : 'ចំនួនមុខវិជ្ជា (តួរចែកប្រឡងឆមាស)៖'}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={semesterDivisorInput}
                    onChange={(e) => setSemesterDivisorInput(e.target.value)}
                    placeholder="14"
                    title="ចំនួនមុខវិជ្ជា/តួរចែករកមធ្យមភាគប្រឡងឆមាស"
                    className="w-16 px-2 py-1 text-center font-mono font-black text-xs text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner"
                  />
                  <div className="hidden sm:flex items-center gap-1">
                    {[
                      { val: '14', label: '14 មុខវិជ្ជា (MoEYS)' },
                      { val: '12', label: '12 មុខវិជ្ជា' },
                      { val: '10', label: '10 មុខវិជ្ជា' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setSemesterDivisorInput(p.val)}
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                          semesterDivisorInput === p.val
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Formula badge and student count */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
              <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200/90 rounded-md font-mono text-[11px] font-bold shadow-2xs">
                រូបមន្ត៖ (មធ្យមភាគប្រឡង + មធ្យមភាគប្រចាំខែ) ÷ ២ = មធ្យមភាគប្រចាំឆមាស
              </span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-bold">
                ឆមាសទី {selectedSemester}
              </span>
              <span>•</span>
              <span>សិស្សសរុប៖ <strong className="text-slate-900 font-mono">{filteredSemesterRecords.length}</strong> នាក់</span>
            </div>
          </div>
        )}

        {/* Subject Selector Tabs (Only in Single Subject View) */}
        {viewMode === 'SUBJECT_SEMESTER' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-600 shrink-0">{t('subjectLabel')}:</span>
            {subjectRules.map((rule) => {
              const isSelected = selectedSubjectCode === rule.subjectCode;
              return (
                <button
                  key={rule.subjectCode}
                  onClick={() => setSelectedSubjectCode(rule.subjectCode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{language === 'en' ? rule.nameEnglish : rule.nameKhmer}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    ×{rule.coefficient}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 🏆 0. OFFICIAL MOEYS ANNUAL RESULTS (តារាងលទ្ធផលប្រចាំឆ្នាំ)     */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'ANNUAL_GRADEBOOK' && (
        <div className="space-y-6">
          {/* Official MoEYS Print Header (Shown when printing) */}
          <div className="hidden print:block mb-4">
            <div className="flex justify-between items-start text-xs leading-relaxed font-semibold">
              <div>
                <div className="font-bold text-sm">{t('ministryName')}</div>
                <div>{language === 'km' ? `មន្ទីរអប់រំ យុវជន និងកីឡា ${school.province}` : `Department of Education, Youth and Sport ${school.province}`}</div>
                <div className="font-bold text-blue-900">{language === 'en' ? school.nameEnglish : school.nameKhmer}</div>
                <div>{t('schoolCodeLabel')}: {school.code}</div>
              </div>

              <div className="text-center">
                <div className="font-bold text-sm">{t('kingdomOfCambodia')}</div>
                <div className="font-bold">{t('nationReligionKing')}</div>
                <div className="mt-1 font-serif">🙣 🙡 🙢 🙠</div>
              </div>
            </div>

            <div className="text-center my-4">
              <h2 className="text-base font-black text-slate-900 uppercase">
                តារាងលទ្ធផល និងការវាយតម្លៃការសិក្សាប្រចាំឆ្នាំ
              </h2>
              <p className="text-xs text-slate-700 mt-0.5">
                {currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា {school.academicYear} • វេន៖ {currentClass?.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
              </p>
            </div>
          </div>

          {/* Quick summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
              <div className="text-[11px] font-bold text-slate-500">សិស្សសរុប (Total)</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {annualGradeStats.totalStudents} <span className="text-xs text-pink-600 font-bold font-sans">(ស្រី: {annualGradeStats.femaleStudents})</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-2xs">
              <div className="text-[11px] font-bold text-emerald-800">ឡើងថ្នាក់ (Promoted)</div>
              <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">
                {annualGradeStats.passedStudents} <span className="text-xs text-emerald-700 font-sans">({annualGradeStats.passRate}%)</span>
              </div>
            </div>

            <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 shadow-2xs">
              <div className="text-[11px] font-bold text-rose-800">ត្រួតថ្នាក់ (Retained)</div>
              <div className="text-lg font-black text-rose-950 font-mono mt-0.5">
                {annualGradeStats.failedStudents} <span className="text-xs text-rose-700 font-sans">({annualGradeStats.failRate}%)</span>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 shadow-2xs">
              <div className="text-[11px] font-bold text-purple-800">និទ្ទេសល្អប្រសើរ (Grade A)</div>
              <div className="text-lg font-black text-purple-950 font-mono mt-0.5">
                {annualGradeStats.counts.A.total} <span className="text-xs text-purple-700 font-sans">(ស្រី: {annualGradeStats.counts.A.female})</span>
              </div>
            </div>
          </div>

          {/* Main Annual Table */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[660px] isolate relative z-0">
              <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1250px]">
                <thead className="sticky top-0 z-30 shadow-xs">
                  {/* Level 1 Header */}
                  <tr className="text-center font-bold uppercase text-[11px]">
                    <th rowSpan={2} className="p-2.5 w-12 min-w-[48px] max-w-[48px] bg-slate-900 text-white sticky left-0 top-0 z-40 border-b-2 border-r border-slate-700">ល.រ</th>
                    <th rowSpan={2} className="p-2.5 w-28 min-w-[112px] max-w-[112px] bg-slate-900 text-white sticky left-[48px] top-0 z-40 border-b-2 border-r border-slate-700">អត្តលេខ</th>
                    <th rowSpan={2} className="p-2.5 w-44 min-w-[176px] max-w-[176px] bg-slate-900 text-white sticky left-[160px] top-0 z-40 border-b-2 border-r border-slate-700">គោត្តនាម និងនាម</th>
                    <th rowSpan={2} className="p-2.5 w-14 min-w-[56px] max-w-[56px] bg-slate-900 text-white sticky left-[336px] top-0 z-40 border-b-2 border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)]">ភេទ</th>
                    
                    {/* លទ្ធផលប្រចាំឆមាស */}
                    <th colSpan={4} className="p-2.5 bg-blue-700 text-white font-black sticky top-0 z-30 border-b border-r border-blue-600">
                      លទ្ធផលប្រចាំឆមាស
                    </th>

                    {/* និទ្ទេសតាមផ្នែក */}
                    <th colSpan={4} className="p-2.5 bg-purple-700 text-white font-black sticky top-0 z-30 border-b border-r border-purple-600">
                      និទ្ទេសតាមផ្នែក
                    </th>

                    {/* លទ្ធផល */}
                    <th rowSpan={2} className="p-2.5 w-24 bg-emerald-950 text-emerald-300 font-black sticky top-0 z-30 border-b-2 border-r border-slate-700">
                      លទ្ធផល
                    </th>

                    {/* សេចក្ដីផ្សេងៗ */}
                    <th rowSpan={2} className="p-2.5 min-w-[140px] bg-slate-900 text-white sticky top-0 z-30 border-b-2 border-slate-700">
                      សេចក្ដីផ្សេងៗ
                    </th>
                  </tr>

                  {/* Level 2 Header */}
                  <tr className="text-center font-bold text-[10px]">
                    {/* 4 Semester Results Sub-columns */}
                    <th className="p-2 bg-blue-100 text-blue-950 font-bold border-b-2 border-r border-blue-200 min-w-[90px] sticky top-[38px] z-20">ម.ភាគប្រចាំឆមាស១</th>
                    <th className="p-2 bg-blue-100 text-blue-950 font-bold border-b-2 border-r border-blue-200 min-w-[90px] sticky top-[38px] z-20">ម.ភាគប្រចាំឆមាស២</th>
                    <th className="p-2 bg-emerald-100 text-emerald-950 font-black border-b-2 border-r border-emerald-300 min-w-[100px] sticky top-[38px] z-20">ម.ភាគប្រចាំឆ្នាំ</th>
                    <th className="p-2 bg-amber-200 text-amber-950 font-black border-b-2 border-r border-amber-300 min-w-[70px] sticky top-[38px] z-20">ចំណាត់ថ្នាក់</th>

                    {/* 4 Domains Sub-columns */}
                    <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[80px] sticky top-[38px] z-20" title="ចំណេះដឹង (A-F)">ចំណេះដឹង</th>
                    <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[85px] sticky top-[38px] z-20" title="បំណិន-ចំណេះធ្វើ (A-F)">បំណិន-ចំណេះធ្វើ</th>
                    <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[80px] sticky top-[38px] z-20" title="តម្លៃ-សីលធម៌ (A-F)">តម្លៃ-សីលធម៌</th>
                    <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[90px] sticky top-[38px] z-20" title="សាមគ្គីភាព-ការចូលរួម (A-F)">សាមគ្គីភាព-ការចូលរួម</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredAnnualRecords.map((r, idx) => {
                    const isFemale = r.student.gender === 'FEMALE';
                    const isTop3 = r.rank <= 3;
                    const isEven = idx % 2 === 0;
                    const stickyBg = isEven ? 'bg-white' : 'bg-slate-100';

                    return (
                      <tr
                        key={r.student.studentNationalId}
                        className={`group transition-colors ${
                          isEven ? 'bg-white' : 'bg-slate-100'
                        } hover:bg-blue-100`}
                      >
                        {/* 1. Roll No (Sticky Left) */}
                        <td className={`p-2 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                          {idx + 1}
                        </td>

                        {/* 2. National ID (Sticky Left) */}
                        <td className={`p-2 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                          {r.student.studentNationalId}
                        </td>

                        {/* 3. Student Name (Sticky Left) */}
                        <td className={`p-2 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                          {r.student.khmerName}
                        </td>

                        {/* 4. Gender (Sticky Left with Drop Shadow Separator) */}
                        <td className={`p-2 text-center sticky left-[336px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-14 min-w-[56px] max-w-[56px]`}>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              isFemale
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {isFemale ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {/* Semester 1 & Semester 2 and Annual Average */}
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-blue-900 bg-blue-50/60">
                          {r.semester1Average.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-blue-900 bg-blue-50/60">
                          {r.semester2Average.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black text-emerald-950 bg-emerald-100/70 text-[13px]">
                          {r.annualAverage.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black bg-amber-100/70 text-amber-950">
                          {isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black shadow-2xs">
                              {r.rank}
                            </span>
                          ) : (
                            <span className="text-slate-800">{r.rank}</span>
                          )}
                        </td>

                        {/* 4 Interactive Domains Dropdowns */}
                        <td className="p-1 border-b border-r border-slate-200 text-center bg-purple-50/30">
                          <select
                            value={r.domainGrades.knowledge}
                            onChange={(e) => handleAnnualDomainGradeChange(r.student.studentNationalId, 'knowledge', e.target.value)}
                            className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-purple-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-1 border-b border-r border-slate-200 text-center bg-purple-50/30">
                          <select
                            value={r.domainGrades.skills}
                            onChange={(e) => handleAnnualDomainGradeChange(r.student.studentNationalId, 'skills', e.target.value)}
                            className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-purple-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-1 border-b border-r border-slate-200 text-center bg-purple-50/30">
                          <select
                            value={r.domainGrades.values}
                            onChange={(e) => handleAnnualDomainGradeChange(r.student.studentNationalId, 'values', e.target.value)}
                            className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-purple-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>

                        <td className="p-1 border-b border-r border-slate-200 text-center bg-purple-50/30">
                          <select
                            value={r.domainGrades.participation}
                            onChange={(e) => handleAnnualDomainGradeChange(r.student.studentNationalId, 'participation', e.target.value)}
                            className="px-1.5 py-0.5 text-[11px] font-bold rounded border border-purple-200 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                          >
                            {['A', 'B', 'C', 'D', 'E', 'F'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>

                        {/* Outcome / Promotion Status */}
                        <td className="p-2 border-b border-r border-slate-200 text-center font-bold bg-white">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            r.isPassing
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {r.outcome}
                          </span>
                        </td>

                        {/* Remarks Input */}
                        <td className="p-1 border-b border-r border-slate-200 bg-slate-50">
                          <input
                            type="text"
                            value={r.remarks}
                            placeholder={r.outcome}
                            onChange={(e) => handleAnnualRemarkChange(r.student.studentNationalId, e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistics Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-800 mb-2 uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>ស្ថិតិចែកចាយនិទ្ទេសប្រចាំឆ្នាំ (Annual Grade Distribution)</span>
              </h4>
              <table className="w-full text-[11px] border-collapse border border-slate-300 bg-white">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-1.5 border border-slate-300 text-center">និទ្ទេស</th>
                    <th className="p-1.5 border border-slate-300 text-center">ការវាយតម្លៃ</th>
                    <th className="p-1.5 border border-slate-300 text-center">មធ្យមភាគប្រចាំឆ្នាំ</th>
                    <th className="p-1.5 border border-slate-300 text-center">សរុប</th>
                    <th className="p-1.5 border border-slate-300 text-center">ស្រី</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: 'A', label: 'ល្អប្រសើរ', range: '≥ 85.00', count: annualGradeStats.counts.A },
                    { l: 'B', label: 'ល្អណាស់', range: '80.00 - 84.99', count: annualGradeStats.counts.B },
                    { l: 'C', label: 'ល្អ', range: '70.00 - 79.99', count: annualGradeStats.counts.C },
                    { l: 'D', label: 'ល្អបង្គួរ', range: '60.00 - 69.99', count: annualGradeStats.counts.D },
                    { l: 'E', label: 'មធ្យម (ជាប់)', range: '50.00 - 59.99', count: annualGradeStats.counts.E },
                    { l: 'F', label: 'ខ្សោយ (ធ្លាក់)', range: '< 50.00', count: annualGradeStats.counts.F },
                  ].map((row) => (
                    <tr key={row.l} className="text-center hover:bg-slate-50">
                      <td className="p-1 border border-slate-300 font-black">{row.l}</td>
                      <td className="p-1 border border-slate-300 font-medium">{row.label}</td>
                      <td className="p-1 border border-slate-300 font-mono text-[10px] text-slate-500">{row.range}</td>
                      <td className="p-1 border border-slate-300 font-mono font-bold">{row.count.total} នាក់</td>
                      <td className="p-1 border border-slate-300 font-mono text-pink-600 font-bold">{row.count.female} នាក់</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800 mb-2 uppercase">
                  សង្ខេបលទ្ធផលរួមប្រចាំឆ្នាំ (Annual Overall Results Summary)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-[11px] text-emerald-800 font-bold">ឡើងថ្នាក់សរុប (Promoted)</div>
                    <div className="text-lg font-black text-emerald-900 font-mono mt-1">
                      {annualGradeStats.passedStudents} <span className="text-xs font-normal">({annualGradeStats.passRate}%)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      ស្រី: {annualGradeStats.passedFemales} នាក់ ({annualGradeStats.passFemaleRate}%)
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="text-[11px] text-rose-800 font-bold">ត្រួតថ្នាក់សរុប (Retained)</div>
                    <div className="text-lg font-black text-rose-900 font-mono mt-1">
                      {annualGradeStats.failedStudents} <span className="text-xs font-normal">({annualGradeStats.failRate}%)</span>
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5">
                      ស្រី: {annualGradeStats.failedFemales} នាក់ ({annualGradeStats.failFemaleRate}%)
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-3 font-medium">
                ℹ️ <strong>កំណត់សម្គាល់៖</strong> សិស្សដែលមានមធ្យមភាគប្រចាំឆ្នាំចាប់ពី <strong>៥០.០០</strong> ឡើងទៅទទួលបានសិទ្ធិឡើងថ្នាក់ដោយស្វ័យប្រវត្តិតាមបទបញ្ជាក្រសួងអប់រំ យុវជន និងកីឡា។
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🌟 1. FULL MONTHLY COMPETENCY GRADEBOOK (REQUESTED FORMAT)     */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'MONTHLY_COMPETENCY' && (
        <div className="space-y-6">
          {/* Official MoEYS Print Header (Shown when printing) */}
          <div className="hidden print:block mb-4">
            <div className="flex justify-between items-start text-xs leading-relaxed font-semibold">
              <div>
                <div className="font-bold text-sm">{t('ministryName')}</div>
                <div>មន្ទីរអប់រំ យុវជន និងកីឡា {school.province}</div>
                <div className="font-bold text-blue-900">{school.nameKhmer}</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-sm">ព្រះរាជាណាចក្រកម្ពុជា</div>
                <div className="font-bold">ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
                <div className="mt-0.5 font-serif">🙣 🙡 🙢 🙠</div>
              </div>
            </div>
            <div className="text-center my-3">
              <h2 className="text-base font-black text-slate-900 uppercase">
                តារាងពិន្ទុ និងការវាយតម្លៃការសិក្សាប្រចាំ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'}
              </h2>
              <p className="text-xs text-slate-700">
                {currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា {school.academicYear} • គ្រូបន្ទុកថ្នាក់៖ {currentClass?.homeroomTeacherName || 'អៀង សុខា'}
              </p>
            </div>
          </div>

          {/* MoEYS Evaluation Benchmark Badge Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-950 no-print">
            <div className="flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                តារាងពិន្ទុ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'} • {currentClass?.name || 'ថ្នាក់រៀន'} ({filteredMonthlyRecords.length} នាក់ • មុខវិជ្ជាប្រឡង {activeCompetencyColumns.length} ជំនាញ)
              </span>
            </div>
            <div className="text-[11px] text-blue-800 font-medium flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700">កម្រិតនិទ្ទេស៖</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">A (&ge;85)</span>
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded font-bold">B (80-84)</span>
              <span className="px-1.5 py-0.5 bg-sky-100 text-sky-800 rounded font-bold">C (70-79)</span>
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">D (60-69)</span>
              <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded font-bold">E (50-59)</span>
              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold">F (&lt;50)</span>
            </div>
          </div>

          {/* 📊 High Performance Keyboard-Navigable MoEYS Monthly Competency Table */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden print:border-slate-800 print:shadow-none">
            <div className="overflow-x-auto max-h-[640px] isolate relative z-0">
              <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1200px]">
                {/* Two-Tier Grouped Table Header */}
                <thead>
                  {/* Row 1: Subject Categories Header */}
                  <tr className="text-center font-bold uppercase text-[11px]">
                    <th
                      colSpan={4}
                      className="p-2.5 bg-slate-900 text-white sticky left-0 top-0 z-30 min-w-[392px] max-w-[392px] border-b border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.2)]"
                    >
                      ព័ត៌មានសិស្ស
                    </th>

                    {activeSubjectGroups.map((group) => (
                      <th
                        key={group.id}
                        colSpan={group.subColumns.length}
                        className={`p-2.5 ${group.headerBg} ${group.headerText} tracking-wide sticky top-0 z-20 border-b border-r border-slate-300`}
                      >
                        {group.nameKhmer}
                      </th>
                    ))}

                    <th colSpan={4} className="p-2.5 bg-slate-900 text-amber-300 sticky top-0 z-20 border-b border-r border-slate-700">
                      លទ្ធផលប្រចាំខែ
                    </th>

                    <th className="p-2.5 bg-slate-900 text-white sticky top-0 z-20 border-b border-slate-700 w-36">
                      ផ្សេងៗ
                    </th>
                  </tr>

                  {/* Row 2: Competency & Skill Sub-columns Header */}
                  <tr className="text-[10px] font-bold text-center">
                    {/* Student Info Subheaders (Sticky Top & Left with solid opaque bg) */}
                    <th className="p-2 w-12 min-w-[48px] max-w-[48px] text-center bg-slate-200 text-slate-900 sticky left-0 top-[38px] z-30 border-b-2 border-r border-slate-300">
                      ល.រ
                    </th>
                    <th className="p-2 w-28 min-w-[112px] max-w-[112px] text-left bg-slate-200 text-slate-900 sticky left-[48px] top-[38px] z-30 border-b-2 border-r border-slate-300">
                      អត្តលេខ
                    </th>
                    <th className="p-2 w-44 min-w-[176px] max-w-[176px] text-left bg-slate-200 text-slate-900 sticky left-[160px] top-[38px] z-30 border-b-2 border-r border-slate-300">
                      គោត្តនាម និងនាម
                    </th>
                    <th className="p-2 w-14 min-w-[56px] max-w-[56px] text-center bg-slate-200 text-slate-900 sticky left-[336px] top-[38px] z-30 border-b-2 border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.15)]">
                      ភេទ
                    </th>

                    {/* Competency Subheaders with Group-Specific Color Theme */}
                    {activeSubjectGroups.map((group) =>
                      group.subColumns.map((col) => (
                        <th
                          key={col.key}
                          className={`p-1.5 w-18 min-w-[70px] text-center font-bold sticky top-[38px] z-20 border-b-2 border-r border-slate-300 whitespace-normal leading-tight ${
                            group.subHeaderBg || 'bg-slate-100 text-slate-800'
                          }`}
                          title={col.nameEnglish}
                        >
                          {col.nameKhmer}
                        </th>
                      ))
                    )}

                    {/* Result Subheaders */}
                    <th className="p-2 w-20 min-w-[76px] text-center bg-blue-100 text-blue-950 font-black sticky top-[38px] z-20 border-b-2 border-r border-slate-300">
                      ពិន្ទុសរុប
                    </th>
                    <th className="p-2 w-20 min-w-[76px] text-center bg-amber-100 text-amber-950 font-black sticky top-[38px] z-20 border-b-2 border-r border-slate-300">
                      <div>មធ្យមភាគ</div>
                      <div className="text-[9px] font-mono font-bold text-amber-800 opacity-90">(÷{subjectDivisor})</div>
                    </th>
                    <th className="p-2 w-16 min-w-[64px] text-center bg-emerald-100 text-emerald-950 font-black sticky top-[38px] z-20 border-b-2 border-r border-slate-300">
                      ចំណាត់ថ្នាក់
                    </th>
                    <th className="p-2 w-14 min-w-[56px] text-center bg-purple-100 text-purple-950 font-black sticky top-[38px] z-20 border-b-2 border-r border-slate-300">
                      និទ្ទេស
                    </th>

                    {/* Remarks Subheader */}
                    <th className="p-2 w-36 min-w-[140px] text-center bg-slate-100 text-slate-800 font-bold sticky top-[38px] z-20 border-b-2 border-b-slate-300 border-r border-slate-300">
                      សេចក្ដីផ្សេងៗ
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="font-medium text-slate-900">
                  {filteredMonthlyRecords.map((record, studentIdx) => {
                    const isFailing = record.averageScore < 50 && record.averageScore > 0;
                    const isHonor = record.rank <= 5;
                    const isEven = studentIdx % 2 === 0;
                    const stickyBg = isEven ? 'bg-white' : 'bg-slate-100';

                    return (
                      <tr
                        key={record.student.studentNationalId}
                        className={`group transition-colors ${
                          isEven ? 'bg-white' : 'bg-slate-100'
                        } hover:bg-blue-100`}
                      >
                        {/* 1. ល.រ (Sticky Left, Opaque Background) */}
                        <td
                          className={`p-1.5 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}
                        >
                          {studentIdx + 1}
                        </td>

                        {/* 2. អត្តលេខ (Sticky Left, Opaque Background) */}
                        <td
                          className={`p-1.5 font-mono text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}
                        >
                          {record.student.studentNationalId}
                        </td>

                        {/* 3. គោត្តនាម និងនាម (Sticky Left, Opaque Background) */}
                        <td
                          className={`p-1.5 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}
                        >
                          {language === 'en' ? record.student.latinName : record.student.khmerName}
                        </td>

                        {/* 4. ភេទ (Sticky Left, Opaque Background with Drop Shadow Separator) */}
                        <td
                          className={`p-1.5 text-center sticky left-[336px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-14 min-w-[56px] max-w-[56px]`}
                        >
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              record.student.gender === 'FEMALE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {record.student.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {/* Active Interactive Competency Score Cells with Solid Group Colors */}
                        {activeSubjectGroups.map((group) =>
                          group.subColumns.map((col) => {
                            const colIdx = activeCompetencyColumns.findIndex((c) => c.key === col.key);
                            const val = record.scores[col.key] ?? 0;
                            const isCellFailing = val < 50 && val > 0;
                            const isPeHealth = group.id === 'PE_HEALTH';

                            return (
                              <td
                                key={col.key}
                                className={`p-1 text-center border-b border-r border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:z-10 ${
                                  isPeHealth ? 'bg-orange-50' : (group.cellBg || (isEven ? 'bg-white' : 'bg-slate-100'))
                                }`}
                              >
                                <input
                                  ref={(el) => {
                                    if (!monthlyInputRefs.current[studentIdx]) {
                                      monthlyInputRefs.current[studentIdx] = [];
                                    }
                                    monthlyInputRefs.current[studentIdx][colIdx] = el;
                                  }}
                                  type="number"
                                  min="0"
                                  max={col.maxScore}
                                  step="0.5"
                                  value={val === 0 ? '' : val}
                                  placeholder="0"
                                  onChange={(e) => {
                                    const num = parseFloat(e.target.value) || 0;
                                    handleScoreChange(record.student.studentNationalId, col.key, num);
                                  }}
                                  onKeyDown={(e) =>
                                    handleMonthlyKeyDown(
                                      e,
                                      studentIdx,
                                      colIdx,
                                      activeCompetencyColumns.length
                                    )
                                  }
                                  className={`w-14 text-center py-1 rounded font-mono font-bold text-xs focus:outline-none transition-all ${
                                    isCellFailing
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                                      : isPeHealth
                                      ? 'bg-orange-50 text-orange-950 border border-orange-300 hover:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500'
                                      : 'bg-white text-slate-900 border border-slate-300 hover:border-slate-400 focus:bg-blue-50'
                                  }`}
                                />
                              </td>
                            );
                          })
                        )}

                        {/* 5. ពិន្ទុសរុប (Total Score) */}
                        <td className="p-1.5 text-center font-mono font-black text-blue-950 bg-blue-100 border-b border-r border-slate-200">
                          {record.totalScore > 0 ? record.totalScore.toFixed(1) : '-'}
                        </td>

                        {/* 6. មធ្យមភាគ (Average Score) */}
                        <td
                          className={`p-1.5 text-center font-mono font-black border-b border-r border-slate-200 ${
                            isFailing
                              ? 'bg-rose-100 text-rose-900'
                              : 'bg-amber-100 text-amber-950'
                          }`}
                        >
                          {record.averageScore > 0 ? record.averageScore.toFixed(2) : '-'}
                        </td>

                        {/* 7. ចំណាត់ថ្នាក់ (Rank) */}
                        <td className="p-1.5 text-center font-mono font-black border-b border-r border-slate-200 bg-emerald-100 text-emerald-950">
                          {record.averageScore > 0 ? (
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                                isHonor ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-emerald-950'
                              }`}
                            >
                              {record.rank}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* 8. និទ្ទេស (Grade Letter) */}
                        <td className="p-1.5 text-center border-b border-r border-slate-200 bg-purple-100 text-purple-950">
                          {record.averageScore > 0 ? (
                            <span
                              className={`inline-block font-black text-xs px-2 py-0.5 rounded ${
                                record.gradeLetter === 'A'
                                  ? 'bg-emerald-200 text-emerald-950'
                                  : record.gradeLetter === 'B'
                                  ? 'bg-blue-200 text-blue-950'
                                  : record.gradeLetter === 'C'
                                  ? 'bg-sky-200 text-sky-950'
                                  : record.gradeLetter === 'D'
                                  ? 'bg-amber-200 text-amber-950'
                                  : record.gradeLetter === 'E'
                                  ? 'bg-orange-200 text-orange-950'
                                  : 'bg-rose-200 text-rose-950'
                              }`}
                            >
                              {record.gradeLetter}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* 9. សេចក្ដីផ្សេងៗ (Remarks) */}
                        <td className="p-1 border-b border-r border-slate-200 bg-slate-50">
                          <input
                            type="text"
                            value={record.remarks}
                            placeholder="សម្គាល់..."
                            onChange={(e) =>
                              handleRemarksChange(record.student.studentNationalId, e.target.value)
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-blue-500 rounded"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {/* 📈 GRADE DISTRIBUTION & PASS/FAIL STATISTICS TABLE */}
          <div className="pt-2">
            <div className="w-full max-w-xl border border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="p-2.5 bg-slate-900 text-white font-bold text-xs flex items-center justify-between">
                <span>ស្ថិតិលទ្ធផលសិក្សាប្រចាំ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'}</span>
                <span className="text-[11px] font-mono text-slate-300">MoEYS Performance Indicators</span>
              </div>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-200">
                    <th className="p-1.5 border-r border-slate-200 w-24">និទ្ទេស</th>
                    <th className="p-1.5 border-r border-slate-200 w-28">ចំនួន(នាក់)</th>
                    <th className="p-1.5 border-r border-slate-200 w-28">ភាគរយ</th>
                    <th className="p-1.5 border-r border-slate-200 w-28">ស្រី(នាក់)</th>
                    <th className="p-1.5 w-28">ភាគរយ</th>
                  </tr>
                </thead>
                <tbody>
                  {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((grade) => {
                    const count = gradeStats.counts[grade].total;
                    const femaleCount = gradeStats.counts[grade].female;
                    const percent =
                      gradeStats.totalStudents > 0
                        ? ((count / gradeStats.totalStudents) * 100).toFixed(2)
                        : '0.00';
                    const femalePercent =
                      gradeStats.femaleStudents > 0
                        ? ((femaleCount / gradeStats.femaleStudents) * 100).toFixed(2)
                        : '0.00';

                    return (
                      <tr key={grade} className="border-b border-slate-200 hover:bg-slate-100">
                        <td className="p-1 font-mono font-black border-r border-slate-200 text-slate-900">{grade}</td>
                        <td className="p-1 font-mono font-bold border-r border-slate-200 text-slate-900">{count}</td>
                        <td className="p-1 font-mono border-r border-slate-200 text-slate-700">{percent} %</td>
                        <td className="p-1 font-mono font-bold border-r border-slate-200 text-slate-900">{femaleCount}</td>
                        <td className="p-1 font-mono text-slate-700">{femalePercent} %</td>
                      </tr>
                    );
                  })}

                  {/* Summary Row */}
                  <tr className="bg-slate-100 font-bold text-[11px] text-slate-900">
                    <td colSpan={5} className="p-2.5 text-left leading-relaxed">
                      សរុប <span className="font-mono font-black">{gradeStats.totalStudents}</span> នាក់ ស្រី <span className="font-mono font-black">{gradeStats.femaleStudents}</span> នាក់ | ជាប់ <span className="font-mono font-black text-emerald-700">{gradeStats.passedStudents}</span> នាក់ (<span className="font-mono">{gradeStats.passRate}%</span>) ស្រីជាប់ <span className="font-mono font-black text-emerald-700">{gradeStats.passedFemales}</span> នាក់ (<span className="font-mono">{gradeStats.passFemaleRate}%</span>) | ធ្លាក់ <span className="font-mono font-black text-rose-700">{gradeStats.failedStudents}</span> នាក់ (<span className="font-mono">{gradeStats.failRate}%</span>)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ✍️ 2-PARTY OFFICIAL SIGNATURES FOOTER (Shown on Screen & Print) */}
          <div className="pt-8 grid grid-cols-2 text-xs font-bold text-slate-900">
            {/* Left Signer: Principal */}
            <div className="text-left space-y-1 pl-4">
              <div className="text-slate-700">បានឃើញ និងឯកភាព</div>
              <div className="font-black text-sm pt-0.5 text-slate-900">នាយកសាលា</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{school.principalName || 'លោក ឈួន ម៉េងហ៊ាង'}</div>
            </div>

            {/* Right Signer: Homeroom Teacher */}
            <div className="text-right space-y-1 pr-4">
              <div className="text-slate-700">
                រាជធានីភ្នំពេញ, ថ្ងៃទី ០២ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'} ឆ្នាំ ២០២៤
              </div>
              <div className="font-black text-sm pt-0.5 text-slate-900">គ្រូបន្ទុកថ្នាក់</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">
                {currentClass?.homeroomTeacherName || 'អៀង សុខា'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🌟 2. FULL SEMESTER GRADEBOOK (តារាងពិន្ទុប្រចាំឆមាស)             */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'SEMESTER_GRADEBOOK' && (
        <div className="space-y-4">
          {/* Quick Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 no-print">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-medium">សិស្សសរុប</div>
                <div className="text-lg font-black text-slate-900 font-mono">{semesterGradeStats.totalStudents} នាក់</div>
              </div>
              <span className="text-xs text-pink-600 font-bold font-mono">ស្រី: {semesterGradeStats.femaleStudents}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-emerald-700 font-medium">សិស្សជាប់ (Passed)</div>
                <div className="text-lg font-black text-emerald-800 font-mono">{semesterGradeStats.passedStudents} នាក់</div>
              </div>
              <span className="text-xs text-emerald-600 font-bold font-mono">{semesterGradeStats.passRate}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-rose-700 font-medium">សិស្សធ្លាក់ (Failed)</div>
                <div className="text-lg font-black text-rose-800 font-mono">{semesterGradeStats.failedStudents} នាក់</div>
              </div>
              <span className="text-xs text-rose-600 font-bold font-mono">{semesterGradeStats.failRate}%</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-indigo-700 font-medium">និទ្ទេស A (≥85)</div>
                <div className="text-lg font-black text-indigo-900 font-mono">{semesterGradeStats.counts.A.total} នាក់</div>
              </div>
              <span className="text-xs text-indigo-600 font-bold font-mono">ស្រី: {semesterGradeStats.counts.A.female}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-blue-700 font-medium">និទ្ទេស B & C</div>
                <div className="text-lg font-black text-blue-900 font-mono">{semesterGradeStats.counts.B.total + semesterGradeStats.counts.C.total} នាក់</div>
              </div>
              <span className="text-xs text-blue-600 font-bold font-mono">ស្រី: {semesterGradeStats.counts.B.female + semesterGradeStats.counts.C.female}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-amber-700 font-medium">និទ្ទេស D & E</div>
                <div className="text-lg font-black text-amber-900 font-mono">{semesterGradeStats.counts.D.total + semesterGradeStats.counts.E.total} នាក់</div>
              </div>
              <span className="text-xs text-amber-600 font-bold font-mono">ស្រី: {semesterGradeStats.counts.D.female + semesterGradeStats.counts.E.female}</span>
            </div>
          </div>

          {/* Interactive Spreadsheet Table Container */}
          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[75vh] isolate relative z-0">
              <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1700px]">
                <thead>
                  {/* Level 1 Header */}
                  <tr className="text-center font-bold uppercase text-[11px] sticky top-0 z-30 shadow-xs">
                    <th rowSpan={2} className="p-2.5 w-12 min-w-[48px] max-w-[48px] bg-slate-900 text-white sticky left-0 top-0 z-40 border-b-2 border-r border-slate-700">ល.រ</th>
                    <th rowSpan={2} className="p-2.5 w-28 min-w-[112px] max-w-[112px] bg-slate-900 text-white sticky left-[48px] top-0 z-40 border-b-2 border-r border-slate-700">អត្តលេខ</th>
                    <th rowSpan={2} className="p-2.5 w-44 min-w-[176px] max-w-[176px] bg-slate-900 text-white sticky left-[160px] top-0 z-40 border-b-2 border-r border-slate-700">គោត្តនាម និងនាម</th>
                    <th rowSpan={2} className="p-2.5 w-14 min-w-[56px] max-w-[56px] bg-slate-900 text-white sticky left-[336px] top-0 z-40 border-b-2 border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)]">ភេទ</th>

                    {/* ពិន្ទុប្រឡងឆមាស */}
                    <th colSpan={14} className="p-2.5 bg-blue-700 text-white font-black sticky top-0 z-30 border-b border-r border-blue-600">
                      ពិន្ទុប្រឡងឆមាស (១៤ មុខវិជ្ជា)
                    </th>

                    {/* លទ្ធផលប្រចាំឆមាស */}
                    <th colSpan={5} className="p-2.5 bg-amber-700 text-white font-black sticky top-0 z-30 border-b border-r border-amber-600">
                      លទ្ធផលប្រចាំឆមាស
                    </th>

                    {/* និទ្ទេសតាមផ្នែក */}
                    <th colSpan={4} className="p-2.5 bg-purple-700 text-white font-black sticky top-0 z-30 border-b border-r border-purple-600">
                      និទ្ទេសតាមផ្នែក (៤ ផ្នែក)
                    </th>

                    {/* សេចក្ដីផ្សេងៗ */}
                    <th rowSpan={2} className="p-2.5 min-w-[130px] bg-slate-900 text-white sticky top-0 z-30 border-b-2 border-slate-700">
                      សេចក្ដីផ្សេងៗ
                    </th>
                  </tr>

                  {/* Level 2 Sub-Headers */}
                  <tr className="text-center font-bold text-[10px] sticky top-[38px] z-20 shadow-xs">
                    {/* 14 Semester Exam Subjects */}
                    {SEMESTER_EXAM_SUBJECTS.map((subj) => (
                      <th key={subj.key} className="p-1.5 bg-blue-100 text-blue-950 font-bold border-b-2 border-r border-blue-200 min-w-[65px]" title={subj.nameEnglish}>
                        {subj.nameKhmer}
                      </th>
                    ))}

                    {/* 5 Results Sub-columns */}
                    <th className="p-1.5 bg-amber-100 text-amber-950 font-bold border-b-2 border-r border-amber-200 min-w-[65px]">ពិន្ទុសរុប</th>
                    <th className="p-1.5 bg-amber-100 text-amber-950 font-bold border-b-2 border-r border-amber-200 min-w-[70px]">ម.ភាគប្រឡង</th>
                    <th className="p-1.5 bg-amber-100 text-amber-950 font-bold border-b-2 border-r border-amber-200 min-w-[70px]">ម.ភាគប្រចាំខែ</th>
                    <th className="p-1.5 bg-emerald-100 text-emerald-950 font-black border-b-2 border-r border-emerald-300 min-w-[75px]">ម.ភាគឆមាស</th>
                    <th className="p-1.5 bg-amber-200 text-amber-950 font-black border-b-2 border-r border-amber-300 min-w-[60px]">ចំណាត់ថ្នាក់</th>

                    {/* 4 Domains Sub-columns */}
                    <th className="p-1.5 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[65px]" title="ចំណេះដឹង (A-F)">ចំណេះដឹង</th>
                    <th className="p-1.5 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[65px]" title="បំណិន-ចំណេះធ្វើ (A-F)">បំណិន-ចំណេះធ្វើ</th>
                    <th className="p-1.5 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[65px]" title="តម្លៃ-សីលធម៌ (A-F)">តម្លៃ-សីលធម៌</th>
                    <th className="p-1.5 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[70px]" title="សាមគ្គីភាព-ការចូលរួម (A-F)">សាមគ្គីភាព-ការចូលរួម</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredSemesterRecords.map((r, studentIdx) => {
                    const isFemale = r.student.gender === 'FEMALE';
                    const isTop3 = r.rank <= 3;
                    const isEven = studentIdx % 2 === 0;
                    const stickyBg = isEven ? 'bg-white' : 'bg-slate-100';

                    return (
                      <tr
                        key={r.student.studentNationalId}
                        className={`group transition-colors ${
                          isEven ? 'bg-white' : 'bg-slate-100'
                        } hover:bg-blue-100`}
                      >
                        {/* 1. Roll No (Sticky Left) */}
                        <td className={`p-2 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                          {studentIdx + 1}
                        </td>

                        {/* 2. National ID (Sticky Left) */}
                        <td className={`p-2 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                          {r.student.studentNationalId}
                        </td>

                        {/* 3. Student Name (Sticky Left) */}
                        <td className={`p-2 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                          {r.student.khmerName}
                        </td>

                        {/* 4. Gender (Sticky Left with Drop Shadow Separator) */}
                        <td className={`p-2 text-center sticky left-[336px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-14 min-w-[56px] max-w-[56px]`}>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              isFemale
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {isFemale ? 'ស្រី' : 'ប្រុស'}
                          </span>
                        </td>

                        {/* 5. 14 Editable Exam Subject Score Inputs */}
                        {SEMESTER_EXAM_SUBJECTS.map((subj, colIdx) => {
                          const currentVal = r.examScores[subj.key];
                          const displayVal = typeof currentVal === 'number' ? currentVal : '';
                          const isFailing = typeof currentVal === 'number' && currentVal < 50;

                          return (
                            <td key={subj.key} className="p-0.5 border-b border-r border-slate-200 bg-blue-50/20">
                              <input
                                ref={(el) => {
                                  if (!semesterInputRefs.current[studentIdx]) {
                                    semesterInputRefs.current[studentIdx] = [];
                                  }
                                  semesterInputRefs.current[studentIdx][colIdx] = el;
                                }}
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={displayVal}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? 0 : Number(e.target.value);
                                  handleSemesterScoreChange(r.student.studentNationalId, subj.key, Math.min(100, Math.max(0, val)));
                                }}
                                onKeyDown={(e) => handleSemesterKeyDown(e, studentIdx, colIdx, SEMESTER_EXAM_SUBJECTS.length)}
                                className={`w-full h-8 px-1 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:z-10 transition-colors ${
                                  isFailing ? 'bg-rose-50 text-rose-700 border-rose-300 font-black' : 'text-slate-900'
                                }`}
                              />
                            </td>
                          );
                        })}

                        {/* 6. Results (Auto-calculated) */}
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-blue-950 bg-blue-50/60">
                          {r.totalExamScore}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-amber-950 bg-amber-50/60">
                          {r.examAverage.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-indigo-950 bg-indigo-50/60" title="មធ្យមភាគនៃខែប្រឡងក្នុងឆមាសនេះ">
                          {r.monthlyAverage.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black text-emerald-950 bg-emerald-100/70 text-[12px]">
                          {r.semesterAverage.toFixed(2)}
                        </td>
                        <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black bg-amber-100/70 text-amber-950">
                          {isTop3 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-black shadow-xs">
                              {r.rank}
                            </span>
                          ) : (
                            <span className="text-slate-800">{r.rank}</span>
                          )}
                        </td>

                        {/* 7. 4 Domain Grades (Dropdown selector) */}
                        {(['knowledge', 'skills', 'values', 'participation'] as (keyof DomainGrades)[]).map((dKey) => {
                          const currentGrade = r.domainGrades[dKey];
                          return (
                            <td key={dKey} className="p-1 border-b border-r border-slate-200 text-center bg-purple-50/30">
                              <select
                                value={currentGrade}
                                onChange={(e) => handleDomainGradeChange(r.student.studentNationalId, dKey, e.target.value)}
                                className={`px-1 py-0.5 rounded text-[11px] font-bold text-center border border-purple-200 bg-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer ${
                                  currentGrade === 'A' ? 'text-emerald-700 font-black' : currentGrade === 'F' ? 'text-rose-600 font-black' : 'text-slate-800'
                                }`}
                              >
                                {['A', 'B', 'C', 'D', 'E', 'F'].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}

                        {/* 8. Remarks Input */}
                        <td className="p-1 border-b border-r border-slate-200 bg-slate-50">
                          <input
                            type="text"
                            value={r.remarks}
                            onChange={(e) => handleSemesterRemarkChange(r.student.studentNationalId, e.target.value)}
                            placeholder={r.isPassing ? 'ឡើងថ្នាក់' : 'ប្រឡងសង'}
                            className="w-full px-2 py-1 text-xs text-slate-800 bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded font-medium"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📈 GRADE DISTRIBUTION & PASS/FAIL STATISTICS TABLE */}
          <div className="pt-2">
            <div className="w-full max-w-xl border border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white">
              <div className="p-2.5 bg-slate-900 text-white font-bold text-xs flex items-center justify-between">
                <span>ស្ថិតិលទ្ធផលសិក្សាប្រចាំឆមាសទី {selectedSemester}</span>
                <span className="text-[11px] font-mono text-slate-300">MoEYS Semester Performance Indicators</span>
              </div>
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-200">
                    <th className="p-1.5 border-r border-slate-200 w-24">និទ្ទេស</th>
                    <th className="p-1.5 border-r border-slate-200 w-28">ចំនួន(នាក់)</th>
                    <th className="p-1.5 border-r border-slate-200 w-24">ស្រី(នាក់)</th>
                    <th className="p-1.5 border-r border-slate-200 w-24">ភាគរយ</th>
                    <th className="p-1.5">កំណត់សម្គាល់</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-emerald-700">A (ល្អប្រសើរ)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{semesterGradeStats.counts.A.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.A.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.A.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-slate-600">ពិន្ទុ &ge; 85.00</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-blue-700">B (ល្អណាស់)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{semesterGradeStats.counts.B.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.B.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.B.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-slate-600">80.00 - 84.99</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-sky-700">C (ល្អ)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{semesterGradeStats.counts.C.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.C.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.C.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-slate-600">70.00 - 79.99</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-amber-700">D (ល្អបង្គួរ)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{semesterGradeStats.counts.D.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.D.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.D.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-slate-600">60.00 - 69.99</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-orange-700">E (មធ្យម)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold">{semesterGradeStats.counts.E.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.E.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.E.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-slate-600">50.00 - 59.99 (ជាប់)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 bg-rose-50/50">
                    <td className="p-1.5 border-r border-slate-200 font-black text-rose-700">F (ខ្សោយ)</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono font-bold text-rose-900">{semesterGradeStats.counts.F.total}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-pink-600 font-bold">{semesterGradeStats.counts.F.female}</td>
                    <td className="p-1.5 border-r border-slate-200 font-mono text-rose-700">{semesterGradeStats.totalStudents > 0 ? ((semesterGradeStats.counts.F.total / semesterGradeStats.totalStudents) * 100).toFixed(1) : 0}%</td>
                    <td className="p-1.5 text-[11px] text-rose-700 font-bold">&lt; 50.00 (ធ្លាក់)</td>
                  </tr>
                  <tr className="bg-slate-900 text-white font-bold">
                    <td className="p-1.5 border-r border-slate-800">សរុប (Total)</td>
                    <td className="p-1.5 border-r border-slate-800 font-mono">{semesterGradeStats.totalStudents}</td>
                    <td className="p-1.5 border-r border-slate-800 font-mono text-pink-300">{semesterGradeStats.femaleStudents}</td>
                    <td className="p-1.5 border-r border-slate-800 font-mono">100%</td>
                    <td className="p-1.5 text-[11px] text-emerald-300">ជាប់ {semesterGradeStats.passRate}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ✍️ MOEYS OFFICIAL 2-PARTY SIGNATURES */}
          <div className="grid grid-cols-2 gap-8 pt-8 pb-4 text-xs font-semibold print:grid hidden">
            <div className="text-left space-y-1 pl-4">
              <div className="text-slate-700">បានឃើញ និងអនុម័ត</div>
              <div className="font-black text-sm pt-0.5 text-slate-900">នាយកសាលា</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{school.principalName || 'ហេង វុទ្ធី'}</div>
            </div>

            <div className="text-right space-y-1 pr-4">
              <div className="text-slate-700">
                រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ ២០២៤
              </div>
              <div className="font-black text-sm pt-0.5 text-slate-900">គ្រូបន្ទុកថ្នាក់</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">
                {currentClass?.homeroomTeacherName || 'អៀង សុខា'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 📊 3. SUBJECT SEMESTER VIEW (SINGLE SUBJECT DEEP-DIVE)         */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'SUBJECT_SEMESTER' && (
        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-950 font-medium">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t('formulaBannerText')}</span>
            </div>
            <div className="text-[11px] text-blue-800 font-bold shrink-0">
              A (&ge;85%) • B (80-84%) • C (70-79%) • D (60-69%) • E (50-59%) • F (&lt;50%)
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[620px] isolate relative z-0">
              <table className="w-full text-xs text-left border-separate border-spacing-0">
                <thead className="bg-slate-900 text-slate-100 text-[11px] font-bold uppercase sticky top-0 z-30">
                  <tr>
                    <th className="p-3 w-12 min-w-[48px] max-w-[48px] text-center sticky left-0 top-0 z-40 bg-slate-900 text-white border-b-2 border-r border-slate-700">{t('rollNoHeader')}</th>
                    <th className="p-3 w-28 min-w-[112px] max-w-[112px] sticky left-[48px] top-0 z-40 bg-slate-900 text-white border-b-2 border-r border-slate-700">{t('studentIdHeader')}</th>
                    <th className="p-3 w-44 min-w-[176px] max-w-[176px] sticky left-[160px] top-0 z-40 bg-slate-900 text-white border-b-2 border-r border-slate-700">{t('studentNameHeader')}</th>
                    <th className="p-3 w-14 min-w-[56px] max-w-[56px] text-center sticky left-[336px] top-0 z-40 bg-slate-900 text-white border-b-2 border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)]">{t('genderHeader')}</th>

                    <th className="p-3 w-20 text-center bg-slate-800 border-b-2 border-r border-slate-700">{t('monthOct')}</th>
                    <th className="p-3 w-20 text-center bg-slate-800 border-b-2 border-r border-slate-700">{t('monthNov')}</th>
                    <th className="p-3 w-20 text-center bg-slate-800 border-b-2 border-r border-slate-700">{t('monthDec')}</th>
                    <th className="p-3 w-20 text-center bg-slate-800 border-b-2 border-r border-slate-700">{t('monthJan')}</th>
                    <th className="p-3 w-20 text-center bg-slate-800 border-b-2 border-r border-slate-700">{t('monthFeb')}</th>

                    <th className="p-3 w-24 text-center bg-blue-950 text-blue-200 border-b-2 border-r border-slate-800">
                      {t('monthlyAverageHeader')}
                    </th>
                    <th className="p-3 w-24 text-center bg-amber-950 text-amber-200 border-b-2 border-r border-slate-800">
                      {t('examScoreHeader')}
                    </th>
                    <th className="p-3 w-28 text-center bg-indigo-950 text-indigo-200 border-b-2 border-r border-slate-800">
                      {t('semesterScoreHeader')}
                    </th>
                    <th className="p-3 w-24 text-center bg-slate-800 border-b-2 border-r border-slate-700">
                      {t('weightedScoreHeader')}
                    </th>
                    <th className="p-3 w-20 text-center border-b-2 border-slate-800">{t('gradeLabel')}</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {filteredSubjectRecords.map((record, studentIdx) => {
                    const subScore = record.scoresBySubject[selectedSubjectCode] || {
                      monthly: [70, 70, 70, 70, 70],
                      exam: 70,
                    };

                    const validMonthly = subScore.monthly.filter((v) => v !== undefined && v >= 0);
                    const monthlyAvg =
                      validMonthly.length > 0 ? validMonthly.reduce((a, b) => a + b, 0) / validMonthly.length : 0;
                    const subjectSemesterScore = (monthlyAvg + subScore.exam * 2) / 3;
                    const weightedTotal = subjectSemesterScore * (currentRule?.coefficient || 1);
                    const isFailing = subjectSemesterScore < 50;
                    const isEven = studentIdx % 2 === 0;
                    const stickyBg = isEven ? 'bg-white' : 'bg-slate-100';

                    return (
                      <tr
                        key={record.student.studentNationalId}
                        className={`group transition-colors ${
                          isEven ? 'bg-white' : 'bg-slate-100'
                        } hover:bg-blue-100`}
                      >
                        <td className={`p-2.5 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                          {record.student.rollNumber}
                        </td>
                        <td className={`p-2.5 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                          {record.student.studentNationalId}
                        </td>
                        <td className={`p-2.5 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                          {language === 'en' ? record.student.latinName : record.student.khmerName}
                        </td>
                        <td className={`p-2.5 text-center sticky left-[336px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-14 min-w-[56px] max-w-[56px]`}>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              record.student.gender === 'FEMALE'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}
                          >
                            {record.student.gender === 'FEMALE' ? t('female') : t('male')}
                          </span>
                        </td>

                        {[0, 1, 2, 3, 4].map((monthIdx) => {
                          const val = subScore.monthly[monthIdx] ?? 0;
                          const isCellFailing = val < 50;

                          return (
                            <td
                              key={monthIdx}
                              className="p-1 text-center border-b border-r border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:z-10 bg-white"
                            >
                              <input
                                ref={(el) => {
                                  if (!subjectInputRefs.current[studentIdx]) {
                                    subjectInputRefs.current[studentIdx] = [];
                                  }
                                  subjectInputRefs.current[studentIdx][monthIdx] = el;
                                }}
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={val === 0 ? '' : val}
                                placeholder="0"
                                onChange={(e) => {
                                  const num = parseFloat(e.target.value) || 0;
                                  updateScore(record.student.studentNationalId, selectedSubjectCode, 'monthly', monthIdx, num);
                                }}
                                className={`w-16 text-center py-1 rounded font-mono font-bold text-xs focus:outline-none transition-all ${
                                  isCellFailing
                                    ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                                    : 'bg-white text-slate-900 border border-slate-300 hover:border-slate-400'
                                }`}
                              />
                            </td>
                          );
                        })}

                        <td className="p-2.5 text-center font-mono font-bold text-blue-950 bg-blue-100 border-b border-r border-slate-200">
                          {monthlyAvg.toFixed(2)}
                        </td>

                        <td className="p-1 text-center bg-amber-100 border-b border-r border-slate-200 focus-within:ring-2 focus-within:ring-amber-500">
                          <input
                            ref={(el) => {
                              if (!subjectInputRefs.current[studentIdx]) {
                                  subjectInputRefs.current[studentIdx] = [];
                              }
                              subjectInputRefs.current[studentIdx][5] = el;
                            }}
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={subScore.exam === 0 ? '' : subScore.exam}
                            placeholder="0"
                            onChange={(e) => {
                              const num = parseFloat(e.target.value) || 0;
                              updateScore(record.student.studentNationalId, selectedSubjectCode, 'exam', 0, num);
                            }}
                            className={`w-16 text-center py-1 rounded font-mono font-bold text-xs focus:outline-none transition-all ${
                              subScore.exam < 50
                                ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                                : 'bg-amber-100 text-amber-950 border border-amber-300 hover:border-amber-400 font-bold'
                            }`}
                          />
                        </td>

                        <td
                          className={`p-2.5 text-center font-mono font-black border-b border-r border-slate-200 ${
                            isFailing ? 'bg-rose-100 text-rose-900' : 'bg-indigo-100 text-indigo-950'
                          }`}
                        >
                          {subjectSemesterScore.toFixed(2)}
                        </td>

                        <td className="p-2.5 text-center font-mono font-bold text-slate-900 bg-slate-100 border-b border-r border-slate-200">
                          {weightedTotal.toFixed(2)}
                        </td>

                        <td className="p-2.5 text-center bg-white border-b border-slate-200">
                          <span
                            className={`inline-block font-black text-xs px-2 py-0.5 rounded ${
                              subjectSemesterScore >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : subjectSemesterScore >= 80
                                ? 'bg-blue-100 text-blue-800'
                                : subjectSemesterScore >= 70
                                ? 'bg-sky-100 text-sky-800'
                                : subjectSemesterScore >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : subjectSemesterScore >= 50
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {subjectSemesterScore >= 85
                              ? 'A'
                              : subjectSemesterScore >= 80
                              ? 'B'
                              : subjectSemesterScore >= 70
                              ? 'C'
                              : subjectSemesterScore >= 60
                              ? 'D'
                              : subjectSemesterScore >= 50
                              ? 'E'
                              : 'F'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 🎛️ 3. COLUMN MANAGER MODAL (DISABLE / ENABLE NON-EXAMINED COLS) */}
      {/* ------------------------------------------------------------- */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 no-print animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-black tracking-wide">
                      កំណត់មុខវិជ្ជា/ជំនាញប្រឡងក្នុងថ្នាក់រៀន
                    </h2>
                    <span className="px-2 py-0.5 text-xs bg-blue-500/30 text-blue-200 border border-blue-400/40 rounded-full font-bold font-mono">
                      {currentClass?.name || 'ថ្នាក់រៀន'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    ជ្រើសរើស ឬបិទ (Disable) មុខវិជ្ជាដែលមិនត្រូវបានប្រឡងក្នុងថ្នាក់នេះ។ ពិន្ទុសរុប មធ្យមភាគ និងការនាំចេញនឹងគណនាតែលើមុខវិជ្ជាដែលបានជ្រើសប៉ុណ្ណោះ។
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Toolbar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>ជ្រើសរើសតាមកម្រងជំនាញ (Presets)៖</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1. All 21 Columns */}
                <button
                  type="button"
                  onClick={() => setDisabledColumnsForClass(selectedClassId, [])}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    disabledColKeys.length === 0
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ✓ ទាំងអស់ (២១ ជំនាញ)
                </button>

                {/* 2. Science Track */}
                <button
                  type="button"
                  onClick={() => {
                    const scienceDisabled = [
                      'SOC_HIST',
                      'SOC_GEO',
                      'SOC_MORAL',
                      'SOC_ECON',
                      'SOC_CITIZEN',
                      'PE_PRACTICE',
                      'PE_THEORY',
                      'PE_HYGIENE',
                      'LS_AGRI',
                      'LS_VOCATIONAL',
                    ];
                    setDisabledColumnsForClass(selectedClassId, scienceDisabled);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-white hover:bg-slate-100 text-indigo-700 border-indigo-200 cursor-pointer"
                  title="រក្សាទុក៖ ភាសាខ្មែរ គណិតវិទ្យា វិទ្យាសាស្ត្រ និងភាសាបរទេស"
                >
                  🔬 ថ្នាក់វិទ្យាសាស្ត្រ (១០ ជំនាញ)
                </button>

                {/* 3. Social Science Track */}
                <button
                  type="button"
                  onClick={() => {
                    const socialDisabled = [
                      'SCI_PHY',
                      'SCI_CHEM',
                      'SCI_BIO',
                      'SCI_EARTH_ENV',
                      'PE_PRACTICE',
                      'PE_THEORY',
                      'PE_HYGIENE',
                      'LS_AGRI',
                      'LS_VOCATIONAL',
                    ];
                    setDisabledColumnsForClass(selectedClassId, socialDisabled);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-white hover:bg-slate-100 text-emerald-700 border-emerald-200 cursor-pointer"
                  title="រក្សាទុក៖ ភាសាខ្មែរ គណិតវិទ្យា សិក្សាសង្គម និងភាសាបរទេស"
                >
                  📚 ថ្នាក់វិទ្យាសាស្ត្រសង្គម (១១ ជំនាញ)
                </button>

                {/* 4. Core Subjects Only */}
                <button
                  type="button"
                  onClick={() => {
                    const coreDisabled = [
                      'KHM_SPEAKING',
                      'KHM_LISTENING',
                      'MATH_STAT',
                      'MATH_LOGIC',
                      'SCI_EARTH_ENV',
                      'SOC_ECON',
                      'SOC_CITIZEN',
                      'PE_PRACTICE',
                      'PE_THEORY',
                      'PE_HYGIENE',
                      'LS_AGRI',
                      'LS_VOCATIONAL',
                    ];
                    setDisabledColumnsForClass(selectedClassId, coreDisabled);
                  }}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border bg-white hover:bg-slate-100 text-amber-800 border-amber-200 cursor-pointer"
                  title="រក្សាទុកតែជំនាញគោលសំខាន់ៗ"
                >
                  ⭐ មុខវិជ្ជាស្នូល (៩ ជំនាញ)
                </button>
              </div>
            </div>

            {/* Modal Body: Grouped Subject Lists */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(monthlySubjectGroups || MONTHLY_SUBJECT_GROUPS).map((group) => {
                  const groupColKeys = group.subColumns.map((c) => c.key);
                  const groupActiveCount = group.subColumns.filter((c) => !disabledColKeys.includes(c.key)).length;
                  const allGroupDisabled = groupActiveCount === 0;
                  const allGroupActive = groupActiveCount === group.subColumns.length;

                  const handleToggleWholeGroup = () => {
                    if (allGroupDisabled) {
                      // Enable whole group
                      setDisabledColumnsForClass(
                        selectedClassId,
                        disabledColKeys.filter((k) => !groupColKeys.includes(k))
                      );
                    } else {
                      // Disable whole group
                      const combined = Array.from(new Set([...disabledColKeys, ...groupColKeys]));
                      setDisabledColumnsForClass(selectedClassId, combined);
                    }
                  };

                  return (
                    <div
                      key={group.id}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        allGroupDisabled
                          ? 'bg-slate-100/80 border-slate-300 opacity-60'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Group Header */}
                      <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${group.headerBg}`} />
                          <span className="text-xs font-black text-slate-900">{group.nameKhmer}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white rounded border border-slate-300 text-slate-700 font-bold">
                            {groupActiveCount}/{group.subColumns.length}
                          </span>
                        </div>

                        {/* Whole Group Toggle Button */}
                        <button
                          type="button"
                          onClick={handleToggleWholeGroup}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors cursor-pointer ${
                            allGroupDisabled
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-800'
                          }`}
                        >
                          {allGroupDisabled ? 'បើកទាំងអស់' : 'បិទក្រុមនេះ'}
                        </button>
                      </div>

                      {/* Sub-columns Checklist */}
                      <div className="p-2 divide-y divide-slate-100">
                        {group.subColumns.map((col) => {
                          const isDisabled = disabledColKeys.includes(col.key);

                          return (
                            <div
                              key={col.key}
                              onClick={() => toggleColumnForClass(selectedClassId, col.key)}
                              className={`p-2 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                isDisabled
                                  ? 'bg-slate-100/60 text-slate-400 hover:bg-slate-100 line-through'
                                  : 'hover:bg-blue-50/50 text-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="text-blue-600 shrink-0">
                                  {isDisabled ? (
                                    <Square className="w-4 h-4 text-slate-400" />
                                  ) : (
                                    <CheckSquare className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="truncate">
                                  <div className={`text-xs font-bold ${isDisabled ? 'text-slate-500' : 'text-slate-900'}`}>
                                    {col.nameKhmer}
                                  </div>
                                  <div className="text-[10px] text-slate-600 truncate font-mono">
                                    {col.nameEnglish}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 no-underline">
                                <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  ពេញ {col.maxScore}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    isDisabled
                                      ? 'bg-slate-200 text-slate-600'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isDisabled ? 'បិទ' : 'ប្រឡង'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-700 font-medium">
                សរុបមុខវិជ្ជាប្រឡង៖ <strong className="text-blue-700 font-mono font-black">{activeCompetencyColumns.length}</strong> / {ALL_COMPETENCY_COLUMNS.length} ជំនាញ
                {disabledColKeys.length > 0 && (
                  <span className="text-amber-700 ml-1.5">
                    (មិនប្រឡង <strong>{disabledColKeys.length}</strong>)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextDivisor = activeCompetencyColumns.length;
                    setDivisorInput(String(nextDivisor));
                    if (selectedClassId) {
                      updateClassDivisor(selectedClassId, nextDivisor);
                      setDisabledColumnsForClass(selectedClassId, disabledColKeys);
                    }
                    setIsColumnModalOpen(false);
                    triggerSave();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>រក្សាទុកក្នុង Database & អនុវត្ត ({activeCompetencyColumns.length} មុខវិជ្ជា)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
