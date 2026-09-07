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










const MOEYS_GRADE_BENCHMARKS, MoEYSGradeDetail> = {
  GRADE_A: {
    code: 'GRADE_A',
    letter: 'A',
    labelKhmer: 'ល្អប្រសើរ (Excellent)',
    labelEnglish: 'Excellent',
    minScore.0,
    maxScore.0,
    isPassing,
    colorHex: '#059669', // Emerald
  },
  GRADE_B: {
    code: 'GRADE_B',
    letter: 'B',
    labelKhmer: 'ល្អណាស់ (Very Good)',
    labelEnglish: 'Very Good',
    minScore.0,
    maxScore.99,
    isPassing,
    colorHex: '#2563eb', // Blue
  },
  GRADE_C: {
    code: 'GRADE_C',
    letter: 'C',
    labelKhmer: 'ល្អ (Good)',
    labelEnglish: 'Good',
    minScore.0,
    maxScore.99,
    isPassing,
    colorHex: '#0284c7', // Sky
  },
  GRADE_D: {
    code: 'GRADE_D',
    letter: 'D',
    labelKhmer: 'ល្អបង្គួរ (Fairly Good)',
    labelEnglish: 'Fairly Good',
    minScore.0,
    maxScore.99,
    isPassing,
    colorHex: '#d97706', // Amber
  },
  GRADE_E: {
    code: 'GRADE_E',
    letter: 'E',
    labelKhmer: 'មធ្យម (Average / Passing)',
    labelEnglish: 'Average (Pass)',
    minScore.0,
    maxScore.99,
    isPassing,
    colorHex: '#ea580c', // Orange
  },
  GRADE_F: {
    code: 'GRADE_F',
    letter: 'F',
    labelKhmer: 'ខ្សោយ / ធ្លាក់ (Fail)',
    labelEnglish: 'Fail',
    minScore.0,
    maxScore.99,
    isPassing,
    colorHex: '#dc2626', // Red
  },
};



/**
 * Standard MoEYS Curriculum Subject Coefficients by Grade & Track
 */
const MOEYS_STANDARD_SUBJECT_RULES, SubjectRuleDefinition[]> = {
  // Grades 11 & 12 Science Stream (ថ្នាក់វិទ្យាសាស្ត្រ)
  SCIENCE_UPPER
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដី និងបរិស្ថាន', nameEnglish: 'Earth & Env Science', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស (អង់គ្លេស/បារាំង)', nameEnglish: 'Foreign Language', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'ICT', nameKhmer: 'បច្ចេកវិទ្យាព័ត៌មានវិទ្យា (ICT)', nameEnglish: 'ICT', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PE', nameKhmer: 'កីឡា និងអប់រំកាយ', nameEnglish: 'Physical Education', coefficient.0, maxScore, passingScore, isCore},
  ],

  // Grades 11 & 12 Social Science Stream (ថ្នាក់វិទ្យាសាស្ត្រសង្គម)
  SOCIAL_SCIENCE_UPPER
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដី និងបរិស្ថាន', nameEnglish: 'Earth & Env Science', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'ICT', nameKhmer: 'បច្ចេកវិទ្យាព័ត៌មានវិទ្យា', nameEnglish: 'ICT', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PE', nameKhmer: 'កីឡា និងអប់រំកាយ', nameEnglish: 'Physical Education', coefficient.0, maxScore, passingScore, isCore},
  ],

  // Grades 7 to 10 General Track (ថ្នាក់ចំណេះទូទៅ / មូលដ្ឋាន)
  GENERAL_STANDARD
    { subjectCode: 'KHM', nameKhmer: 'ភាសាខ្មែរ', nameEnglish: 'Khmer Literature', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'MATH', nameKhmer: 'គណិតវិទ្យា', nameEnglish: 'Mathematics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PHYS', nameKhmer: 'រូបវិទ្យា', nameEnglish: 'Physics', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'CHEM', nameKhmer: 'គីមីវិទ្យា', nameEnglish: 'Chemistry', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'BIO', nameKhmer: 'ជីវវិទ្យា', nameEnglish: 'Biology', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'HIST', nameKhmer: 'ប្រវត្តិវិទ្យា', nameEnglish: 'History', coefficient.5, maxScore, passingScore, isCore},
    { subjectCode: 'GEO', nameKhmer: 'ភូមិវិទ្យា', nameEnglish: 'Geography', coefficient.5, maxScore, passingScore, isCore},
    { subjectCode: 'MOR', nameKhmer: 'សីលធម៌-ពលរដ្ឋ', nameEnglish: 'Moral & Civics', coefficient.5, maxScore, passingScore, isCore},
    { subjectCode: 'EARTH', nameKhmer: 'ផែនដីវិទ្យា', nameEnglish: 'Earth Science', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'LANG', nameKhmer: 'ភាសាបរទេស', nameEnglish: 'Foreign Language', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'ICT', nameKhmer: 'ព័ត៌មានវិទ្យា', nameEnglish: 'ICT', coefficient.0, maxScore, passingScore, isCore},
    { subjectCode: 'PE', nameKhmer: 'អប់រំកាយ', nameEnglish: 'Physical Education', coefficient.0, maxScore, passingScore, isCore},
  ],
};

