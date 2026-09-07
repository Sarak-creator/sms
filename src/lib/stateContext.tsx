'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  ROLE_DEFAULT_PERMISSIONS,
  TeacherData,
  StudentData,
  SpecializationData,
  ChapterData,
  UserData,
  UserRole,
  SystemPermissions,
  SEED_SPECIALIZATIONS,
} from './schoolData';
import {
  CURRENT_SCHOOL,
  ClassRoom,
  SchoolInfo,
} from './mockData';
import {
  getSubjectRulesForClass,
  calculateSubjectSemesterScore,
  calculateSemesterResult,
  calculateAnnualResult,
  rankStudents,
  calculateMoEYSGrade,
  MoEYSGradeDetail,
  SubjectRuleDefinition,
  RankedStudent,
  SubjectSemesterInput,
  StudentRankInput,
} from './gradingEngine';
import { translations, Language, TranslationKey } from './translations';
import {
  AcademicMonthDef,
  MONTHLY_ACADEMIC_MONTHS,
  MonthlySubjectGroupDef,
  CompetencyColumnDef,
  MONTHLY_SUBJECT_GROUPS,
  ALL_COMPETENCY_COLUMNS,
  DomainGrades,
} from './monthlyGradebookData';
import {
  fetchAllDataFromSupabase,
  syncSchoolToSupabase,
  syncUserToSupabase,
  deleteUserFromSupabase,
  syncStudentToSupabase,
  deleteStudentFromSupabase,
  syncTeacherToSupabase,
  deleteTeacherFromSupabase,
  syncClassToSupabase,
  deleteClassFromSupabase,
  syncMonthlyScoreToSupabase,
  syncSemesterExamScoreToSupabase,
  syncAttendanceToSupabase,
  syncSpecializationToSupabase,
  deleteSpecializationFromSupabase,
  syncChapterToSupabase,
  deleteChapterFromSupabase,
  wipeAllSupabaseData,
} from './supabase/syncService';
import { isSupabaseConfigured } from './supabase/client';

export interface ScoreState {
  monthly: number[]; // 5 months per semester
  exam: number;
}

export interface StudentScoreRecord {
  student: StudentData;
  scoresBySubject: Record<string, ScoreState>;
  semester1Result: ReturnType<typeof calculateSemesterResult>;
  rankInfo: RankedStudent;
}

const EMPTY_USER: UserData = {
  id: '',
  username: '',
  email: '',
  khmerName: '',
  latinName: '',
  role: 'STAFF_VIEWER',
  status: 'INACTIVE',
  assignedClassIds: [],
  assignedSubjectCodes: [],
  permissions: ROLE_DEFAULT_PERMISSIONS.STAFF_VIEWER,
  avatarColor: 'from-blue-600 to-indigo-600',
};

