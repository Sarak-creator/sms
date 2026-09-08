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
  ChevronDown,
  RefreshCw,
  Moon,
  Layers,
} from 'lucide-react';
import { useSchool } from '@/lib/stateContext';
import {
  HolidayData,
  HolidayType,
  toKhmerNumber,
  getBuddhistYear,
  formatAcademicYear,
  generateCambodiaHolidaysForYear,
} from '@/lib/holidayData';

const KHMER_MONTH_NAMES = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
];

const KHMER_DAY_NAMES = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032];

export default function CalendarPage() {
  const {
    holidays,
    addHoliday,
    bulkAddHolidays,
    updateHoliday,
    deleteHoliday,
    autoUpdateHolidaysForYear,
    autoUpdateHolidaysThisAndNextYears,
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
  const [yearFilter, setYearFilter] = useState<'ALL' | 'VIEW_YEAR' | number>('VIEW_YEAR');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [autoUpdateModalOpen, setAutoUpdateModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayData | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isUpdatingHolidays, setIsUpdatingHolidays] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Omit<HolidayData, 'id'>>({
    titleKhmer: '',
    titleEnglish: '',
    dateFrom: '',
    dateTo: '',
    type: 'PUBLIC_HOLIDAY',
    isDayOff: true,
    description: '',
    academicYear: school.academicYear || formatAcademicYear(today.getFullYear()),
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Month & Year navigation
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
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    );
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    setSelectedDateStr(`${year}-${String(currentMonth + 1).padStart(2, '0')}-01`);
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
    setSelectedDateStr(`${currentYear}-${String(month + 1).padStart(2, '0')}-01`);
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

  // Count holidays in the currently viewed year
  const currentViewYearHolidaysCount = useMemo(() => {
    return holidays.filter((h) => h.dateFrom.startsWith(String(currentYear))).length;
  }, [holidays, currentYear]);

  // Filtered list of holidays for display
  const filteredHolidays = useMemo(() => {
    return holidays
      .filter((h) => {
        // Year filter
        if (yearFilter === 'VIEW_YEAR') {
          if (!h.dateFrom.startsWith(String(currentYear))) return false;
        } else if (typeof yearFilter === 'number') {
          if (!h.dateFrom.startsWith(String(yearFilter))) return false;
        }

        // Type filter
        if (typeFilter !== 'ALL' && h.type !== typeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchKhmer = h.titleKhmer.toLowerCase().includes(q);
          const matchEng = (h.titleEnglish || '').toLowerCase().includes(q);
          const matchDesc = (h.description || '').toLowerCase().includes(q);
          const matchLunar = (h.lunarDetail || '').toLowerCase().includes(q);
          if (!matchKhmer && !matchEng && !matchDesc && !matchLunar) return false;
        }
        return true;
      })
      .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  }, [holidays, typeFilter, yearFilter, currentYear, searchQuery]);

  // Calculate upcoming events and stats
  const stats = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const yearPrefix = String(currentYear);
    const viewYearHolidays = holidays.filter((h) => h.dateFrom.startsWith(yearPrefix));

    const publicHolidaysCount = viewYearHolidays.filter((h) => h.isDayOff).length;
    const examsCount = viewYearHolidays.filter((h) => h.type === 'EXAM_PERIOD').length;
    const vacationsCount = viewYearHolidays.filter((h) => h.type === 'VACATION').length;

    // Find next upcoming holiday / event (from today)
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
  }, [holidays, currentYear]);

  // Auto-Update Action Handlers
  const handleAutoUpdateThisYear = () => {
    setIsUpdatingHolidays(true);
    const thisYear = new Date().getFullYear();
    const count = autoUpdateHolidaysForYear(thisYear);
    setIsUpdatingHolidays(false);
    setAutoUpdateModalOpen(false);
    showToast(`បានធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិនៃឆ្នាំ ${toKhmerNumber(thisYear)} ជោគជ័យ (${count} ព្រឹត្តិការណ៍ថ្មី)!`);
  };

  const handleAutoUpdateThisAndNextYears = () => {
    setIsUpdatingHolidays(true);
    const count = autoUpdateHolidaysThisAndNextYears();
    setIsUpdatingHolidays(false);
    setAutoUpdateModalOpen(false);
    const thisYear = new Date().getFullYear();
    showToast(`បានធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ ឆ្នាំ ${toKhmerNumber(thisYear)} និងបណ្តាឆ្នាំបន្ទាប់ជោគជ័យ (${count} ព្រឹត្តិការណ៍ថ្មី)!`);
  };

  const handleAutoUpdateCurrentViewYear = () => {
    setIsUpdatingHolidays(true);
    const count = autoUpdateHolidaysForYear(currentYear);
    setIsUpdatingHolidays(false);
    setAutoUpdateModalOpen(false);
    showToast(`បានបង្កើតថ្ងៃឈប់សម្រាក និងប្រតិទិន MoEYS ឆ្នាំ ${toKhmerNumber(currentYear)} ជោគជ័យ (${count} ព្រឹត្តិការណ៍)!`);
  };

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
      academicYear: school.academicYear || formatAcademicYear(currentYear),
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
      academicYear: h.academicYear || school.academicYear || formatAcademicYear(currentYear),
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
    const count = autoUpdateHolidaysThisAndNextYears();
    setResetConfirmOpen(false);
    showToast(`បានស្តារ និងធ្វើបច្ចុប្បន្នភាពទិន្នន័យប្រតិទិន MoEYS ជោគជ័យ (${count} ព្រឹត្តិការណ៍ថ្មី)!`);
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900">
              {language === 'km' ? 'ប្រតិទិន និងថ្ងៃឈប់សម្រាកផ្លូវការ' : 'Academic Calendar & Holidays'}
            </h1>
            <span className="px-2.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>MoEYS Cambodia • ស្វ័យប្រវត្តិ</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            គ្រប់គ្រងថ្ងៃឈប់សម្រាកបុណ្យជាតិ ពិធីបុណ្យប្រពៃណី ការប្រឡងឆមាស និងវិស្សមកាលសិក្សា ឆ្នាំ {toKhmerNumber(currentYear)} (ព.ស. {toKhmerNumber(getBuddhistYear(currentYear))})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* 🚀 Primary Auto-Update Button */}
          <button
            onClick={() => setAutoUpdateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
            title="ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិនៃថ្ងៃឈប់សម្រាកសម្រាប់ឆ្នាំនេះ និងឆ្នាំបន្ទាប់ៗ"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ</span>
          </button>

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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>បន្ថែមព្រឹត្តិការណ៍</span>
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
            <div className="text-xs font-bold text-slate-500">
              ថ្ងៃឈប់សម្រាកផ្លូវការ ({toKhmerNumber(currentYear)})
            </div>
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
            <div className="text-xs font-bold text-slate-500">
              សម័យប្រឡងផ្លូវការ ({toKhmerNumber(currentYear)})
            </div>
            <div className="text-2xl font-black text-amber-600 font-mono mt-1">
              {stats.examsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">ឆមាសទី១-២, ឌីប្លូម, បាក់ឌុប</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Vacations */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-500">
              វិស្សមកាលសិក្សា ({toKhmerNumber(currentYear)})
            </div>
            <div className="text-2xl font-black text-sky-600 font-mono mt-1">
              {stats.vacationsCount}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">វិស្សមកាលតូច & ធំ MoEYS</div>
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
          {/* Calendar Month & Year Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Month Dropdown */}
              <select
                value={currentMonth}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-900 font-black text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {KHMER_MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx}>
                    ខែ {name}
                  </option>
                ))}
              </select>

              {/* Year Dropdown with Buddhist Era */}
              <select
                value={currentYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-black text-sm rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    ឆ្នាំ {toKhmerNumber(y)} (ព.ស. {toKhmerNumber(getBuddhistYear(y))})
                  </option>
                ))}
              </select>

              {/* Holiday count badge for active year */}
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-100 text-slate-600 rounded-md">
                {currentViewYearHolidaysCount} ព្រឹត្តិការណ៍
              </span>
            </div>

            {/* Previous, Next, Today Buttons */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                ថ្ងៃនេះ
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

          {/* Missing Holidays Banner for selected year (Auto-generate suggestion) */}
          {currentViewYearHolidaysCount === 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ពុំទាន់មានទិន្នន័យថ្ងៃឈប់សម្រាកសម្រាប់ឆ្នាំ {toKhmerNumber(currentYear)} នៅឡើយទេ។</span>
              </div>
              <button
                onClick={handleAutoUpdateCurrentViewYear}
                disabled={isUpdatingHolidays}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors shrink-0 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>បង្កើតស្វ័យប្រវត្តិនៃឆ្នាំ {toKhmerNumber(currentYear)}</span>
              </button>
            </div>
          )}

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
                      className={`text-xs font-bold ${
                        item.isToday
                          ? 'w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]'
                          : hasHoliday
                          ? 'text-rose-600 font-black'
                          : 'text-slate-800'
                      }`}
                    >
                      {item.day}
                    </span>

                    {/* Dot badges */}
                    <div className="flex items-center gap-0.5">
                      {hasHoliday && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" title="ថ្ងៃឈប់សម្រាក" />}
                      {hasExam && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" title="សម័យប្រឡង" />}
                      {hasVacation && <div className="w-1.5 h-1.5 rounded-full bg-sky-500" title="វិស្សមកាល" />}
                    </div>
                  </div>

                  {/* Micro event badge preview inside calendar cell */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] px-1 py-0.2 rounded font-medium truncate leading-tight ${
                          ev.isDayOff
                            ? 'bg-rose-100/80 text-rose-800'
                            : ev.type === 'EXAM_PERIOD'
                            ? 'bg-amber-100/80 text-amber-800'
                            : ev.type === 'VACATION'
                            ? 'bg-sky-100/80 text-sky-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        title={ev.titleKhmer}
                      >
                        {ev.titleKhmer}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[8px] text-slate-400 font-mono">
                        +{dayEvents.length - 2} ទៀត
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Date Detail Drawer Bar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-slate-800">
                កាលបរិច្ឆេទជ្រើសរើស៖ <span className="font-mono text-blue-700 font-bold">{selectedDateStr}</span>
              </span>
              {getEventsForDate(selectedDateStr).length > 0 ? (
                <span className="text-[11px] text-slate-600">
                  (មាន {getEventsForDate(selectedDateStr).length} ព្រឹត្តិការណ៍)
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 italic">គ្មានកម្មវិធី ឬការឈប់សម្រាកទេ</span>
              )}
            </div>

            <button
              onClick={() => handleOpenAdd(selectedDateStr)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ថែមព្រឹត្តិការណ៍ក្នុងថ្ងៃនេះ</span>
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

            {/* Year Filter Quick Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
              <span className="text-[10px] text-slate-400 font-medium mr-1 flex items-center gap-0.5">
                <Layers className="w-3 h-3" />
                <span>ឆ្នាំ៖</span>
              </span>
              {[
                { label: `ឆ្នាំ ${toKhmerNumber(currentYear)}`, val: 'VIEW_YEAR' },
                { label: 'ឆ្នាំទាំងអស់', val: 'ALL' },
                { label: `${toKhmerNumber(2025)}`, val: 2025 },
                { label: `${toKhmerNumber(2026)}`, val: 2026 },
                { label: `${toKhmerNumber(2027)}`, val: 2027 },
              ].map((item) => (
                <button
                  key={String(item.val)}
                  onClick={() => setYearFilter(item.val as any)}
                  className={`px-2 py-0.5 rounded-md transition-colors shrink-0 cursor-pointer ${
                    yearFilter === item.val
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Category Filter Tabs */}
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
                      ? 'bg-slate-900 text-white shadow-xs'
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
                placeholder="ស្វែងរកថ្ងៃបុណ្យ ការប្រឡង ឬចន្ទគតិ..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            {/* Scrollable Holiday Items List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredHolidays.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs italic space-y-2">
                  <div>មិនមានទិន្នន័យត្រូវគ្នានឹងការស្វែងរកឡើយ</div>
                  <button
                    onClick={handleAutoUpdateCurrentViewYear}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ទាញយកទិន្នន័យស្វ័យប្រវត្តិនៃឆ្នាំ {toKhmerNumber(currentYear)}</span>
                  </button>
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
                            {h.lunarDetail && (
                              <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[9px] font-bold rounded border border-indigo-200/60 flex items-center gap-0.5">
                                <Moon className="w-2.5 h-2.5 text-indigo-500" />
                                <span>{h.lunarDetail}</span>
                              </span>
                            )}
                            {h.isAutoGenerated && (
                              <span className="px-1.5 py-0.2 bg-amber-50 text-amber-700 text-[9px] font-semibold rounded border border-amber-200/50">
                                MoEYS ស្វ័យប្រវត្តិ
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
                        {h.academicYear && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            ឆ្នាំសិក្សា {h.academicYear}
                          </span>
                        )}
                      </div>
                      {h.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 pt-0.5">
                          {h.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 Modal: Auto-Update Holidays (ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ) */}
      {autoUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    ធ្វើបច្ចុប្បន្នភាពថ្ងៃឈប់សម្រាក & ប្រតិទិន MoEYS ស្វ័យប្រវត្តិ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Continuous Cambodia Holiday & Academic Calendar Auto-Sync Engine
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 p-3 rounded-xl border border-blue-100">
              ប្រព័ន្ធនឹងគណនាថ្ងៃឈប់សម្រាកផ្លូវការរបស់កម្ពុជាទាំង ១១ ថ្ងៃ, ពិធីបុណ្យចន្ទគតិ (ចូលឆ្នាំខ្មែរ, វិសាខបូជា, ច្រត់ព្រះនង្គ័ល, ភ្ជុំបិណ្ឌ, អុំទូក) និងកាលវិភាគប្រឡង-វិស្សមកាល MoEYS ដោយស្វ័យប្រវត្តិ និងរក្សាទុកក្នុង Database។
            </p>

            {/* Action options */}
            <div className="space-y-2.5 pt-1">
              {/* Option 1: Current Year */}
              <button
                onClick={handleAutoUpdateThisYear}
                disabled={isUpdatingHolidays}
                className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                    <span>១. ធ្វើបច្ចុប្បន្នភាពស្វ័យប្រវត្តិ ឆ្នាំនេះ ({toKhmerNumber(today.getFullYear())})</span>
                    <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">ឆ្នាំបច្ចុប្បន្ន</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    បង្កើតទិន្នន័យបុណ្យជាតិ និងកាលវិភាគអប់រំសម្រាប់ឆ្នាំ {today.getFullYear()}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Option 2: This Year and Next Years (Continuous) */}
              <button
                onClick={handleAutoUpdateThisAndNextYears}
                disabled={isUpdatingHolidays}
                className="w-full p-3.5 rounded-2xl border-2 border-indigo-500/40 bg-indigo-50/30 hover:bg-indigo-50 hover:border-indigo-600 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="font-black text-xs text-indigo-950 group-hover:text-indigo-700 flex items-center gap-1.5">
                    <span>២. ធ្វើបច្ចុប្បន្នភាព ឆ្នាំនេះ និងបណ្តាឆ្នាំបន្ទាប់ (បន្តស្វ័យប្រវត្តិ)</span>
                    <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded">ណែនាំ</span>
                  </div>
                  <div className="text-[11px] text-indigo-700/80 mt-0.5">
                    គណនា និងរក្សាទុកសម្រាប់ឆ្នាំ {today.getFullYear()} ដល់ {today.getFullYear() + 2} (មិនបាច់ព្រួយបារម្ភពេលឆ្លងឆ្នាំថ្មី)
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              </button>

              {/* Option 3: Current Viewed Year (if different) */}
              {currentYear !== today.getFullYear() && (
                <button
                  onClick={handleAutoUpdateCurrentViewYear}
                  disabled={isUpdatingHolidays}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/60 transition-all flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-amber-800 flex items-center gap-1.5">
                      <span>៣. ធ្វើបច្ចុប្បន្នភាពឆ្នាំដែលកំពុងមើល ({toKhmerNumber(currentYear)})</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      បង្កើតទិន្នន័យសម្រាប់ប្រតិទិនឆ្នាំ {toKhmerNumber(currentYear)} (ព.ស. {toKhmerNumber(getBuddhistYear(currentYear))})
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAutoUpdateModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                បិទ
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
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
                <p className="text-xs text-slate-500">បញ្ចូលទិន្នន័យបុណ្យជាតិ និងប្រតិទិនសិក្សា MoEYS គ្រប់ឆ្នាំសិក្សា</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              ដំណើរការនេះនឹងបញ្ចូល និងធ្វើបច្ចុប្បន្នភាពថ្ងៃឈប់សម្រាកផ្លូវការទាំងអស់របស់កម្ពុជា (ចូលឆ្នាំខ្មែរ, ភ្ជុំបិណ្ឌ, អុំទូក, ឯករាជ្យជាតិ, វិសាខបូជា, ច្រត់ព្រះនង្គ័ល, សម័យប្រឡងឆមាស និងវិស្សមកាល) សម្រាប់ឆ្នាំនេះ និងបណ្តាឆ្នាំបន្ទាប់ទៅកាន់ Database Supabase។
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
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