/**
 * Retrieve appropriate subject rules by grade level and stream track
 */
function getSubjectRulesForClass(gradeLevel, track){
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
function calculateMoEYSGrade(score){
  const rounded = Math.round((score + Number.EPSILON) * 100) / 100;
  if (rounded >= 85.0) return MOEYS_GRADE_BENCHMARKS.GRADE_A;
  if (rounded >= 80.0) return MOEYS_GRADE_BENCHMARKS.GRADE_B;
  if (rounded >= 70.0) return MOEYS_GRADE_BENCHMARKS.GRADE_C;
  if (rounded >= 60.0) return MOEYS_GRADE_BENCHMARKS.GRADE_D;
  if (rounded >= 50.0) return MOEYS_GRADE_BENCHMARKS.GRADE_E;
  return MOEYS_GRADE_BENCHMARKS.GRADE_F;
}





/**
 * Computes a student's weighted monthly average across all active subjects for a single month
 */
function calculateMonthlyAverage(scores){
  let totalWeightedScore = 0;
  let totalCoefficients = 0;

  for (const s of scores) {
    if (s.isExempt) continue;
    const clampedScore = Math.min(100, Math.max(0, s.rawScore));
    totalWeightedScore += clampedScore * s.coefficient;
    totalCoefficients += s.coefficient;
  }

  const monthlyAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients ;
  const roundedAverage = Math.round((monthlyAverage + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAverage);

  return {
    totalWeightedScore.round((totalWeightedScore + Number.EPSILON) * 100) / 100,
    totalCoefficients,
    monthlyAverage,
    letterGrade,
    isPassing= 50.0,
  };
}





/**
 * Strictly computes the subject-level semester score according to MoEYS formula:
 * Subject Semester Score = (Monthly Average + (Semester Exam Mark * 2)) / 3
 */
function calculateSubjectSemesterScore(input){
  const validMonthly = input.monthlyScores.filter((s) => !isNaN(s) && s >= 0);
  const monthlyAvg = validMonthly.length > 0 ? validMonthly.reduce((a, b) => a + b, 0) / validMonthly.length ;
  const exam = Math.min(100, Math.max(0, input.semesterExamScore || 0));

  // Strict MoEYS Formula: (Monthly Avg + (Exam * 2)) / 3
  const subjectScore = (monthlyAvg + exam * 2) / 3;
  const roundedSubjectScore = Math.round((subjectScore + Number.EPSILON) * 100) / 100;
  const roundedMonthlyAvg = Math.round((monthlyAvg + Number.EPSILON) * 100) / 100;
  const weightedScore = Math.round((roundedSubjectScore * input.coefficient + Number.EPSILON) * 100) / 100;

  return {
    subjectCode.subjectCode,
    monthlyAverage,
    semesterExamScore,
    subjectSemesterScore,
    coefficient.coefficient,
    weightedScore,
    letterGrade(roundedSubjectScore),
  };
}



/**
 * Computes the overall Semester result for a student across all subjects
 */
function calculateSemesterResult(subjectInputs){
  const subjects= [];
  let totalWeightedScore = 0;
  let totalCoefficients = 0;

  for (const input of subjectInputs) {
    if (input.isExempt) continue;
    const subResult = calculateSubjectSemesterScore(input);
    subjects.push(subResult);
    totalWeightedScore += subResult.weightedScore;
    totalCoefficients += subResult.coefficient;
  }

  const semesterAverage = totalCoefficients > 0 ? totalWeightedScore / totalCoefficients ;
  const roundedAvg = Math.round((semesterAverage + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAvg);

  return {
    subjects,
    totalWeightedScore.round((totalWeightedScore + Number.EPSILON) * 100) / 100,
    totalCoefficients,
    semesterAverage,
    letterGrade,
    isPassing= 50.0,
  };
}



/**
 * Computes Annual Result and Promotion Eligibility:
 * Annual Average = (Semester 1 Average + Semester 2 Average) / 2
 */
function calculateAnnualResult(
  semester1Average,
  semester2Average,
  absencesNoPermission= 0
){
  const annualAvg = (semester1Average + semester2Average) / 2;
  const roundedAnnualAvg = Math.round((annualAvg + Number.EPSILON) * 100) / 100;
  const letterGrade = calculateMoEYSGrade(roundedAnnualAvg);

  let promotionStatus= 'PROMOTED';

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
    semester1Average.round((semester1Average + Number.EPSILON) * 100) / 100,
    semester2Average.round((semester2Average + Number.EPSILON) * 100) / 100,
    annualAverage,
    letterGrade,
    isPassing= 50.0,
    promotionStatus,
  };
}





/**
 * Automated MoEYS Ranking Algorithm:
 * 1. Primary.
 * 2. Tie-breakers, Attendance rate, Khmer alphabetical order.
 * 3. Assign dense ranks (or shared rank when exact match).
 * 4. Mark Top 5 Honor Roll (តារាងកិត្តិយស).
 */
function rankStudents(students){
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
  const result= [];

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
      rank,
      isHonorRoll= 5 && student.averageScore >= 50.0,
      letterGrade(student.averageScore),
    });
  }

  return result;
}