interface SchoolContextType {
  school: SchoolInfo;
  updateSchool: (updated: Partial<SchoolInfo>) => void;
  academicMonths: AcademicMonthDef[];
  updateAcademicMonth: (index: number, updated: Partial<AcademicMonthDef>) => void;
  setMonthSemester: (index: number, semester: 1 | 2) => void;
  toggleMonthExamStatus: (index: number) => void;
  setMonthExamStatus: (index: number, isExam: boolean) => void;
  setAcademicMonths: (months: AcademicMonthDef[]) => void;
  classes: ClassRoom[];
  addClass: (newClass: ClassRoom) => void;
  updateClass: (classId: string, updated: Partial<ClassRoom>) => void;
  deleteClass: (classId: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedSemester: number;
  setSelectedSemester: (sem: number) => void;
  selectedSubjectCode: string;
  setSelectedSubjectCode: (code: string) => void;
  students: StudentData[];
  addStudent: (student: StudentData) => void;
  updateStudent: (studentNationalId: string, updated: Partial<StudentData>) => void;
  deleteStudent: (studentNationalId: string) => void;
  transferStudents: (studentIds: string[], targetClassId: string) => void;
  transferSingleStudent: (studentNationalId: string, targetClassId: string) => void;
  promoteStudents: (
    studentIds: string[],
    targetClassId: string,
    status?: 'PROMOTED' | 'RETAINED' | 'GRADUATED'
  ) => void;
  teachers: TeacherData[];
  addTeacher: (teacher: TeacherData) => void;
  updateTeacher: (civilServantId: string, updated: Partial<TeacherData>) => void;
  deleteTeacher: (civilServantId: string) => void;
  // Users & Permissions (RBAC) & Authentication
  users: UserData[];
  currentUser: UserData;
  setCurrentUser: (user: UserData) => void;
  switchUserRole: (userId: string) => void;
  addUser: (user: UserData) => void;
  updateUser: (userId: string, updated: Partial<UserData>) => void;
  deleteUser: (userId: string) => void;
  hasPermission: (permissionKey: keyof SystemPermissions) => boolean;
  isLoggedIn: boolean;
  login: (
    identifier: string,
    password?: string
  ) => { success: boolean; user?: UserData; error?: string };
  logout: () => void;
  // Class & Teacher Data Scope Access Control
  accessibleClasses: ClassRoom[];
  accessibleStudents: StudentData[];
  canAccessClass: (classId: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  isTeacher: boolean;
  isHomeroomTeacher: boolean;
  specializations: SpecializationData[];
  addSpecialization: (spec: SpecializationData) => void;
  updateSpecialization: (code: string, updated: Partial<SpecializationData>) => void;
  deleteSpecialization: (code: string) => void;
  // Subject alias methods
  addSubject: (spec: SpecializationData) => void;
  updateSubject: (code: string, updated: Partial<SpecializationData>) => void;
  deleteSubject: (code: string) => void;
  addSubjectRule: (rule: SubjectRuleDefinition) => void;
  updateSubjectRule: (code: string, updated: Partial<SubjectRuleDefinition>) => void;
  deleteSubjectRule: (code: string) => void;
  // Monthly Competency Subject Groups & Skills Management
  monthlySubjectGroups: MonthlySubjectGroupDef[];
  allCompetencyColumns: CompetencyColumnDef[];
  addSubjectGroup: (group: MonthlySubjectGroupDef) => void;
  updateSubjectGroup: (groupId: string, updated: Partial<MonthlySubjectGroupDef>) => void;
  deleteSubjectGroup: (groupId: string) => void;
  addSkillToGroup: (groupId: string, skill: CompetencyColumnDef) => void;
  updateSkillInGroup: (groupId: string, skillKey: string, updated: Partial<CompetencyColumnDef>) => void;
  deleteSkillFromGroup: (groupId: string, skillKey: string) => void;
  resetSubjectGroups: () => void;
  chapters: ChapterData[];
  addChapter: (chapter: ChapterData) => void;
  updateChapter: (id: string, updated: Partial<ChapterData>) => void;
  deleteChapter: (id: string) => void;
  subjectRules: SubjectRuleDefinition[];
  
  // Monthly Competency Scores Map
  monthlyScoresMap: Record<number, Record<string, Record<string, number>>>;
  updateMonthlyCompetencyScore: (monthIndex: number, studentId: string, colKey: string, score: number) => void;
  setMonthlyScoresMap: React.Dispatch<React.SetStateAction<Record<number, Record<string, Record<string, number>>>>>;

  // Semester Exam Scores Map (1 | 2 -> studentId -> subjectKey -> score)
  semesterExamScoresMap: Record<number, Record<string, Record<string, number>>>;
  updateSemesterExamScore: (semester: 1 | 2, studentId: string, subjectKey: string, score: number) => void;
  setSemesterExamScoresMap: React.Dispatch<React.SetStateAction<Record<number, Record<string, Record<string, number>>>>>;

  // Custom Domain Grades (1 | 2 -> studentId -> Partial<DomainGrades>)
  customDomainGradesMap: Record<number, Record<string, Partial<DomainGrades>>>;
  updateDomainGrade: (semester: 1 | 2, studentId: string, domain: keyof DomainGrades, grade: string) => void;

  // Annual Custom Domain Grades (studentId -> Partial<DomainGrades>)
  customAnnualDomainGradesMap: Record<string, Partial<DomainGrades>>;
  updateAnnualDomainGrade: (studentId: string, domain: keyof DomainGrades, grade: string) => void;

  // Semester Remarks Map (1 | 2 -> studentId -> remark)
  semesterRemarksMap: Record<number, Record<string, string>>;
  updateSemesterRemark: (semester: 1 | 2, studentId: string, remark: string) => void;

  // Annual Remarks Map (studentId -> remark)
  annualRemarksMap: Record<string, string>;
  updateAnnualRemark: (studentId: string, remark: string) => void;

  // Single-subject classical scores
  scores: Record<string, Record<string, ScoreState>>;
  updateScore: (studentId: string, subjectCode: string, type: 'monthly' | 'exam', monthIndex: number, value: number) => void;
  batchUpdateMonthlyScore: (subjectCode: string, monthIndex: number, studentScores: Record<string, number>) => void;
  
  // Attendance
  attendance: Record<string, 'PRESENT' | 'ABSENT_PERMISSION' | 'ABSENT_NO_PERMISSION' | 'LATE'>;
  updateAttendance: (studentId: string, status: 'PRESENT' | 'ABSENT_PERMISSION' | 'ABSENT_NO_PERMISSION' | 'LATE') => void;
  markAllPresent: () => void;
  
  // Computed Records
  computedStudentRecords: StudentScoreRecord[];
  
  // Localization / Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;

  // Responsive Sidebar Drawer
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  // Disabled / Inactive examined columns per classroom
  disabledColumnsMap: Record<string, string[]>;
  toggleColumnForClass: (classId: string, columnKey: string) => void;
  setDisabledColumnsForClass: (classId: string, columnKeys: string[]) => void;

  // Export & Print helper
  exportToExcel: (filename: string, tableData: any[]) => void;
  exportSystemData: () => any;
  importSystemData: (jsonData: any) => boolean;
  resetToDefaults: () => void;

  // Supabase Live Connection & Data Controls
  isSupabaseConnected: boolean;
  refreshFromSupabase: () => Promise<void>;
  clearAllTestData: () => Promise<void>;
}

const SchoolContext = createContext<SchoolContextType | null>(null);

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('km');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('MATH');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moeys_sms_lang') as Language | null;
      if (saved === 'km' || saved === 'en') {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moeys_sms_lang', lang);
    }
  };

  const t = (key: TranslationKey): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.km || key;
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [school, setSchool] = useState<SchoolInfo>(() => CURRENT_SCHOOL);
  const [academicMonths, setAcademicMonths] = useState<AcademicMonthDef[]>(() => MONTHLY_ACADEMIC_MONTHS);
  const [classes, setClasses] = useState<ClassRoom[]>(() => []);
  const [teachers, setTeachers] = useState<TeacherData[]>(() => []);
  const [users, setUsers] = useState<UserData[]>(() => []);
  const [currentUser, setCurrentUser] = useState<UserData>(() => EMPTY_USER);
  const [students, setStudents] = useState<StudentData[]>(() => []);
  const [specializations, setSpecializations] = useState<SpecializationData[]>(() => SEED_SPECIALIZATIONS);
  const [monthlySubjectGroups, setMonthlySubjectGroups] = useState<MonthlySubjectGroupDef[]>(() => MONTHLY_SUBJECT_GROUPS);
  const [chapters, setChapters] = useState<ChapterData[]>(() => []);
  const [scores, setScores] = useState<Record<string, Record<string, ScoreState>>>(() => ({}));
  const [attendance, setAttendance] = useState<Record<string, 'PRESENT' | 'ABSENT_PERMISSION' | 'ABSENT_NO_PERMISSION' | 'LATE'>>(() => ({}));
  const [disabledColumnsMap, setDisabledColumnsMap] = useState<Record<string, string[]>>({});

