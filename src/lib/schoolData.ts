/**
 * MoEYS Data Definitions and Types
 * Pure Client-Safe TypeScript Module (No server/ORM dependencies)
 */

export interface TeacherData {
  civilServantId: string;
  khmerName: string;
  latinName: string;
  gender: 'MALE' | 'FEMALE';
  cadre: string;
  specialization: string;
  standardQuota: number;
  assignedShift: 'MORNING' | 'AFTERNOON';
  phoneNumber: string;
  dob: Date;
}

export interface StudentData {
  studentNationalId: string;
  khmerName: string;
  latinName: string;
  gender: 'MALE' | 'FEMALE';
  dob: Date;
  pobProvince: string;
  pobDistrict: string;
  fatherName: string;
  fatherOccupation?: string;
  motherName: string;
  motherOccupation?: string;
  guardianPhone: string;
  rollNumber: number;
  classId?: string;
}

export const SEED_TEACHERS: TeacherData[] = [];

export const SEED_STUDENTS_30: StudentData[] = [];

export const SEED_ALL_STUDENTS: StudentData[] = [];

export interface SpecializationData {
  id: string;
  code: string;
  nameKhmer: string;
  nameEnglish: string;
  category: 'STEM' | 'SOCIAL' | 'LANGUAGE' | 'ARTS_SPORTS' | 'PRIMARY' | 'PRIMARY_GENERAL';
  department: string;
  standardWeeklyHours: number;
  coefficient: number;
  maxScore: number;
  passingScore: number;
  isCore: boolean;
  description?: string;
}

