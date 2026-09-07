'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import { ChapterData } from '@/lib/schoolData';
import {
  Bookmark,
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Clock,
  Layers,
  Sparkles,
  FileText,
  Calendar,
} from 'lucide-react';

const EMPTY_CHAPTER_FORM: ChapterData = {
  id: '',
  chapterNumber: 1,
  titleKhmer: '',
  titleEnglish: '',
  subjectCode: 'MATH',
  subjectName: 'គណិតវិទ្យា',
  gradeLevel: 'GRADE_11',
  semester: 1,
  totalLessons: 4,
  totalTeachingHours: 16,
  description: '',
};

import { AccessDenied } from '@/components/AccessDenied';

export default function ChaptersPage() {
  const {
    school,
    chapters,
    addChapter,
    updateChapter,
    deleteChapter,
    specializations,
    canAccessRoute,
    language,
    t,
  } = useSchool();

  if (!canAccessRoute('/chapters')) {
    return <AccessDenied />;
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');

  // Modal State for Add & Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [formData, setFormData] = useState<ChapterData>(EMPTY_CHAPTER_FORM);
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<ChapterData | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter chapters
  const filteredChapters = chapters.filter((chap) => {
    const matchesSearch =
      chap.titleKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chap.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = subjectFilter === 'ALL' || chap.subjectCode === subjectFilter;
    const matchesGrade = gradeFilter === 'ALL' || chap.gradeLevel === gradeFilter;
    const matchesSemester = semesterFilter === 'ALL' || String(chap.semester) === semesterFilter;

    return matchesSearch && matchesSubject && matchesGrade && matchesSemester;
  });

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('ADD');
    const defaultSpec = specializations[0] || { code: 'MATH', nameKhmer: 'គណិតវិទ្យា' };
    const nextChapterNum =
      chapters.filter((c) => c.subjectCode === defaultSpec.code && c.gradeLevel === 'GRADE_11').length + 1;

    setFormData({
      ...EMPTY_CHAPTER_FORM,
      id: `ch-${defaultSpec.code.toLowerCase()}-${Date.now()}`,
      chapterNumber: nextChapterNum,
      subjectCode: defaultSpec.code,
      subjectName: defaultSpec.nameKhmer,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (chap: ChapterData) => {
    setModalMode('EDIT');
    setFormData({ ...chap });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle Subject Select Change
  const handleSubjectChange = (code: string) => {
    const found = specializations.find((s) => s.code === code);
    setFormData((prev) => ({
      ...prev,
      subjectCode: code,
      subjectName: found ? found.nameKhmer : code,
    }));
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleKhmer.trim()) {
      setFormError(language === 'km' ? 'សូមបញ្ចូលចំណងជើងជំពូក!' : 'Please enter chapter title!');
      return;
    }

    if (modalMode === 'ADD') {
      const uniqueId = `ch-${formData.subjectCode.toLowerCase()}-${Date.now()}`;
      addChapter({
        ...formData,
        id: uniqueId,
      });
      showToast(
        language === 'km'
          ? `បានបន្ថែមជំពូក "${formData.titleKhmer}" ដោយជោគជ័យ!`
          : `Chapter "${formData.titleEnglish || formData.titleKhmer}" added successfully!`
      );
    } else {
      updateChapter(formData.id, formData);
      showToast(
        language === 'km'
          ? `បានកែសម្រួលជំពូក "${formData.titleKhmer}" ដោយជោគជ័យ!`
          : `Chapter "${formData.titleEnglish || formData.titleKhmer}" updated successfully!`
      );
    }

    setIsModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteChapter(deleteTarget.id);
      showToast(
        language === 'km'
          ? `បានលុបជំពូក "${deleteTarget.titleKhmer}" ចេញពីកម្មវិធីសិក្សា!`
          : `Chapter "${deleteTarget.titleEnglish || deleteTarget.titleKhmer}" removed!`
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
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('chaptersTitle')}
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {chapters.length} {language === 'km' ? 'ជំពូក' : 'Chapters'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('chaptersDesc')}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addChapter')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'មុខវិជ្ជា:' : 'Subject:'}</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('all')}</option>
              {specializations.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.nameKhmer} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Grade Level Filter */}
          <div className="ml-2 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{t('gradeLevelLabel')}:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('all')}</option>
              <option value="GRADE_10">ថ្នាក់ទី ១០</option>
              <option value="GRADE_11">ថ្នាក់ទី ១១</option>
              <option value="GRADE_12">ថ្នាក់ទី ១២</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="ml-2 flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{language === 'km' ? 'ឆមាស:' : 'Semester:'}</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">{t('all')}</option>
              <option value="1">{language === 'km' ? 'ឆមាសទី ១' : 'Semester 1'}</option>
              <option value="2">{language === 'km' ? 'ឆមាសទី ២' : 'Semester 2'}</option>
            </select>
          </div>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកជំពូក ឬខ្លឹមសារមេរៀន...' : 'Search chapter or content...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredChapters.map((chap) => {
          return (
            <div
              key={chap.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-600 text-white font-bold text-[10px] rounded-md shadow-xs">
                      {language === 'km' ? `ជំពូកទី ${chap.chapterNumber}` : `Chapter ${chap.chapterNumber}`}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded-md">
                      {chap.gradeLevel.replace('GRADE_', 'ថ្នាក់ទី ')}
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-[10px] rounded-md">
                      {chap.subjectName} ({chap.subjectCode})
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] rounded-md">
                      {language === 'km' ? `ឆមាសទី ${chap.semester}` : `Sem ${chap.semester}`}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-800 line-clamp-2">
                    {chap.titleKhmer}
                  </h3>
                  {chap.titleEnglish && (
                    <p className="text-xs text-slate-400 font-mono line-clamp-1 mt-0.5">
                      {chap.titleEnglish}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                {chap.description || 'កម្មវិធីសិក្សាស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា'}
              </p>

              {/* Stats Box */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('lessonsCountLabel')}:</span>
                  </span>
                  <strong className="font-bold text-slate-800 font-mono">{chap.totalLessons}</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'km' ? 'ម៉ោងបង្រៀន:' : 'Hours:'}</span>
                  </span>
                  <strong className="font-bold text-blue-700 font-mono">{chap.totalTeachingHours} ម៉</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(chap)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'កែសម្រួល' : 'Edit'}</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(chap)}
                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-200/60"
                  title={language === 'km' ? 'លុបជំពូក' : 'Delete'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredChapters.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យជំពូកដែលស្វែងរកទេ' : 'No chapters found'}
          </h3>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD / EDIT CHAPTER                                      */}
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
                        ? 'បន្ថែមជំពូកមេរៀនថ្មី'
                        : 'Add New Curriculum Chapter'
                      : language === 'km'
                      ? 'កែសម្រួលជំពូកមេរៀន'
                      : 'Edit Curriculum Chapter'}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Subject */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'មុខវិជ្ជា *' : 'Subject *'}
                  </label>
                  <select
                    value={formData.subjectCode}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {specializations.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.nameKhmer} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grade Level */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('gradeLevelLabel')}</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GRADE_10">ថ្នាក់ទី ១០</option>
                    <option value="GRADE_11">ថ្នាក់ទី ១១</option>
                    <option value="GRADE_12">ថ្នាក់ទី ១២</option>
                    <option value="GRADE_7">ថ្នាក់ទី ៧</option>
                    <option value="GRADE_8">ថ្នាក់ទី ៨</option>
                    <option value="GRADE_9">ថ្នាក់ទី ៩</option>
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ឆមាស' : 'Semester'}
                  </label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) as 1 | 2 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>{language === 'km' ? 'ឆមាសទី ១' : 'Semester 1'}</option>
                    <option value={2}>{language === 'km' ? 'ឆមាសទី ២' : 'Semester 2'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {/* Chapter Number */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('chapterNumberLabel')}</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={formData.chapterNumber}
                    onChange={(e) => setFormData({ ...formData, chapterNumber: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Khmer Chapter Title */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ចំណងជើងជំពូក (ខ្មែរ) *' : 'Chapter Title (Khmer) *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'km' ? 'ឧ. អនុគមន៍អិចស្ប៉ូណង់ស្យែល និងលោការីត' : 'e.g. Chapter title'}
                    value={formData.titleKhmer}
                    onChange={(e) => setFormData({ ...formData, titleKhmer: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* English Chapter Title */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {language === 'km' ? 'ចំណងជើងជាអង់គ្លេស' : 'Chapter Title (English)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Exponential and Logarithmic Functions"
                  value={formData.titleEnglish}
                  onChange={(e) => setFormData({ ...formData, titleEnglish: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Total Lessons */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('lessonsCountLabel')}</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formData.totalLessons}
                    onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Teaching Hours */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    {language === 'km' ? 'ម៉ោងបង្រៀនសរុប' : 'Total Hours'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.totalTeachingHours}
                    onChange={(e) => setFormData({ ...formData, totalTeachingHours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {language === 'km' ? 'គោលបំណង និងសេចក្តីសង្ខេបជំពូក' : 'Learning Outcomes & Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'km' ? 'សេចក្តីសង្ខេបចំណេះដឹង និងបំណិនដែលសិស្សទទួលបាន...' : 'Brief summary of concepts...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {modalMode === 'ADD'
                    ? language === 'km'
                      ? 'រក្សាទុកជំពូក'
                      : 'Save Chapter'
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
                {language === 'km' ? 'បញ្ជាក់ការលុបជំពូក' : 'Confirm Chapter Deletion'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបជំពូក "${deleteTarget.titleKhmer}" (${deleteTarget.subjectName}) ចេញពីកម្មវិធីសិក្សាមែនទេ?`
                  : `Are you sure you want to delete chapter "${deleteTarget.titleEnglish || deleteTarget.titleKhmer}" (${deleteTarget.subjectName})?`}
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