  // Monthly Competency Scores Map: monthIndex -> studentId -> { [colKey]: score }
  const [monthlyScoresMap, setMonthlyScoresMap] = useState<Record<number, Record<string, Record<string, number>>>>(
    () => ({})
  );

  // Semester Exam Scores Map: semester (1|2) -> studentId -> { [subjectKey]: score }
  const [semesterExamScoresMap, setSemesterExamScoresMap] = useState<Record<number, Record<string, Record<string, number>>>>(
    () => ({ 1: {}, 2: {} })
  );

  // Custom Domain Grades Map: semester (1|2) -> studentId -> Partial<DomainGrades>
  const [customDomainGradesMap, setCustomDomainGradesMap] = useState<Record<number, Record<string, Partial<DomainGrades>>>>(
    () => ({ 1: {}, 2: {} })
  );

  // Annual Custom Domain Grades Map: studentId -> Partial<DomainGrades>
  const [customAnnualDomainGradesMap, setCustomAnnualDomainGradesMap] = useState<Record<string, Partial<DomainGrades>>>(
    () => ({})
  );

  // Semester Remarks Map: semester (1|2) -> studentId -> string
  const [semesterRemarksMap, setSemesterRemarksMap] = useState<Record<number, Record<string, string>>>(
    () => ({ 1: {}, 2: {} })
  );

  // Annual Remarks Map: studentId -> string
  const [annualRemarksMap, setAnnualRemarksMap] = useState<Record<string, string>>(
    () => ({})
  );

