'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '@/lib/stateContext';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Award,
  Calculator,
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
} from '@/lib/monthlyGradebookData';

export default function ReportsPage() {
  const {
    school,
    academicMonths,
    classes,
    selectedClassId,
    students,
    computedStudentRecords,
    disabledColumnsMap,
    subjectRules,
    monthlySubjectGroups,
    allCompetencyColumns,
    monthlyScoresMap,
    semesterExamScoresMap,
    customDomainGradesMap,
    customAnnualDomainGradesMap,
    semesterRemarksMap,
    annualRemarksMap,
    exportToExcel,
    language,
    t,
  } = useSchool();

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const [reportType, setReportType] = useState<'ANNUAL_GRADEBOOK' | 'SEMESTER_GRADEBOOK' | 'MONTHLY_GRADEBOOK' | 'K1_S1' | 'HONOR_ROLL' | 'REPORT_BOOK' | 'EMIS'>('ANNUAL_GRADEBOOK');
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const currentMonthObj = academicMonths.find((m) => m.index === selectedMonthIndex) || academicMonths[0];

  // Disabled columns for selected class
  const disabledColKeys = useMemo(() => {
    return disabledColumnsMap[selectedClassId] || [];
  }, [disabledColumnsMap, selectedClassId]);

  // Active competency columns
  const activeCompetencyColumns = useMemo(() => {
    return (allCompetencyColumns || ALL_COMPETENCY_COLUMNS).filter((c) => !disabledColKeys.includes(c.key));
  }, [allCompetencyColumns, disabledColKeys]);

  // Active subject groups
  const activeSubjectGroups = useMemo(() => {
    return (monthlySubjectGroups || MONTHLY_SUBJECT_GROUPS).map((group) => ({
      ...group,
      subColumns: group.subColumns.filter((col) => !disabledColKeys.includes(col.key)),
    })).filter((group) => group.subColumns.length > 0);
  }, [monthlySubjectGroups, disabledColKeys]);

  const [divisorInput, setDivisorInput] = useState<string>(
    String(currentClass?.subjectDivisor || activeCompetencyColumns.length || 21)
  );
  const [semesterDivisorInput, setSemesterDivisorInput] = useState<string>(
    String(currentClass?.semesterDivisor || SEMESTER_EXAM_SUBJECTS.length)
  );
  const [annualSem1DivisorInput, setAnnualSem1DivisorInput] = useState<string>(String(SEMESTER_EXAM_SUBJECTS.length));
  const [annualSem2DivisorInput, setAnnualSem2DivisorInput] = useState<string>(String(SEMESTER_EXAM_SUBJECTS.length));

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

  const subjectDivisor = !isNaN(parseFloat(divisorInput)) && parseFloat(divisorInput) > 0 ? parseFloat(divisorInput) : (activeCompetencyColumns.length || 1);
  const semesterSubjectDivisor = !isNaN(parseFloat(semesterDivisorInput)) && parseFloat(semesterDivisorInput) > 0 ? parseFloat(semesterDivisorInput) : SEMESTER_EXAM_SUBJECTS.length;
  const annualSem1Divisor = !isNaN(parseFloat(annualSem1DivisorInput)) && parseFloat(annualSem1DivisorInput) > 0 ? parseFloat(annualSem1DivisorInput) : SEMESTER_EXAM_SUBJECTS.length;
  const annualSem2Divisor = !isNaN(parseFloat(annualSem2DivisorInput)) && parseFloat(annualSem2DivisorInput) > 0 ? parseFloat(annualSem2DivisorInput) : SEMESTER_EXAM_SUBJECTS.length;

  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const currentMonthScores = (monthlyScoresMap && monthlyScoresMap[selectedMonthIndex]) || {};

  const computedMonthlyRecords = useMemo(() => {
    const activeKeys = activeCompetencyColumns.map((c) => c.key);
    return computeMonthlyStudentRecords(classStudents, currentMonthScores, {}, subjectDivisor, activeKeys);
  }, [classStudents, currentMonthScores, subjectDivisor, activeCompetencyColumns]);

  const gradeStats = computeGradeStatistics(computedMonthlyRecords);

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

  const semesterGradeStats = computeSemesterGradeStatistics(computedSemesterRecords);

  // Annual Gradebook computations
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

  const annualGradeStats = useMemo(() => {
    return computeAnnualGradeStatistics(computedAnnualRecords);
  }, [computedAnnualRecords]);

  // Sorted alphabetically by Khmer collation for official Form K1/S1
  const sortedKhmerRoster = [...computedStudentRecords].sort((a, b) =>
    a.student.khmerName.localeCompare(b.student.khmerName, 'km')
  );

  const totalStudents = computedStudentRecords.length;
  const femaleStudents = computedStudentRecords.filter((r) => r.student.gender === 'FEMALE').length;

  const topHonorRoll = [...computedStudentRecords]
    .filter((r) => r.rankInfo.isHonorRoll)
    .sort((a, b) => a.rankInfo.rank - b.rankInfo.rank)
    .slice(0, 5);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (reportType === 'ANNUAL_GRADEBOOK') {
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
      exportToExcel(`MoEYS_តារាងលទ្ធផលប្រចាំឆ្នាំ_${currentClass?.name || ''}`, data);
    } else if (reportType === 'SEMESTER_GRADEBOOK') {
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
      exportToExcel(`MoEYS_តារាងពិន្ទុប្រចាំឆមាសទី${selectedSemester}_${currentClass?.name || ''}`, data);
    } else if (reportType === 'K1_S1') {
      const data = sortedKhmerRoster.map((r, idx) => ({
        'No.': idx + 1,
        'National ID': r.student.studentNationalId,
        'Khmer Name': r.student.khmerName,
        'Latin Name': r.student.latinName,
        'Gender': r.student.gender === 'FEMALE' ? 'F' : 'M',
        'Date of Birth': new Date(r.student.dob).toLocaleDateString('km-KH'),
        'Place of Birth': `${r.student.pobDistrict}, ${r.student.pobProvince}`,
        'Father Name': r.student.fatherName,
        'Mother Name': r.student.motherName,
        'Guardian Phone': r.student.guardianPhone,
      }));
      exportToExcel(`MoEYS_Form_K1_S1_${currentClass?.name || ''}`, data);
    } else if (reportType === 'MONTHLY_GRADEBOOK') {
      const data = computedMonthlyRecords.map((r, idx) => {
        const row: Record<string, any> = {
          'ល.រ': idx + 1,
          'អត្តលេខ': r.student.studentNationalId,
          'គោត្តនាម និងនាម': r.student.khmerName,
          'អក្សរឡាតាំង': r.student.latinName,
          'ភេទ': r.student.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស',
        };

        activeSubjectGroups.forEach((group) => {
          group.subColumns.forEach((col) => {
            row[`${group.nameKhmer} - ${col.nameKhmer}`] = r.scores[col.key] ?? 0;
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
      exportToExcel(`MoEYS_តារាងពិន្ទុ_${currentMonthObj?.nameKhmer || ''}_${currentClass?.name || ''}`, data);
    } else if (reportType === 'HONOR_ROLL') {
      const data = topHonorRoll.map((r) => ({
        'Rank': r.rankInfo.rank,
        'National ID': r.student.studentNationalId,
        'Khmer Name': r.student.khmerName,
        'Latin Name': r.student.latinName,
        'Gender': r.student.gender === 'FEMALE' ? 'F' : 'M',
        'Average Score': r.rankInfo.averageScore.toFixed(2),
        'Letter Grade': r.rankInfo.letterGrade.letter,
        'Assessment': r.rankInfo.letterGrade.labelKhmer,
      }));
      exportToExcel(`MoEYS_Honor_Roll_${currentClass?.name || ''}`, data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Non-printable Control Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('reportsCenterTitle')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('reportsCenterDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print')}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs (Non-printable) */}
      <div className="bg-white p-2 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 no-print overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'ANNUAL_GRADEBOOK', label: 'តារាងលទ្ធផលប្រចាំឆ្នាំ' },
            { id: 'SEMESTER_GRADEBOOK', label: 'តារាងពិន្ទុប្រចាំឆមាស' },
            { id: 'MONTHLY_GRADEBOOK', label: 'តារាងពិន្ទុប្រចាំខែ' },
            { id: 'K1_S1', label: t('tabFormK1S1') },
            { id: 'HONOR_ROLL', label: t('tabHonorRoll') },
            { id: 'REPORT_BOOK', label: t('tabReportBook') },
            { id: 'EMIS', label: t('tabEMIS') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                reportType === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Controls for ANNUAL_GRADEBOOK */}
        {reportType === 'ANNUAL_GRADEBOOK' && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 pr-2">
            <div className="flex items-center gap-1.5 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200/80">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <label className="text-xs font-bold text-emerald-950">តួរចែក ឆ.១៖</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={annualSem1DivisorInput}
                onChange={(e) => setAnnualSem1DivisorInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-emerald-900 bg-white border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="14"
                title="ចំនួនមុខវិជ្ជា/តួរចែកប្រឡងឆមាសទី១"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50/70 px-2.5 py-1 rounded-lg border border-emerald-200/80">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <label className="text-xs font-bold text-emerald-950">តួរចែក ឆ.២៖</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={annualSem2DivisorInput}
                onChange={(e) => setAnnualSem2DivisorInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-emerald-900 bg-white border border-emerald-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="14"
                title="ចំនួនមុខវិជ្ជា/តួរចែកប្រឡងឆមាសទី២"
              />
            </div>
          </div>
        )}

        {/* Controls for SEMESTER_GRADEBOOK */}
        {reportType === 'SEMESTER_GRADEBOOK' && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 pr-2">
            {/* Semester Switcher (ឆមាសទី ១ vs ឆមាសទី ២) */}
            <div className="flex items-center gap-1.5 bg-blue-50/90 p-1 rounded-lg border border-blue-200">
              <span className="text-xs font-bold text-blue-900 px-1">ឆមាស៖</span>
              <button
                type="button"
                onClick={() => setSelectedSemester(1)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedSemester === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-800 hover:bg-blue-100'
                }`}
              >
                ឆមាសទី ១
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester(2)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedSemester === 2
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-blue-800 hover:bg-blue-100'
                }`}
              >
                ឆមាសទី ២
              </button>
            </div>

            {/* Subject Divisor Input for Semester */}
            <div className="flex items-center gap-1.5 bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-200/80">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <label className="text-xs font-bold text-indigo-950">តួរចែក៖</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={semesterDivisorInput}
                onChange={(e) => setSemesterDivisorInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-indigo-900 bg-white border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="14"
                title="ចំនួនមុខវិជ្ជា/តួរចែករកមធ្យមភាគប្រឡងឆមាស"
              />
            </div>
          </div>
        )}

        {/* Controls for MONTHLY_GRADEBOOK */}
        {reportType === 'MONTHLY_GRADEBOOK' && (
          <div className="flex flex-wrap items-center gap-3 shrink-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600">ខែ៖</span>
              <select
                value={selectedMonthIndex}
                onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {academicMonths.map((m) => (
                  <option key={m.index} value={m.index}>
                    {m.nameKhmer} (M{m.index} • ឆ.{m.semester}){m.isExamMonth === false ? ' 🚫 [មិនប្រឡង]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Divisor Input in Reports */}
            <div className="flex items-center gap-1.5 bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-200/80">
              <Calculator className="w-3.5 h-3.5 text-indigo-600" />
              <label className="text-xs font-bold text-indigo-950">តួរចែក៖</label>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={divisorInput}
                onChange={(e) => setDivisorInput(e.target.value)}
                className="w-14 px-1.5 py-0.5 text-center font-mono font-bold text-xs text-indigo-900 bg-white border border-indigo-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="21"
                title="ចំនួនមុខវិជ្ជា/តួរចែករកមធ្យមភាគ"
              />
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 0. OFFICIAL MOEYS ANNUAL RESULTS REPORT (តារាងលទ្ធផលប្រចាំឆ្នាំ)  */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'ANNUAL_GRADEBOOK' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
          {/* Official MoEYS Header */}
          <div className="flex justify-between items-start text-xs leading-relaxed font-semibold">
            <div className="text-left">
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
            <h2 className="text-base font-black text-slate-900 uppercase flex items-center justify-center gap-2">
              <span>តារាងលទ្ធផល និងការវាយតម្លៃការសិក្សាប្រចាំឆ្នាំ</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-bold">
                ប្រចាំឆ្នាំសិក្សា {school.academicYear}
              </span>
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា {school.academicYear} • វេន៖ {currentClass?.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 mt-1 flex-wrap">
              <span>{t('total')}: <strong>{computedAnnualRecords.length} នាក់</strong> (ស្រី: <strong>{annualGradeStats.femaleStudents} នាក់</strong>)</span>
              <span>•</span>
              <span className="text-emerald-700">ឡើងថ្នាក់ (ជាប់)៖ <strong>{annualGradeStats.passedStudents} នាក់ ({annualGradeStats.passRate}%)</strong></span>
              <span>•</span>
              <span className="text-rose-700">ត្រួតថ្នាក់ (ធ្លាក់)៖ <strong>{annualGradeStats.failedStudents} នាក់ ({annualGradeStats.failRate}%)</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono text-[10px]">
                រូបមន្ត៖ (មធ្យមភាគប្រចាំឆមាស១ + មធ្យមភាគប្រចាំឆមាស២) ÷ ២ = មធ្យមភាគប្រចាំឆ្នាំ
              </span>
            </div>
          </div>

          {/* Full Annual Table with all requested fields */}
          <div className="overflow-x-auto max-h-[660px] isolate relative z-0 border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1250px]">
              <thead>
                {/* Level 1 Header */}
                <tr className="text-center font-bold uppercase text-[11px] sticky top-0 z-30 shadow-xs">
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
                  <th rowSpan={2} className="p-2.5 min-w-[130px] bg-slate-900 text-white sticky top-0 z-30 border-b-2 border-slate-700">
                    សេចក្ដីផ្សេងៗ
                  </th>
                </tr>

                {/* Level 2 Header */}
                <tr className="text-center font-bold text-[10px] sticky top-[38px] z-20 shadow-xs">
                  {/* 4 Semester Results Sub-columns */}
                  <th className="p-2 bg-blue-100 text-blue-950 font-bold border-b-2 border-r border-blue-200 min-w-[90px]">ម.ភាគប្រចាំឆមាស១</th>
                  <th className="p-2 bg-blue-100 text-blue-950 font-bold border-b-2 border-r border-blue-200 min-w-[90px]">ម.ភាគប្រចាំឆមាស២</th>
                  <th className="p-2 bg-emerald-100 text-emerald-950 font-black border-b-2 border-r border-emerald-300 min-w-[100px]">ម.ភាគប្រចាំឆ្នាំ</th>
                  <th className="p-2 bg-amber-200 text-amber-950 font-black border-b-2 border-r border-amber-300 min-w-[70px]">ចំណាត់ថ្នាក់</th>

                  {/* 4 Domains Sub-columns */}
                  <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[80px]" title="ចំណេះដឹង (A-F)">ចំណេះដឹង</th>
                  <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[85px]" title="បំណិន-ចំណេះធ្វើ (A-F)">បំណិន-ចំណេះធ្វើ</th>
                  <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[80px]" title="តម្លៃ-សីលធម៌ (A-F)">តម្លៃ-សីលធម៌</th>
                  <th className="p-2 bg-purple-100 text-purple-950 font-bold border-b-2 border-r border-purple-200 min-w-[90px]" title="សាមគ្គីភាព-ការចូលរួម (A-F)">សាមគ្គីភាព-ការចូលរួម</th>
                </tr>
              </thead>
              <tbody>
                {computedAnnualRecords.map((r, idx) => {
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
                      <td className={`p-2 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                        {idx + 1}
                      </td>
                      <td className={`p-2 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                        {r.student.studentNationalId}
                      </td>
                      <td className={`p-2 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                        {r.student.khmerName}
                      </td>
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

                      {/* 4 Domains */}
                      <td className="p-2 border-b border-r border-slate-200 text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${r.domainGrades.knowledge === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.knowledge === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.knowledge}
                        </span>
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${r.domainGrades.skills === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.skills === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.skills}
                        </span>
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${r.domainGrades.values === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.values === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.values}
                        </span>
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${r.domainGrades.participation === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.participation === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.participation}
                        </span>
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

                      {/* Remarks */}
                      <td className="p-2 border-b border-r border-slate-200 text-slate-800 text-[11px] bg-slate-50">
                        {r.remarks || r.outcome}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official MoEYS Grade Distribution & Pass/Fail Statistics Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Grade Breakdown Table */}
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

            {/* Annual Pass / Fail Summary Overview */}
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

          {/* Official MoEYS 3-Party Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-8 text-xs text-center font-semibold pt-4 border-t border-slate-200">
            <div>
              <div>បានឃើញ និងអនុម័ត</div>
              <div className="font-bold text-slate-900 mt-1">{t('principalNameLabel')}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{school.principalName}</div>
            </div>

            <div>
              <div>បានពិនិត្យត្រឹមត្រូវ</div>
              <div className="font-bold text-slate-900 mt-1">ប្រធានផ្នែក / នាយករង</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">................................</div>
            </div>

            <div>
              <div>រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ ២០២៤</div>
              <div className="font-bold text-slate-900 mt-1">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{currentClass?.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 0. OFFICIAL MOEYS SEMESTER GRADEBOOK REPORT (តារាងពិន្ទុប្រចាំឆមាស) */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'SEMESTER_GRADEBOOK' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
          {/* Official MoEYS Header */}
          <div className="flex justify-between items-start text-xs leading-relaxed font-semibold">
            <div className="text-left">
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
            <h2 className="text-base font-black text-slate-900 uppercase flex items-center justify-center gap-2">
              <span>តារាងពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាប្រចាំឆមាសទី {selectedSemester}</span>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-full text-xs font-bold">
                ឆមាសទី {selectedSemester}
              </span>
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា {school.academicYear} • វេន៖ {currentClass?.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
            </p>
            <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 mt-1 flex-wrap">
              <span>{t('total')}: <strong>{computedSemesterRecords.length} នាក់</strong> (ស្រី: <strong>{semesterGradeStats.femaleStudents} នាក់</strong>)</span>
              <span>•</span>
              <span className="text-emerald-700">ជាប់៖ <strong>{semesterGradeStats.passedStudents} នាក់ ({semesterGradeStats.passRate}%)</strong></span>
              <span>•</span>
              <span className="text-rose-700">ធ្លាក់៖ <strong>{semesterGradeStats.failedStudents} នាក់ ({semesterGradeStats.failRate}%)</strong></span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono text-[10px]">
                រូបមន្ត៖ (មធ្យមភាគប្រឡង + មធ្យមភាគប្រចាំខែ) ÷ ២ = មធ្យមភាគប្រចាំឆមាស
              </span>
            </div>
          </div>

          {/* Full Semester Table with all requested fields */}
          <div className="overflow-x-auto max-h-[680px] isolate relative z-0 border border-slate-300 rounded-xl">
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

                {/* Level 2 Header: 14 subjects + 5 results + 4 domains */}
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
                {computedSemesterRecords.map((r, idx) => {
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
                      <td className={`p-2 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                        {idx + 1}
                      </td>
                      <td className={`p-2 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                        {r.student.studentNationalId}
                      </td>
                      <td className={`p-2 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                        {r.student.khmerName}
                      </td>
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

                      {/* 14 Exam Subject Scores */}
                      {SEMESTER_EXAM_SUBJECTS.map((subj) => {
                        const sc = r.examScores[subj.key];
                        const isLow = typeof sc === 'number' && sc < 50;
                        return (
                          <td key={subj.key} className={`p-1.5 border-b border-r border-slate-200 text-center font-mono text-[11px] ${isLow ? 'text-rose-600 font-bold bg-rose-50/50' : 'text-slate-800 bg-blue-50/20'}`}>
                            {typeof sc === 'number' ? sc : '-'}
                          </td>
                        );
                      })}

                      {/* Results */}
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-blue-950 bg-blue-50/60">
                        {r.totalExamScore}
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-amber-950 bg-amber-50/60">
                        {r.examAverage.toFixed(2)}
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-indigo-950 bg-indigo-50/60">
                        {r.monthlyAverage.toFixed(2)}
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black text-emerald-950 bg-emerald-100/70 text-[12px]">
                        {r.semesterAverage.toFixed(2)}
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

                      {/* 4 Domains */}
                      <td className="p-1.5 border-b border-r border-slate-200 text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${r.domainGrades.knowledge === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.knowledge === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.knowledge}
                        </span>
                      </td>
                      <td className="p-1.5 border-b border-slate-200 border-r text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${r.domainGrades.skills === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.skills === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.skills}
                        </span>
                      </td>
                      <td className="p-1.5 border-b border-slate-200 border-r text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${r.domainGrades.values === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.values === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.values}
                        </span>
                      </td>
                      <td className="p-1.5 border-b border-slate-200 border-r text-center font-bold bg-purple-50/30">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${r.domainGrades.participation === 'A' ? 'bg-emerald-100 text-emerald-800 font-black' : r.domainGrades.participation === 'F' ? 'bg-rose-100 text-rose-800 font-black' : 'bg-white border border-purple-200 text-slate-800'}`}>
                          {r.domainGrades.participation}
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="p-2 border-b border-r border-slate-200 text-slate-800 text-[11px] bg-slate-50">
                        {r.remarks || (r.isPassing ? 'ឡើងថ្នាក់' : 'ប្រឡងសង')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Official MoEYS Grade Distribution & Pass/Fail Statistics Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Grade Breakdown Table */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-black text-slate-800 mb-2 uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>ស្ថិតិចែកចាយនិទ្ទេស (Grade Distribution)</span>
              </h4>
              <table className="w-full text-[11px] border-collapse border border-slate-300 bg-white">
                <thead className="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th className="p-1.5 border border-slate-300 text-center">និទ្ទេស</th>
                    <th className="p-1.5 border border-slate-300 text-center">ការវាយតម្លៃ</th>
                    <th className="p-1.5 border border-slate-300 text-center">ពិន្ទុ</th>
                    <th className="p-1.5 border border-slate-300 text-center">សរុប</th>
                    <th className="p-1.5 border border-slate-300 text-center">ស្រី</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { l: 'A', label: 'ល្អប្រសើរ', range: '≥ 85.00', count: semesterGradeStats.counts.A },
                    { l: 'B', label: 'ល្អណាស់', range: '80.00 - 84.99', count: semesterGradeStats.counts.B },
                    { l: 'C', label: 'ល្អ', range: '70.00 - 79.99', count: semesterGradeStats.counts.C },
                    { l: 'D', label: 'ល្អបង្គួរ', range: '60.00 - 69.99', count: semesterGradeStats.counts.D },
                    { l: 'E', label: 'មធ្យម (ជាប់)', range: '50.00 - 59.99', count: semesterGradeStats.counts.E },
                    { l: 'F', label: 'ខ្សោយ (ធ្លាក់)', range: '< 50.00', count: semesterGradeStats.counts.F },
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

            {/* Pass / Fail Summary Overview */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-slate-800 mb-2 uppercase">
                  សង្ខេបលទ្ធផលរួម (Overall Results Summary)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs mt-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="text-[11px] text-emerald-800 font-bold">សិស្សជាប់សរុប (Passed)</div>
                    <div className="text-lg font-black text-emerald-900 font-mono mt-1">
                      {semesterGradeStats.passedStudents} <span className="text-xs font-normal">({semesterGradeStats.passRate}%)</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">
                      ស្រី: {semesterGradeStats.passedFemales} នាក់ ({semesterGradeStats.passFemaleRate}%)
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="text-[11px] text-rose-800 font-bold">សិស្សធ្លាក់សរុប (Failed)</div>
                    <div className="text-lg font-black text-rose-900 font-mono mt-1">
                      {semesterGradeStats.failedStudents} <span className="text-xs font-normal">({semesterGradeStats.failRate}%)</span>
                    </div>
                    <div className="text-[10px] text-rose-700 mt-0.5">
                      ស្រី: {semesterGradeStats.failedFemales} នាក់ ({semesterGradeStats.failFemaleRate}%)
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-3 font-medium">
                ℹ️ <strong>កំណត់សម្គាល់៖</strong> ពិន្ទុ និងមធ្យមភាគប្រចាំឆមាសត្រូវបានគណនាតាមរូបមន្តស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា។
              </div>
            </div>
          </div>

          {/* Official MoEYS 3-Party Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-8 text-xs text-center font-semibold pt-4 border-t border-slate-200">
            <div>
              <div>បានឃើញ និងអនុម័ត</div>
              <div className="font-bold text-slate-900 mt-1">{t('principalNameLabel')}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{school.principalName}</div>
            </div>

            <div>
              <div>បានពិនិត្យត្រឹមត្រូវ</div>
              <div className="font-bold text-slate-900 mt-1">ប្រធានផ្នែក / នាយករង</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">................................</div>
            </div>

            <div>
              <div>រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ ២០២៤</div>
              <div className="font-bold text-slate-900 mt-1">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{currentClass?.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. OFFICIAL MOEYS MONTHLY COMPETENCY GRADEBOOK REPORT           */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'MONTHLY_GRADEBOOK' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
          {/* Official MoEYS Header */}
          <div className="flex justify-between items-start text-xs leading-relaxed font-semibold">
            <div className="text-left">
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
            <h2 className="text-base font-black text-slate-900 uppercase flex items-center justify-center gap-2">
              <span>តារាងពិន្ទុ និងការវាយតម្លៃលទ្ធផលសិក្សាប្រចាំ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'}</span>
              {currentMonthObj?.isExamMonth === false && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 rounded text-xs font-bold">
                  🚫 មិនប្រឡង
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentClass?.name || 'ថ្នាក់រៀន'} • ឆ្នាំសិក្សា {school.academicYear} • វេន៖ {currentClass?.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
            </p>
            <div className="text-[11px] font-bold text-slate-600 mt-1">
              {t('total')}: <strong>{computedMonthlyRecords.length} នាក់</strong> (ស្រី: <strong>{gradeStats.femaleStudents} នាក់</strong>) | ជាប់៖ <strong>{gradeStats.passedStudents} នាក់ ({gradeStats.passRate}%)</strong>
            </div>
          </div>

          {/* Full Table */}
          <div className="overflow-x-auto max-h-[660px] isolate relative z-0 border border-slate-300 rounded-xl">
            <table className="w-full text-xs text-left border-separate border-spacing-0 min-w-[1500px]">
              <thead>
                {/* Level 1 Header: Subject Groups */}
                <tr className="text-center font-bold uppercase text-[11px] sticky top-0 z-30 shadow-xs">
                  <th
                    colSpan={4}
                    className="p-2.5 bg-slate-900 text-white sticky left-0 top-0 z-40 min-w-[392px] max-w-[392px] border-b border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)]"
                  >
                    ព័ត៌មានសិស្ស
                  </th>
                  {activeSubjectGroups.map((g) => (
                    <th key={g.id} colSpan={g.subColumns.length} className={`p-2.5 ${g.headerBg} ${g.headerText} sticky top-0 z-30 border-b border-r border-slate-300`}>
                      {g.nameKhmer}
                    </th>
                  ))}
                  <th colSpan={4} className="p-2.5 bg-slate-900 text-amber-300 sticky top-0 z-30 border-b border-r border-slate-700">
                    លទ្ធផលប្រចាំខែ
                  </th>
                  <th className="p-2.5 bg-slate-900 text-white sticky top-0 z-30 border-b border-slate-700 w-28">
                    ផ្សេងៗ
                  </th>
                </tr>

                {/* Level 2 Header: Competency Columns with Group Colors */}
                <tr className="text-[10px] font-bold text-center sticky top-[38px] z-20 shadow-xs">
                  <th className="p-2 w-12 min-w-[48px] max-w-[48px] text-center bg-slate-900 text-white sticky left-0 top-[38px] z-40 border-b-2 border-r border-slate-700">
                    ល.រ
                  </th>
                  <th className="p-2 w-28 min-w-[112px] max-w-[112px] text-left bg-slate-900 text-white sticky left-[48px] top-[38px] z-40 border-b-2 border-r border-slate-700">
                    អត្តលេខ
                  </th>
                  <th className="p-2 w-44 min-w-[176px] max-w-[176px] text-left bg-slate-900 text-white sticky left-[160px] top-[38px] z-40 border-b-2 border-r border-slate-700">
                    គោត្តនាម និងនាម
                  </th>
                  <th className="p-2 w-14 min-w-[56px] max-w-[56px] text-center bg-slate-900 text-white sticky left-[336px] top-[38px] z-40 border-b-2 border-r-2 border-slate-700 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.18)]">
                    ភេទ
                  </th>

                  {activeSubjectGroups.map((group) =>
                    group.subColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`p-1.5 w-16 text-[9.5px] font-bold border-b-2 border-r border-slate-300 ${
                          group.subHeaderBg || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {col.nameKhmer}
                      </th>
                    ))
                  )}

                  <th className="p-2 w-18 bg-blue-100 text-blue-950 font-black border-b-2 border-r border-slate-300">ពិន្ទុសរុប</th>
                  <th className="p-2 w-20 bg-amber-100 text-amber-950 font-black border-b-2 border-r border-slate-300">
                    <div>មធ្យមភាគ</div>
                    <div className="text-[8.5px] font-mono text-amber-800 opacity-90">(÷{subjectDivisor})</div>
                  </th>
                  <th className="p-2 w-16 bg-emerald-100 text-emerald-950 font-black border-b-2 border-r border-slate-300">ចំណាត់ថ្នាក់</th>
                  <th className="p-2 w-14 bg-purple-100 text-purple-950 font-black border-b-2 border-r border-slate-300">និទ្ទេស</th>
                  <th className="p-2 w-28 bg-slate-100 text-slate-800 font-bold border-b-2 border-slate-300">សេចក្ដីផ្សេងៗ</th>
                </tr>
              </thead>

              <tbody>
                {computedMonthlyRecords.map((r, idx) => {
                  const isFemale = r.student.gender === 'FEMALE';
                  const isEven = idx % 2 === 0;
                  const stickyBg = isEven ? 'bg-white' : 'bg-slate-100';

                  return (
                    <tr
                      key={r.student.studentNationalId}
                      className={`group transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-100'
                      } hover:bg-blue-100`}
                    >
                      <td className={`p-2 text-center font-mono font-bold text-slate-700 sticky left-0 z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-12 min-w-[48px] max-w-[48px]`}>
                        {idx + 1}
                      </td>
                      <td className={`p-2 font-mono text-center text-[11px] font-semibold text-slate-800 sticky left-[48px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 w-28 min-w-[112px] max-w-[112px]`}>
                        {r.student.studentNationalId}
                      </td>
                      <td className={`p-2 font-bold text-slate-900 sticky left-[160px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r border-slate-200 whitespace-nowrap w-44 min-w-[176px] max-w-[176px]`}>
                        {r.student.khmerName}
                      </td>
                      <td className={`p-2 text-center sticky left-[336px] z-10 ${stickyBg} group-hover:bg-blue-100 border-b border-r-2 border-slate-400 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.12)] w-14 min-w-[56px] max-w-[56px]`}>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                            isFemale ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {isFemale ? 'ស្រី' : 'ប្រុស'}
                        </span>
                      </td>

                      {activeSubjectGroups.map((group) =>
                        group.subColumns.map((col) => {
                          const val = r.scores[col.key] ?? 0;
                          const isPeHealth = group.id === 'PE_HEALTH';
                          return (
                            <td
                              key={col.key}
                              className={`p-1.5 border-b border-r border-slate-200 text-center font-mono text-[11px] ${
                                isPeHealth ? 'bg-orange-50 text-orange-950 font-bold' : (group.cellBg || '')
                              }`}
                            >
                              {val > 0 ? val : '-'}
                            </td>
                          );
                        })
                      )}

                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-bold text-blue-950 bg-blue-100">{r.totalScore.toFixed(1)}</td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black bg-amber-100 text-amber-950">{r.averageScore.toFixed(2)}</td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-mono font-black text-emerald-950 bg-emerald-100">
                        {r.rank}
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-center font-bold font-mono bg-purple-50/40">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.gradeLetter === 'A' ? 'bg-emerald-200 text-emerald-950' :
                          r.gradeLetter === 'B' ? 'bg-blue-200 text-blue-950' :
                          r.gradeLetter === 'C' ? 'bg-sky-200 text-sky-950' :
                          r.gradeLetter === 'D' ? 'bg-amber-200 text-amber-950' :
                          r.gradeLetter === 'E' ? 'bg-orange-200 text-orange-950' : 'bg-rose-200 text-rose-950'
                        }`}>
                          {r.gradeLetter}
                        </span>
                      </td>
                      <td className="p-2 border-b border-r border-slate-200 text-left text-[10px] text-slate-800 bg-slate-50">{r.remarks || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary Stats Table */}
          <div className="pt-2 max-w-lg">
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-1.5 border-r border-slate-300">និទ្ទេស</th>
                    <th className="p-1.5 border-r border-slate-300">ចំនួន(នាក់)</th>
                    <th className="p-1.5 border-r border-slate-300">ភាគរយ</th>
                    <th className="p-1.5 border-r border-slate-300">ស្រី(នាក់)</th>
                    <th className="p-1.5">ភាគរយ</th>
                  </tr>
                </thead>
                <tbody>
                  {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((grade) => (
                    <tr key={grade} className="border-b border-slate-300">
                      <td className="p-1 font-mono font-black border-r border-slate-300">{grade}</td>
                      <td className="p-1 font-mono font-bold border-r border-slate-300">{gradeStats.counts[grade].total}</td>
                      <td className="p-1 font-mono border-r border-slate-300">
                        {gradeStats.totalStudents > 0 ? ((gradeStats.counts[grade].total / gradeStats.totalStudents) * 100).toFixed(1) : '0'} %
                      </td>
                      <td className="p-1 font-mono font-bold border-r border-slate-300">{gradeStats.counts[grade].female}</td>
                      <td className="p-1 font-mono">
                        {gradeStats.femaleStudents > 0 ? ((gradeStats.counts[grade].female / gradeStats.femaleStudents) * 100).toFixed(1) : '0'} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official MoEYS 2-Party Signatures */}
          <div className="grid grid-cols-2 gap-6 mt-8 text-xs text-center font-semibold pt-4">
            <div className="text-left pl-4">
              <div>បានឃើញ និងឯកភាព</div>
              <div className="font-bold text-slate-900 mt-1">{t('principalNameLabel')}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{school.principalName}</div>
            </div>

            <div className="text-right pr-4">
              <div>រាជធានីភ្នំពេញ, ថ្ងៃទី ០២ {currentMonthObj?.nameKhmer || 'ខែសិក្សា'} ឆ្នាំ ២០២៤</div>
              <div className="font-bold text-slate-900 mt-1">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}</div>
              <div className="h-16"></div>
              <div className="font-bold text-slate-800">{currentClass?.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. FORM K1 / S1: OFFICIAL MOEYS ROSTER                         */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'K1_S1' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none">
          {/* Official MoEYS Header */}
          <div className="flex justify-between items-start text-xs leading-relaxed mb-6 font-semibold">
            <div className="text-left">
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
              {language === 'km' ? 'តារាងបញ្ជីរាយនាមសិស្សផ្លូវការ (ទម្រង់ ក១-ស១)' : 'Official Class Roster (Form K1/S1)'}
            </h2>
            <p className="text-xs text-slate-700 mt-0.5">
              {currentClass?.name || 'ថ្នាក់រៀន'} • {t('academicYearLabel')} {school.academicYear} • {currentClass?.shift === 'MORNING' ? t('shiftMorning') : t('shiftAfternoon')}
            </p>
            <div className="text-[11px] font-bold text-slate-600 mt-1">
              {t('total')}: <strong>{totalStudents} {t('studentCountUnit')}</strong> ({t('female')}: <strong>{femaleStudents} {t('studentCountUnit')}</strong>)
            </div>
          </div>

          {/* Form K1/S1 Table */}
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 text-[11px] font-bold uppercase">
                <tr>
                  <th className="p-2 border border-slate-300 w-10 text-center">{t('rollNoHeader')}</th>
                  <th className="p-2 border border-slate-300 w-28">{t('studentIdHeader')}</th>
                  <th className="p-2 border border-slate-300">{t('studentNameHeader')}</th>
                  <th className="p-2 border border-slate-300">{language === 'km' ? 'អក្សរឡាតាំង' : 'Latin Name'}</th>
                  <th className="p-2 border border-slate-300 w-12 text-center">{t('genderHeader')}</th>
                  <th className="p-2 border border-slate-300 w-24">{t('dobLabel')}</th>
                  <th className="p-2 border border-slate-300">{t('pobLabel')}</th>
                  <th className="p-2 border border-slate-300">{t('guardianInfoLabel')}</th>
                  <th className="p-2 border border-slate-300 w-24">{t('phoneLabel')}</th>
                  <th className="p-2 border border-slate-300 w-20 text-center">{language === 'km' ? 'ផ្សេងៗ' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {sortedKhmerRoster.map((r, idx) => (
                  <tr key={r.student.studentNationalId} className="hover:bg-slate-50">
                    <td className="p-1.5 border border-slate-300 text-center font-mono">{idx + 1}</td>
                    <td className="p-1.5 border border-slate-300 font-mono font-medium">{r.student.studentNationalId}</td>
                    <td className="p-1.5 border border-slate-300 font-bold">{r.student.khmerName}</td>
                    <td className="p-1.5 border border-slate-300 font-mono text-[11px]">{r.student.latinName}</td>
                    <td className="p-1.5 border border-slate-300 text-center font-bold">
                      {r.student.gender === 'FEMALE' ? t('female') : t('male')}
                    </td>
                    <td className="p-1.5 border border-slate-300 font-mono text-[11px]">
                      {new Date(r.student.dob).toLocaleDateString('km-KH')}
                    </td>
                    <td className="p-1.5 border border-slate-300 text-[11px]">
                      {r.student.pobDistrict}, {r.student.pobProvince}
                    </td>
                    <td className="p-1.5 border border-slate-300 text-[11px]">
                      {r.student.fatherName ? `ឳ: ${r.student.fatherName}` : `ម្តាយ: ${r.student.motherName}`}
                    </td>
                    <td className="p-1.5 border border-slate-300 font-mono text-[11px]">{r.student.guardianPhone}</td>
                    <td className="p-1.5 border border-slate-300 text-center text-[10px] text-emerald-700 font-semibold">
                      {language === 'km' ? 'កំពុងរៀន' : 'Enrolled'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official MoEYS 3-Party Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-xs text-center font-semibold pt-4">
            <div>
              <div>{language === 'km' ? 'បានឃើញ និងអនុម័ត' : 'Approved & Verified'}</div>
              <div className="font-bold text-slate-900 mt-1">{t('principalNameLabel')}</div>
              <div className="h-16 sm:h-20"></div>
              <div className="font-bold text-slate-800">{school.principalName}</div>
            </div>

            <div>
              <div>{language === 'km' ? 'ពិនិត្យត្រឹមត្រូវដោយ' : 'Checked & Endorsed'}</div>
              <div className="font-bold text-slate-900 mt-1">{language === 'km' ? 'ប្រធានការិយាល័យសិក្សា' : 'Academic Affairs Head'}</div>
              <div className="h-16 sm:h-20"></div>
              <div className="font-bold text-slate-800">លោក អ៊ុំ គឹមសាន</div>
            </div>

            <div>
              <div>{language === 'km' ? 'រាជធានីភ្នំពេញ, ថ្ងៃទី..... ខែ..... ឆ្នាំ២០២៤' : 'Phnom Penh, Date: ...... / ...... / 2024'}</div>
              <div className="font-bold text-slate-900 mt-1">{language === 'km' ? 'គ្រូបន្ទុកថ្នាក់' : 'Homeroom Teacher'}</div>
              <div className="h-16 sm:h-20"></div>
              <div className="font-bold text-slate-800">{currentClass?.homeroomTeacherName || 'មិនទាន់ចាត់តាំង'}</div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. HONOR ROLL: TOP 5 STUDENTS TABLE                           */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'HONOR_ROLL' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="font-bold text-xs text-slate-600">{t('ministryName')} • {language === 'en' ? school.nameEnglish : school.nameKhmer}</div>
            <h2 className="text-xl font-black text-amber-700 uppercase mt-1 flex items-center justify-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>{t('tabHonorRoll')}</span>
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {currentClass?.name || 'ថ្នាក់រៀន'} • {school.academicYear}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-amber-50 text-amber-950 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3 border border-slate-300 w-24 text-center">{t('rankLabel')}</th>
                  <th className="p-3 border border-slate-300 w-32">{t('studentIdHeader')}</th>
                  <th className="p-3 border border-slate-300">{t('studentNameHeader')}</th>
                  <th className="p-3 border border-slate-300 w-16 text-center">{t('genderHeader')}</th>
                  <th className="p-3 border border-slate-300 w-32 text-center">{t('averageScoreLabel')}</th>
                  <th className="p-3 border border-slate-300 w-24 text-center">{t('gradeLabel')}</th>
                  <th className="p-3 border border-slate-300">{language === 'km' ? 'ការវាយតម្លៃគុណសម្បត្តិ' : 'Merit Assessment'}</th>
                </tr>
              </thead>
              <tbody>
                {topHonorRoll.map((r) => (
                  <tr key={r.student.studentNationalId} className="hover:bg-amber-50/40">
                    <td className="p-3 border border-slate-300 text-center font-black text-base text-amber-700">
                      {language === 'km' ? `លេខ ${r.rankInfo.rank}` : `#${r.rankInfo.rank}`}
                    </td>
                    <td className="p-3 border border-slate-300 font-mono font-bold text-slate-700">
                      {r.student.studentNationalId}
                    </td>
                    <td className="p-3 border border-slate-300 font-bold text-sm text-slate-900">
                      {language === 'en' ? r.student.latinName : r.student.khmerName}
                    </td>
                    <td className="p-3 border border-slate-300 text-center font-bold">
                      {r.student.gender === 'FEMALE' ? t('female') : t('male')}
                    </td>
                    <td className="p-3 border border-slate-300 text-center font-black text-sm text-blue-700 font-mono">
                      {r.rankInfo.averageScore.toFixed(2)}%
                    </td>
                    <td className="p-3 border border-slate-300 text-center">
                      <span
                        className="inline-block px-2 py-0.5 rounded font-black text-xs"
                        style={{
                          backgroundColor: `${r.rankInfo.letterGrade.colorHex}20`,
                          color: r.rankInfo.letterGrade.colorHex,
                        }}
                      >
                        {language === 'km' ? `និទ្ទេស ${r.rankInfo.letterGrade.letter}` : `Grade ${r.rankInfo.letterGrade.letter}`}
                      </span>
                    </td>
                    <td className="p-3 border border-slate-300 font-bold text-slate-800">
                      {language === 'km' ? r.rankInfo.letterGrade.labelKhmer : r.rankInfo.letterGrade.labelEnglish} • {language === 'km' ? 'សីលធម៌ល្អប្រសើរ' : 'Exemplary Conduct'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>{language === 'km' ? 'កំណត់សម្គាល់:' : 'Remarks:'}</strong> {language === 'km' ? 'សិស្សដែលមានឈ្មោះក្នុងតារាងកិត្តិយសខាងលើ ទទួលបានប័ណ្ណសរសើរផ្លូវការពីគណៈគ្រប់គ្រងសាលា និងមានសិទ្ធិទទួលបានអាហារូបករណ៍ឆ្នើមប្រចាំឆ្នាំ។' : 'Scholars listed in the Honor Roll above receive an official Certificate of Distinction from school leadership and qualify for annual excellence grants.'}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. REPORT BOOK: SAMPLE OFFICIAL STUDENT REPORT BOOK            */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'REPORT_BOOK' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm print:p-0">
          <div className="text-center mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase">
              {t('tabReportBook')}
            </h2>
            <p className="text-xs text-slate-600">
              {language === 'km' ? `គំរូសន្លឹកតាមដានការសិក្សាផ្លូវការសម្រាប់សិស្សម្នាក់ៗប្រចាំឆ្នាំ ${school.academicYear}` : `Official individual student assessment record for academic year ${school.academicYear}`}
            </p>
          </div>

          {/* Sample First Student Dossier */}
          {computedStudentRecords[0] && (
            <div className="border border-slate-300 rounded-xl p-4 sm:p-6 bg-slate-50/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {language === 'km' ? `សិស្ស: ${computedStudentRecords[0].student.khmerName}` : `Student: ${computedStudentRecords[0].student.latinName}`}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {t('studentIdHeader')}: {computedStudentRecords[0]?.student?.studentNationalId || 'N/A'} • {currentClass?.name || 'ថ្នាក់រៀន'}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-500">{t('rankLabel')}:</div>
                  <div className="text-xl font-black text-blue-700">
                    {language === 'km' ? `លេខ ${computedStudentRecords[0].rankInfo.rank} / ${totalStudents}` : `#${computedStudentRecords[0].rankInfo.rank} of ${totalStudents}`}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-300">
                  <thead className="bg-slate-100 text-[11px] font-bold">
                    <tr>
                      <th className="p-2 border border-slate-300">{t('subjectLabel')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('coefficientLabel')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('monthlyAverageHeader')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('examScoreHeader')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('semesterScoreHeader')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('weightedScoreHeader')}</th>
                      <th className="p-2 border border-slate-300 text-center">{t('gradeLabel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRules.map((rule) => {
                      const subScore = computedStudentRecords[0].scoresBySubject[rule.subjectCode] || {
                        monthly: [85, 85, 85, 85, 85],
                        exam: 90,
                      };
                      const monthlyAvg = subScore.monthly.reduce((a, b) => a + b, 0) / subScore.monthly.length;
                      const semScore = (monthlyAvg + subScore.exam * 2) / 3;

                      return (
                        <tr key={rule.subjectCode}>
                          <td className="p-2 border border-slate-300 font-bold">
                            {language === 'en' ? rule.nameEnglish : rule.nameKhmer}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono">×{rule.coefficient}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono">{monthlyAvg.toFixed(1)}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono">{subScore.exam}</td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold text-blue-700">
                            {semScore.toFixed(2)}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-mono font-bold">
                            {(semScore * rule.coefficient).toFixed(2)}
                          </td>
                          <td className="p-2 border border-slate-300 text-center font-bold">
                            {semScore >= 85 ? 'A' : semScore >= 80 ? 'B' : semScore >= 70 ? 'C' : semScore >= 60 ? 'D' : semScore >= 50 ? 'E' : 'F'}
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

      {/* ------------------------------------------------------------- */}
      {/* 4. EMIS STATISTICAL CENSUS EXPORT                             */}
      {/* ------------------------------------------------------------- */}
      {reportType === 'EMIS' && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-base font-black text-slate-900 uppercase">
              {language === 'km' ? 'តារាងទិន្នន័យស្ថិតិជំរឿន EMIS សម្រាប់ក្រសួងអប់រំ យុវជន និងកីឡា' : 'EMIS Census Statistical Indicators (MoEYS Standard)'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'km' ? 'សង្ខេបស្ថិតិសិស្សតាមកម្រិតថ្នាក់ ភេទ និងលទ្ធផលឡើងថ្នាក់' : 'Comprehensive school census breakdown by grade levels, gender ratios, and progression.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-slate-500">{language === 'km' ? 'សិស្សសរុបគ្រឹះស្ថាន' : 'Total Enrollment'}</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {classes.reduce((sum, c) => sum + c.totalStudents, 0)} {t('studentCountUnit')}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
              <div className="text-blue-700">{language === 'km' ? 'សិស្សស្រីសរុប' : 'Total Female Scholars'}</div>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {classes.reduce((sum, c) => sum + c.femaleStudents, 0)} {t('studentCountUnit')}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-emerald-700">{language === 'km' ? 'អត្រាឡើងថ្នាក់រំពឹងទុក' : 'Projected Promotion Rate'}</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">96.7%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
