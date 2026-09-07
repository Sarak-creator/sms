'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Save,
  Download,
  Search,
  Sparkles,
} from 'lucide-react';

export default function AttendancePage() {
  const {
    school,
    classes,
    accessibleClasses,
    canAccessClass,
    isTeacher,
    currentUser,
    selectedClassId,
    setSelectedClassId,
    students,
    attendance,
    updateAttendance,
    markAllPresent,
    exportToExcel,
    language,
    t,
  } = useSchool();

  const targetClasses = isTeacher ? accessibleClasses : classes;
  const currentClass =
    targetClasses.find((c) => c.id === selectedClassId) ||
    targetClasses[0] ||
    classes[0];

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // Filter students for current accessible class strictly
  const classStudents = students.filter(
    (s) => s.classId === (currentClass?.id || selectedClassId)
  );

  const filteredStudents = classStudents.filter(
    (s) =>
      s.khmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.latinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentNationalId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Statistics strictly for current class
  const classAttendanceValues = classStudents.map((s) => attendance[s.studentNationalId] || 'PRESENT');
  const presentCount = classAttendanceValues.filter((v) => v === 'PRESENT').length;
  const permCount = classAttendanceValues.filter((v) => v === 'ABSENT_PERMISSION').length;
  const noPermCount = classAttendanceValues.filter((v) => v === 'ABSENT_NO_PERMISSION').length;
  const lateCount = classAttendanceValues.filter((v) => v === 'LATE').length;

  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => {
      const status = attendance[s.studentNationalId] || 'PRESENT';
      const statusLabel =
        status === 'PRESENT'
          ? 'Present (P)'
          : status === 'ABSENT_PERMISSION'
          ? 'Excused (A/P)'
          : status === 'ABSENT_NO_PERMISSION'
          ? 'Unexcused (A/NP)'
          : 'Late (L)';

      return {
        'No.': s.rollNumber,
        'National ID': s.studentNationalId,
        'Khmer Name': s.khmerName,
        'Latin Name': s.latinName,
        'Gender': s.gender === 'FEMALE' ? 'F' : 'M',
        'Date': selectedDate,
        'Shift': currentClass.shift === 'MORNING' ? 'Morning' : 'Afternoon',
        'Attendance Status': statusLabel,
      };
    });

    exportToExcel(`MoEYS_Attendance_${currentClass.name}_${selectedDate}`, data);
  };

  const triggerSave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-5">
      {/* Teacher Scope Notice */}
      {isTeacher && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-[11px]">
              ✓
            </div>
            <div>
              <strong className="text-emerald-950 font-bold">
                {t('teacherScopeBadge')}: <span className="text-emerald-700 underline">{currentClass.name}</span>
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

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('attendanceHeaderTitle')}
            </h1>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-full">
              {language === 'km' ? 'កត់ត្រារហ័ស' : '1-Click Attendance'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('attendanceHeaderDesc')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={markAllPresent}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('markAllPresentButton')}</span>
          </button>
          <button
            onClick={triggerSave}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('save')}</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === 'km' ? 'ទិន្នន័យវត្តមានត្រូវបានកត់ត្រាជោគជ័យ!' : 'Attendance saved successfully!'}</span>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-700 uppercase">{t('presentStatus')}</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{presentCount}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            P
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-blue-700 uppercase">{t('absentPermStatus')}</div>
            <div className="text-2xl font-black text-blue-700 mt-1">{permCount}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            A/P
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-rose-700 uppercase">{t('absentNoPermStatus')}</div>
            <div className="text-2xl font-black text-rose-700 mt-1">{noPermCount}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            A/NP
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-700 uppercase">{t('lateStatus')}</div>
            <div className="text-2xl font-black text-amber-700 mt-1">{lateCount}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            L
          </div>
        </div>
      </div>

      {/* Date & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{t('attendanceDateLabel')}:</span>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">{t('selectClassLabel')}:</span>
            <select
              value={currentClass.id}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {targetClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
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

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-100 text-[11px] font-bold uppercase">
              <tr>
                <th className="p-3 w-12 text-center">{t('rollNoHeader')}</th>
                <th className="p-3 w-32">{t('studentIdHeader')}</th>
                <th className="p-3">{t('studentNameHeader')}</th>
                <th className="p-3 w-16 text-center">{t('genderHeader')}</th>
                <th className="p-3 w-80 text-center">{t('presentStatus')} / {t('absentPermStatus')}</th>
                <th className="p-3">{language === 'km' ? 'កំណត់សម្គាល់' : 'Notes & Remarks'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const status = attendance[s.studentNationalId] || 'PRESENT';

                return (
                  <tr
                    key={s.studentNationalId}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                    }`}
                  >
                    <td className="p-3 text-center font-mono font-bold text-slate-500">
                      {s.rollNumber}
                    </td>
                    <td className="p-3 font-mono text-slate-600 font-medium">
                      {s.studentNationalId}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">
                        {language === 'en' ? s.latinName : s.khmerName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {language === 'en' ? s.khmerName : s.latinName}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          s.gender === 'FEMALE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {s.gender === 'FEMALE' ? t('female') : t('male')}
                      </span>
                    </td>

                    {/* Status Button Toggles */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => updateAttendance(s.studentNationalId, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            status === 'PRESENT'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>P</span>
                        </button>

                        <button
                          onClick={() => updateAttendance(s.studentNationalId, 'ABSENT_PERMISSION')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            status === 'ABSENT_PERMISSION'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>A/P</span>
                        </button>

                        <button
                          onClick={() => updateAttendance(s.studentNationalId, 'ABSENT_NO_PERMISSION')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            status === 'ABSENT_NO_PERMISSION'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>A/NP</span>
                        </button>

                        <button
                          onClick={() => updateAttendance(s.studentNationalId, 'LATE')}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            status === 'LATE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>L</span>
                        </button>
                      </div>
                    </td>

                    <td className="p-3 text-slate-500 text-xs">
                      {status === 'ABSENT_PERMISSION' && (
                        <span className="text-blue-600 font-medium text-[11px]">
                          {language === 'km' ? 'មានលិខិតសុំច្បាប់ពីអាណាព្យាបាល' : 'Excused absence with guardian note'}
                        </span>
                      )}
                      {status === 'ABSENT_NO_PERMISSION' && (
                        <span className="text-rose-600 font-bold text-[11px]">
                          {language === 'km' ? 'ខកខានមិនបានជូនដំណឹង' : 'Unexcused / Truancy alert'}
                        </span>
                      )}
                      {status === 'LATE' && (
                        <span className="text-amber-600 font-medium text-[11px]">
                          {language === 'km' ? 'មកយឺត ១៥ នាទី' : 'Late arrival (15 mins)'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