export const SEED_SPECIALIZATIONS: SpecializationData[] = [
  {
    id: 'spec-khm-prim',
    code: 'KHM_PRIM',
    nameKhmer: 'ភាសាខ្មែរ (បឋមសិក្សា)',
    nameEnglish: 'Khmer Language (Primary)',
    category: 'PRIMARY_GENERAL',
    department: 'ដេប៉ាតឺម៉ង់បឋមសិក្សា',
    standardWeeklyHours: 8,
    coefficient: 1.5,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'ការអាន ការសរសេរ និងវេយ្យាករណ៍ភាសាខ្មែរកម្រិតបឋមសិក្សា',
  },
  {
    id: 'spec-math-prim',
    code: 'MATH_PRIM',
    nameKhmer: 'គណិតវិទ្យា (បឋមសិក្សា)',
    nameEnglish: 'Mathematics (Primary)',
    category: 'PRIMARY_GENERAL',
    department: 'ដេប៉ាតឺម៉ង់បឋមសិក្សា',
    standardWeeklyHours: 6,
    coefficient: 1.5,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'លេខនព្វន្ត រូបធរណីមាត្រ និងការដោះស្រាយចំណោទបឋមសិក្សា',
  },
  {
    id: 'spec-sci-soc-prim',
    code: 'SCI_SOC_PRIM',
    nameKhmer: 'វិទ្យាសាស្ត្រ និងការសិក្សាសង្គម (បឋម)',
    nameEnglish: 'Science & Social Studies (Primary)',
    category: 'PRIMARY_GENERAL',
    department: 'ដេប៉ាតឺម៉ង់បឋមសិក្សា',
    standardWeeklyHours: 4,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'វិទ្យាសាស្ត្រអនុវត្ត សីលធម៌ ពលរដ្ឋ និងប្រវត្តិវិទ្យាកម្រិតបឋម',
  },
  {
    id: 'spec-eng-prim',
    code: 'ENG_PRIM',
    nameKhmer: 'ភាសាអង់គ្លេស (បឋមសិក្សា)',
    nameEnglish: 'English (Primary)',
    category: 'PRIMARY_GENERAL',
    department: 'ដេប៉ាតឺម៉ង់ភាសាបរទេស',
    standardWeeklyHours: 2,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'ភាសាអង់គ្លេសមូលដ្ឋានកម្រិតបឋមសិក្សា',
  },
  {
    id: 'spec-gen-prim',
    code: 'GEN_PRIM',
    nameKhmer: 'គរុកោសល្យបឋមសិក្សា (ទូទៅ/គ្រប់មុខវិជ្ជា)',
    nameEnglish: 'Primary Pedagogy (General)',
    category: 'PRIMARY_GENERAL',
    department: 'ដេប៉ាតឺម៉ង់បឋមសិក្សា',
    standardWeeklyHours: 18,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'បង្រៀនទូទៅគ្រប់មុខវិជ្ជាសម្រាប់គ្រូបឋមសិក្សាថ្នាក់ទី១ ដល់ទី៦',
  },
  {
    id: 'spec-math',
    code: 'MATH',
    nameKhmer: 'គណិតវិទ្យា',
    nameEnglish: 'Mathematics',
    category: 'STEM',
    department: 'ដេប៉ាតឺម៉ង់គណិតវិទ្យា',
    standardWeeklyHours: 6,
    coefficient: 2.0,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'ពិជគណិត ធរណីមាត្រ និងស្ថិតិ',
  },
  {
    id: 'spec-khm',
    code: 'KHM',
    nameKhmer: 'ភាសាខ្មែរ និងអក្សរសាស្ត្រ',
    nameEnglish: 'Khmer Literature',
    category: 'LANGUAGE',
    department: 'ដេប៉ាតឺម៉ង់អក្សរសាស្ត្រខ្មែរ',
    standardWeeklyHours: 5,
    coefficient: 2.0,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'វេយ្យាករណ៍ និងតែងសេចក្តី',
  },
  {
    id: 'spec-phys',
    code: 'PHYS',
    nameKhmer: 'រូបវិទ្យា',
    nameEnglish: 'Physics',
    category: 'STEM',
    department: 'ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពិត',
    standardWeeklyHours: 4,
    coefficient: 1.5,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'មេកានិច និងអគ្គិសនី',
  },
  {
    id: 'spec-chem',
    code: 'CHEM',
    nameKhmer: 'គីមីវិទ្យា',
    nameEnglish: 'Chemistry',
    category: 'STEM',
    department: 'ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពិត',
    standardWeeklyHours: 4,
    coefficient: 1.5,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'គីមីសរីរាង្គ និងអសរីរាង្គ',
  },
  {
    id: 'spec-bio',
    code: 'BIO',
    nameKhmer: 'ជីវវិទ្យា',
    nameEnglish: 'Biology',
    category: 'STEM',
    department: 'ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពិត',
    standardWeeklyHours: 4,
    coefficient: 1.5,
    maxScore: 100,
    passingScore: 50,
    isCore: true,
    description: 'ពន្ធុវិទ្យា និងជីវវិទ្យាកោសិកា',
  },
  {
    id: 'spec-hist',
    code: 'HIST',
    nameKhmer: 'ប្រវត្តិវិទ្យា',
    nameEnglish: 'History',
    category: 'SOCIAL',
    department: 'ដេប៉ាតឺម៉ង់សង្គមវិទ្យា',
    standardWeeklyHours: 3,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'ប្រវត្តិសាស្ត្រកម្ពុជា និងពិភពលោក',
  },
  {
    id: 'spec-geog',
    code: 'GEOG',
    nameKhmer: 'ភូមិវិទ្យា',
    nameEnglish: 'Geography',
    category: 'SOCIAL',
    department: 'ដេប៉ាតឺម៉ង់សង្គមវិទ្យា',
    standardWeeklyHours: 3,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'ភូមិសាស្ត្រកម្ពុជា និងសកលលោក',
  },
  {
    id: 'spec-mor',
    code: 'MOR',
    nameKhmer: 'សីលធម៌-ពលរដ្ឋវិជ្ជា',
    nameEnglish: 'Moral & Civics',
    category: 'SOCIAL',
    department: 'ដេប៉ាតឺម៉ង់សង្គមវិទ្យា',
    standardWeeklyHours: 2,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'ច្បាប់ និងសីលធម៌រស់នៅ',
  },
  {
    id: 'spec-eng',
    code: 'ENG',
    nameKhmer: 'ភាសាអង់គ្លេស',
    nameEnglish: 'English Language',
    category: 'LANGUAGE',
    department: 'ដេប៉ាតឺម៉ង់ភាសាបរទេស',
    standardWeeklyHours: 3,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'ភាសាអង់គ្លេសទូទៅ',
  },
  {
    id: 'spec-ict',
    code: 'ICT',
    nameKhmer: 'បច្ចេកវិទ្យាព័ត៌មាន (ICT)',
    nameEnglish: 'ICT & Computer Science',
    category: 'STEM',
    department: 'ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យា',
    standardWeeklyHours: 2,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'កុំព្យូទ័រ និងការសរសេរកូដមូលដ្ឋាន',
  },
  {
    id: 'spec-pe',
    code: 'PE',
    nameKhmer: 'អប់រំកាយ និងកីឡា',
    nameEnglish: 'Physical Education',
    category: 'ARTS_SPORTS',
    department: 'ដេប៉ាតឺម៉ង់កីឡា',
    standardWeeklyHours: 2,
    coefficient: 1.0,
    maxScore: 100,
    passingScore: 50,
    isCore: false,
    description: 'កាយវប្បកម្ម និងកីឡាបាល់ទាត់/បាល់ទះ',
  },
];

