/**
 * Verification Test Suite for MoEYS Grading Engine
 */

const {
  calculateMoEYSGrade,
  calculateMonthlyAverage,
  calculateSubjectSemesterScore,
  calculateSemesterResult,
  calculateAnnualResult,
  rankStudents,
  MOEYS_GRADE_BENCHMARKS,
  MOEYS_STANDARD_SUBJECT_RULES,
} = require('./gradingEngine.ts');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- 1. Testing MoEYS Grade Benchmarks (និទ្ទេស) ---');
assert(calculateMoEYSGrade(100).letter === 'A', '100% -> Grade A (ល្អប្រសើរ)');
assert(calculateMoEYSGrade(85.0).letter === 'A', '85.00% -> Grade A (ល្អប្រសើរ)');
assert(calculateMoEYSGrade(84.99).letter === 'B', '84.99% -> Grade B (ល្អណាស់)');
assert(calculateMoEYSGrade(80.0).letter === 'B', '80.00% -> Grade B (ល្អណាស់)');
assert(calculateMoEYSGrade(79.99).letter === 'C', '79.99% -> Grade C (ល្អ)');
assert(calculateMoEYSGrade(70.0).letter === 'C', '70.00% -> Grade C (ល្អ)');
assert(calculateMoEYSGrade(69.99).letter === 'D', '69.99% -> Grade D (ល្អបង្គួរ)');
assert(calculateMoEYSGrade(60.0).letter === 'D', '60.00% -> Grade D (ល្អបង្គួរ)');
assert(calculateMoEYSGrade(59.99).letter === 'E', '59.99% -> Grade E (មធ្យម)');
assert(calculateMoEYSGrade(50.0).letter === 'E', '50.00% -> Grade E (មធ្យម)');
assert(calculateMoEYSGrade(49.99).letter === 'F', '49.99% -> Grade F (ខ្សោយ/ធ្លាក់)');
assert(calculateMoEYSGrade(25.0).letter === 'F', '25.00% -> Grade F (ខ្សោយ/ធ្លាក់)');

console.log('\n--- 2. Testing Subject Semester Formula: (MonthlyAvg + Exam*2) / 3 ---');
// Student with monthly scores [70, 80, 75, 85, 90] in Semester 1 (Monthly Avg = 80)
// Semester Exam Score = 95
// Formula: (80 + 95 * 2) / 3 = (80 + 190) / 3 = 270 / 3 = 90.00
const subjectTest = calculateSubjectSemesterScore({
  subjectCode: 'MATH',
  monthlyScores: [70, 80, 75, 85, 90],
  semesterExamScore: 95,
  coefficient: 3.0,
});
console.log('Subject Semester Score Result:', subjectTest);
assert(subjectTest.monthlyAverage === 80, 'Monthly average computed as 80.00');
assert(subjectTest.subjectSemesterScore === 90, 'Subject semester score strictly equals (80 + 95*2)/3 = 90.00');
assert(subjectTest.weightedScore === 270, 'Weighted score = 90 * 3.0 = 270.00');
assert(subjectTest.letterGrade.letter === 'A', 'Grade is A (ល្អប្រសើរ)');

console.log('\n--- 3. Testing Science Stream Semester Evaluation ---');
// 4 subjects: Math (coeff 3, score 90), Phys (coeff 2, score 80), Chem (coeff 2, score 85), Bio (coeff 2, score 75)
// Total Weighted = (90*3) + (80*2) + (85*2) + (75*2) = 270 + 160 + 170 + 150 = 750
// Total Coeffs = 3 + 2 + 2 + 2 = 9
// Average = 750 / 9 = 83.33 -> Grade B
const semResult = calculateSemesterResult([
  { subjectCode: 'MATH', monthlyScores: [90, 90, 90], semesterExamScore: 90, coefficient: 3 },
  { subjectCode: 'PHYS', monthlyScores: [80, 80, 80], semesterExamScore: 80, coefficient: 2 },
  { subjectCode: 'CHEM', monthlyScores: [85, 85, 85], semesterExamScore: 85, coefficient: 2 },
  { subjectCode: 'BIO',  monthlyScores: [75, 75, 75], semesterExamScore: 75, coefficient: 2 },
]);
console.log('Semester Result:', semResult);
assert(semResult.totalWeightedScore === 750, 'Total weighted score is 750');
assert(semResult.totalCoefficients === 9, 'Total coefficients is 9');
assert(semResult.semesterAverage === 83.33, 'Semester Average is 83.33%');
assert(semResult.letterGrade.letter === 'B', 'Semester Grade is B (ល្អណាស់)');

