'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  UserCheck,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useSchool } from '@/lib/stateContext';

export default function DashboardPage() {
  const {
    school,
    classes,
    accessibleClasses,
    isTeacher,
    selectedClassId,
    setSelectedClassId,
    students,
    teachers,
    computedStudentRecords,
    attendance,
    language,
    t,
  } = useSchool();

  const targetClasses = isTeacher ? accessibleClasses : classes;
  const currentClass = targetClasses.find((c) => c.id === selectedClassId) || targetClasses[0] || classes[0];

  // Global School Enrollment Totals
  const totalSchoolStudents = students.length;
  const totalFemaleStudents = students.filter((s) => s.gender === 'FEMALE').length;
  const femalePercentage = totalSchoolStudents > 0 ? Math.round((totalFemaleStudents / totalSchoolStudents) * 100) : 0;

  // Classroom specific metrics for the currently selected class
  const classTotal = computedStudentRecords.length;
  const classFemale = computedStudentRecords.filter((r) => r.student.gender === 'FEMALE').length;

  // Attendance metrics for today for the ACTIVE CLASS
  let presentCount = 0;
  let absentPermCount = 0;
  let absentNoPermCount = 0;
  let lateCount = 0;

  computedStudentRecords.forEach((r) => {
    const st = attendance[r.student.studentNationalId] || 'PRESENT';
    if (st === 'PRESENT') presentCount++;
    else if (st === 'ABSENT_PERMISSION') absentPermCount++;
    else if (st === 'ABSENT_NO_PERMISSION') absentNoPermCount++;
    else if (st === 'LATE') lateCount++;
  });

  const attendanceRate = classTotal > 0 ? Math.round((presentCount / classTotal) * 100) : 100;

  // Grade Distribution Counts
  const gradeCounts = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
  computedStudentRecords.forEach((r) => {
    const letter = r.rankInfo.letterGrade.letter as keyof typeof gradeCounts;
    if (gradeCounts[letter] !== undefined) {
      gradeCounts[letter]++;
    }
  });

  // Top 5 Honor Roll
  const honorRollStudents = [...computedStudentRecords]
    .filter((r) => r.rankInfo.isHonorRoll)
    .sort((a, b) => a.rankInfo.rank - b.rankInfo.rank)
    .slice(0, 5);

  // At-Risk Students (Average < 50% or Unexcused Absence)
  const atRiskStudents = computedStudentRecords.filter(
    (r) => r.rankInfo.averageScore < 50 || attendance[r.student.studentNationalId] === 'ABSENT_NO_PERMISSION'
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome & Institutional Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-blue-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>{language === 'en' ? school.nameEnglish : school.nameKhmer}</span>
              <span>•</span>
              <span className="font-mono">{school.code}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              {t('dashboardHeaderTitle')}
            </h1>
            <p className="text-slate-300 text-xs mt-1.5 max-w-2xl leading-relaxed">
              {t('dashboardHeaderDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap sm:flex-nowrap">
            {/* Quick Class Switcher */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <span className="text-xs text-blue-200 font-bold hidden sm:inline">{t('selectClassLabel')}:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-slate-900/80 text-white font-bold text-xs px-2.5 py-1 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
              >
                {targetClasses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Link
              href="/gradebook"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/25 hover:shadow-lg cursor-pointer"
            >
              <span>{t('navGradebook')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20 cursor-pointer"
            >
              <span>{t('navReports')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Student Enrollment by Gender */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('kpiTotalStudents')}</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-800">
              {totalSchoolStudents} <span className="text-xs font-normal text-slate-500">{t('studentCountUnit')}</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>{t('kpiFemaleStudents')}: <strong className="text-blue-700 font-bold">{totalFemaleStudents}</strong> {t('studentCountUnit')}</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                {femalePercentage}% {t('female')}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Teacher Workload Quota */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('kpiTeacherQuota')}</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-slate-800">
              17.2 <span className="text-xs font-normal text-slate-500">{t('hoursPerWeekUnit')}</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>{t('kpiMoEYSStandard')}: <strong>16-18h</strong></span>
              <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                {teachers.length} {t('kpiActiveTeachers')}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Daily Attendance Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('kpiAttendanceRate')}</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-emerald-600">
              {attendanceRate}%
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>{t('kpiPresentCount')}: <strong>{presentCount}/{classTotal}</strong></span>
              <span className="text-amber-600 font-bold text-[11px]">
                {t('kpiAbsentCount')}: {absentPermCount + absentNoPermCount}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: At-Risk & Dropout Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t('kpiAtRisk')}</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-black text-amber-600">
              {atRiskStudents.length} <span className="text-xs font-normal text-slate-500">{t('studentCountUnit')}</span>
            </div>
            <div className="mt-2 text-xs flex items-center justify-between text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span>{t('kpiAtRiskDesc')}</span>
              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                {t('kpiNeedsMonitoring')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Grade Distribution & Honor Roll */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Grade Benchmarks & Class Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grade Distribution Bar */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {t('gradeDistributionTitle')} ({currentClass?.name || t('selectClassLabel')})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('gradeDistributionDesc')}
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                {t('total')} {classTotal} ({t('female')} {classFemale})
              </span>
            </div>

            {/* Benchmarks Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 pt-2">
              {[
                { grade: 'A', labelKm: 'ល្អប្រសើរ (៨៥-១០០%)', labelEn: 'Excellent (85-100%)', count: gradeCounts.A, color: 'bg-emerald-600', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { grade: 'B', labelKm: 'ល្អណាស់ (៨០-៨៤%)', labelEn: 'Very Good (80-84%)', count: gradeCounts.B, color: 'bg-blue-600', text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
                { grade: 'C', labelKm: 'ល្អ (៧០-៧៩%)', labelEn: 'Good (70-79%)', count: gradeCounts.C, color: 'bg-sky-600', text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200' },
                { grade: 'D', labelKm: 'ល្អបង្គួរ (៦០-៦៩%)', labelEn: 'Fairly Good (60-69%)', count: gradeCounts.D, color: 'bg-amber-600', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
                { grade: 'E', labelKm: 'មធ្យម (៥០-៥៩%)', labelEn: 'Average (50-59%)', count: gradeCounts.E, color: 'bg-orange-600', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
                { grade: 'F', labelKm: 'ធ្លាក់ (ក្រោម ៥០%)', labelEn: 'Fail (<50%)', count: gradeCounts.F, color: 'bg-rose-600', text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
              ].map((b) => (
                <div key={b.grade} className={`${b.bg} ${b.border} border rounded-xl p-3 text-center transition-all hover:scale-102`}>
                  <div className={`text-lg font-black ${b.text}`}>
                    {language === 'km' ? `និទ្ទេស ${b.grade}` : `Grade ${b.grade}`}
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-1">
                    {b.count}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                    {language === 'km' ? b.labelKm : b.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* At-Risk Warning Callout */}
          {atRiskStudents.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-900">
                    {t('atRiskSectionTitle')}
                  </h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {t('atRiskSectionDesc')}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {atRiskStudents.map((r) => (
                  <div
                    key={r.student.studentNationalId}
                    className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{r.student.khmerName}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {r.student.studentNationalId} • {r.student.gender === 'FEMALE' ? t('female') : t('male')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold font-mono text-rose-600 block">
                        {r.rankInfo.averageScore.toFixed(2)}/100
                      </span>
                      <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded">
                        {language === 'km' ? r.rankInfo.letterGrade.labelKhmer : r.rankInfo.letterGrade.labelEnglish}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Top 5 Honor Roll */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {t('honorRollTitle')}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t('honorRollDesc')}
                </p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            {honorRollStudents.map((r, idx) => {
              const medals = ['🥇', '🥈', '🥉', '🏅', '🎖️'];
              return (
                <div
                  key={r.student.studentNationalId}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-200 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{medals[idx] || '⭐'}</span>
                    <div>
                      <div className="font-bold text-xs text-slate-800">
                        {r.student.khmerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.student.latinName} • {r.student.gender === 'FEMALE' ? t('female') : t('male')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black font-mono text-blue-700">
                      {r.rankInfo.averageScore.toFixed(2)}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {language === 'km' ? `និទ្ទេស ${r.rankInfo.letterGrade.letter}` : `Grade ${r.rankInfo.letterGrade.letter}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/reports"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t('tabHonorRoll')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
