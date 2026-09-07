/**
 * MoEYS Cambodian Public High School Grading & Evaluation Engine
 * ម៉ាស៊ីនគណនាពិន្ទុ និងចំណាត់ថ្នាក់តាមស្តង់ដារក្រសួងអប់រំ យុវជន និងកីឡា
 * 
 * Strict implementation of Cambodian National Curriculum Evaluation Rules:
 * - 10 Academic Months per year (Month 1-5 = Sem 1, Month 6-10 = Sem 2)
 * - Semester Formula: (Monthly Avg + (Semester Exam * 2)) / 3
 * - Annual Formula: (Semester 1 Avg + Semester 2 Avg) / 2
 * - Track Specific Coefficients (Science vs Social Science)
 * - Official MoEYS Grade Benchmarks (A, B, C, D, E, F)
 * - Automated Tie-breaker ranking & Honor Roll determination
 */

export type GradeLevel =
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
export type Track = 'GENERAL' | 'SCIENCE' | 'SOCIAL_SCIENCE';

export type MoEYSGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'GRADE_D' | 'GRADE_E' | 'GRADE_F';

export type PromotionStatus = 'PROMOTED' | 'RETAINED' | 'RE_EXAM' | 'GRADUATED' | 'INELIGIBLE';

export interface MoEYSGradeDetail {
  code: MoEYSGrade;
  letter: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  labelKhmer: string; // 'ល្អប្រសើរ', 'ល្អណាស់', 'ល្អ', 'ល្អបង្គួរ', 'មធ្យម', 'ខ្សោយ/ធ្លាក់'
  labelEnglish: string;
  minScore: number;
  maxScore: number;
  isPassing: boolean;
  colorHex: string;
}

export const MOEYS_GRADE_BENCHMARKS: Record<MoEYSGrade, MoEYSGradeDetail> = {
  GRADE_A: {
    code: 'GRADE_A',
    letter: 'A',
    labelKhmer: 'ល្អប្រសើរ (Excellent)',
    labelEnglish: 'Excellent',
    minScore: 85.0,
    maxScore: 100.0,
    isPassing: true,
    colorHex: '#059669', // Emerald
  },
  GRADE_B: {
    code: 'GRADE_B',
    letter: 'B',
    labelKhmer: 'ល្អណាស់ (Very Good)',
    labelEnglish: 'Very Good',
    minScore: 80.0,
    maxScore: 84.99,
    isPassing: true,
    colorHex: '#2563eb', // Blue
  },
  GRADE_C: {
    code: 'GRADE_C',
    letter: 'C',
    labelKhmer: 'ល្អ (Good)',
    labelEnglish: 'Good',
    minScore: 70.0,
    maxScore: 79.99,
    isPassing: true,
    colorHex: '#0284c7', // Sky
  },
  GRADE_D: {
    code: 'GRADE_D',
    letter: 'D',
    labelKhmer: 'ល្អបង្គួរ (Fairly Good)',
    labelEnglish: 'Fairly Good',
    minScore: 60.0,
    maxScore: 69.99,
    isPassing: true,
    colorHex: '#d97706', // Amber
  },
  GRADE_E: {
    code: 'GRADE_E',
    letter: 'E',
    labelKhmer: 'មធ្យម (Average / Passing)',
    labelEnglish: 'Average (Pass)',
    minScore: 50.0,
    maxScore: 59.99,
    isPassing: true,
    colorHex: '#ea580c', // Orange
  },
  GRADE_F: {
    code: 'GRADE_F',
    letter: 'F',
    labelKhmer: 'ខ្សោយ / ធ្លាក់ (Fail)',
    labelEnglish: 'Fail',
    minScore: 0.0,
    maxScore: 49.99,
    isPassing: false,
    colorHex: '#dc2626', // Red
  },
};

export interface SubjectRuleDefinition {
  subjectCode: string;
  nameKhmer: string;
  nameEnglish: string;
  coefficient: number;
  maxScore: number;
  passingScore: number;
  isCore: boolean;
}

/**
 * Standard MoEYS Curriculum Subject Coefficients by Grade & Track
 */