export interface ChapterData {
  id: string;
  chapterNumber: number;
  titleKhmer: string;
  titleEnglish: string;
  subjectCode: string;
  subjectName: string;
  gradeLevel:
    | 'GRADE_1'
    | 'GRADE_2'
    | 'GRADE_3'
    | 'GRADE_4'
    | 'GRADE_5'
    | 'GRADE_6'
    | 'GRADE_7'
    | 'GRADE_8'
    | 'GRADE_9'
    | 'GRADE_10'
    | 'GRADE_11'
    | 'GRADE_12';
  semester: 1 | 2;
  totalLessons: number;
  totalTeachingHours: number;
  description: string;
}

export const SEED_CHAPTERS: ChapterData[] = [];

export type UserRole =
  | 'PRINCIPAL'
  | 'ACADEMIC_OFFICER'
  | 'HOMEROOM_TEACHER'
  | 'SUBJECT_TEACHER'
  | 'STAFF_VIEWER';

export interface SystemPermissions {
  canEditSchoolInfo: boolean;
  canManageTeachers: boolean;
  canManageClasses: boolean;
  canManageStudents: boolean;
  canTransferAndPromote: boolean;
  canEnterAllScores: boolean;
  canEnterAssignedScoresOnly: boolean;
  canLockGrades: boolean;
  canTakeAttendance: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canExportBackup: boolean;
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  khmerName: string;
  latinName: string;
  role: UserRole;
  teacherId?: string; // Reference to TeacherData.civilServantId
  assignedClassIds: string[];
  assignedSubjectCodes: string[];
  status: 'ACTIVE' | 'INACTIVE';
  passwordHash?: string;
  permissions: SystemPermissions;
  avatarColor: string;
  phoneNumber?: string;
  lastLogin?: string;
}

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, SystemPermissions> = {
  PRINCIPAL: {
    canEditSchoolInfo: true,
    canManageTeachers: true,
    canManageClasses: true,
    canManageStudents: true,
    canTransferAndPromote: true,
    canEnterAllScores: true,
    canEnterAssignedScoresOnly: false,
    canLockGrades: true,
    canTakeAttendance: true,
    canViewReports: true,
    canManageUsers: true,
    canExportBackup: true,
  },
  ACADEMIC_OFFICER: {
    canEditSchoolInfo: false,
    canManageTeachers: true,
    canManageClasses: true,
    canManageStudents: true,
    canTransferAndPromote: true,
    canEnterAllScores: true,
    canEnterAssignedScoresOnly: false,
    canLockGrades: true,
    canTakeAttendance: true,
    canViewReports: true,
    canManageUsers: false,
    canExportBackup: true,
  },
  HOMEROOM_TEACHER: {
    canEditSchoolInfo: false,
    canManageTeachers: false,
    canManageClasses: false,
    canManageStudents: true,
    canTransferAndPromote: false,
    canEnterAllScores: false,
    canEnterAssignedScoresOnly: true,
    canLockGrades: false,
    canTakeAttendance: true,
    canViewReports: true,
    canManageUsers: false,
    canExportBackup: false,
  },
  SUBJECT_TEACHER: {
    canEditSchoolInfo: false,
    canManageTeachers: false,
    canManageClasses: false,
    canManageStudents: false,
    canTransferAndPromote: false,
    canEnterAllScores: false,
    canEnterAssignedScoresOnly: true,
    canLockGrades: false,
    canTakeAttendance: true,
    canViewReports: true,
    canManageUsers: false,
    canExportBackup: false,
  },
  STAFF_VIEWER: {
    canEditSchoolInfo: false,
    canManageTeachers: false,
    canManageClasses: false,
    canManageStudents: false,
    canTransferAndPromote: false,
    canEnterAllScores: false,
    canEnterAssignedScoresOnly: false,
    canLockGrades: false,
    canTakeAttendance: false,
    canViewReports: true,
    canManageUsers: false,
    canExportBackup: false,
  },
};

export const SEED_USERS: UserData[] = [
  {
    id: 'user-admin-01',
    username: 'admin',
    email: 'principal@school.gov.kh',
    khmerName: 'គណៈគ្រប់គ្រងសាលា',
    latinName: 'School Administrator',
    role: 'PRINCIPAL',
    assignedClassIds: [],
    assignedSubjectCodes: [],
    status: 'ACTIVE',
    permissions: ROLE_DEFAULT_PERMISSIONS.PRINCIPAL,
    avatarColor: 'from-blue-600 to-indigo-600',
    phoneNumber: '023 724 118',
  },
];