console.log('\n--- 4. Testing Annual Result Formula & Promotion Status ---');
// Sem 1 = 78.50, Sem 2 = 82.50 -> Annual = (78.50 + 82.50) / 2 = 80.50 -> Grade B -> Promoted
const annual1 = calculateAnnualResult(78.5, 82.5, 2);
console.log('Annual Result 1:', annual1);
assert(annual1.annualAverage === 80.5, 'Annual Average is 80.50');
assert(annual1.letterGrade.letter === 'B', 'Annual Grade is B');
assert(annual1.promotionStatus === 'PROMOTED', 'Student is PROMOTED (ឡើងថ្នាក់)');

// Re-exam case: Sem 1 = 44, Sem 2 = 48 -> Annual = 46.00 -> Grade F -> RE_EXAM
const annual2 = calculateAnnualResult(44, 48, 5);
console.log('Annual Result 2 (Re-exam):', annual2);
assert(annual2.annualAverage === 46.0, 'Annual Average is 46.00');
assert(annual2.promotionStatus === 'RE_EXAM', 'Student is RE_EXAM (ប្រឡងសង)');

// Retained case: Sem 1 = 40, Sem 2 = 42 -> Annual = 41.00 -> RETAINED
const annual3 = calculateAnnualResult(40, 42, 5);
console.log('Annual Result 3 (Retained):', annual3);
assert(annual3.annualAverage === 41.0, 'Annual Average is 41.00');
assert(annual3.promotionStatus === 'RETAINED', 'Student is RETAINED (ត្រួតថ្នាក់)');

console.log('\n--- 5. Testing Automated Ranking & Honor Roll (តារាងកិត្តិយស) ---');
const sampleStudents = [
  { studentId: 'S1', studentNameKhmer: 'សុខ ចាន់ដារា', gender: 'MALE', averageScore: 92.5, totalWeightedScore: 832.5, coreSubjectScore: 95 },
  { studentId: 'S2', studentNameKhmer: 'កែវ ធីតា', gender: 'FEMALE', averageScore: 88.0, totalWeightedScore: 792.0, coreSubjectScore: 90 },
  { studentId: 'S3', studentNameKhmer: 'ជា សុភ័ក្ត្រ', gender: 'MALE', averageScore: 84.5, totalWeightedScore: 760.5, coreSubjectScore: 85 },
  { studentId: 'S4', studentNameKhmer: 'លឹម គឹមហួរ', gender: 'FEMALE', averageScore: 76.0, totalWeightedScore: 684.0, coreSubjectScore: 78 },
  { studentId: 'S5', studentNameKhmer: 'ម៉ៅ វាសនា', gender: 'MALE', averageScore: 65.0, totalWeightedScore: 585.0, coreSubjectScore: 60 },
  { studentId: 'S6', studentNameKhmer: 'ហេង សុជាតា', gender: 'FEMALE', averageScore: 48.0, totalWeightedScore: 432.0, coreSubjectScore: 45 },
];

const ranked = rankStudents(sampleStudents);
console.log('Ranked Students:', ranked);
assert(ranked[0].studentId === 'S1' && ranked[0].rank === 1 && ranked[0].isHonorRoll === true, 'Rank 1 is S1 (Honor Roll)');
assert(ranked[1].studentId === 'S2' && ranked[1].rank === 2 && ranked[1].isHonorRoll === true, 'Rank 2 is S2 (Honor Roll)');
assert(ranked[4].studentId === 'S5' && ranked[4].rank === 5 && ranked[4].isHonorRoll === true, 'Rank 5 is S5 (Honor Roll)');
assert(ranked[5].studentId === 'S6' && ranked[5].rank === 6 && ranked[5].isHonorRoll === false, 'Rank 6 is S6 (Not Honor Roll - Fail)');

console.log('\n=========================================');
console.log('🎯 ALL MOEYS GRADING & RANKING TESTS PASSED!');
console.log('=========================================');