export const MOEYS_STANDARD_SUBJECT_RULES: Record<string, SubjectRuleDefinition[]> = {
  // Grades 11 & 12 Science Stream (ថ្នាក់វិទ្យាសាស្ត្រ)
  SCIENCE_UPPER: [
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient: 3.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដី និងបរិស្ថាន', nameEnglish: 'Earth & Env Science', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស (អង់គ្លេស/បារាំង)', nameEnglish: 'Foreign Language', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'ICT', nameKhmer: 'បច្ចេកវិទ្យាព័ត៌មានវិទ្យា (ICT)', nameEnglish: 'ICT', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'PE', nameKhmer: 'កីឡា និងអប់រំកាយ', nameEnglish: 'Physical Education', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
  ],

  // Grades 11 & 12 Social Science Stream (ថ្នាក់វិទ្យាសាស្ត្រសង្គម)
  SOCIAL_SCIENCE_UPPER: [
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient: 3.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដី និងបរិស្ថាន', nameEnglish: 'Earth & Env Science', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'ICT', nameKhmer: 'បច្ចេកវិទ្យាព័ត៌មានវិទ្យា', nameEnglish: 'ICT', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'PE', nameKhmer: 'កីឡា និងអប់រំកាយ', nameEnglish: 'Physical Education', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
  ],

  // Grades 7 to 10 General Track (ថ្នាក់ចំណេះទូទៅ / មូលដ្ឋាន)
  GENERAL_STANDARD: [
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient: 3.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient: 3.0, maxScore: 100, passingScore: 50, isCore: true },
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient: 2.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient: 1.5, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient: 1.5, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient: 1.5, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដីវិទ្យា', nameEnglish: 'Earth Science', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'ICT', nameKhmer: 'ព័ត៌មានវិទ្យា', nameEnglish: 'ICT', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
    { subjectCode: 'PE', nameKhmer: 'អប់រំកាយ', nameEnglish: 'Physical Education', coefficient: 1.0, maxScore: 100, passingScore: 50, isCore: false },
  ],
};

/**
 * Retrieve appropriate subject rules by grade level and stream track
 */
export function getSubjectRulesForClass(gradeLevel: GradeLevel, track: Track): SubjectRuleDefinition[] {
  if (gradeLevel === 'GRADE_11' || gradeLevel === 'GRADE_12') {
    if (track === 'SCIENCE') {
      return MOEYS_STANDARD_SUBJECT_RULES.SCIENCE_UPPER;
    }
    if (track === 'SOCIAL_SCIENCE') {
      return MOEYS_STANDARD_SUBJECT_RULES.SOCIAL_SCIENCE_UPPER;
    }
  }
  return MOEYS_STANDARD_SUBJECT_RULES.GENERAL_STANDARD;
}

/**
 * Maps any score or average (0 - 100) to the strict MoEYS Letter Grade Benchmark (A, B, C, D, E, F)
 */
export function calculateMoEYSGrade(score: number): MoEYSGradeDetail {
  const rounded = Math.round((score + Number.EPSILON) * 100) / 100;
  if (rounded >= 85.0) return MOEYS_GRADE_BENCHMARKS.GRADE_A;
  if (rounded >= 80.0) return MOEYS_GRADE_BENCHMARKS.GRADE_B;
  if (rounded >= 70.0) return MOEYS_GRADE_BENCHMARKS.GRADE_C;
  if (rounded >= 60.0) return MOEYS_GRADE_BENCHMARKS.GRADE_D;
  if (rounded >= 50.0) return MOEYS_GRADE_BENCHMARKS.GRADE_E;
  return MOEYS_GRADE_BENCHMARKS.GRADE_F;
}

export interface StudentSubjectMonthlyScore {
  subjectCode: string;
  rawScore: number;
  coefficient: number;
  isExempt?: boolean;
}

export interface MonthlyEvaluationResult {
  totalWeightedScore: number;
  totalCoefficients: number;
  monthlyAverage: number;
  letterGrade: MoEYSGradeDetail;
  isPassing: boolean;
}

/**
 * Computes a student's weighted monthly average across all active subjects for a single month
 */
