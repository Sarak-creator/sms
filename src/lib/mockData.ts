import { StudentData, TeacherData } from './schoolData';
import {
  calculateMoEYSGrade,
  calculateMonthlyAverage,
  calculateSubjectSemesterScore,
  calculateSemesterResult,
  calculateAnnualResult,
  getSubjectRulesForClass,
  rankStudents,
  MoEYSGradeDetail,
  SubjectRuleDefinition,
  KHMER_ACADEMIC_MONTHS,
} from './gradingEngine';

export interface SchoolSettings {
  defaultDivisor?: number;
  semesterDefaultDivisor?: number;
  passingThreshold?: number;
  autoCalculateRank?: boolean;
  autoSaveAlert?: boolean;
  academicMonths?: any[];
  [key: string]: any;
}

export interface SchoolInfo {
  nameKhmer: string;
  nameEnglish: string;
  code: string;
  province: string;
  district: string;
  principalName: string;
  academicYear: string;
  phone?: string;
  email?: string;
  address?: string;
  settings?: SchoolSettings;
}

export const CURRENT_SCHOOL: SchoolInfo = {
  nameKhmer: '',
  nameEnglish: '',
  code: '',
  province: '',
  district: '',
  principalName: '',
  academicYear: '២០២៤ - ២០២៥',
  phone: '',
  email: '',
  address: '',
  settings: {
    defaultDivisor: 21,
    semesterDefaultDivisor: 14,
    passingThreshold: 50,
    autoCalculateRank: true,
    autoSaveAlert: true,
  },
};

export interface ClassRoom {
  id: string;
  name: string;
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
  track: 'GENERAL' | 'SCIENCE' | 'SOCIAL_SCIENCE';
  shift: 'MORNING' | 'AFTERNOON';
  roomNumber: string;
  homeroomTeacherId: string;
  homeroomTeacherName: string;
  totalStudents: number;
  femaleStudents: number;
  // Per-classroom examined subjects & divisor stored in database
  subjectDivisor?: number;
  semesterDivisor?: number;
  disabledColumnKeys?: string[];
  examSubjectKeys?: string[];
}

export const INITIAL_CLASSES: ClassRoom[] = [];

// Empty initial classical scores map
export function generateInitialGrade11Scores(students: StudentData[] = []) {
  return {};
}

// Empty initial attendance map
export function generateInitialAttendance(students: StudentData[] = []) {
  return {};
}