  // Refresh and load all data from Supabase live database
  const refreshFromSupabase = async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const data = await fetchAllDataFromSupabase();
      if (data) {
        setIsSupabaseConnected(true);
        if (data.school) setSchool(data.school);
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('moeys_sms_current_user_id') : null;
          if (savedUserId) {
            const found = data.users.find((u) => u.id === savedUserId);
            if (found) setCurrentUser(found);
          }
        }
        if (data.classes) {
          setClasses(data.classes);
          if (data.classes.length > 0 && !selectedClassId) {
            setSelectedClassId(data.classes[0].id);
          }
        }
        if (data.teachers) setTeachers(data.teachers);
        if (data.students) setStudents(data.students);
        if (data.specializations && data.specializations.length > 0) setSpecializations(data.specializations);
        if (data.chapters) setChapters(data.chapters);
        if (data.monthlyScoresMap) setMonthlyScoresMap(data.monthlyScoresMap);
        if (data.semesterExamScoresMap) setSemesterExamScoresMap(data.semesterExamScoresMap);
        if (data.attendance) setAttendance(data.attendance);
      }
    } catch (err) {
      console.error('Error refreshing from Supabase:', err);
    }
  };

  useEffect(() => {
    refreshFromSupabase();
  }, []);

  const clearAllTestData = async () => {
    try {
      await wipeAllSupabaseData();
    } catch (e) {
      console.error('Supabase wipe error:', e);
    }
    setStudents([]);
    setScores({});
    setAttendance({});
    setMonthlyScoresMap({});
    setSemesterExamScoresMap({ 1: {}, 2: {} });
    setCustomDomainGradesMap({ 1: {}, 2: {} });
    setCustomAnnualDomainGradesMap({});
    setSemesterRemarksMap({ 1: {}, 2: {} });
    setAnnualRemarksMap({});
    if (typeof window !== 'undefined') {
      localStorage.removeItem('moeys_sms_scores');
      localStorage.removeItem('moeys_sms_attendance');
    }
  };

  const updateMonthlyCompetencyScore = (monthIndex: number, studentId: string, colKey: string, score: number) => {
    setMonthlyScoresMap((prev) => {
      const studentMap = {
        ...((prev[monthIndex] && prev[monthIndex][studentId]) || {}),
        [colKey]: score,
      };
      const next = {
        ...prev,
        [monthIndex]: {
          ...(prev[monthIndex] || {}),
          [studentId]: studentMap,
        },
      };
      syncMonthlyScoreToSupabase(monthIndex, studentId, studentMap);
      return next;
    });
  };

  const updateSemesterExamScore = (semester: 1 | 2, studentId: string, subjectKey: string, score: number) => {
    setSemesterExamScoresMap((prev) => {
      const studentMap = {
        ...((prev[semester] && prev[semester][studentId]) || {}),
        [subjectKey]: score,
      };
      const next = {
        ...prev,
        [semester]: {
          ...(prev[semester] || {}),
          [studentId]: studentMap,
        },
      };
      syncSemesterExamScoreToSupabase(semester, studentId, studentMap);
      return next;
    });
  };

  const updateDomainGrade = (semester: 1 | 2, studentId: string, domain: keyof DomainGrades, grade: string) => {
    setCustomDomainGradesMap((prev) => ({
      ...prev,
      [semester]: {
        ...(prev[semester] || {}),
        [studentId]: {
          ...((prev[semester] && prev[semester][studentId]) || {}),
          [domain]: grade,
        },
      },
    }));
  };

  const updateAnnualDomainGrade = (studentId: string, domain: keyof DomainGrades, grade: string) => {
    setCustomAnnualDomainGradesMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [domain]: grade,
      },
    }));
  };

  const updateSemesterRemark = (semester: 1 | 2, studentId: string, remark: string) => {
    setSemesterRemarksMap((prev) => ({
      ...prev,
      [semester]: {
        ...(prev[semester] || {}),
        [studentId]: remark,
      },
    }));
  };

  const updateAnnualRemark = (studentId: string, remark: string) => {
    setAnnualRemarksMap((prev) => ({
      ...prev,
      [studentId]: remark,
    }));
  };

  // Dynamic flat list of all competency columns
  const allCompetencyColumns = useMemo(() => {
    return monthlySubjectGroups.flatMap((g) => g.subColumns);
  }, [monthlySubjectGroups]);

  // Subject Group & Skill CRUD operations
  const addSubjectGroup = (newGroup: MonthlySubjectGroupDef) => {
    setMonthlySubjectGroups((prev) => [...prev, newGroup]);
  };

  const updateSubjectGroup = (groupId: string, updated: Partial<MonthlySubjectGroupDef>) => {
    setMonthlySubjectGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updated } : g))
    );
  };

  const deleteSubjectGroup = (groupId: string) => {
    setMonthlySubjectGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const addSkillToGroup = (groupId: string, skill: CompetencyColumnDef) => {
    setMonthlySubjectGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const exists = g.subColumns.some((c) => c.key === skill.key);
          const updatedCols = exists
            ? g.subColumns.map((c) => (c.key === skill.key ? { ...c, ...skill } : c))
            : [...g.subColumns, skill];
          return { ...g, subColumns: updatedCols };
        }
        return g;
      })
    );
  };

  const updateSkillInGroup = (groupId: string, skillKey: string, updated: Partial<CompetencyColumnDef>) => {
    setMonthlySubjectGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subColumns: g.subColumns.map((c) =>
              c.key === skillKey ? { ...c, ...updated } : c
            ),
          };
        }
        return g;
      })
    );
  };

  const deleteSkillFromGroup = (groupId: string, skillKey: string) => {
    setMonthlySubjectGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            subColumns: g.subColumns.filter((c) => c.key !== skillKey),
          };
        }
        return g;
      })
    );
  };

  const resetSubjectGroups = () => {
    setMonthlySubjectGroups(MONTHLY_SUBJECT_GROUPS);
  };

  // Toggle or bulk set disabled competency columns for a specific classroom
  const toggleColumnForClass = (classId: string, columnKey: string) => {
    setDisabledColumnsMap((prev) => {
      const current = prev[classId] || [];
      const updated = current.includes(columnKey)
        ? current.filter((k) => k !== columnKey)
        : [...current, columnKey];
      return { ...prev, [classId]: updated };
    });
  };

  const setDisabledColumnsForClass = (classId: string, columnKeys: string[]) => {
    setDisabledColumnsMap((prev) => ({
      ...prev,
      [classId]: columnKeys,
    }));
  };

  // School profile update
  const updateSchool = (updated: Partial<SchoolInfo>) => {
    setSchool((prev) => {
      const next = { ...prev, ...updated };
      syncSchoolToSupabase(next);
      return next;
    });
  };

  // Academic month configuration (change month name or semester 1 vs 2)
  const updateAcademicMonth = (index: number, updated: Partial<AcademicMonthDef>) => {
    setAcademicMonths((prev) =>
      prev.map((m) => (m.index === index ? { ...m, ...updated } : m))
    );
  };

  const setMonthSemester = (index: number, semester: 1 | 2) => {
    setAcademicMonths((prev) =>
      prev.map((m) => (m.index === index ? { ...m, semester } : m))
    );
  };

  const toggleMonthExamStatus = (index: number) => {
    setAcademicMonths((prev) =>
      prev.map((m) =>
        m.index === index ? { ...m, isExamMonth: m.isExamMonth === false ? true : false } : m
      )
    );
  };

  const setMonthExamStatus = (index: number, isExam: boolean) => {
    setAcademicMonths((prev) =>
      prev.map((m) => (m.index === index ? { ...m, isExamMonth: isExam } : m))
    );
  };

  // Reset all system data to MoEYS Standard Defaults (Clean State)
  const resetToDefaults = () => {
    setSchool(CURRENT_SCHOOL);
    setAcademicMonths(MONTHLY_ACADEMIC_MONTHS);
    setClasses([]);
    setTeachers([]);
    setUsers([]);
    setCurrentUser(EMPTY_USER);
    setStudents([]);
    setSpecializations(SEED_SPECIALIZATIONS);
    setMonthlySubjectGroups(MONTHLY_SUBJECT_GROUPS);
    setChapters([]);
    setScores({});
    setAttendance({});
    setDisabledColumnsMap({});
    setMonthlyScoresMap({});
    setSemesterExamScoresMap({ 1: {}, 2: {} });
    setCustomDomainGradesMap({ 1: {}, 2: {} });
    setCustomAnnualDomainGradesMap({});
    setSemesterRemarksMap({ 1: {}, 2: {} });
    setAnnualRemarksMap({});
  };

  // Export full system snapshot as JSON
  const exportSystemData = () => {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      school,
      academicMonths,
      classes,
      teachers,
      users,
      students,
      specializations,
      monthlySubjectGroups,
      chapters,
      scores,
      attendance,
      disabledColumnsMap,
      monthlyScoresMap,
      semesterExamScoresMap,
      customDomainGradesMap,
      customAnnualDomainGradesMap,
      semesterRemarksMap,
      annualRemarksMap,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoEYS_System_Backup_${school.code}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return data;
  };

  // Import system data from JSON
  const importSystemData = (jsonData: any): boolean => {
    try {
      if (jsonData.school) setSchool(jsonData.school);
      if (jsonData.academicMonths && Array.isArray(jsonData.academicMonths)) setAcademicMonths(jsonData.academicMonths);
      if (jsonData.classes && Array.isArray(jsonData.classes)) setClasses(jsonData.classes);
      if (jsonData.teachers && Array.isArray(jsonData.teachers)) setTeachers(jsonData.teachers);
      if (jsonData.users && Array.isArray(jsonData.users)) {
        setUsers(jsonData.users);
        setCurrentUser(jsonData.users[0] || EMPTY_USER);
      }
      if (jsonData.students && Array.isArray(jsonData.students)) setStudents(jsonData.students);
      if (jsonData.specializations && Array.isArray(jsonData.specializations)) setSpecializations(jsonData.specializations);
      if (jsonData.monthlySubjectGroups && Array.isArray(jsonData.monthlySubjectGroups)) setMonthlySubjectGroups(jsonData.monthlySubjectGroups);
      if (jsonData.chapters && Array.isArray(jsonData.chapters)) setChapters(jsonData.chapters);
      if (jsonData.scores) setScores(jsonData.scores);
      if (jsonData.attendance) setAttendance(jsonData.attendance);
      if (jsonData.disabledColumnsMap) setDisabledColumnsMap(jsonData.disabledColumnsMap);
      if (jsonData.monthlyScoresMap) setMonthlyScoresMap(jsonData.monthlyScoresMap);
      if (jsonData.semesterExamScoresMap) setSemesterExamScoresMap(jsonData.semesterExamScoresMap);
      if (jsonData.customDomainGradesMap) setCustomDomainGradesMap(jsonData.customDomainGradesMap);
      if (jsonData.customAnnualDomainGradesMap) setCustomAnnualDomainGradesMap(jsonData.customAnnualDomainGradesMap);
      if (jsonData.semesterRemarksMap) setSemesterRemarksMap(jsonData.semesterRemarksMap);
      if (jsonData.annualRemarksMap) setAnnualRemarksMap(jsonData.annualRemarksMap);
      return true;
    } catch (e) {
      console.error('Failed to import system data:', e);
      return false;
    }
  };

  // Chapter CRUD operations
  const addChapter = (newChap: ChapterData) => {
    setChapters((prev) => [...prev, newChap]);
    syncChapterToSupabase(newChap);
  };

  const updateChapter = (id: string, updated: Partial<ChapterData>) => {
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = { ...c, ...updated };
          syncChapterToSupabase(next);
          return next;
        }
        return c;
      })
    );
  };

  const deleteChapter = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id));
    deleteChapterFromSupabase(id);
  };

  // Specialization & Subject CRUD operations
  const addSpecialization = (newSpec: SpecializationData) => {
    setSpecializations((prev) => [...prev, newSpec]);
    syncSpecializationToSupabase(newSpec);
  };

  const updateSpecialization = (code: string, updated: Partial<SpecializationData>) => {
    setSpecializations((prev) =>
      prev.map((s) => {
        if (s.code === code) {
          const next = { ...s, ...updated };
          syncSpecializationToSupabase(next);
          return next;
        }
        return s;
      })
    );
  };

  const deleteSpecialization = (code: string) => {
    setSpecializations((prev) => prev.filter((s) => s.code !== code));
    deleteSpecializationFromSupabase(code);
  };

  // Subject aliases
  const addSubject = addSpecialization;
  const updateSubject = updateSpecialization;
  const deleteSubject = deleteSpecialization;

  const addSubjectRule = (rule: SubjectRuleDefinition) => {
    const existing = specializations.find((s) => s.code === rule.subjectCode);
    if (!existing) {
      const newSpec: SpecializationData = {
        id: `spec-${rule.subjectCode.toLowerCase()}`,
        code: rule.subjectCode,
        nameKhmer: rule.nameKhmer,
        nameEnglish: rule.nameEnglish,
        category: 'STEM',
        department: 'ដេប៉ាតឺម៉ង់មុខវិជ្ជា',
        standardWeeklyHours: 4,
        coefficient: rule.coefficient,
        maxScore: rule.maxScore,
        passingScore: rule.passingScore,
        isCore: rule.isCore,
        description: 'មុខវិជ្ជាកម្មវិធីសិក្សាជាតិ',
      };
      addSpecialization(newSpec);
    } else {
      updateSpecialization(rule.subjectCode, {
        nameKhmer: rule.nameKhmer,
        nameEnglish: rule.nameEnglish,
        coefficient: rule.coefficient,
        maxScore: rule.maxScore,
        passingScore: rule.passingScore,
        isCore: rule.isCore,
      });
    }
  };

  const updateSubjectRule = (code: string, updated: Partial<SubjectRuleDefinition>) => {
    setSpecializations((prev) =>
      prev.map((s) => {
        if (s.code === code) {
          const next: SpecializationData = {
            ...s,
            nameKhmer: updated.nameKhmer ?? s.nameKhmer,
            nameEnglish: updated.nameEnglish ?? s.nameEnglish,
            coefficient: updated.coefficient ?? s.coefficient,
            maxScore: updated.maxScore ?? s.maxScore,
            passingScore: updated.passingScore ?? s.passingScore,
            isCore: updated.isCore ?? s.isCore,
          };
          syncSpecializationToSupabase(next);
          return next;
        }
        return s;
      })
    );
  };

  const deleteSubjectRule = (code: string) => {
    deleteSpecialization(code);
  };

  // Class CRUD operations
  const addClass = (newClass: ClassRoom) => {
    setClasses((prev) => [...prev, newClass]);
    syncClassToSupabase(newClass);
  };

  const updateClass = (classId: string, updated: Partial<ClassRoom>) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          const next = { ...c, ...updated };
          syncClassToSupabase(next);
          return next;
        }
        return c;
      })
    );
  };

  const deleteClass = (classId: string) => {
    setClasses((prev) => {
      const remaining = prev.filter((c) => c.id !== classId);
      if (selectedClassId === classId && remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
      return remaining;
    });
    deleteClassFromSupabase(classId);
  };

  // Teacher CRUD operations
  const addTeacher = (newTeacher: TeacherData) => {
    setTeachers((prev) => [newTeacher, ...prev]);
    syncTeacherToSupabase(newTeacher);
  };

  const updateTeacher = (civilServantId: string, updated: Partial<TeacherData>) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.civilServantId === civilServantId) {
          const next = { ...t, ...updated };
          syncTeacherToSupabase(next);
          return next;
        }
        return t;
      })
    );
  };

  const deleteTeacher = (civilServantId: string) => {
    setTeachers((prev) => prev.filter((t) => t.civilServantId !== civilServantId));
    deleteTeacherFromSupabase(civilServantId);
  };

  // User CRUD & RBAC operations
  const switchUserRole = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      // If teacher role, automatically ensure selectedClassId is within their accessible scope
      if (found.role === 'HOMEROOM_TEACHER' || found.role === 'SUBJECT_TEACHER') {
        const userClasses = classes.filter(
          (c) =>
            (found.assignedClassIds && found.assignedClassIds.includes(c.id)) ||
            (found.teacherId && c.homeroomTeacherId === found.teacherId) ||
            c.homeroomTeacherName === found.khmerName
        );
        if (userClasses.length > 0 && !userClasses.some((c) => c.id === selectedClassId)) {
          setSelectedClassId(userClasses[0].id);
        }
      }
    }
  };

  const addUser = (newUser: UserData) => {
    setUsers((prev) => [newUser, ...prev]);
    syncUserToSupabase(newUser);
  };

  const updateUser = (userId: string, updated: Partial<UserData>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const updatedUser = { ...u, ...updated };
          if (currentUser.id === userId) {
            setCurrentUser(updatedUser);
          }
          syncUserToSupabase(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );
  };

  const deleteUser = (userId: string) => {
    setUsers((prev) => {
      const remaining = prev.filter((u) => u.id !== userId);
      if (currentUser.id === userId && remaining.length > 0) {
        setCurrentUser(remaining[0]);
      }
      return remaining;
    });
    deleteUserFromSupabase(userId);
  };

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('moeys_sms_logged_in');
      return saved === 'true';
    }
    return false;
  });

  const login = (
    identifier: string,
    password?: string
  ): { success: boolean; user?: UserData; error?: string } => {
    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      return { success: false, error: 'MISSING_IDENTIFIER' };
    }

    // Find user by username, email, or teacher civil servant ID
    const foundUser = users.find((u) => {
      const matchUsername = u.username.toLowerCase() === cleanId;
      const matchEmail = (u.email || '').toLowerCase() === cleanId;
      const matchTeacherId = u.teacherId && u.teacherId.toLowerCase() === cleanId;
      return matchUsername || matchEmail || matchTeacherId;
    });

    if (!foundUser) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    if (foundUser.status === 'INACTIVE') {
      return { success: false, error: 'ACCOUNT_SUSPENDED' };
    }

    // Password verification against registered user password
    if (password !== undefined) {
      const inputPass = (password || '').trim();
      const expectedPass = (foundUser.passwordHash || '').trim();

      if (expectedPass) {
        if (inputPass !== expectedPass) {
          return { success: false, error: 'WRONG_PASSWORD' };
        }
      } else {
        // Fallback for legacy or unhashed accounts
        if (
          inputPass !== 'admin' &&
          inputPass !== 'pass123' &&
          inputPass !== '123456'
        ) {
          return { success: false, error: 'WRONG_PASSWORD' };
        }
      }
    }

    setCurrentUser(foundUser);
    setIsLoggedIn(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moeys_sms_logged_in', 'true');
      localStorage.setItem('moeys_sms_current_user_id', foundUser.id);
    }

    // Auto switch selectedClassId to user's assigned class if applicable
    if (foundUser.role === 'HOMEROOM_TEACHER' || foundUser.role === 'SUBJECT_TEACHER') {
      const userClasses = classes.filter(
        (c) =>
          (foundUser.assignedClassIds && foundUser.assignedClassIds.includes(c.id)) ||
          (foundUser.teacherId && c.homeroomTeacherId === foundUser.teacherId) ||
          c.homeroomTeacherName === foundUser.khmerName
      );
      if (userClasses.length > 0 && !userClasses.some((c) => c.id === selectedClassId)) {
        setSelectedClassId(userClasses[0].id);
      }
    }

    return { success: true, user: foundUser };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(EMPTY_USER);
    if (typeof window !== 'undefined') {
      localStorage.setItem('moeys_sms_logged_in', 'false');
      localStorage.removeItem('moeys_sms_current_user_id');
    }
  };

  const hasPermission = (perm: keyof SystemPermissions): boolean => {
    if (currentUser.role === 'PRINCIPAL') return true;
    return !!currentUser.permissions[perm];
  };

  const isTeacher = currentUser.role === 'HOMEROOM_TEACHER' || currentUser.role === 'SUBJECT_TEACHER';
  const isHomeroomTeacher = currentUser.role === 'HOMEROOM_TEACHER';

  // Accessible Classes Scope for Current User
  const accessibleClasses = useMemo(() => {
    if (currentUser.role === 'PRINCIPAL' || currentUser.role === 'ACADEMIC_OFFICER') {
      return classes;
    }
    const filtered = classes.filter((cls) => {
      if (currentUser.assignedClassIds && currentUser.assignedClassIds.includes(cls.id)) {
        return true;
      }
      if (currentUser.teacherId && cls.homeroomTeacherId === currentUser.teacherId) {
        return true;
      }
      if (
        cls.homeroomTeacherName &&
        (cls.homeroomTeacherName === currentUser.khmerName ||
          cls.homeroomTeacherName === currentUser.latinName)
      ) {
        return true;
      }
      return false;
    });

    return filtered;
  }, [currentUser, classes]);

  const canAccessClass = (classId: string): boolean => {
    if (currentUser.role === 'PRINCIPAL' || currentUser.role === 'ACADEMIC_OFFICER') {
      return true;
    }
    return accessibleClasses.some((c) => c.id === classId);
  };

  const accessibleStudents = useMemo(() => {
    if (currentUser.role === 'PRINCIPAL' || currentUser.role === 'ACADEMIC_OFFICER') {
      return students;
    }
    const allowedClassIds = new Set(accessibleClasses.map((c) => c.id));
    return students.filter((s) => allowedClassIds.has(s.classId));
  }, [currentUser, accessibleClasses, students]);

  const canAccessRoute = (route: string): boolean => {
    if (currentUser.role === 'PRINCIPAL') return true;
    if (route === '/settings') {
      return !!currentUser.permissions.canEditSchoolInfo;
    }
    if (route === '/users') {
      return !!currentUser.permissions.canManageUsers;
    }
    if (route === '/teachers') {
      return !!currentUser.permissions.canManageTeachers;
    }
    if (route === '/specializations' || route === '/chapters') {
      return currentUser.role === 'ACADEMIC_OFFICER';
    }
    return true;
  };

  // Student CRUD operations
  const addStudent = (newStudent: StudentData) => {
    setStudents((prev) => [newStudent, ...prev]);
    syncStudentToSupabase(newStudent);
  };

  const updateStudent = (studentNationalId: string, updated: Partial<StudentData>) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.studentNationalId === studentNationalId) {
          const next = { ...s, ...updated };
          syncStudentToSupabase(next);
          return next;
        }
        return s;
      })
    );
  };

  const deleteStudent = (studentNationalId: string) => {
    setStudents((prev) => prev.filter((s) => s.studentNationalId !== studentNationalId));
    deleteStudentFromSupabase(studentNationalId);
  };

  // Transfer single or multiple students to a target class
  const transferStudents = (studentIds: string[], targetClassId: string) => {
    if (!studentIds.length || !targetClassId) return;
    setStudents((prev) => {
      const targetClassStudents = prev.filter(
        (s) => s.classId === targetClassId && !studentIds.includes(s.studentNationalId)
      );
      let nextRoll =
        targetClassStudents.length > 0
          ? Math.max(...targetClassStudents.map((s) => s.rollNumber || 0)) + 1
          : 1;

      return prev.map((s) => {
        if (studentIds.includes(s.studentNationalId)) {
          const updatedStudent = {
            ...s,
            classId: targetClassId,
            rollNumber: nextRoll++,
          };
          syncStudentToSupabase(updatedStudent);
          return updatedStudent;
        }
        return s;
      });
    });
  };

  const transferSingleStudent = (studentNationalId: string, targetClassId: string) => {
    transferStudents([studentNationalId], targetClassId);
  };

  // Promote students to the next grade level or repeat / graduate
  const promoteStudents = (
    studentIds: string[],
    targetClassId: string,
    status: 'PROMOTED' | 'RETAINED' | 'GRADUATED' = 'PROMOTED'
  ) => {
    if (!studentIds.length) return;
    if (status === 'GRADUATED') {
      setStudents((prev) =>
        prev.map((s) => {
          if (studentIds.includes(s.studentNationalId)) {
            const updated = { ...s, classId: 'GRADUATED' };
            syncStudentToSupabase(updated);
            return updated;
          }
          return s;
        })
      );
    } else {
      transferStudents(studentIds, targetClassId);
    }
  };

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const defaultTrackRules = currentClass ? getSubjectRulesForClass(currentClass.gradeLevel, currentClass.track) : [];

  // Dynamic Subject Rules synchronized with specializations/subjects
  const subjectRules: SubjectRuleDefinition[] = specializations.map((spec) => {
    const matchedTrackRule = defaultTrackRules.find((r) => r.subjectCode === spec.code);
    return {
      subjectCode: spec.code,
      nameKhmer: spec.nameKhmer,
      nameEnglish: spec.nameEnglish,
      coefficient: spec.coefficient ?? matchedTrackRule?.coefficient ?? 1.0,
      maxScore: spec.maxScore ?? matchedTrackRule?.maxScore ?? 100,
      passingScore: spec.passingScore ?? matchedTrackRule?.passingScore ?? 50,
      isCore: spec.isCore ?? matchedTrackRule?.isCore ?? false,
    };
  });

  // Update a single score cell in the interactive gradebook
  const updateScore = (
    studentId: string,
    subjectCode: string,
    type: 'monthly' | 'exam',
    monthIndex: number,
    value: number
  ) => {
    const clamped = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
    setScores((prev) => {
      const studentMap = prev[studentId] || {};
      const subjectMap = studentMap[subjectCode] || { monthly: [0, 0, 0, 0, 0], exam: 0 };
      
      let newMonthly = [...subjectMap.monthly];
      let newExam = subjectMap.exam;

      if (type === 'monthly') {
        newMonthly[monthIndex] = clamped;
      } else {
        newExam = clamped;
      }

      return {
        ...prev,
        [studentId]: {
          ...studentMap,
          [subjectCode]: {
            monthly: newMonthly,
            exam: newExam,
          },
        },
      };
    });
  };

  const batchUpdateMonthlyScore = (
    subjectCode: string,
    monthIndex: number,
    studentScores: Record<string, number>
  ) => {
    setScores((prev) => {
      const next = { ...prev };
      Object.entries(studentScores).forEach(([studentId, value]) => {
        const clamped = isNaN(value) ? 0 : Math.min(100, Math.max(0, value));
        const studentMap = next[studentId] || {};
        const subjectMap = studentMap[subjectCode] || { monthly: [0, 0, 0, 0, 0], exam: 0 };
        const newMonthly = [...subjectMap.monthly];
        newMonthly[monthIndex] = clamped;
        next[studentId] = {
          ...studentMap,
          [subjectCode]: {
            monthly: newMonthly,
            exam: subjectMap.exam,
          },
        };
      });
      return next;
    });
  };

  const updateAttendance = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT_PERMISSION' | 'ABSENT_NO_PERMISSION' | 'LATE'
  ) => {
    setAttendance((prev) => {
      const next = {
        ...prev,
        [studentId]: status,
      };
      syncAttendanceToSupabase(studentId, status);
      return next;
    });
  };

  const markAllPresent = () => {
    const newAtt: Record<string, 'PRESENT' | 'ABSENT_PERMISSION' | 'ABSENT_NO_PERMISSION' | 'LATE'> = {};
    students.forEach((s) => {
      newAtt[s.studentNationalId] = 'PRESENT';
      syncAttendanceToSupabase(s.studentNationalId, 'PRESENT');
    });
    setAttendance(newAtt);
  };

  const computedStudentRecords: StudentScoreRecord[] = useMemo(() => {
    if (!currentClass) return [];

    const targetStudents = students.filter((s) => s.classId === currentClass.id);
    const rules = subjectRules;

    const rawOutputs = targetStudents.map((student) => {
      const scoresBySubject: Record<string, ScoreState> = {};
      const subjectInputs: SubjectSemesterInput[] = [];

      rules.forEach((rule) => {
        const studentScores = scores[student.studentNationalId]?.[rule.subjectCode] || {
          monthly: [0, 0, 0, 0, 0],
          exam: 0,
        };
        scoresBySubject[rule.subjectCode] = studentScores;

        subjectInputs.push({
          subjectCode: rule.subjectCode,
          monthlyScores: studentScores.monthly,
          semesterExamScore: studentScores.exam,
          coefficient: rule.coefficient,
        });
      });

      const sem1Result = calculateSemesterResult(subjectInputs);

      return {
        student,
        scoresBySubject,
        semester1Result: sem1Result,
      };
    });

    const rankInputs: StudentRankInput[] = rawOutputs.map((item) => ({
      studentId: item.student.studentNationalId,
      studentNameKhmer: item.student.khmerName,
      gender: item.student.gender,
      averageScore: item.semester1Result.semesterAverage,
      totalWeightedScore: item.semester1Result.totalWeightedScore,
    }));

    const rankedStudentsList = rankStudents(rankInputs);
    const rankedMap = new Map<string, RankedStudent>();
    rankedStudentsList.forEach((r) => rankedMap.set(r.studentId, r));

    return rawOutputs.map((item) => {
      const rankInfo = rankedMap.get(item.student.studentNationalId) || {
        studentId: item.student.studentNationalId,
        studentNameKhmer: item.student.khmerName,
        gender: item.student.gender,
        averageScore: item.semester1Result.semesterAverage,
        totalWeightedScore: item.semester1Result.totalWeightedScore,
        rank: 0,
        isHonorRoll: false,
        letterGrade: item.semester1Result.letterGrade,
      };

      return {
        ...item,
        rankInfo,
      };
    });
  }, [students, currentClass, scores, subjectRules]);

  // Export to Excel Helper
  const exportToExcel = async (filename: string, tableData: any[]) => {
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(tableData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (err) {
      console.error('Failed to export to excel:', err);
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        school,
        updateSchool,
        academicMonths,
        updateAcademicMonth,
        setMonthSemester,
        toggleMonthExamStatus,
        setMonthExamStatus,
        setAcademicMonths,
        classes,
        addClass,
        updateClass,
        deleteClass,
        selectedClassId,
        setSelectedClassId,
        selectedMonth,
        setSelectedMonth,
        selectedSemester,
        setSelectedSemester,
        selectedSubjectCode,
        setSelectedSubjectCode,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        transferStudents,
        transferSingleStudent,
        promoteStudents,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        users,
        currentUser,
        setCurrentUser,
        switchUserRole,
        addUser,
        updateUser,
        deleteUser,
        hasPermission,
        isLoggedIn,
        login,
        logout,
        accessibleClasses,
        accessibleStudents,
        canAccessClass,
        canAccessRoute,
        isTeacher,
        isHomeroomTeacher,
        specializations,
        addSpecialization,
        updateSpecialization,
        deleteSpecialization,
        addSubject,
        updateSubject,
        deleteSubject,
        addSubjectRule,
        updateSubjectRule,
        deleteSubjectRule,
        monthlySubjectGroups,
        allCompetencyColumns,
        addSubjectGroup,
        updateSubjectGroup,
        deleteSubjectGroup,
        addSkillToGroup,
        updateSkillInGroup,
        deleteSkillFromGroup,
        resetSubjectGroups,
        chapters,
        addChapter,
        updateChapter,
        deleteChapter,
        subjectRules,
        monthlyScoresMap,
        updateMonthlyCompetencyScore,
        setMonthlyScoresMap,
        semesterExamScoresMap,
        updateSemesterExamScore,
        setSemesterExamScoresMap,
        customDomainGradesMap,
        updateDomainGrade,
        customAnnualDomainGradesMap,
        updateAnnualDomainGrade,
        semesterRemarksMap,
        updateSemesterRemark,
        annualRemarksMap,
        updateAnnualRemark,
        scores,
        updateScore,
        batchUpdateMonthlyScore,
        attendance,
        updateAttendance,
        markAllPresent,
        computedStudentRecords,
        language,
        setLanguage,
        t,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        disabledColumnsMap,
        toggleColumnForClass,
        setDisabledColumnsForClass,
        exportToExcel,
        exportSystemData,
        importSystemData,
        resetToDefaults,
        isSupabaseConnected,
        refreshFromSupabase,
        clearAllTestData,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
}
