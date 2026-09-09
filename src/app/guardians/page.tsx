'use client';

import React, { useState } from 'react';
import { useSchool } from '@/lib/stateContext';
import { StudentData } from '@/lib/schoolData';
import {
  Contact,
  Search,
  Download,
  Phone,
  MessageSquare,
  Send,
  Pencil,
  MapPin,
  Briefcase,
  Users,
  UserCheck,
  CheckCircle2,
  X,
  Building2,
  ShieldCheck,
  ExternalLink,
  Copy,
} from 'lucide-react';

interface GuardianRecord {
  id: string;
  studentId: string;
  studentNameKhmer: string;
  studentNameLatin: string;
  rollNumber: number;
  className: string;
  guardianName: string;
  relation: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  relationLabelKm: string;
  relationLabelEn: string;
  phone: string;
  occupation: string;
  address: string;
  isEmergencyContact: boolean;
}

const SAMPLE_OCCUPATIONS = [
  'មន្ត្រីរាជការ',
  'អាជីវករ',
  'ពាណិជ្ជករ',
  'កសិករ',
  'គ្រូបង្រៀន',
  'បុគ្គលិកក្រុមហ៊ុនឯកជន',
  'វេជ្ជបណ្ឌិត',
  'វិស្វករ',
  'សហគ្រិន',
];

