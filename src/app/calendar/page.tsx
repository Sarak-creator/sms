'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  CalendarX,
  Sparkles,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Info,
  CalendarDays,
  Award,
  SunMedium,
  PartyPopper,
  GraduationCap,
  Bell,
  BookOpen,
} from 'lucide-react';
import { useSchool } from '@/lib/stateContext';
import { HolidayData, HolidayType, OFFICIAL_CAMBODIA_HOLIDAYS_2024_2025 } from '@/lib/holidayData';

const KHMER_MONTH_NAMES = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const KHMER_DAY_NAMES = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

export default function CalendarPage() {
  const {
    holidays,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    school,
    language,
    currentUser,
    hasPermission,
  } = useSchool();

  // Selected date for viewing / grid
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  );

  // Filter & Search state
  const [typeFilter, setTypeFilter] = useState<'ALL' | HolidayType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<HolidayData, 'id'>>({
    titleKhmer: '',
    titleEnglish: '',
    dateFrom: '',
    dateTo: '',
    type: 'PUBLIC_HOLIDAY',
    isDayOff: true,
    description: '',
    academicYear: school.academicYear || '២០២៤ - ២០២៥',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDateStr(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    );
  };

  // Calendar Grid Days Calculation
  const calendarGrid = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      day: number;
      month: number;
      year: number;
      dateStr: string;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        month: prevM,
        year: prevY,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday =
        today.getFullYear() === currentYear &&
        today.getMonth() === currentMonth &&
        today.getDate() === d;
      days.push({
        day: d,
        month: currentMonth,
        year: currentYear,
        dateStr,
        isCurrentMonth: true,
        isToday,
      });
    }

    // Next month padding to fill rows of 7
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        month: nextM,
        year: nextY,
        dateStr,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Helper to test if holiday falls on a specific date string (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    return holidays.filter((h) => dateStr >= h.dateFrom && dateStr <= h.dateTo);
  };

  // Filtered list of holidays for display
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchKhmer = h.titleKhmer.toLowerCase().includes(q);
          const matchEng = (h.titleEnglish || '').toLowerCase().includes(q);
          const matchDesc = (h.description || '').toLowerCase().includes(q);
          if (!matchKhmer && !matchEng && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  }, [holidays, typeFilter, searchQuery]);

  // Calculate upcoming events and stats
  const stats = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const publicHolidaysCount = holidays.filter((h) => h.isDayOff).length;
    const examsCount = holidays.filter((h) => h.type === 'EXAM_PERIOD').length;
    const vacationsCount = holidays.filter((h) => h.type === 'VACATION').length;

    // Find next upcoming holiday / event
    const upcoming = holidays
      .filter((h) => h.dateTo >= todayStr)
      .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))[0];

    let daysUntilUpcoming: number | null = null;
    if (upcoming) {
      const upDate = new Date(upcoming.dateFrom);
      const diffTime = upDate.getTime() - new Date(todayStr).getTime();
      daysUntilUpcoming = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      publicHolidaysCount,
      examsCount,
      vacationsCount,
      upcoming,
      daysUntilUpcoming,
    };
  }, [holidays]);

  // Handle open Add Modal
  const handleOpenAdd = (prefillDate?: string) => {
    const defaultDate = prefillDate || `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    setEditingHoliday(null);
    setFormData({
      titleKhmer: '',
      titleEnglish: '',
      dateFrom: defaultDate,
      dateTo: defaultDate,
      type: 'PUBLIC_HOLIDAY',
      isDayOff: true,
      description: '',
      academicYear: school.academicYear || '២០២៤ - ២០២៥',
    });
    setModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (h: HolidayData) => {
    setEditingHoliday(h);
    setFormData({
      titleKhmer: h.titleKhmer,
      titleEnglish: h.titleEnglish || '',
      dateFrom: h.dateFrom,
      dateTo: h.dateTo,
      type: h.type,
      isDayOff: h.isDayOff,
      description: h.description || '',
      academicYear: h.academicYear || school.academicYear || '២០២៤ - ២០២៥',
    });
    setModalOpen(true);
  };

  // Handle Save
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleKhmer.trim() || !formData.dateFrom || !formData.dateTo) {
      alert('សូមបំពេញឈ្មោះ និងកាលបរិច្ឆេទឱ្យបានត្រឹមត្រូវ!');
      return;
    }

    if (formData.dateFrom > formData.dateTo) {
      alert('កាលបរិច្ឆេទចាប់ផ្តើមមិនអាចក្រោយកាលបរិច្ឆេទបញ្ចប់បានទេ!');
      return;
    }

    if (editingHoliday) {
      updateHoliday(editingHoliday.id, formData);
      showToast('កែប្រែព័ត៌មានថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍ជោគជ័យ!');
    } else {
      const newHoliday: HolidayData = {
        id: `hol-${Date.now()}`,
        ...formData,
      };
      addHoliday(newHoliday);
      showToast('បន្ថែមថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍ថ្មីបានជោគជ័យ!');
    }
    setModalOpen(false);
  };

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteHoliday(deleteConfirmId);
      setDeleteConfirmId(null);
      showToast('លុបថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍បានជោគជ័យ!');
    }
  };

  // Handle Reset to Default MoEYS Holidays
  const handleResetToMoEYS = () => {
    OFFICIAL_CAMBODIA_HOLIDAYS_2024_2025.forEach((h) => {
      addHoliday(h);
    });
    setResetConfirmOpen(false);
    showToast('ស្តារទិន្នន័យប្រតិទិន & ថ្ងៃឈប់សម្រាកស្តង់ដារ MoEYS ជោគជ័យ!');
  };

  // Type badge styling
  const getTypeBadge = (type: HolidayType, isDayOff: boolean) => {
    switch (type) {
      case 'PUBLIC_HOLIDAY':
        return (
          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold rounded-full flex items-center gap-1">
            <PartyPopper className="w-3 h-3" />
            <span>ថ្ងៃឈប់សម្រាកផ្លូវការ</span>
          </span>
        );
      case 'EXAM_PERIOD':
        return (
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-full flex items-center gap-1">
            <Award className="w-3 h-3" />
            <span>ការប្រឡងផ្លូវការ</span>
          </span>
        );
      case 'VACATION':
        return (
          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-bold rounded-full flex items-center gap-1">
            <SunMedium className="w-3 h-3" />
            <span>វិស្សមកាលសិក្សា</span>
          </span>
        );
      case 'ACADEMIC_EVENT':
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            <span>ព្រឹត្តិការណ៍ MoEYS</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-full">
            កម្មវិធីសាលា
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 🧭 Top Banner & Title */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">
              {language === 'km' ? 'ប្រតិទិន និងថ្ងៃឈប់សម្រាកផ្លូវការ' : 'Academic Calendar & Holidays'}
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-full">
              MoEYS Cambodia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            គ្រប់គ្រងថ្ងៃឈប់សម្រាកបុណ្យជាតិ ពិធីបុណ្យប្រពៃណី ការប្រឡងឆមាស និងវិស្សមកាលសិក្សាឆ្នាំ {school.academicYear || '២០២៤ - ២០២៥'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            title="ស្តារទិន្នន័យថ្ងៃឈប់សម្រាក MoEYS"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ស្តារទិន្នន័យ MoEYS</span>
          </button>

          <button
            onClick={() => handleOpenAdd()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍</span>
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold z-50 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 📊 KPI & Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Upcoming Holiday */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 rounded-2xl text-white shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>ព្រឹត្តិការណ៍បន្ទាប់</span>
            </span>
            {stats.daysUntilUpcoming !== null && (
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 font-mono font-bold text-[10px] rounded-md border border-amber-300/30">
                {stats.daysUntilUpcoming === 0
                  ? 'ថ្ងៃនេះ!'
                  : stats.daysUntilUpcoming > 0
                  ? `នៅសល់ ${stats.daysUntilUpcoming} ថ្ងៃ`
                  : 'បានកន្លងផុត'}
              </span>
            )}
          </div>

          <div className="mt-2 min-w-0">
            {stats.upcoming ? (
              <>
                <div className="font-bold text-xs text-white truncate">
                  {stats.upcoming.titleKhmer}
                </div>
                <div className="text-[10px] text-blue-200 font-mono mt-0.5">
                  {stats.upcoming.dateFrom} {stats.upcoming.dateFrom !== stats.upcoming.dateTo && `ដល់ ${stats.upcoming.dateTo}`}
                </div>
              </>
            ) : (
              <div className="text-xs text-slate-300 italic">គ្មានព្រឹត្តិការណ៍បន្ទាប់</div>
            )}
          </div>
        </div>

        {/* Total Public Holidays */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">ថ្ងៃឈប់សម្រាកផ្លូវការ</div>
            <div className="text-2xl font-black text-rose-600 font-mono mt-1">
              {stats.publicHolidaysCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">ទូទាំងប្រទេស (Public Days Off)</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <PartyPopper className="w-5 h-5" />
          </div>
        </div>

        {/* Exam Periods */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">សម័យប្រឡងផ្លូវការ</div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {stats.examsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">ឆមាសទី ១ & ឆមាសទី ២</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Vacations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">វិស្សមកាលសិក្សា</div>
            <div className="text-2xl font-black text-sky-600 font-mono mt-1">
              {stats.vacationsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">វិស្សមកាលតូច & ធំ</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <SunMedium className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Interactive Grid & List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 🗓️ Left Column: Interactive Month Calendar (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          {/* Calendar Month Header & Navigation */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-slate-900">
                ខែ{KHMER_MONTH_NAMES[currentMonth]} ឆ្នាំ {currentYear}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                ថ្ងៃនេះ (Today)
              </button>
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="ខែមុន"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="ខែបន្ទាប់"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of the Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 py-1">
            {KHMER_DAY_NAMES.map((d, i) => (
              <div key={d} className={`py-1 ${i === 0 ? 'text-rose-500' : ''}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 35 or 42 Days Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((item, idx) => {
              const dayEvents = getEventsForDate(item.dateStr);
              const hasHoliday = dayEvents.some((e) => e.isDayOff);
              const hasExam = dayEvents.some((e) => e.type === 'EXAM_PERIOD');
              const hasVacation = dayEvents.some((e) => e.type === 'VACATION');
              const isSelected = item.dateStr === selectedDateStr;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(item.dateStr)}
                  className={`min-h-[72px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    !item.isCurrentMonth
                      ? 'bg-slate-50/50 border-slate-100 text-slate-400 opacity-60'
                      : isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30'
                      : item.isToday
                      ? 'bg-amber-50/60 border-amber-300'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        item.isToday
                          ? 'bg-blue-600 text-white shadow-xs'
                          : idx % 7 === 0
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.day}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="w-2 h-2 rounded-full shrink-0 bg-blue-600 animate-pulse"></span>
                    )}
                  </div>

                  {/* Badges / event indicators on day */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-bold truncate px-1 py-0.5 rounded leading-tight ${
                          ev.type === 'PUBLIC_HOLIDAY'
                            ? 'bg-rose-100 text-rose-800'
                            : ev.type === 'EXAM_PERIOD'
                            ? 'bg-amber-100 text-amber-900'
                            : ev.type === 'VACATION'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                        title={ev.titleKhmer}
                      >
                        {ev.titleKhmer}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-slate-500 font-bold px-1">
                        +{dayEvents.length - 2} ទៀត
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Detail Box */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>កាលបរិច្ឆេទដែលបានជ្រើសរើស៖ <span className="font-mono text-blue-700">{selectedDateStr}</span></span>
              </div>
              <div className="text-slate-600 text-[11px] mt-0.5">
                {getEventsForDate(selectedDateStr).length > 0 ? (
                  <span>
                    មានព្រឹត្តិការណ៍ {getEventsForDate(selectedDateStr).length}៖{' '}
                    <strong>{getEventsForDate(selectedDateStr).map((e) => e.titleKhmer).join(', ')}</strong>
                  </span>
                ) : (
                  <span>មិនមានថ្ងៃឈប់សម្រាក ឬព្រឹត្តិការណ៍ក្នុងថ្ងៃនេះឡើយ</span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleOpenAdd(selectedDateStr)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ថែមក្នុងថ្ងៃនេះ</span>
            </button>
          </div>
        </div>

        {/* 📋 Right Column: Filterable Chronological Events List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>បញ្ជីថ្ងៃឈប់សម្រាក & ព្រឹត្តិការណ៍ MoEYS</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredHolidays.length} ព្រឹត្តិការណ៍
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
              {[
                { label: 'ទាំងអស់', val: 'ALL' },
                { label: 'ថ្ងៃឈប់ផ្លូវការ', val: 'PUBLIC_HOLIDAY' },
                { label: 'ការប្រឡង', val: 'EXAM_PERIOD' },
                { label: 'វិស្សមកាល', val: 'VACATION' },
                { label: 'ព្រឹត្តិការណ៍', val: 'ACADEMIC_EVENT' },
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setTypeFilter(tab.val as any)}
                  className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    typeFilter === tab.val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកថ្ងៃបុណ្យ ឬការប្រឡង..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Scrollable Holiday Items List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ
                </div>
              ) : (
                filteredHolidays.map((h) => {
                  const isMultiDay = h.dateFrom !== h.dateTo;
                  return (
                    <div
                      key={h.id}
                      className="p-3 bg-slate-50 hover:bg-blue-50/40 border border-slate-200/90 rounded-xl transition-all space-y-1.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {getTypeBadge(h.type, h.isDayOff)}
                            {h.isDayOff && (
                              <span className="px-1.5 py-0.2 bg-rose-100 text-rose-800 text-[9px] font-bold rounded">
                                ឈប់សម្រាក
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 leading-snug">
                            {h.titleKhmer}
                          </h4>
                          {h.titleEnglish && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              {h.titleEnglish}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={() => handleOpenEdit(h)}
                            className="p-1 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                            title="កែប្រែ"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(h.id)}
                            className="p-1 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                            title="លុប"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Date details & description */}
                      <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1 font-mono font-bold text-blue-900">
                          <CalendarIcon className="w-3 h-3 text-blue-600" />
                          <span>
                            {h.dateFrom} {isMultiDay && `~ ${h.dateTo}`}
                          </span>
                        </div>
                        {h.description && (
                          <span className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {h.description}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📝 Modal: Add / Edit Holiday */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  {editingHoliday ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <h3 className="font-black text-slate-900 text-sm">
                  {editingHoliday ? 'កែប្រែព័ត៌មានថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍' : 'បន្ថែមថ្ងៃឈប់សម្រាក/ព្រឹត្តិការណ៍ថ្មី'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ឈ្មោះថ្ងៃឈប់សម្រាក / កម្មវិធី (ភាសាខ្មែរ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.titleKhmer}
                  onChange={(e) => setFormData({ ...formData, titleKhmer: e.target.value })}
                  placeholder="ឧ. ពិធីបុណ្យចូលឆ្នាំខ្មែរ ប្រពៃណីជាតិ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ឈ្មោះជាភាសាអង់គ្លេស (English Title)
                </label>
                <input
                  type="text"
                  value={formData.titleEnglish}
                  onChange={(e) => setFormData({ ...formData, titleEnglish: e.target.value })}
                  placeholder="e.g. Khmer New Year Festival"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ចាប់ពីថ្ងៃ (Date From) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateFrom}
                    onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ដល់ថ្ងៃ (Date To) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateTo}
                    onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ប្រភេទព្រឹត្តិការណ៍
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as HolidayType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PUBLIC_HOLIDAY">ថ្ងៃឈប់សម្រាកផ្លូវការ (Public Holiday)</option>
                    <option value="EXAM_PERIOD">សម័យប្រឡងផ្លូវការ (Exam Period)</option>
                    <option value="VACATION">វិស្សមកាលសិក្សា (Vacation)</option>
                    <option value="ACADEMIC_EVENT">ប្រតិទិន MoEYS (Academic Event)</option>
                    <option value="SCHOOL_EVENT">កម្មវិធីសាលារៀន (School Event)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ស្ថានភាពឈប់សម្រាក
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isDayOff}
                        onChange={(e) => setFormData({ ...formData, isDayOff: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                    <span className="font-bold text-slate-700">
                      {formData.isDayOff ? 'ឈប់សម្រាក (Day Off)' : 'ចូលរៀនធម្មតា'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ការពិពណ៌នាបន្ថែម
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ព័ត៌មានលម្អិត ឬសេចក្តីជូនដំណឹង..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  រក្សាទុកក្នុង Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ⚠️ Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0 font-bold">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">បញ្ជាក់ការលុបថ្ងៃឈប់សម្រាក</h3>
                <p className="text-xs text-slate-500">តើអ្នកពិតជាចង់លុបទិន្នន័យនេះចេញពីប្រព័ន្ធមែនទេ?</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer font-bold"
              >
                យល់ព្រម លុប
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔄 Reset to MoEYS Default Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">ស្តារថ្ងៃឈប់សម្រាកផ្លូវការ MoEYS</h3>
                <p className="text-xs text-slate-500">បញ្ចូលទិន្នន័យបុណ្យជាតិ និងប្រតិទិនសិក្សា MoEYS ២០២៤-២០២៥</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              ដំណើរការនេះនឹងបញ្ចូលថ្ងៃឈប់សម្រាកផ្លូវការទាំងអស់របស់កម្ពុជា (ចូលឆ្នាំខ្មែរ, ភ្ជុំបិណ្ឌ, អុំទូក, ឯករាជ្យជាតិ, សម័យប្រឡងឆមាស និងវិស្សមកាល) ទៅកាន់ Database Supabase។
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                បោះបង់
              </button>
              <button
                onClick={handleResetToMoEYS}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer font-bold"
              >
                យល់ព្រម ស្តារទិន្នន័យ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
