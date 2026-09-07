/**
 * MoEYS Cambodian Standard Monthly Competency & Skills Gradebook Engine
 * តារាងពិន្ទុប្រចាំខែតាមជំនាញ និងសមត្ថភាពក្រសួងអប់រំ យុវជន និងកីឡា
 */

import { SEED_STUDENTS_30, SEED_ALL_STUDENTS, StudentData } from './schoolData';

export interface CompetencyColumnDef {
  key: string;
  nameKhmer: string;
  nameEnglish: string;
  maxScore: number;
}

export interface MonthlySubjectGroupDef {
  id: string;
  nameKhmer: string;
  nameEnglish: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  subHeaderBg?: string;
  cellBg?: string;
  subColumns: CompetencyColumnDef[];
}

export const MONTHLY_SUBJECT_GROUPS: MonthlySubjectGroupDef[] = [
  {
    id: 'KHM',
    nameKhmer: 'ភាសាខ្មែរ',
    nameEnglish: 'Khmer Language',
    headerBg: 'bg-indigo-50 border-t-4 border-indigo-500',
    headerText: 'text-indigo-950 font-black',
    badgeBg: 'bg-indigo-100 text-indigo-900',
    subHeaderBg: 'bg-indigo-100 text-indigo-950',
    cellBg: 'bg-indigo-50',
    subColumns: [
      { key: 'khm_listening', nameKhmer: 'សមត្ថភាពស្ដាប់', nameEnglish: 'Listening', maxScore: 100 },
      { key: 'khm_writing', nameKhmer: 'សមត្ថភាពសរសេរ', nameEnglish: 'Writing', maxScore: 100 },
      { key: 'khm_reading', nameKhmer: 'សមត្ថភាពអាន', nameEnglish: 'Reading', maxScore: 100 },
      { key: 'khm_speaking', nameKhmer: 'សមត្ថភាពនិយាយ', nameEnglish: 'Speaking', maxScore: 100 },
    ],
  },
  {
    id: 'MATH',
    nameKhmer: 'គណិតវិទ្យា',
    nameEnglish: 'Mathematics',
    headerBg: 'bg-blue-50 border-t-4 border-blue-500',
    headerText: 'text-blue-950 font-black',
    badgeBg: 'bg-blue-100 text-blue-900',
    subHeaderBg: 'bg-blue-100 text-blue-950',
    cellBg: 'bg-blue-50',
    subColumns: [
      { key: 'math_numbers', nameKhmer: 'ចំនួន', nameEnglish: 'Numbers', maxScore: 100 },
      { key: 'math_measure', nameKhmer: 'រង្វាស់រង្វាល់', nameEnglish: 'Measurement', maxScore: 100 },
      { key: 'math_geometry', nameKhmer: 'ធរណីមាត្រ', nameEnglish: 'Geometry', maxScore: 100 },
      { key: 'math_algebra', nameKhmer: 'ពិជគណិត', nameEnglish: 'Algebra', maxScore: 100 },
      { key: 'math_statistics', nameKhmer: 'ស្ថិតិ', nameEnglish: 'Statistics', maxScore: 100 },
    ],
  },
  {
    id: 'SCI',
    nameKhmer: 'វិទ្យាសាស្ត្រ',
    nameEnglish: 'Science',
    headerBg: 'bg-emerald-50 border-t-4 border-emerald-500',
    headerText: 'text-emerald-950 font-black',
    badgeBg: 'bg-emerald-100 text-emerald-900',
    subHeaderBg: 'bg-emerald-100 text-emerald-950',
    cellBg: 'bg-emerald-50',
    subColumns: [
      { key: 'sci_physics', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', maxScore: 100 },
      { key: 'sci_chemistry', nameKhmer: 'គីមី', nameEnglish: 'Chemistry', maxScore: 100 },
      { key: 'sci_biology', nameKhmer: 'ជីវៈ', nameEnglish: 'Biology', maxScore: 100 },
      { key: 'sci_earth_env', nameKhmer: 'ផែនដី-បរិស្ថានវិទ្យា', nameEnglish: 'Earth-Env', maxScore: 100 },
    ],
  },
  {
    id: 'SOC',
    nameKhmer: 'សិក្សាសង្គម',
    nameEnglish: 'Social Studies',
    headerBg: 'bg-amber-50 border-t-4 border-amber-500',
    headerText: 'text-amber-950 font-black',
    badgeBg: 'bg-amber-100 text-amber-900',
    subHeaderBg: 'bg-amber-100 text-amber-950',
    cellBg: 'bg-amber-50',
    subColumns: [
      { key: 'soc_civics', nameKhmer: 'សីលធម៌-ពលរដ្ឋវិជ្ជា', nameEnglish: 'Civics & Moral', maxScore: 100 },
      { key: 'soc_geography', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', maxScore: 100 },
      { key: 'soc_history', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', maxScore: 100 },
      { key: 'soc_home_arts', nameKhmer: 'គេហៈវិទ្យា-អប់រំសិល្បៈ', nameEnglish: 'Home Ec & Art', maxScore: 100 },
    ],
  },
  {
    id: 'PE_HEALTH',
    nameKhmer: 'អប់រំកាយសុខភាពកីឡា',
    nameEnglish: 'PE & Health',
    headerBg: 'bg-orange-100 border-t-4 border-orange-500',
    headerText: 'text-orange-950 font-black',
    badgeBg: 'bg-orange-200 text-orange-900',
    subHeaderBg: 'bg-orange-100 text-orange-950',
    cellBg: 'bg-orange-50',
    subColumns: [
      { key: 'pe_sports', nameKhmer: 'អប់រំកាយ-កីឡា', nameEnglish: 'PE & Sports', maxScore: 100 },
      { key: 'pe_hygiene', nameKhmer: 'សុខភាព-អនាម័យ', nameEnglish: 'Health & Hygiene', maxScore: 100 },
    ],
  },
  {
    id: 'LIFE_SKILLS',
    nameKhmer: 'អប់រំបំណិនជីវិត',
    nameEnglish: 'Life Skills',
    headerBg: 'bg-purple-50 border-t-4 border-purple-500',
    headerText: 'text-purple-950 font-black',
    badgeBg: 'bg-purple-100 text-purple-900',
    subHeaderBg: 'bg-purple-100 text-purple-950',
    cellBg: 'bg-purple-50',
    subColumns: [
      { key: 'life_skills', nameKhmer: 'អប់រំបំណិនជីវិត', nameEnglish: 'Life Skills', maxScore: 100 },
    ],
  },
  {
    id: 'FOREIGN_LANG',
    nameKhmer: 'ភាសាបរទេស',
    nameEnglish: 'Foreign Language',
    headerBg: 'bg-rose-50 border-t-4 border-rose-500',
    headerText: 'text-rose-950 font-black',
    badgeBg: 'bg-rose-100 text-rose-900',
    subHeaderBg: 'bg-rose-100 text-rose-950',
    cellBg: 'bg-rose-50',
    subColumns: [
      { key: 'foreign_lang', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', maxScore: 100 },
    ],
  },
];


// Flat list of all 21 competency sub-columns
export const ALL_COMPETENCY_COLUMNS: CompetencyColumnDef[] = MONTHLY_SUBJECT_GROUPS.flatMap(
  (g) => g.subColumns
);

export interface AcademicMonthDef {
  index: number;
  nameKhmer: string;
  nameEnglish: string;
  semester: 1 | 2;
  isExamMonth?: boolean;
}

export const ALL_CALENDAR_MONTHS = [
  { nameKhmer: 'ខែតុលា', nameEnglish: 'October' },
  { nameKhmer: 'ខែវិច្ឆិកា', nameEnglish: 'November' },
  { nameKhmer: 'ខែធ្នូ', nameEnglish: 'December' },
  { nameKhmer: 'ខែមករា', nameEnglish: 'January' },
  { nameKhmer: 'ខែកុម្ភៈ', nameEnglish: 'February' },
  { nameKhmer: 'ខែមីនា', nameEnglish: 'March' },
  { nameKhmer: 'ខែមេសា', nameEnglish: 'April' },
  { nameKhmer: 'ខែឧសភា', nameEnglish: 'May' },
  { nameKhmer: 'ខែមិថុនា', nameEnglish: 'June' },
  { nameKhmer: 'ខែកក្កដា', nameEnglish: 'July' },
  { nameKhmer: 'ខែសីហា', nameEnglish: 'August' },
  { nameKhmer: 'ខែកញ្ញា', nameEnglish: 'September' },
];

export const MONTHLY_ACADEMIC_MONTHS: AcademicMonthDef[] = [
  { index: 1, nameKhmer: 'ខែតុលា', nameEnglish: 'October', semester: 1, isExamMonth: true },
  { index: 2, nameKhmer: 'ខែវិច្ឆិកា', nameEnglish: 'November', semester: 1, isExamMonth: true },
  { index: 3, nameKhmer: 'ខែធ្នូ', nameEnglish: 'December', semester: 1, isExamMonth: true },
  { index: 4, nameKhmer: 'ខែមករា', nameEnglish: 'January', semester: 1, isExamMonth: true },
  { index: 5, nameKhmer: 'ខែកុម្ភៈ', nameEnglish: 'February', semester: 1, isExamMonth: true },
  { index: 6, nameKhmer: 'ខែមីនា', nameEnglish: 'March', semester: 2, isExamMonth: true },
  { index: 7, nameKhmer: 'ខែមេសា', nameEnglish: 'April', semester: 2, isExamMonth: true },
  { index: 8, nameKhmer: 'ខែឧសភា', nameEnglish: 'May', semester: 2, isExamMonth: true },
  { index: 9, nameKhmer: 'ខែមិថុនា', nameEnglish: 'June', semester: 2, isExamMonth: true },
  { index: 10, nameKhmer: 'ខែកក្កដា', nameEnglish: 'July', semester: 2, isExamMonth: true },
];

export interface StudentMonthlyCompetencyRecord {
  student: StudentData;
  scores: Record<string, number>; // key = column.key, value = score (0-100)
  totalScore: number;
  averageScore: number;
  rank: number;
  gradeLetter: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  gradeLabelKhmer: string;
  isPassing: boolean;
  remarks: string;
}

// Generate initial realistic scores for all students across classes
export function generateInitialMonthlyCompetencyScores(
  students: StudentData[] = []
): Record<number, Record<string, Record<string, number>>> {
  return {};
}

// Helper to calculate total, average, ranks, and letter grades
export function computeMonthlyStudentRecords(
  students: StudentData[],
  monthScores: Record<string, Record<string, number>>,
  remarksMap: Record<string, string> = {},
  subjectDivisor: number = ALL_COMPETENCY_COLUMNS.length,
  activeColumns?: string[]
): StudentMonthlyCompetencyRecord[] {
  const effectiveColumns = activeColumns && activeColumns.length > 0
    ? ALL_COMPETENCY_COLUMNS.filter((c) => activeColumns.includes(c.key))
    : ALL_COMPETENCY_COLUMNS;

  const defaultDivisor = effectiveColumns.length > 0 ? effectiveColumns.length : 1;
  const divisor = subjectDivisor && subjectDivisor > 0 ? subjectDivisor : defaultDivisor;

  const records = students.map((student) => {
    const scores = monthScores[student.studentNationalId] || {};
    let sum = 0;
    let validCount = 0;

    effectiveColumns.forEach((col) => {
      const val = scores[col.key];
      if (typeof val === 'number' && !isNaN(val)) {
        sum += val;
        validCount++;
      }
    });

    const average = validCount > 0 ? sum / divisor : 0;
    let letter = 'F';
    let labelKhmer = 'ខ្សោយ / ធ្លាក់';
    let isPassing = false;

    if (average >= 85) {
      letter = 'A';
      labelKhmer = 'ល្អប្រសើរ';
      isPassing = true;
    } else if (average >= 80) {
      letter = 'B';
      labelKhmer = 'ល្អណាស់';
      isPassing = true;
    } else if (average >= 70) {
      letter = 'C';
      labelKhmer = 'ល្អ';
      isPassing = true;
    } else if (average >= 60) {
      letter = 'D';
      labelKhmer = 'ល្អបង្គួរ';
      isPassing = true;
    } else if (average >= 50) {
      letter = 'E';
      labelKhmer = 'មធ្យម (ជាប់)';
      isPassing = true;
    } else {
      letter = 'F';
      labelKhmer = 'ខ្សោយ (ធ្លាក់)';
      isPassing = false;
    }

    return {
      student,
      scores,
      totalScore: Number(sum.toFixed(1)),
      averageScore: Number(average.toFixed(2)),
      rank: 0,
      gradeLetter: letter,
      gradeLabelKhmer: labelKhmer,
      isPassing,
      remarks: remarksMap[student.studentNationalId] || '',
    };
  });

  // Calculate ranks (descending by averageScore, tie-break by rollNumber)
  const sorted = [...records].sort((a, b) => {
    if (b.averageScore !== a.averageScore) {
      return b.averageScore - a.averageScore;
    }
    return a.student.rollNumber - b.student.rollNumber;
  });

  let currentRank = 1;
  sorted.forEach((item, idx) => {
    if (idx > 0 && item.averageScore < sorted[idx - 1].averageScore) {
      currentRank = idx + 1;
    }
    item.rank = currentRank;
  });

  return records;
}

export function computeGradeStatistics(records: StudentMonthlyCompetencyRecord[]) {
  const counts: Record<string, { total: number; female: number }> = {
    A: { total: 0, female: 0 },
    B: { total: 0, female: 0 },
    C: { total: 0, female: 0 },
    D: { total: 0, female: 0 },
    E: { total: 0, female: 0 },
    F: { total: 0, female: 0 },
  };

  let passedStudents = 0;
  let passedFemales = 0;
  let totalStudents = records.length;
  let femaleStudents = 0;

  records.forEach((r) => {
    const isFemale = r.student.gender === 'FEMALE';
    if (isFemale) femaleStudents++;

    if (counts[r.gradeLetter]) {
      counts[r.gradeLetter].total++;
      if (isFemale) {
        counts[r.gradeLetter].female++;
      }
    }

    if (r.isPassing) {
      passedStudents++;
      if (isFemale) passedFemales++;
    }
  });

  const failedStudents = totalStudents - passedStudents;
  const failedFemales = femaleStudents - passedFemales;

  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const passFemaleRate = femaleStudents > 0 ? ((passedFemales / femaleStudents) * 100).toFixed(2) : '0.00';
  const failRate = totalStudents > 0 ? ((failedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const failFemaleRate = femaleStudents > 0 ? ((failedFemales / femaleStudents) * 100).toFixed(2) : '0.00';

  return {
    counts,
    totalStudents,
    femaleStudents,
    passedStudents,
    passedFemales,
    failedStudents,
    failedFemales,
    passRate,
    passFemaleRate,
    failRate,
    failFemaleRate,
  };
}

// ============================================================================
// OFFICIAL MOEYS SEMESTER GRADEBOOK ENGINE (តារាងពិន្ទុប្រចាំឆមាស)
// ============================================================================

export interface SemesterExamSubjectDef {
  key: string;
  nameKhmer: string;
  nameEnglish: string;
  groupNameKhmer: string;
  maxScore: number;
}

export const SEMESTER_EXAM_SUBJECTS: SemesterExamSubjectDef[] = [
  // ភាសាខ្មែរ (៤ ជំនាញ)
  { key: 'khm_reading', nameKhmer: 'អំណាន', nameEnglish: 'Reading', groupNameKhmer: 'ភាសាខ្មែរ', maxScore: 100 },
  { key: 'khm_listen_speak', nameKhmer: 'ស្ដាប់ និងនិយាយ', nameEnglish: 'Listening & Speaking', groupNameKhmer: 'ភាសាខ្មែរ', maxScore: 100 },
  { key: 'khm_dictation', nameKhmer: 'សរសេរតាមអាន', nameEnglish: 'Dictation', groupNameKhmer: 'ភាសាខ្មែរ', maxScore: 100 },
  { key: 'khm_essay', nameKhmer: 'តែងសេចក្ដី', nameEnglish: 'Composition / Essay', groupNameKhmer: 'ភាសាខ្មែរ', maxScore: 100 },
  // គណិតវិទ្យា
  { key: 'math', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', groupNameKhmer: 'គណិតវិទ្យា', maxScore: 100 },
  // វិទ្យាសាស្ត្រ
  { key: 'science', nameKhmer: 'វិទ្យាសាស្ត្រ', nameEnglish: 'Science', groupNameKhmer: 'វិទ្យាសាស្ត្រ', maxScore: 100 },
  // សិក្សាសង្គម (៤ មុខវិជ្ជា)
  { key: 'civics', nameKhmer: 'សីលធម៌-ពលរដ្ឋវិជ្ជា', nameEnglish: 'Moral & Civics', groupNameKhmer: 'សិក្សាសង្គម', maxScore: 100 },
  { key: 'geography', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', groupNameKhmer: 'សិក្សាសង្គម', maxScore: 100 },
  { key: 'history', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', groupNameKhmer: 'សិក្សាសង្គម', maxScore: 100 },
  { key: 'home_arts', nameKhmer: 'គេហៈវិទ្យា-អប់រំសិល្បៈ', nameEnglish: 'Home Ec & Arts', groupNameKhmer: 'សិក្សាសង្គម', maxScore: 100 },
  // អប់រំកាយ-សុខភាព
  { key: 'pe_sports', nameKhmer: 'អប់រំកាយ-កីឡា', nameEnglish: 'PE & Sports', groupNameKhmer: 'អប់រំកាយសុខភាពកីឡា', maxScore: 100 },
  { key: 'pe_hygiene', nameKhmer: 'សុខភាព-អនាម័យ', nameEnglish: 'Health & Hygiene', groupNameKhmer: 'អប់រំកាយសុខភាពកីឡា', maxScore: 100 },
  // អប់រំបំណិនជីវិត
  { key: 'life_skills', nameKhmer: 'អប់រំបំណិនជីវិត', nameEnglish: 'Life Skills', groupNameKhmer: 'អប់រំបំណិនជីវិត', maxScore: 100 },
  // ភាសាបរទេស
  { key: 'foreign_lang', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', groupNameKhmer: 'ភាសាបរទេស', maxScore: 100 },
];

export interface DomainGrades {
  knowledge: string;      // ចំណេះដឹង (A, B, C, D, E, F)
  skills: string;         // បំណិន-ចំណេះធ្វើ (A, B, C, D, E, F)
  values: string;         // តម្លៃ-សីលធម៌ (A, B, C, D, E, F)
  participation: string;  // សាមគ្គីភាព-ការចូលរួម (A, B, C, D, E, F)
}

export interface StudentSemesterGradebookRecord {
  student: StudentData;
  examScores: Record<string, number>; // key = subject key, value = score (0-100)
  totalExamScore: number;
  examAverage: number;
  monthlyAverage: number;
  semesterAverage: number;
  rank: number;
  gradeLetter: string;
  gradeLabelKhmer: string;
  isPassing: boolean;
  domainGrades: DomainGrades;
  remarks: string;
}

export function scoreToMoEYSLetter(avg: number): { letter: string; labelKhmer: string; isPassing: boolean } {
  if (avg >= 85) return { letter: 'A', labelKhmer: 'ល្អប្រសើរ', isPassing: true };
  if (avg >= 80) return { letter: 'B', labelKhmer: 'ល្អណាស់', isPassing: true };
  if (avg >= 70) return { letter: 'C', labelKhmer: 'ល្អ', isPassing: true };
  if (avg >= 60) return { letter: 'D', labelKhmer: 'ល្អបង្គួរ', isPassing: true };
  if (avg >= 50) return { letter: 'E', labelKhmer: 'មធ្យម (ជាប់)', isPassing: true };
  return { letter: 'F', labelKhmer: 'ខ្សោយ (ធ្លាក់)', isPassing: false };
}

// Generate realistic initial scores for Semester 1 & 2 exams
export function generateInitialSemesterExamScores(
  students: StudentData[] = []
): Record<number, Record<string, Record<string, number>>> {
  return { 1: {}, 2: {} };
}

export function computeSemesterGradebookRecords(
  students: StudentData[],
  semesterExamScores: Record<string, Record<string, number>>,
  monthlyScoresMap: Record<number, Record<string, Record<string, number>>>,
  academicMonths: AcademicMonthDef[],
  targetSemester: 1 | 2 = 1,
  subjectDivisor: number = SEMESTER_EXAM_SUBJECTS.length,
  customDomainGrades: Record<string, Partial<DomainGrades>> = {},
  remarksMap: Record<string, string> = {}
): StudentSemesterGradebookRecord[] {
  const divisor = subjectDivisor && subjectDivisor > 0 ? subjectDivisor : SEMESTER_EXAM_SUBJECTS.length;

  // Find all active examined months in this semester
  const semesterExamMonths = academicMonths.filter(
    (m) => m.semester === targetSemester && m.isExamMonth !== false
  );

  const records = students.map((student) => {
    const studentId = student.studentNationalId;
    const examScores = semesterExamScores[studentId] || {};

    // 1. Total Exam Score & Exam Average
    let totalExamScore = 0;
    let validExamCount = 0;
    SEMESTER_EXAM_SUBJECTS.forEach((subj) => {
      const val = examScores[subj.key];
      if (typeof val === 'number' && !isNaN(val)) {
        totalExamScore += val;
        validExamCount++;
      }
    });

    const examAverage = validExamCount > 0 ? totalExamScore / divisor : 0;

    // 2. Monthly Average (from semester's active months)
    let sumMonthlyAverages = 0;
    let monthCount = 0;

    semesterExamMonths.forEach((m) => {
      const monthData = monthlyScoresMap[m.index]?.[studentId];
      if (monthData) {
        let monthSum = 0;
        let count = 0;
        Object.values(monthData).forEach((sc) => {
          if (typeof sc === 'number' && !isNaN(sc)) {
            monthSum += sc;
            count++;
          }
        });
        if (count > 0) {
          const mAvg = monthSum / count;
          sumMonthlyAverages += mAvg;
          monthCount++;
        }
      }
    });

    const monthlyAverage = monthCount > 0 ? sumMonthlyAverages / monthCount : examAverage;

    // 3. Final Semester Average = (Exam Avg + Monthly Avg) / 2
    const semesterAverage = Number(((examAverage + monthlyAverage) / 2).toFixed(2));

    const { letter, labelKhmer, isPassing } = scoreToMoEYSLetter(semesterAverage);

    // 4. Domain Grades (4 ផ្នែក)
    const getAvgScore = (keys: string[]) => {
      let sum = 0;
      let cnt = 0;
      keys.forEach((k) => {
        if (typeof examScores[k] === 'number') {
          sum += examScores[k];
          cnt++;
        }
      });
      return cnt > 0 ? sum / cnt : semesterAverage;
    };

    const knowledgeScore = getAvgScore(['math', 'science', 'geography', 'history', 'civics']);
    const skillsScore = getAvgScore(['khm_reading', 'khm_dictation', 'khm_essay', 'home_arts', 'life_skills']);
    const valuesScore = getAvgScore(['civics', 'pe_hygiene']);
    const participationScore = getAvgScore(['pe_sports', 'khm_listen_speak', 'foreign_lang']);

    const customDomains = customDomainGrades[studentId] || {};
    const domainGrades: DomainGrades = {
      knowledge: customDomains.knowledge || scoreToMoEYSLetter(knowledgeScore).letter,
      skills: customDomains.skills || scoreToMoEYSLetter(skillsScore).letter,
      values: customDomains.values || scoreToMoEYSLetter(valuesScore).letter,
      participation: customDomains.participation || scoreToMoEYSLetter(participationScore).letter,
    };

    return {
      student,
      examScores,
      totalExamScore: Number(totalExamScore.toFixed(1)),
      examAverage: Number(examAverage.toFixed(2)),
      monthlyAverage: Number(monthlyAverage.toFixed(2)),
      semesterAverage,
      rank: 0,
      gradeLetter: letter,
      gradeLabelKhmer: labelKhmer,
      isPassing,
      domainGrades,
      remarks: remarksMap[studentId] || '',
    };
  });

  // Calculate Ranks
  const sorted = [...records].sort((a, b) => {
    if (b.semesterAverage !== a.semesterAverage) {
      return b.semesterAverage - a.semesterAverage;
    }
    return a.student.rollNumber - b.student.rollNumber;
  });

  let currentRank = 1;
  sorted.forEach((item, idx) => {
    if (idx > 0 && item.semesterAverage < sorted[idx - 1].semesterAverage) {
      currentRank = idx + 1;
    }
    item.rank = currentRank;
  });

  return records;
}

export function computeSemesterGradeStatistics(records: StudentSemesterGradebookRecord[]) {
  const counts: Record<string, { total: number; female: number }> = {
    A: { total: 0, female: 0 },
    B: { total: 0, female: 0 },
    C: { total: 0, female: 0 },
    D: { total: 0, female: 0 },
    E: { total: 0, female: 0 },
    F: { total: 0, female: 0 },
  };

  let passedStudents = 0;
  let passedFemales = 0;
  let totalStudents = records.length;
  let femaleStudents = 0;

  records.forEach((r) => {
    const isFemale = r.student.gender === 'FEMALE';
    if (isFemale) femaleStudents++;

    if (counts[r.gradeLetter]) {
      counts[r.gradeLetter].total++;
      if (isFemale) counts[r.gradeLetter].female++;
    }

    if (r.isPassing) {
      passedStudents++;
      if (isFemale) passedFemales++;
    }
  });

  const failedStudents = totalStudents - passedStudents;
  const failedFemales = femaleStudents - passedFemales;

  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const passFemaleRate = femaleStudents > 0 ? ((passedFemales / femaleStudents) * 100).toFixed(2) : '0.00';
  const failRate = totalStudents > 0 ? ((failedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const failFemaleRate = femaleStudents > 0 ? ((failedFemales / femaleStudents) * 100).toFixed(2) : '0.00';

  return {
    counts,
    totalStudents,
    femaleStudents,
    passedStudents,
    passedFemales,
    failedStudents,
    failedFemales,
    passRate,
    passFemaleRate,
    failRate,
    failFemaleRate,
  };
}

// ============================================================================
// OFFICIAL MOEYS ANNUAL GRADEBOOK ENGINE (តារាងលទ្ធផលប្រចាំឆ្នាំ)
// ============================================================================

export interface StudentAnnualGradebookRecord {
  student: StudentData;
  semester1Average: number;
  semester2Average: number;
  annualAverage: number;
  rank: number;
  gradeLetter: string;
  gradeLabelKhmer: string;
  isPassing: boolean;
  domainGrades: DomainGrades;
  outcome: 'ឡើងថ្នាក់' | 'ត្រួតថ្នាក់' | string;
  remarks: string;
}

export function computeAnnualGradebookRecords(
  students: StudentData[],
  semesterExamScoresMap: Record<number, Record<string, Record<string, number>>>,
  monthlyScoresMap: Record<number, Record<string, Record<string, number>>>,
  academicMonths: AcademicMonthDef[],
  subjectDivisorSem1: number = SEMESTER_EXAM_SUBJECTS.length,
  subjectDivisorSem2: number = SEMESTER_EXAM_SUBJECTS.length,
  customAnnualDomainGrades: Record<string, Partial<DomainGrades>> = {},
  annualRemarksMap: Record<string, string> = {}
): StudentAnnualGradebookRecord[] {
  const sem1Records = computeSemesterGradebookRecords(
    students,
    (semesterExamScoresMap && semesterExamScoresMap[1]) || {},
    monthlyScoresMap || {},
    academicMonths,
    1,
    subjectDivisorSem1
  );

  const sem2Records = computeSemesterGradebookRecords(
    students,
    (semesterExamScoresMap && semesterExamScoresMap[2]) || {},
    monthlyScoresMap || {},
    academicMonths,
    2,
    subjectDivisorSem2
  );

  const sem1Map = new Map(sem1Records.map((r) => [r.student.studentNationalId, r]));
  const sem2Map = new Map(sem2Records.map((r) => [r.student.studentNationalId, r]));

  const records = students.map((student) => {
    const studentId = student.studentNationalId;
    const r1 = sem1Map.get(studentId);
    const r2 = sem2Map.get(studentId);

    const s1Avg = r1 ? r1.semesterAverage : 0;
    const s2Avg = r2 ? r2.semesterAverage : s1Avg;

    // Formula: មធ្យមភាគប្រចាំឆ្នាំ = (មធ្យមភាគប្រចាំឆមាស១ + មធ្យមភាគប្រចាំឆមាស២) ÷ ២
    const annualAverage = Number(((s1Avg + s2Avg) / 2).toFixed(2));
    const { letter, labelKhmer, isPassing } = scoreToMoEYSLetter(annualAverage);

    const custom = customAnnualDomainGrades[studentId] || {};
    const domainGrades: DomainGrades = {
      knowledge: custom.knowledge || r2?.domainGrades.knowledge || r1?.domainGrades.knowledge || letter,
      skills: custom.skills || r2?.domainGrades.skills || r1?.domainGrades.skills || letter,
      values: custom.values || r2?.domainGrades.values || r1?.domainGrades.values || letter,
      participation: custom.participation || r2?.domainGrades.participation || r1?.domainGrades.participation || letter,
    };

    const outcome = isPassing ? 'ឡើងថ្នាក់' : 'ត្រួតថ្នាក់';
    const remarks = annualRemarksMap[studentId] || '';

    return {
      student,
      semester1Average: s1Avg,
      semester2Average: s2Avg,
      annualAverage,
      rank: 0,
      gradeLetter: letter,
      gradeLabelKhmer: labelKhmer,
      isPassing,
      domainGrades,
      outcome,
      remarks,
    };
  });

  // Calculate annual ranks
  const sorted = [...records].sort((a, b) => {
    if (b.annualAverage !== a.annualAverage) {
      return b.annualAverage - a.annualAverage;
    }
    return a.student.rollNumber - b.student.rollNumber;
  });

  let currentRank = 1;
  sorted.forEach((item, idx) => {
    if (idx > 0 && item.annualAverage < sorted[idx - 1].annualAverage) {
      currentRank = idx + 1;
    }
    item.rank = currentRank;
  });

  return records;
}

export function computeAnnualGradeStatistics(records: StudentAnnualGradebookRecord[]) {
  const counts: Record<string, { total: number; female: number }> = {
    A: { total: 0, female: 0 },
    B: { total: 0, female: 0 },
    C: { total: 0, female: 0 },
    D: { total: 0, female: 0 },
    E: { total: 0, female: 0 },
    F: { total: 0, female: 0 },
  };

  let passedStudents = 0;
  let passedFemales = 0;
  let totalStudents = records.length;
  let femaleStudents = 0;

  records.forEach((r) => {
    const isFemale = r.student.gender === 'FEMALE';
    if (isFemale) femaleStudents++;

    if (counts[r.gradeLetter]) {
      counts[r.gradeLetter].total++;
      if (isFemale) counts[r.gradeLetter].female++;
    }

    if (r.isPassing) {
      passedStudents++;
      if (isFemale) passedFemales++;
    }
  });

  const failedStudents = totalStudents - passedStudents;
  const failedFemales = femaleStudents - passedFemales;

  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const passFemaleRate = femaleStudents > 0 ? ((passedFemales / femaleStudents) * 100).toFixed(2) : '0.00';
  const failRate = totalStudents > 0 ? ((failedStudents / totalStudents) * 100).toFixed(2) : '0.00';
  const failFemaleRate = femaleStudents > 0 ? ((failedFemales / femaleStudents) * 100).toFixed(2) : '0.00';

  return {
    counts,
    totalStudents,
    femaleStudents,
    passedStudents,
    passedFemales,
    failedStudents,
    failedFemales,
    passRate,
    passFemaleRate,
    failRate,
    failFemaleRate,
  };
}