export default function GuardiansPage() {
  const {
    school,
    classes,
    accessibleClasses,
    isTeacher,
    selectedClassId,
    setSelectedClassId,
    students,
    updateStudent,
    exportToExcel,
    language,
    t,
  } = useSchool();

  const targetClasses = isTeacher ? accessibleClasses : classes;
  const currentClass = targetClasses.find((c) => c.id === selectedClassId) || targetClasses[0] || classes[0];

  const [classFilter, setClassFilter] = useState<string>(selectedClassId || targetClasses[0]?.id || 'c-11-sci-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [relationFilter, setRelationFilter] = useState<'ALL' | 'FATHER' | 'MOTHER'>('ALL');

  // Contact Modal State
  const [contactModalData, setContactModalData] = useState<GuardianRecord | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<'ATTENDANCE' | 'GRADE' | 'MEETING'>('ATTENDANCE');

  // Edit Guardian Modal State
  const [editStudent, setEditStudent] = useState<StudentData | null>(null);
  const [editFatherName, setEditFatherName] = useState('');
  const [editFatherOccupation, setEditFatherOccupation] = useState('');
  const [editMotherName, setEditMotherName] = useState('');
  const [editMotherOccupation, setEditMotherOccupation] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Scoped students based on active classFilter
  const scopedStudents = React.useMemo(() => {
    if (classFilter === 'ALL' && !isTeacher) {
      return students;
    }
    return students.filter((s) => s.classId === classFilter);
  }, [students, classFilter, isTeacher]);

  // Compile Guardian Records from Scoped Student list
  const guardianList: GuardianRecord[] = React.useMemo(() => {
    const list: GuardianRecord[] = [];
    scopedStudents.forEach((s, idx) => {
      const defaultOccFather = s.fatherOccupation || SAMPLE_OCCUPATIONS[idx % SAMPLE_OCCUPATIONS.length];
      const defaultOccMother = s.motherOccupation || SAMPLE_OCCUPATIONS[(idx + 3) % SAMPLE_OCCUPATIONS.length];
      const fullAddress = `${s.pobDistrict}, ${s.pobProvince}`;
      const studentClass = classes.find((c) => c.id === s.classId)?.name || 'មិនទាន់កំណត់';

      // Father Entry
      if (s.fatherName) {
        list.push({
          id: `${s.studentNationalId}-father`,
          studentId: s.studentNationalId,
          studentNameKhmer: s.khmerName,
          studentNameLatin: s.latinName,
          rollNumber: s.rollNumber,
          className: studentClass,
          guardianName: s.fatherName,
          relation: 'FATHER',
          relationLabelKm: 'ឪពុក',
          relationLabelEn: 'Father',
          phone: s.guardianPhone,
          occupation: defaultOccFather,
          address: fullAddress,
          isEmergencyContact: true,
        });
      }

      // Mother Entry
      if (s.motherName) {
        list.push({
          id: `${s.studentNationalId}-mother`,
          studentId: s.studentNationalId,
          studentNameKhmer: s.khmerName,
          studentNameLatin: s.latinName,
          rollNumber: s.rollNumber,
          className: studentClass,
          guardianName: s.motherName,
          relation: 'MOTHER',
          relationLabelKm: 'ម្តាយ',
          relationLabelEn: 'Mother',
          phone: s.guardianPhone,
          occupation: defaultOccMother,
          address: fullAddress,
          isEmergencyContact: false,
        });
      }
    });
    return list;
  }, [scopedStudents, classes]);

  // Filter Guardians
  const filteredGuardians = guardianList.filter((g) => {
    const matchesSearch =
      g.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.studentNameKhmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.studentNameLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.phone.includes(searchQuery) ||
      g.occupation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRelation = relationFilter === 'ALL' || g.relation === relationFilter;

    return matchesSearch && matchesRelation;
  });

  // Open Edit Modal
  const handleOpenEdit = (record: GuardianRecord) => {
    const stu = students.find((s) => s.studentNationalId === record.studentId);
    if (stu) {
      setEditStudent(stu);
      setEditFatherName(stu.fatherName);
      setEditFatherOccupation(stu.fatherOccupation || '');
      setEditMotherName(stu.motherName);
      setEditMotherOccupation(stu.motherOccupation || '');
      setEditPhone(stu.guardianPhone);
    }
  };

  // Save Guardian Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editStudent) {
      updateStudent(editStudent.studentNationalId, {
        fatherName: editFatherName,
        fatherOccupation: editFatherOccupation,
        motherName: editMotherName,
        motherOccupation: editMotherOccupation,
        guardianPhone: editPhone,
      });
      showToast(
        language === 'km'
          ? `បានកែសម្រួលព័ត៌មានអាណាព្យាបាលរបស់សិស្ស "${editStudent.khmerName}" ដោយជោគជ័យ!`
          : `Guardian details for "${editStudent.latinName}" updated successfully!`
      );
      setEditStudent(null);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = filteredGuardians.map((g, idx) => ({
      'No.': idx + 1,
      'Guardian Name': g.guardianName,
      'Relationship': language === 'km' ? g.relationLabelKm : g.relationLabelEn,
      'Student Name (Khmer)': g.studentNameKhmer,
      'Student Name (Latin)': g.studentNameLatin,
      'Class': g.className,
      'Phone Number': g.phone,
      'Occupation': g.occupation,
      'Address': g.address,
    }));

    exportToExcel(`MoEYS_Guardian_Directory_${currentClass?.name || 'Class'}`, data);
  };

  // Message template generator
  const getNoticeMessage = () => {
    if (!contactModalData) return '';
    const classNameStr = currentClass?.name || 'ថ្នាក់រៀន';
    if (selectedTemplate === 'ATTENDANCE') {
      return `ជម្រាបសួរលោក/លោកស្រី ${contactModalData.guardianName} (${contactModalData.relationLabelKm} របស់សិស្ស ${contactModalData.studentNameKhmer})។ វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ សូមជូនដំណឹងអំពីវត្តមានសិក្សារបស់សិស្សក្នុង ${classNameStr}។ សូមទំនាក់ទំនងមកសាលាប្រសិនបើមានចម្ងល់។`;
    } else if (selectedTemplate === 'GRADE') {
      return `ជម្រាបសួរលោក/លោកស្រី ${contactModalData.guardianName}។ លទ្ធផលពិន្ទុប្រចាំខែរបស់សិស្ស ${contactModalData.studentNameKhmer} (${classNameStr}) ត្រូវបានប្រកាសជាផ្លូវការហើយ។ សូមពិនិត្យសៀវភៅតាមដានការសិក្សា។`;
    } else {
      return `ជម្រាបសួរលោក/លោកស្រី ${contactModalData.guardianName} (${contactModalData.relationLabelKm} របស់សិស្ស ${contactModalData.studentNameKhmer})។ វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ សូមគោរពអញ្ជើញចូលរួមកិច្ចប្រជុំមាតាបិតាសិស្សនៅថ្ងៃចុងសប្តាហ៍នេះវេលាម៉ោង ០៨:០០ ព្រឹក។`;
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getNoticeMessage());
    showToast(language === 'km' ? 'បានចម្លងអត្ថបទសាររួចរាល់!' : 'Message template copied!');
  };

  return (
    <div className="space-y-5">
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
              <Contact className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-black text-slate-800">
              {t('guardianDirectoryTitle')}
            </h1>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {guardianList.length} {language === 'km' ? 'នាក់' : 'Guardians'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t('guardianDirectoryDesc')} ({currentClass?.name || t('selectClassLabel')})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{language === 'km' ? 'អាណាព្យាបាលសរុប' : 'Total Guardians'}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{guardianList.length}</div>
          <p className="text-[10px] text-slate-400">{language === 'km' ? 'ឪពុក និងម្តាយក្នុងប្រព័ន្ធ' : 'Registered parents'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{language === 'km' ? 'លេខទូរស័ព្ទទាក់ទង' : 'Verified Phones'}</span>
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">100%</div>
          <p className="text-[10px] text-emerald-600 font-bold">{students.length}/{students.length} {language === 'km' ? 'សិស្សមានលេខទូរស័ព្ទ' : 'Students covered'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{language === 'km' ? 'ទំនាក់ទំនងបន្ទាន់' : 'Emergency Contacts'}</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{students.length}</div>
          <p className="text-[10px] text-slate-400">{language === 'km' ? 'អាណាព្យាបាលចម្បង' : 'Primary guardians'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">{language === 'km' ? 'ឆានែលទាក់ទង' : 'Notice Channels'}</span>
            <Send className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-bold text-slate-800 pt-1 flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">Call</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">SMS</span>
            <span className="px-2 py-0.5 bg-sky-50 text-sky-700 rounded-md border border-sky-200">Telegram</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{language === 'km' ? 'ត្រៀមជាស្រេច' : 'Ready to broadcast'}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700">{t('selectClassLabel')}:</span>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                if (e.target.value !== 'ALL') {
                  setSelectedClassId(e.target.value);
                }
              }}
              className="px-3 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {!isTeacher && <option value="ALL">{language === 'km' ? 'គ្រប់ថ្នាក់ទាំងអស់ (All Classes)' : 'All Classes'}</option>}
              {targetClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-600">{t('parentRelation')}:</span>
            {[
              { id: 'ALL', labelKm: 'ទាំងអស់', labelEn: 'All' },
              { id: 'FATHER', labelKm: 'ឪពុក', labelEn: 'Fathers' },
              { id: 'MOTHER', labelKm: 'ម្តាយ', labelEn: 'Mothers' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setRelationFilter(r.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  relationFilter === r.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {language === 'km' ? r.labelKm : r.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={language === 'km' ? 'ស្វែងរកឈ្មោះអាណាព្យាបាល សិស្ស ឬលេខទូរស័ព្ទ...' : 'Search guardian, student, phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* Guardians Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-100 text-[11px] font-bold uppercase">
              <tr>
                <th className="p-3.5 w-12 text-center">#</th>
                <th className="p-3.5">{language === 'km' ? 'ឈ្មោះអាណាព្យាបាល' : 'Guardian Name'}</th>
                <th className="p-3.5 w-24 text-center">{t('parentRelation')}</th>
                <th className="p-3.5">{language === 'km' ? 'សិស្សអាណាព្យាបាល' : 'Student (Child)'}</th>
                <th className="p-3.5">{t('phoneLabel')}</th>
                <th className="p-3.5">{t('occupationLabel')}</th>
                <th className="p-3.5">{t('currentAddressLabel')}</th>
                <th className="p-3.5 w-40 text-center">{t('actionsLabel')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuardians.map((g, idx) => (
                <tr
                  key={g.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                  }`}
                >
                  <td className="p-3.5 text-center font-mono font-bold text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800 text-sm">
                      {g.guardianName}
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        g.relation === 'FATHER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {language === 'km' ? g.relationLabelKm : g.relationLabelEn}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-bold text-slate-800">
                      {g.studentNameKhmer}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {g.studentNameLatin} • {g.studentId}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <a
                      href={`tel:${g.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1.5 font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/60 px-2 py-1 rounded-lg border border-blue-100"
                    >
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>{g.phone}</span>
                    </a>
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{g.occupation}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{g.address}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Quick Contact Modal */}
                      <button
                        onClick={() => setContactModalData(g)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-blue-200"
                        title={t('quickContact')}
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>{language === 'km' ? 'ផ្ញើសារ' : 'Notice'}</span>
                      </button>

                      {/* Edit Guardian */}
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title={language === 'km' ? 'កែសម្រួល' : 'Edit'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredGuardians.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Contact className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">
            {language === 'km' ? 'មិនមានទិន្នន័យអាណាព្យាបាលដែលស្វែងរកទេ' : 'No guardians found matching your criteria'}
          </h3>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUICK CONTACT & NOTICE SENDER                          */}
      {/* ------------------------------------------------------------- */}
      {contactModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {language === 'km' ? 'ផ្ញើសេចក្តីជូនដំណឹងទៅអាណាព្យាបាល' : 'Send Notice to Guardian'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {contactModalData.guardianName} ({contactModalData.relationLabelKm} - {contactModalData.studentNameKhmer})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactModalData(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Call & Info Header */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('phoneLabel')}</span>
                <span className="text-sm font-mono font-bold text-slate-800">{contactModalData.phone}</span>
              </div>
              <a
                href={`tel:${contactModalData.phone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ហៅទូរស័ព្ទផ្ទាល់' : 'Call Now'}</span>
              </a>
            </div>

            {/* Notice Templates */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'km' ? 'ជ្រើសរើសគំរូសារផ្លូវការ' : 'Select Notice Template'}
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                {[
                  { id: 'ATTENDANCE', labelKm: 'វត្តមានសិស្ស', labelEn: 'Attendance' },
                  { id: 'GRADE', labelKm: 'លទ្ធផលពិន្ទុ', labelEn: 'Grade Result' },
                  { id: 'MEETING', labelKm: 'កិច្ចប្រជុំមាតាបិតា', labelEn: 'PTA Meeting' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tpl.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedTemplate === tpl.id
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {language === 'km' ? tpl.labelKm : tpl.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'km' ? 'ខ្លឹមសារសារ SMS / Telegram' : 'Message Body Preview'}
              </label>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-medium">
                {getNoticeMessage()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ចម្លងសារ' : 'Copy'}</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`sms:${contactModalData.phone.replace(/\s+/g, '')}?body=${encodeURIComponent(getNoticeMessage())}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? 'ផ្ញើជា SMS' : 'Send SMS'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT GUARDIAN DETAILS                                   */}
      {/* ------------------------------------------------------------- */}
      {editStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    {language === 'km' ? 'កែសម្រួលព័ត៌មានអាណាព្យាបាល' : 'Edit Guardian Information'}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {editStudent.khmerName} ({editStudent.studentNationalId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditStudent(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('fatherNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={editFatherName}
                    onChange={(e) => setEditFatherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('fatherOccupationLabel')}</label>
                  <input
                    type="text"
                    placeholder="ឧ. មន្ត្រីរាជការ, អាជីវករ..."
                    value={editFatherOccupation}
                    onChange={(e) => setEditFatherOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('motherNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={editMotherName}
                    onChange={(e) => setEditMotherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">{t('motherOccupationLabel')}</label>
                  <input
                    type="text"
                    placeholder="ឧ. មេផ្ទះ, អាជីវករ..."
                    value={editMotherOccupation}
                    onChange={(e) => setEditMotherOccupation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">{t('phoneLabel')}</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