/**
 * Cambodian Khmer Month Names for Academic Year (Months 1 to 10)
 */
const KHMER_ACADEMIC_MONTHS = [
  { index, nameKhmer: 'តុលា', nameEnglish: 'October', semester},
  { index, nameKhmer: 'វិច្ឆិកា', nameEnglish: 'November', semester},
  { index, nameKhmer: 'ធ្នូ', nameEnglish: 'December', semester},
  { index, nameKhmer: 'មករា', nameEnglish: 'January', semester},
  { index, nameKhmer: 'កុម្ភៈ', nameEnglish: 'February', semester},
  { index, nameKhmer: 'មីនា', nameEnglish: 'March', semester},
  { index, nameKhmer: 'មេសា', nameEnglish: 'April', semester},
  { index, nameKhmer: 'ឧសភា', nameEnglish: 'May', semester},
  { index, nameKhmer: 'មិថុនា', nameEnglish: 'June', semester},
  { index, nameKhmer: 'កក្កដា', nameEnglish: 'July', semester},
];

module.exports = { calculateMoEYSGrade, calculateMonthlyAverage, calculateSubjectSemesterScore, calculateSemesterResult, calculateAnnualResult, rankStudents, MOEYS_GRADE_BENCHMARKS, MOEYS_STANDARD_SUBJECT_RULES };