export function calculateMonthlyAverage(scores: StudentSubjectMonthlyScore[]): MonthlyEvaluationResult {
  let totalWeightedScore = 0;
  let totalCoefficients = 0;

  for (const s of scores) {
    if (s.isExempt) continue;
    const clampedScore = Math.min(100, Math.max(0, s.rawScore));
    totalWeightedScore += clampedScore * s.coefficient;
    totalCoefficients += s.coefficient;
  }

  const monthlyAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0;
  const roundedAverage = Math.round((monthlyAverage + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAverage);

  return {
    totalWeightedScore: Math.round((totalWeightedScore + Number.EPSILON) * 100) / 100,
    totalCoefficients,
    monthlyAverage: roundedAverage,
    letterGrade,
    isPassing: roundedAverage >= 50.0,
  };
}

export interface SubjectSemesterInput {
  subjectCode: string;
  monthlyScores: number[]; // Scores for the months in this semester (1-5 for Sem1, 6-10 for Sem2)
  semesterExamScore: number; // Semester Exam Mark (0 - 100)
  coefficient: number;
  isExempt?: boolean;
}

export interface SubjectSemesterOutput {
  subjectCode: string;
  monthlyAverage: number;
  semesterExamScore: number;
  subjectSemesterScore: number; // (MonthlyAvg + Exam*2) / 3
  coefficient: number;
  weightedScore: number;
  letterGrade: MoEYSGradeDetail;
}

/**
 * Strictly computes the subject-level semester score according to MoEYS formula:
 * Subject Semester Score = (Monthly Average + (Semester Exam Mark * 2)) / 3
 */
export function calculateSubjectSemesterScore(input: SubjectSemesterInput): SubjectSemesterOutput {
  const validMonthly = input.monthlyScores.filter((s) => !isNaN(s) && s >= 0);
  const monthlyAvg = validMonthly.length > 0 ? validMonthly.reduce((a, b) => a + b, 0) / validMonthly.length : 0;
  const exam = Math.min(100, Math.max(0, input.semesterExamScore || 0));

  // Strict MoEYS Formula: (Monthly Avg + (Exam * 2)) / 3
  const subjectScore = (monthlyAvg + exam * 2) / 3;
  const roundedSubjectScore = Math.round((subjectScore + Number.EPSILON) * 100) / 100;
  const roundedMonthlyAvg = Math.round((monthlyAvg + Number.EPSILON) * 100) / 100;
  const weightedScore = Math.round((roundedSubjectScore * input.coefficient + Number.EPSILON) * 100) / 100;

  return {
    subjectCode: input.subjectCode,
    monthlyAverage: roundedMonthlyAvg,
    semesterExamScore: exam,
    subjectSemesterScore: roundedSubjectScore,
    coefficient: input.coefficient,
    weightedScore,
    letterGrade: calculateMoEYSGrade(roundedSubjectScore),
  };
}

export interface SemesterEvaluationResult {
  subjects: SubjectSemesterOutput[];
  totalWeightedScore: number;
  totalCoefficients: number;
  semesterAverage: number;
  letterGrade: MoEYSGradeDetail;
  isPassing: boolean;
}

/**
 * Computes the overall Semester result for a student across all subjects
 */
export function calculateSemesterResult(subjectInputs: SubjectSemesterInput[]): SemesterEvaluationResult {
  const subjects: SubjectSemesterOutput[] = [];
  let totalWeightedScore = 0;
  let totalCoefficients = 0;

  for (const input of subjectInputs) {
    if (input.isExempt) continue;
    const subResult = calculateSubjectSemesterScore(input);
    subjects.push(subResult);
    totalWeightedScore += subResult.weightedScore;
    totalCoefficients += subResult.coefficient;
  }

  const semesterAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients : 0;
  const roundedAvg = Math.round((semesterAverage + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAvg);

  return {
    subjects,
    totalWeightedScore: Math.round((totalWeightedScore + Number.EPSILON) * 100) / 100,
    totalCoefficients,
    semesterAverage: roundedAvg,
    letterGrade,
    isPassing: roundedAvg >= 50.0,
  };
}

export interface AnnualEvaluationResult {
  semester1Average: number;
  semester2Average: number;
  annualAverage: number;
  letterGrade: MoEYSGradeDetail;
  isPassing: boolean;
  promotionStatus: PromotionStatus;
}

/**
 * Computes Annual Result and Promotion Eligibility:
 * Annual Average = (Semester 1 Average + Semester 2 Average) / 2
 */
export function calculateAnnualResult(
  semester1Average: number,
  semester2Average: number,
  absencesNoPermission: number = 0
): AnnualEvaluationResult {
  const annualAvg = (semester1Average + semester2Average) / 2;
  const roundedAnnualAvg = Math.round((annualAvg + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAnnualAvg);

  let promotionStatus: PromotionStatus = 'PROMOTED';

  // MoEYS Promotion Rules
  if (absencesNoPermission > 30) {
    // Excessive unexcused absences lead to ineligibility/retention
    promotionStatus = 'INELIGIBLE';
  } else if (roundedAnnualAvg >= 50.0) {
    promotionStatus = 'PROMOTED';
  } else if (roundedAnnualAvg >= 45.0) {
    promotionStatus = 'RE_EXAM'; // Allowed re-examination before start of next school year
  } else {
    promotionStatus = 'RETAINED'; // Must repeat grade
  }

  return {
    semester1Average: Math.round((semester1Average + Number.EPSILON) * 100) / 100,
    semester2Average: Math.round((semester2Average + Number.EPSILON) * 100) / 100,
    annualAverage: roundedAnnualAvg,
    letterGrade,
    isPassing: roundedAnnualAvg >= 50.0,
    promotionStatus,
  };
}

export interface StudentRankInput {
  studentId: string;
  studentNameKhmer: string;
  gender: 'MALE' | 'FEMALE';
  averageScore: number;
  totalWeightedScore: number;
  coreSubjectScore?: number; // Tie-breaker 1
  attendanceRate?: number;    // Tie-breaker 2
}

export interface RankedStudent extends StudentRankInput {
  rank: number;
  isHonorRoll: boolean; // Top 5 in class
  letterGrade: MoEYSGradeDetail;
}

/**
 * Automated MoEYS Ranking Algorithm:
 * 1. Primary: Sort descending by average score.
 * 2. Tie-breakers: Core subject score, Attendance rate, Khmer alphabetical order.
 * 3. Assign dense ranks (or shared rank when exact match).
 * 4. Mark Top 5 Honor Roll (តារាងកិត្តិយស).
 */
export function rankStudents(students: StudentRankInput[]): RankedStudent[] {
  const sorted = [...students].sort((a, b) => {
    // 1. Average score (descending)
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    // 2. Total weighted points (descending)
    if (b.totalWeightedScore !== a.totalWeightedScore) {
      return b.totalWeightedScore - a.totalWeightedScore;
    }
    // 3. Core subject score (descending)
    if ((b.coreSubjectScore ?? 0) !== (a.coreSubjectScore ?? 0)) {
      return (b.coreSubjectScore ?? 0) - (a.coreSubjectScore ?? 0);
    }
    // 4. Attendance rate (descending)
    if ((b.attendanceRate ?? 100) !== (a.attendanceRate ?? 100)) {
      return (b.attendanceRate ?? 100) - (a.attendanceRate ?? 100);
    }
    // 5. Khmer alphabetical collation
    return a.studentNameKhmer.localeCompare(b.studentNameKhmer, 'km');
  });

  let currentRank = 1;
  const result: RankedStudent[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const student = sorted[i];
    if (i > 0) {
      const prev = sorted[i - 1];
      const isExactTie =
        prev.averageScore === student.averageScore &&
        prev.totalWeightedScore === student.totalWeightedScore &&
        (prev.coreSubjectScore ?? 0) === (student.coreSubjectScore ?? 0) &&
        (prev.attendanceRate ?? 100) === (student.attendanceRate ?? 100);

      if (!isExactTie) {
        currentRank = i + 1;
      }
    }

    result.push({
      ...student,
      rank: currentRank,
      isHonorRoll: currentRank <= 5 && student.averageScore >= 50.0,
      letterGrade: calculateMoEYSGrade(student.averageScore),
    });
  }

  return result;
}

/**
 * Cambodian Khmer Month Names for Academic Year (Months 1 to 10)
 */
export const KHMER_ACADEMIC_MONTHS = [
  { index: 1, nameKhmer: 'តុលា', nameEnglish: 'October', semester: 1 },
  { index: 2, nameKhmer: 'វិច្ឆិកា', nameEnglish: 'November', semester: 1 },
  { index: 3, nameKhmer: 'ធ្នូ', nameEnglish: 'December', semester: 1 },
  { index: 4, nameKhmer: 'មករា', nameEnglish: 'January', semester: 1 },
  { index: 5, nameKhmer: 'កុម្ភៈ', nameEnglish: 'February', semester: 1 },
  { index: 6, nameKhmer: 'មីនា', nameEnglish: 'March', semester: 2 },
  { index: 7, nameKhmer: 'មេសា', nameEnglish: 'April', semester: 2 },
  { index: 8, nameKhmer: 'ឧសភា', nameEnglish: 'May', semester: 2 },
  { index: 9, nameKhmer: 'មិថុនា', nameEnglish: 'June', semester: 2 },
  { index: 10, nameKhmer: 'កក្កដា', nameEnglish: 'July', semester: 2 },
];
