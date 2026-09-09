'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Check,
  Building2,
  Calendar,
  Phone,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { useSchool } from '@/lib/stateContext';
import { StudentData } from '@/lib/schoolData';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number, updatedCount: number) => void;
  defaultClassId?: string;
}

export default function ImportStudentsModal({
  isOpen,
  onClose,
  onSuccess,
  defaultClassId,
}: ImportStudentsModalProps) {
  const { classes, students, bulkAddOrUpdateStudents, language, t } = useSchool();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedStudents, setParsedStudents] = useState<StudentData[]>([]);
  const [targetClassOverride, setTargetClassOverride] = useState<string>('AUTO');
  const [overwriteExisting, setOverwriteExisting] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  // Convert Excel serial date or date string to Date object
  const parseExcelDate = (val: any): Date => {
    if (!val) return new Date('2008-01-01');
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
      // Excel epoch starts 1899-12-30
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return isNaN(date.getTime()) ? new Date('2008-01-01') : date;
    }
    const str = String(val).trim();
    // Check for DD/MM/YYYY or DD-MM-YYYY
    const parts = str.split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        if (!isNaN(d.getTime())) return d;
      } else {
        // DD/MM/YYYY
        const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        if (!isNaN(d.getTime())) return d;
      }
    }
    const fallback = new Date(str);
    return isNaN(fallback.getTime()) ? new Date('2008-01-01') : fallback;
  };

  // Match class name or ID to an existing class
  const resolveClassId = (rawVal: any, fallbackId: string): string => {
    if (!rawVal) return fallbackId;
    const str = String(rawVal).trim().toLowerCase();
    const found = classes.find(
      (c) =>
        c.id.toLowerCase() === str ||
        c.name.toLowerCase() === str ||
        c.name.toLowerCase().includes(str) ||
        str.includes(c.name.toLowerCase())
    );
    return found ? found.id : fallbackId;
  };

  // Normalize column header keys
  const normalizeKey = (key: string): string => {
    return key.toLowerCase().replace(/[^a-z0-9\u1780-\u17ff]/g, '');
  };

  // Parse Excel buffer
  const processExcelBuffer = (buffer: ArrayBuffer, name: string) => {
    try {
      setErrorMsg('');
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawRows || rawRows.length === 0) {
        setErrorMsg(language === 'km' ? 'ឯកសារ Excel គ្មានទិន្នន័យសិស្សទេ!' : 'The selected Excel sheet is empty!');
        return;
      }

      const defaultClass = defaultClassId || (classes[0] ? classes[0].id : 'c-1-gen-a');

      const extractedList: StudentData[] = rawRows.map((row, idx) => {
        // Search fields across various possible header names
        const findVal = (...aliases: string[]): any => {
          for (const alias of aliases) {
            const normAlias = normalizeKey(alias);
            for (const key of Object.keys(row)) {
              if (normalizeKey(key) === normAlias || normalizeKey(key).includes(normAlias)) {
                if (row[key] !== undefined && row[key] !== '') {
                  return row[key];
                }
              }
            }
          }
          return '';
        };

        const nationalId =
          findVal('nationalid', 'studentnationalid', 'អត្តលេខ', 'អត្តលេខសិស្ស', 'id') ||
          `STU-IMP-${String(Date.now()).slice(-4)}-${String(idx + 1).padStart(3, '0')}`;

        const khmerName =
          findVal('khmername', 'គោត្តនាមនិងនាម', 'ឈ្មោះខ្មែរ', 'ឈ្មោះ', 'name', 'fullname') ||
          `សិស្សគំរូ ${idx + 1}`;

        const latinName =
          findVal('latinname', 'ឈ្មោះឡាតាំង', 'englishname') ||
          `STUDENT ${idx + 1}`;

        const genderRaw = String(findVal('gender', 'ភេទ', 'sex')).trim().toLowerCase();
        const gender: 'FEMALE' | 'MALE' =
          genderRaw.includes('ស្រី') || genderRaw === 'f' || genderRaw === 'female'
            ? 'FEMALE'
            : 'MALE';

        const dob = parseExcelDate(findVal('dob', 'dateofbirth', 'ថ្ងៃខែឆ្នាំកំណើត', 'កំណើត'));
        const pobProvince = findVal('pobprovince', 'province', 'ខេត្តកំណើត', 'រាជធានីខេត្តកំណើត') || 'រាជធានីភ្នំពេញ';
        const pobDistrict = findVal('pobdistrict', 'district', 'ស្រុកកំណើត', 'ស្រុកខណ្ឌកំណើត') || 'ស្រុក/ខណ្ឌគំរូ';

        const fatherName = findVal('fathername', 'father', 'ឈ្មោះឪពុក', 'ឪពុក') || '';
        const fatherOccupation = findVal('fatheroccupation', 'មុខរបរឪពុក') || '';
        const motherName = findVal('mothername', 'mother', 'ឈ្មោះម្តាយ', 'ម្តាយ') || '';
        const motherOccupation = findVal('motheroccupation', 'មុខរបរម្តាយ') || '';
        const guardianPhone = String(findVal('guardianphone', 'phone', 'លេខទូរស័ព្ទ', 'ទូរស័ព្ទ') || '');

        const rawClass = findVal('classroom', 'ថ្នាក់រៀន', 'ថ្នាក់', 'classid', 'class');
        const classId = resolveClassId(rawClass, defaultClass);

        const rollNumber = parseInt(findVal('no', 'rollnumber', 'លរ', 'លេខរៀង') || String(idx + 1), 10);

        return {
          studentNationalId: String(nationalId).trim(),
          khmerName: String(khmerName).trim(),
          latinName: String(latinName).trim(),
          gender,
          dob,
          pobProvince: String(pobProvince).trim(),
          pobDistrict: String(pobDistrict).trim(),
          fatherName: String(fatherName).trim(),
          fatherOccupation: String(fatherOccupation).trim(),
          motherName: String(motherName).trim(),
          motherOccupation: String(motherOccupation).trim(),
          guardianPhone: String(guardianPhone).trim(),
          classId,
          rollNumber: isNaN(rollNumber) ? idx + 1 : rollNumber,
        };
      });

      setFileName(name);
      setParsedStudents(extractedList);
    } catch (err: any) {
      console.error('Error parsing Excel:', err);
      setErrorMsg(
        language === 'km'
          ? `មានបញ្ហាក្នុងការអានឯកសារ Excel៖ ${err?.message || 'ទម្រង់មិនត្រឹមត្រូវ'}`
          : `Failed to read Excel file: ${err?.message || 'Invalid format'}`
      );
    }
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (buffer) {
          processExcelBuffer(buffer, selectedFile.name);
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const buffer = evt.target?.result as ArrayBuffer;
        if (buffer) {
          processExcelBuffer(buffer, droppedFile.name);
        }
      };
      reader.readAsArrayBuffer(droppedFile);
    }
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const sampleRows = [
      {
        'ល.រ (No.)': 1,
        'អត្តលេខសិស្ស (National ID)': 'STU-SAMPLE-001',
        'គោត្តនាម និងនាម (Khmer Name)': 'សុខ ពិសិដ្ឋ',
        'ឈ្មោះឡាតាំង (Latin Name)': 'SOK PISETH',
        'ភេទ (Gender)': 'ប្រុស (M)',
        'ថ្នាក់រៀន (Classroom)': classes[0]?.name || 'ថ្នាក់ទី ១ A',
        'ថ្ងៃខែឆ្នាំកំណើត (DOB)': '15/02/2008',
        'រាជធានី/ខេត្តកំណើត (POB Province)': 'រាជធានីភ្នំពេញ',
        'ស្រុក/ខណ្ឌកំណើត (POB District)': 'ខណ្ឌដូនពេញ',
        'ឈ្មោះឪពុក (Father Name)': 'សុខ សារ៉េត',
        'មុខរបរឪពុក (Father Occupation)': 'មន្ត្រីរាជការ',
        'ឈ្មោះម្តាយ (Mother Name)': 'ចាន់ ស្រីពៅ',
        'មុខរបរម្តាយ (Mother Occupation)': 'អាជីវករ',
        'លេខទូរស័ព្ទអាណាព្យាបាល (Guardian Phone)': '012 345 678',
      },
      {
        'ល.រ (No.)': 2,
        'អត្តលេខសិស្ស (National ID)': 'STU-SAMPLE-002',
        'គោត្តនាម និងនាម (Khmer Name)': 'កែវ ធីតា',
        'ឈ្មោះឡាតាំង (Latin Name)': 'KEO THIDA',
        'ភេទ (Gender)': 'ស្រី (F)',
        'ថ្នាក់រៀន (Classroom)': classes[0]?.name || 'ថ្នាក់ទី ១ A',
        'ថ្ងៃខែឆ្នាំកំណើត (DOB)': '20/06/2008',
        'រាជធានី/ខេត្តកំណើត (POB Province)': 'ខេត្តកណ្តាល',
        'ស្រុក/ខណ្ឌកំណើត (POB District)': 'ក្រុងតាខ្មៅ',
        'ឈ្មោះឪពុក (Father Name)': 'កែវ សុវណ្ណ',
        'មុខរបរឪពុក (Father Occupation)': 'គ្រូបង្រៀន',
        'ឈ្មោះម្តាយ (Mother Name)': 'ស៊ុន ផល្លា',
        'មុខរបរម្តាយ (Mother Occupation)': 'មេផ្ទះ',
        'លេខទូរស័ព្ទអាណាព្យាបាល (Guardian Phone)': '098 765 432',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    ws['!cols'] = [
      { wch: 10 },
      { wch: 22 },
      { wch: 25 },
      { wch: 22 },
      { wch: 12 },
      { wch: 20 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
      { wch: 22 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Import_Template');
    XLSX.writeFile(wb, 'MoEYS_Student_Import_Template.xlsx');
  };

  // Perform Final Import
  const handleConfirmImport = () => {
    if (parsedStudents.length === 0) return;
    setIsProcessing(true);

    try {
      // Apply target class override if specified
      const finalStudentsToImport = parsedStudents.map((s) => {
        if (targetClassOverride !== 'AUTO') {
          return { ...s, classId: targetClassOverride };
        }
        return s;
      });

      const result = bulkAddOrUpdateStudents(finalStudentsToImport, overwriteExisting);
      onSuccess(result.added, result.updated);
      onClose();
    } catch (err) {
      console.error('Import execution error:', err);
      setErrorMsg(language === 'km' ? 'មានបញ្ហាក្នុងការបញ្ចូលទិន្នន័យទៅកាន់ប្រព័ន្ធ!' : 'Failed to save imported records!');
    } finally {
      setIsProcessing(false);
    }
  };

  // Duplicate checks against current students
  const existingIds = new Set(students.map((s) => s.studentNationalId));
  const duplicateCount = parsedStudents.filter((s) => existingIds.has(s.studentNationalId)).length;
  const newCount = parsedStudents.length - duplicateCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800">
                {t('importExcelTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('importExcelDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
              title="Download Excel Template"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('downloadTemplate')}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
              <button
                onClick={() => setErrorMsg('')}
                className="text-rose-400 hover:text-rose-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* File Dropzone Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : file
                ? 'border-emerald-300 bg-emerald-50/30'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center gap-3 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-4 py-2 rounded-xl border border-emerald-300">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>{fileName}</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded text-emerald-800 font-semibold">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {language === 'km'
                      ? 'ចុចទីនេះ ឬទម្លាក់ឯកសារ Excel (.xlsx, .xls) នៅទីនេះ'
                      : 'Click to select or drag & drop Excel file (.xlsx, .xls) here'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {language === 'km'
                      ? 'គាំទ្រឯកសារបញ្ជីសិស្ស MoEYS ដែលមានព័ត៌មាន ឈ្មោះ ភេទ ថ្ងៃកំណើត ឪពុកម្តាយ និងមុខរបរ'
                      : 'Supports MoEYS student rosters with Name, Gender, DOB, Parent Names & Occupations'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Controls & Import Options */}
          {parsedStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              {/* Target Classroom Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('targetClassOption')}</span>
                </label>
                <select
                  value={targetClassOverride}
                  onChange={(e) => setTargetClassOverride(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                >
                  <option value="AUTO">{t('useExcelClass')}</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gradeLevel})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {targetClassOverride === 'AUTO'
                    ? language === 'km'
                      ? 'ប្រព័ន្ធនឹងផ្គូផ្គងថ្នាក់រៀនដោយស្វ័យប្រវត្តិតាមជួរឈរក្នុង Excel'
                      : 'System will match classroom per row from Excel'
                    : language === 'km'
                    ? 'សិស្សទាំងអស់ដែលនាំចូលនឹងត្រូវចាត់តាំងចូលថ្នាក់នេះ'
                    : 'All imported students will be placed in this class'}
                </p>
              </div>

              {/* Duplicate Handling */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('importOptions')}</span>
                </label>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="radio"
                      name="duplicateOption"
                      checked={overwriteExisting}
                      onChange={() => setOverwriteExisting(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t('updateExisting')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                    <input
                      type="radio"
                      name="duplicateOption"
                      checked={!overwriteExisting}
                      onChange={() => setOverwriteExisting(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{t('skipExisting')}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Data Preview Section */}
          {parsedStudents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{t('importPreviewTitle')}</span>
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded-md">
                    {parsedStudents.length} {t('studentCountUnit')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {language === 'km' ? 'សិស្សថ្មី' : 'New'}: {newCount}
                  </span>
                  {duplicateCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                      {language === 'km' ? 'សិស្សមានស្រាប់ (ID ស្ទួន)' : 'Existing (Duplicate ID)'}: {duplicateCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Scrollable Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-700 font-bold z-10">
                    <tr>
                      <th className="py-2.5 px-3">ល.រ</th>
                      <th className="py-2.5 px-3">អត្តលេខ</th>
                      <th className="py-2.5 px-3">គោត្តនាម-នាម</th>
                      <th className="py-2.5 px-3">ឈ្មោះឡាតាំង</th>
                      <th className="py-2.5 px-3">ភេទ</th>
                      <th className="py-2.5 px-3">ថ្ងៃកំណើត</th>
                      <th className="py-2.5 px-3">ឪពុក / មុខរបរ</th>
                      <th className="py-2.5 px-3">ម្តាយ / មុខរបរ</th>
                      <th className="py-2.5 px-3">ថ្នាក់រៀន</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedStudents.map((s, idx) => {
                      const isExisting = existingIds.has(s.studentNationalId);
                      const targetClass = classes.find(
                        (c) => c.id === (targetClassOverride === 'AUTO' ? s.classId : targetClassOverride)
                      );

                      return (
                        <tr
                          key={`${s.studentNationalId}-${idx}`}
                          className={`hover:bg-slate-50 transition-colors ${
                            isExisting ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">
                            {s.studentNationalId}
                            {isExisting && (
                              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] rounded font-bold">
                                {overwriteExisting ? 'Update' : 'Skip'}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800">{s.khmerName}</td>
                          <td className="py-2 px-3 text-slate-600 font-medium">{s.latinName}</td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                s.gender === 'FEMALE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {s.gender === 'FEMALE' ? 'ស្រី' : 'ប្រុស'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(s.dob).toLocaleDateString('en-GB')}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <div>{s.fatherName || '—'}</div>
                            {s.fatherOccupation && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                {s.fatherOccupation}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-slate-700">
                            <div>{s.motherName || '—'}</div>
                            {s.motherOccupation && (
                              <span className="text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
                                {s.motherOccupation}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {targetClass?.name || s.classId}
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

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500">
            {parsedStudents.length > 0 ? (
              <span>
                {language === 'km' ? 'សរុបទាំងអស់៖ ' : 'Total: '}
                <strong className="text-slate-800">{parsedStudents.length}</strong>{' '}
                {t('studentCountUnit')}
              </span>
            ) : (
              <span>{language === 'km' ? 'សូមជ្រើសរើសឯកសារ Excel ដើម្បីចាប់ផ្ដើម' : 'Select an Excel file to begin'}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer"
            >
              {t('close')}
            </button>
            <button
              onClick={handleConfirmImport}
              disabled={parsedStudents.length === 0 || isProcessing}
              className={`inline-flex items-center gap-2 px-5 py-2 text-white text-xs font-bold rounded-xl transition-all shadow-md ${
                parsedStudents.length === 0 || isProcessing
                  ? 'bg-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 cursor-pointer'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isProcessing
                  ? language === 'km'
                    ? 'កំពុងនាំចូល...'
                    : 'Importing...'
                  : language === 'km'
                  ? `នាំចូលសិស្ស (${parsedStudents.length}) នាក់`
                  : `Import (${parsedStudents.length}) Students`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
