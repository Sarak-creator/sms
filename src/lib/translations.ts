/**
 * MoEYS Cambodian Public High School Management System
 * Comprehensive Dual-Language Localization Dictionary (Pure Khmer 🇰🇭 & English 🇬🇧)
 */

export type Language = 'km' | 'en';

export const translations = {
  // Brand & Institution
  ministryName: {
    km: 'ក្រសួងអប់រំ យុវជន និងកីឡា',
    en: 'Ministry of Education, Youth and Sport',
  },
  systemTitle: {
    km: 'ប្រព័ន្ធគ្រប់គ្រងវិទ្យាល័យរដ្ឋកម្ពុជា',
    en: 'Cambodian Public High School Management System',
  },
  systemSubtitle: {
    km: 'ប្រព័ន្ធតាមដានស្ថិតិសិស្ស ម៉ោងបង្រៀនគ្រូ និងលទ្ធផលសិក្សារបស់សិស្សានុសិស្ស',
    en: 'Student Information, Teacher Workload, and Academic Performance Tracking System',
  },
  systemStatusNormal: {
    km: 'ប្រព័ន្ធដំណើរការធម្មតា',
    en: 'System Operational',
  },
  principalRole: {
    km: 'នាយកសាលា',
    en: 'Principal',
  },
  principalNameLabel: {
    km: 'នាយកសាលា',
    en: 'Principal',
  },
  academicYearLabel: {
    km: 'ឆ្នាំសិក្សា',
    en: 'Academic Year',
  },
  selectClassLabel: {
    km: 'ជ្រើសរើសថ្នាក់រៀន',
    en: 'Select Classroom',
  },
  shiftMorning: {
    km: 'វេនព្រឹក (០៧:០០ - ១១:០០)',
    en: 'Morning Shift (07:00 - 11:00)',
  },
  shiftAfternoon: {
    km: 'វេនរសៀល (១៣:០០ - ១៧:០០)',
    en: 'Afternoon Shift (13:00 - 17:00)',
  },
  shiftMorningShort: {
    km: 'វេនព្រឹក',
    en: 'Morning',
  },
  shiftAfternoonShort: {
    km: 'វេនរសៀល',
    en: 'Afternoon',
  },

  // Navigation Items
  navMainModules: {
    km: 'ម៉ូឌុលចម្បង',
    en: 'Main Modules',
  },
  navDashboard: {
    km: 'ផ្ទាំងគ្រប់គ្រង',
    en: 'Dashboard & Overview',
  },
  navGradebook: {
    km: 'តារាងបញ្ចូលពិន្ទុ',
    en: 'Gradebook Spreadsheet',
  },
  navAttendance: {
    km: 'បញ្ជីវត្តមានសិស្ស',
    en: 'Attendance Register',
  },
  navClasses: {
    km: 'គ្រប់គ្រងថ្នាក់រៀន',
    en: 'Classroom Management',
  },
  navStudents: {
    km: 'បញ្ជីរាយនាមសិស្ស',
    en: 'Student Directory',
  },
  navGuardians: {
    km: 'បញ្ជីអាណាព្យាបាលសិស្ស',
    en: 'Parent & Guardian Directory',
  },
  navTeachers: {
    km: 'បុគ្គលិកអប់រំ និងគ្រូបង្រៀន',
    en: 'Teaching Staff & Quota',
  },
  navSpecializations: {
    km: 'មុខវិជ្ជា និងជំនាញ',
    en: 'Subjects & Skills',
  },
  navChapters: {
    km: 'ជំពូកមេរៀន',
    en: 'Curriculum Chapters',
  },
  navReports: {
    km: 'របាយការណ៍ផ្លូវការ',
    en: 'Official MoEYS Reports',
  },
  navSettings: {
    km: 'ការកំណត់ប្រព័ន្ធ',
    en: 'System Settings',
  },
  chaptersTitle: {
    km: 'ការគ្រប់គ្រងជំពូកមេរៀន និងកម្មវិធីសិក្សា',
    en: 'Curriculum Chapters & Lesson Units',
  },
  chaptersDesc: {
    km: 'ចាត់ចែងជំពូកមេរៀនតាមមុខវិជ្ជា កម្រិតថ្នាក់ ចំនួនម៉ោងបង្រៀន និងឆមាស',
    en: 'Organize subject chapters, grade levels, teaching hours, and semesters.',
  },
  addChapter: {
    km: 'បន្ថែមជំពូកថ្មី',
    en: 'Add New Chapter',
  },
  editChapter: {
    km: 'កែសម្រួលជំពូក',
    en: 'Edit Chapter',
  },
  deleteChapter: {
    km: 'លុបជំពូក',
    en: 'Delete Chapter',
  },
  chapterNumberLabel: {
    km: 'ជំពូកទី',
    en: 'Chapter No.',
  },
  lessonsCountLabel: {
    km: 'ចំនួនមេរៀន',
    en: 'Total Lessons',
  },
  specializationTitle: {
    km: 'ការគ្រប់គ្រងឯកទេសបង្រៀន និងមុខវិជ្ជា',
    en: 'Teaching Specializations & Subjects',
  },
  specializationDesc: {
    km: 'គ្រប់គ្រងឯកទេសបង្រៀន មុខវិជ្ជាចំណុះ ដេប៉ាតឺម៉ង់ និងម៉ោងស្តង់ដារ MoEYS',
    en: 'Manage teaching disciplines, subject curricula, departments, and standard hours.',
  },
  addSpecialization: {
    km: 'បន្ថែមឯកទេសថ្មី',
    en: 'Add New Specialization',
  },
  editSpecialization: {
    km: 'កែសម្រួលឯកទេស',
    en: 'Edit Specialization',
  },
  deleteSpecialization: {
    km: 'លុបឯកទេស',
    en: 'Delete Specialization',
  },
  departmentLabel: {
    km: 'ដេប៉ាតឺម៉ង់',
    en: 'Department',
  },
  weeklyHoursLabel: {
    km: 'ម៉ោងបង្រៀន/សប្តាហ៍',
    en: 'Standard Hours/Week',
  },
  guardianDirectoryTitle: {
    km: 'បញ្ជីអាណាព្យាបាលសិស្ស និងទំនាក់ទំនង',
    en: 'Student Guardian & Parent Directory',
  },
  guardianDirectoryDesc: {
    km: 'គ្រប់គ្រងព័ត៌មានទំនាក់ទំនង មុខរបរ និងអាសយដ្ឋានអាណាព្យាបាលសិស្សសម្រាប់កិច្ចសហការអប់រំ',
    en: 'Manage guardian contact info, occupations, and addresses for school-parent collaboration.',
  },
  parentRelation: {
    km: 'ត្រូវជា',
    en: 'Relationship',
  },
  occupationLabel: {
    km: 'មុខរបរ',
    en: 'Occupation',
  },
  currentAddressLabel: {
    km: 'អាសយដ្ឋានបច្ចុប្បន្ន',
    en: 'Current Address',
  },
  quickContact: {
    km: 'ទាក់ទងរហ័ស',
    en: 'Quick Contact',
  },
  sendNotice: {
    km: 'ផ្ញើសេចក្តីជូនដំណឹង',
    en: 'Send Notice',
  },
  createClassroom: {
    km: 'បង្កើតថ្នាក់រៀន',
    en: 'Create Classroom',
  },
  addClassroom: {
    km: 'បន្ថែមថ្នាក់រៀនថ្មី',
    en: 'Add New Classroom',
  },
  editClassroom: {
    km: 'កែសម្រួលថ្នាក់រៀន',
    en: 'Edit Classroom',
  },
  deleteClassroom: {
    km: 'លុបថ្នាក់រៀន',
    en: 'Delete Classroom',
  },
  gradeLevelLabel: {
    km: 'កម្រិតថ្នាក់',
    en: 'Grade Level',
  },
  trackLabel: {
    km: 'ផ្នែក/ឯកទេស',
    en: 'Academic Track',
  },
  roomNumberLabel: {
    km: 'បន្ទប់រៀន',
    en: 'Room Number',
  },
  homeroomTeacherLabel: {
    km: 'គ្រូបន្ទុកថ្នាក់',
    en: 'Homeroom Teacher',
  },

  // Common Actions
  print: {
    km: 'បោះពុម្ព',
    en: 'Print / PDF',
  },
  save: {
    km: 'រក្សាទុក',
    en: 'Save Changes',
  },
  exportExcel: {
    km: 'ទាញយក Excel',
    en: 'Export Excel (.xlsx)',
  },
  searchPlaceholder: {
    km: 'ស្វែងរកតាមឈ្មោះ ឬអត្តលេខ...',
    en: 'Search (Name or National ID)...',
  },
  close: {
    km: 'បិទ',
    en: 'Close',
  },
  all: {
    km: 'ទាំងអស់',
    en: 'All',
  },
  female: {
    km: 'ស្រី',
    en: 'Female',
  },
  male: {
    km: 'ប្រុស',
    en: 'Male',
  },
  total: {
    km: 'សរុប',
    en: 'Total',
  },
  studentCountUnit: {
    km: 'នាក់',
    en: 'students',
  },
  hoursPerWeekUnit: {
    km: 'ម៉ោង/សប្តាហ៍',
    en: 'hrs/week',
  },

  // Dashboard Page
  dashboardHeaderTitle: {
    km: 'ផ្ទាំងគ្រប់គ្រងទូទៅនៃសាលារៀន',
    en: 'Principal Institutional Dashboard',
  },
  dashboardHeaderDesc: {
    km: 'ប្រព័ន្ធតាមដានស្ថិតិសិស្ស ម៉ោងបង្រៀនគ្រូ និងលទ្ធផលសិក្សារបស់សិស្សានុសិស្សប្រចាំឆ្នាំ ស្របតាមបទដ្ឋានក្រសួងអប់រំ យុវជន និងកីឡា',
    en: 'Comprehensive monitoring system for student enrollment, teacher weekly workload quotas, and MoEYS academic benchmark performance.',
  },
  kpiTotalStudents: {
    km: 'ចំនួនសិស្សសរុប',
    en: 'Total Student Enrollment',
  },
  kpiFemaleStudents: {
    km: 'សិស្សស្រី',
    en: 'Female Students',
  },
  kpiTeacherQuota: {
    km: 'បន្ទុកម៉ោងបង្រៀនគ្រូ',
    en: 'Teacher Workload Quota',
  },
  kpiMoEYSStandard: {
    km: 'ស្តង់ដារ MoEYS',
    en: 'MoEYS Standard',
  },
  kpiActiveTeachers: {
    km: 'គ្រូសកម្ម',
    en: 'Active Teachers',
  },
  kpiAttendanceRate: {
    km: 'អត្រាវត្តមានថ្ងៃនេះ',
    en: "Today's Attendance Rate",
  },
  kpiPresentCount: {
    km: 'វត្តមាន',
    en: 'Present',
  },
  kpiAbsentCount: {
    km: 'អវត្តមាន',
    en: 'Absent',
  },
  kpiAtRisk: {
    km: 'សិស្សប្រឈមហានិភ័យ',
    en: 'At-Risk & Dropout Warning',
  },
  kpiAtRiskDesc: {
    km: 'ពិន្ទុក្រោម ៥០% ឬ អវត្តមាន',
    en: 'Score < 50% or High Absence',
  },
  kpiNeedsMonitoring: {
    km: 'ត្រូវការតាមដាន',
    en: 'Needs Action',
  },
  gradeDistributionTitle: {
    km: 'ការបែងចែកនិទ្ទេសក្នុងថ្នាក់',
    en: 'Classroom Grade Distribution',
  },
  gradeDistributionDesc: {
    km: 'គណនាដោយស្វ័យប្រវត្តិតាមរូបមន្តមធ្យមភាគ និងមេគុណមុខវិជ្ជា MoEYS',
    en: 'Computed automatically via strict MoEYS subject weights and grading benchmarks.',
  },
  honorRollTitle: {
    km: 'តារាងកិត្តិយស - សិស្សពូកែប្រចាំថ្នាក់',
    en: 'Top 5 Honor Roll Excellence',
  },
  honorRollDesc: {
    km: 'សិស្សានុសិស្សដែលទទួលបានចំណាត់ថ្នាក់កំពូលទាំង ៥ ក្នុងឆមាសទី១',
    en: 'Top ranked scholars receiving official MoEYS Certificate of Academic Distinction.',
  },
  rankLabel: {
    km: 'ចំណាត់ថ្នាក់',
    en: 'Rank',
  },
  averageScoreLabel: {
    km: 'មធ្យមភាគពិន្ទុ',
    en: 'Average Score',
  },
  gradeLabel: {
    km: 'និទ្ទេស',
    en: 'Letter Grade',
  },
  atRiskSectionTitle: {
    km: 'សិស្សានុសិស្សដែលត្រូវការការយកចិត្តទុកដាក់',
    en: 'Students Requiring Academic Intervention',
  },
  atRiskSectionDesc: {
    km: 'សិស្សដែលមានពិន្ទុមធ្យមភាគក្រោម ៥០% ឬមានអវត្តមានឥតច្បាប់',
    en: 'Students with average marks below passing threshold (50%) or unexcused absences.',
  },

  // Gradebook Page
  gradebookHeaderTitle: {
    km: 'តារាងបញ្ចូលពិន្ទុសិស្ស',
    en: 'Spreadsheet Gradebook',
  },
  gradebookHeaderDesc: {
    km: 'បញ្ចូលពិន្ទុរហ័សដោយប្រើគ្រាប់ចុចព្រួញ, Enter, ឬ Tab។ គណនាមធ្យមភាគ និងមេគុណតាមរូបមន្តផ្លូវការ MoEYS ភ្លាមៗ។',
    en: 'Rapid keyboard navigation using Arrow Keys, Enter, or Tab. Computes subject semester averages and weighted totals in real-time.',
  },
  subjectLabel: {
    km: 'មុខវិជ្ជា',
    en: 'Subject',
  },
  coefficientLabel: {
    km: 'មេគុណ',
    en: 'Coeff',
  },
  rollNoHeader: {
    km: 'ល.រ',
    en: 'No.',
  },
  studentIdHeader: {
    km: 'អត្តលេខ',
    en: 'Student ID',
  },
  studentNameHeader: {
    km: 'គោត្តនាម-នាម',
    en: 'Student Name',
  },
  genderHeader: {
    km: 'ភេទ',
    en: 'Gender',
  },
  monthOct: {
    km: 'តុលា (ខែ១)',
    en: 'Oct (M1)',
  },
  monthNov: {
    km: 'វិច្ឆិកា (ខែ២)',
    en: 'Nov (M2)',
  },
  monthDec: {
    km: 'ធ្នូ (ខែ៣)',
    en: 'Dec (M3)',
  },
  monthJan: {
    km: 'មករា (ខែ៤)',
    en: 'Jan (M4)',
  },
  monthFeb: {
    km: 'កុម្ភៈ (ខែ៥)',
    en: 'Feb (M5)',
  },
  monthlyAverageHeader: {
    km: 'មធ្យមភាគខែ',
    en: 'Monthly Avg',
  },
  examScoreHeader: {
    km: 'ប្រឡងឆមាស',
    en: 'Semester Exam (E)',
  },
  semesterScoreHeader: {
    km: 'ពិន្ទុឆមាស',
    en: 'Semester Mark (S)',
  },
  weightedScoreHeader: {
    km: 'គុណមេគុណ',
    en: 'Weighted Total',
  },
  formulaBannerText: {
    km: 'រូបមន្តគណនាផ្លូវការ MoEYS: ពិន្ទុឆមាស = (មធ្យមភាគប្រចាំខែ + (ពិន្ទុប្រឡងឆមាស × ២)) ÷ ៣',
    en: 'Official MoEYS Formula: Semester Score = (Monthly Avg + (Exam Score × 2)) ÷ 3',
  },
  savedToastSuccess: {
    km: 'ទិន្នន័យពិន្ទុត្រូវបានរក្សាទុកដោយជោគជ័យ!',
    en: 'Gradebook changes saved successfully!',
  },
  subjectDivisorLabel: {
    km: 'ចំនួនមុខវិជ្ជា (តួរចែករកមធ្យមភាគ)',
    en: 'Number of Subjects (Divisor)',
  },
  subjectDivisorShort: {
    km: 'តួរចែកមធ្យមភាគ',
    en: 'Divisor',
  },
  subjectDivisorFormula: {
    km: 'រូបមន្ត៖ មធ្យមភាគ = ពិន្ទុសរុប ÷ តួរចែក',
    en: 'Formula: Average = Total Score ÷ Divisor',
  },

  // Attendance Page
  attendanceHeaderTitle: {
    km: 'បញ្ជីវត្តមានសិស្សប្រចាំថ្ងៃ',
    en: 'Daily Smart Attendance Register',
  },
  attendanceHeaderDesc: {
    km: 'កត់ត្រាវត្តមានរហ័ស និងតាមដានស្ថិតិអវត្តមានមានច្បាប់ ឬឥតច្បាប់ប្រចាំថ្ងៃ',
    en: '1-Click batch attendance recording with daily excused, unexcused, and late attendance tracking.',
  },
  markAllPresentButton: {
    km: 'វត្តមានទាំងអស់',
    en: 'Mark All Present',
  },
  presentStatus: {
    km: 'វត្តមាន (P)',
    en: 'Present (P)',
  },
  absentPermStatus: {
    km: 'សុំច្បាប់ (A/P)',
    en: 'Excused (A/P)',
  },
  absentNoPermStatus: {
    km: 'ឥតច្បាប់ (A/NP)',
    en: 'Unexcused (A/NP)',
  },
  lateStatus: {
    km: 'យឺត (L)',
    en: 'Late (L)',
  },
  attendanceDateLabel: {
    km: 'កាលបរិច្ឆេទ',
    en: 'Date',
  },

  // Student Registry
  studentRegistryTitle: {
    km: 'បញ្ជីរាយនាមសិស្ស និងប្រវត្តិរូប',
    en: 'Student Registry & Personal Dossiers',
  },
  studentRegistryDesc: {
    km: 'គ្រប់គ្រងព័ត៌មានលម្អិត ទីកន្លែងកំណើត អាណាព្យាបាល និងស្ថានភាពសិក្សារបស់សិស្ស',
    en: 'Manage individual student identity, place of birth, guardian contacts, and enrollment records.',
  },
  dobLabel: {
    km: 'ថ្ងៃខែឆ្នាំកំណើត',
    en: 'Date of Birth',
  },
  pobLabel: {
    km: 'ទីកន្លែងកំណើត',
    en: 'Place of Birth (POB)',
  },
  guardianInfoLabel: {
    km: 'ព័ត៌មានអាណាព្យាបាល',
    en: 'Guardian & Parent Details',
  },
  fatherNameLabel: {
    km: 'ឪពុក',
    en: 'Father',
  },
  motherNameLabel: {
    km: 'ម្តាយ',
    en: 'Mother',
  },
  phoneLabel: {
    km: 'ទូរស័ព្ទ',
    en: 'Phone Number',
  },
  actionsLabel: {
    km: 'សកម្មភាព',
    en: 'Actions',
  },
  viewDossierButton: {
    km: 'មើលប្រវត្តិរូប',
    en: 'View Dossier',
  },

  // Teachers Page
  teacherWorkloadTitle: {
    km: 'បញ្ជីបុគ្គលិកអប់រំ និងបន្ទុកម៉ោងបង្រៀន',
    en: 'Teaching Staff & MoEYS Workload Quota',
  },
  teacherWorkloadDesc: {
    km: 'តាមដានអត្តលេខមន្ត្រីរាជការ ក្របខណ្ឌ បន្ទុកម៉ោងបង្រៀនស្តង់ដារ ១៦-១៨ ម៉ោង/សប្តាហ៍ តាមបទបញ្ជាផ្ទៃក្នុង MoEYS',
    en: 'Civil servant IDs, professional cadres, and compliance with statutory 16-18 hours/week teaching quotas.',
  },
  specializationLabel: {
    km: 'ឯកទេសបង្រៀន',
    en: 'Subject Specialization',
  },
  cadreLabel: {
    km: 'ក្របខណ្ឌ',
    en: 'Civil Servant Cadre',
  },
  shiftLabel: {
    km: 'វេនបង្រៀន',
    en: 'Assigned Shift',
  },
  workloadQuotaLabel: {
    km: 'បន្ទុកម៉ោងបង្រៀន',
    en: 'Teaching Workload',
  },
  quotaStandardCompliant: {
    km: 'ស្តង់ដារ MoEYS',
    en: 'MoEYS Compliant',
  },

  // Reports Center Page
  reportsCenterTitle: {
    km: 'មជ្ឈមណ្ឌលរបាយការណ៍ផ្លូវការ',
    en: 'Official MoEYS Reports Center',
  },
  reportsCenterDesc: {
    km: 'ទម្រង់ក១-ស១, សៀវភៅតាមដានការសិក្សា, តារាងកិត្តិយស និងស្ថិតិ EMIS ស្របតាមក្បួនខ្នាតផ្លូវការ',
    en: 'Official Form K1/S1 Rosters, Top 5 Honor Rolls, Term Report Books, and EMIS Census Exports.',
  },
  tabFormK1S1: {
    km: 'ទម្រង់ ក១-ស១ (បញ្ជីរាយនាមសិស្ស)',
    en: 'Form K1/S1 (Official Class Roster)',
  },
  tabHonorRoll: {
    km: 'តារាងកិត្តិយស (សិស្សពូកែ)',
    en: 'Honor Roll Certificate (Top 5)',
  },
  tabReportBook: {
    km: 'សៀវភៅតាមដានការសិក្សា',
    en: 'Student Term Assessment Book',
  },
  tabEMIS: {
    km: 'ស្ថិតិជំរឿន EMIS MoEYS',
    en: 'EMIS Census Analytics',
  },
  kingdomOfCambodia: {
    km: 'ព្រះរាជាណាចក្រកម្ពុជា',
    en: 'Kingdom of Cambodia',
  },
  nationReligionKing: {
    km: 'ជាតិ សាសនា ព្រះមហាក្សត្រ',
    en: 'Nation Religion King',
  },
  schoolCodeLabel: {
    km: 'កូដសាលា',
    en: 'School Code',
  },
  approvedByPrincipal: {
    km: 'បានឃើញ និងអនុម័ត\nនាយកសាលា',
    en: 'Approved & Verified\nSchool Principal',
  },
  homeroomTeacherSignature: {
    km: 'គ្រូបន្ទុកថ្នាក់',
    en: 'Homeroom Teacher',
  },
  academicOfficerSignature: {
    km: 'ប្រធានការិយាល័យសិក្សា',
    en: 'Academic Affairs Officer',
  },

  // System Settings Module
  settingsTitle: {
    km: 'ការកំណត់ប្រព័ន្ធ និងព័ត៌មានសាលារៀន',
    en: 'System Configuration & Institution Settings',
  },
  settingsDesc: {
    km: 'គ្រប់គ្រងព័ត៌មានទូទៅនៃសាលារៀន ស្តង់ដារវាយតម្លៃពិន្ទុ MoEYS ភាសា និងការបម្រុងទុកទិន្នន័យ',
    en: 'Manage general school profile, MoEYS grading benchmarks, shift schedules, and data backup & restore.',
  },
  tabSchoolProfile: {
    km: 'ព័ត៌មានសាលារៀន',
    en: 'School Profile',
  },
  tabGradingConfig: {
    km: 'ស្តង់ដារពិន្ទុ MoEYS',
    en: 'Grading Standards',
  },
  tabSchedulesConfig: {
    km: 'កាលវិភាគ & វេនសិក្សា',
    en: 'Shifts & Schedules',
  },
  tabPreferencesConfig: {
    km: 'ចំណង់ចំណូលចិត្តប្រព័ន្ធ',
    en: 'Preferences',
  },
  tabBackupRestoreConfig: {
    km: 'បម្រុងទុក & ស្តារទិន្នន័យ',
    en: 'Backup & Restore',
  },
  saveSettingsButton: {
    km: 'រក្សាទុកការកំណត់',
    en: 'Save Settings',
  },
  settingsSavedSuccess: {
    km: 'ការកំណត់ប្រព័ន្ធត្រូវបានរក្សាទុកដោយជោគជ័យ!',
    en: 'System settings saved successfully!',
  },
  resetDefaults: {
    km: 'កំណត់ទៅដើមវិញ',
    en: 'Reset to Defaults',
  },

  // Student Classroom Allocation, Transfer & Promotion
  transferClass: {
    km: 'ផ្ទេរថ្នាក់រៀន',
    en: 'Transfer Class',
  },
  transferStudentTitle: {
    km: 'ផ្ទេរសិស្សទៅថ្នាក់រៀនផ្សេង',
    en: 'Transfer Student to Another Class',
  },
  promoteGradeTitle: {
    km: 'ឡើងថ្នាក់ / បន្តការសិក្សា',
    en: 'Promote Student / Advance Grade',
  },
  targetClassroom: {
    km: 'ថ្នាក់រៀនគោលដៅ',
    en: 'Target Classroom',
  },
  currentClassLabel: {
    km: 'ថ្នាក់រៀនបច្ចុប្បន្ន',
    en: 'Current Classroom',
  },
  classroomLabel: {
    km: 'ថ្នាក់រៀន',
    en: 'Classroom',
  },
  promotionType: {
    km: 'ប្រភេទនៃការបន្តការសិក្សា',
    en: 'Progression Type',
  },
  promotedToNextGrade: {
    km: 'ឡើងថ្នាក់ (ឡើងមួយកម្រិតថ្នាក់)',
    en: 'Promoted to Next Grade',
  },
  retainedInGrade: {
    km: 'ថ្នាក់ត្រួត / នៅថ្នាក់ដដែល',
    en: 'Retained / Repeat Grade',
  },
  graduatedStatus: {
    km: 'បញ្ចប់ការសិក្សា (សិស្សចប់ថ្នាក់ទី១២)',
    en: 'Graduated / Completed High School',
  },
  selectTargetClass: {
    km: 'ជ្រើសរើសថ្នាក់រៀនគោលដៅ...',
    en: 'Select target classroom...',
  },

  // User Management & System Permissions (RBAC)
  navUsers: {
    km: 'អ្នកប្រើប្រាស់ និងសិទ្ធិ',
    en: 'Users & Permissions',
  },
  userManagementTitle: {
    km: 'គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ និងសិទ្ធិប្រើប្រាស់ប្រព័ន្ធ',
    en: 'User Accounts & Access Permissions (RBAC)',
  },
  userManagementDesc: {
    km: 'គ្រប់គ្រងគណនីគ្រូបង្រៀន គណៈគ្រប់គ្រងសាលា តួនាទី និងកំណត់ដែនសិទ្ធិប្រើប្រាស់តាមបទដ្ឋាន MoEYS',
    en: 'Manage teacher and staff accounts, assign system roles, and configure granular permissions.',
  },
  rolePrincipal: {
    km: 'នាយកសាលា / គណៈគ្រប់គ្រង',
    en: 'Principal / School Admin',
  },
  roleAcademicOfficer: {
    km: 'ការិយាល័យសិក្សា / រដ្ឋបាល',
    en: 'Academic Affairs Officer',
  },
  roleHomeroomTeacher: {
    km: 'គ្រូបន្ទុកថ្នាក់',
    en: 'Homeroom Teacher',
  },
  roleSubjectTeacher: {
    km: 'គ្រូបង្រៀនតាមមុខវិជ្ជា',
    en: 'Subject Teacher',
  },
  roleStaffViewer: {
    km: 'បុគ្គលិកជំនួយ / បណ្ណារក្ស',
    en: 'Staff / Read-Only Viewer',
  },
  userRoleLabel: {
    km: 'តួនាទីក្នុងប្រព័ន្ធ',
    en: 'System Role',
  },
  userStatusActive: {
    km: 'សកម្ម',
    en: 'Active',
  },
  userStatusInactive: {
    km: 'អសកម្ម',
    en: 'Inactive',
  },
  switchUserLabel: {
    km: 'ប្តូរអ្នកប្រើប្រាស់ (តេស្តសិទ្ធិ)',
    en: 'Switch User (Test RBAC)',
  },
  currentUserLabel: {
    km: 'គណនីកំពុងប្រើប្រាស់',
    en: 'Current Active User',
  },
  assignedClassesLabel: {
    km: 'ថ្នាក់រៀនទទួលខុសត្រូវ',
    en: 'Assigned Classrooms',
  },
  assignedSubjectsLabel: {
    km: 'មុខវិជ្ជាទទួលខុសត្រូវ',
    en: 'Assigned Subjects',
  },
  linkToTeacherLabel: {
    km: 'ភ្ជាប់ជាមួយបុគ្គលិក/គ្រូបង្រៀន',
    en: 'Link to Teacher Profile',
  },
  permissionsMatrixLabel: {
    km: 'តារាងកំណត់សិទ្ធិលម្អិត (Permissions Matrix)',
    en: 'Granular Permissions Matrix',
  },
  permEditSchoolInfo: {
    km: 'កែប្រែព័ត៌មានសាលារៀន និងកាលវិភាគ',
    en: 'Edit school profile & schedules',
  },
  permManageTeachers: {
    km: 'គ្រប់គ្រង និងចាត់តាំងបន្ទុកម៉ោងគ្រូ',
    en: 'Manage teachers & teaching quotas',
  },
  permManageClasses: {
    km: 'បង្កើត កែសម្រួល ឬលុបថ្នាក់រៀន',
    en: 'Create, edit & manage classrooms',
  },
  permManageStudents: {
    km: 'បន្ថែម កែសម្រួល ឬលុបសិស្ស',
    en: 'Add, edit & delete students',
  },
  permTransferAndPromote: {
    km: 'ផ្ទេរសិស្សរវាងថ្នាក់ និងឡើងថ្នាក់',
    en: 'Transfer students & grade promotion',
  },
  permEnterAllScores: {
    km: 'បញ្ចូលពិន្ទុគ្រប់មុខវិជ្ជាទាំងអស់',
    en: 'Enter grades for all subjects',
  },
  permEnterAssignedScoresOnly: {
    km: 'បញ្ចូលពិន្ទុបានតែមុខវិជ្ជាដែលខ្លួនបង្រៀន',
    en: 'Enter grades for assigned subjects only',
  },
  permLockGrades: {
    km: 'ចាក់សោ ឬអនុម័តពិន្ទុផ្លូវការ',
    en: 'Lock & approve final official marks',
  },
  permTakeAttendance: {
    km: 'កត់ត្រាវត្តមានសិស្សប្រចាំថ្ងៃ',
    en: 'Record daily student attendance',
  },
  permViewReports: {
    km: 'មើល និងទាញយករបាយការណ៍/ទម្រង់ ក១-ស១',
    en: 'View & download official MoEYS reports',
  },
  permManageUsers: {
    km: 'បង្កើត និងកំណត់សិទ្ធិអ្នកប្រើប្រាស់',
    en: 'Create users & configure permissions',
  },
  permExportBackup: {
    km: 'បម្រុងទុក និងស្តារទិន្នន័យប្រព័ន្ធ',
    en: 'Backup & restore full system database',
  },
  accessDeniedTitle: {
    km: 'គ្មានសិទ្ធិប្រើប្រាស់ទំព័រនេះ (Access Restricted)',
    en: 'Access Restricted',
  },
  accessDeniedDesc: {
    km: 'លោកអ្នកពុំមានសិទ្ធិចូលទៅកាន់ការកំណត់ប្រព័ន្ធ ឬទិន្នន័យរបស់អ្នកដទៃឡើយ។ លោកអ្នកមានសិទ្ធិគ្រប់គ្រងតែទិន្នន័យសម្រាប់ថ្នាក់រៀនដែលលោកអ្នកទទួលបន្ទុកប៉ុណ្ណោះ។',
    en: 'You do not have permission to access system settings or data belonging to others. You only have permission to manage data for your assigned classroom(s).',
  },
  accessDeniedBtnBack: {
    km: 'ត្រឡប់ទៅកាន់បញ្ជីពិន្ទុថ្នាក់របស់ខ្ញុំ',
    en: 'Back to My Class Gradebook',
  },
  teacherScopeBadge: {
    km: 'វិសាលភាព៖ ថ្នាក់បន្ទុករបស់លោកអ្នក',
    en: 'Scope: Your Assigned Class Only',
  },
  noAssignedClassesWarning: {
    km: 'គណនីរបស់លោកអ្នកមិនទាន់ត្រូវបានចាត់តាំងជាគ្រូបន្ទុកថ្នាក់ ឬគ្រូបង្រៀនថ្នាក់ណាមួយនៅឡើយទេ។ សូមទាក់ទងនាយកសាលា ឬមន្ត្រីសិក្សាធិការ!',
    en: 'Your account is not currently assigned to any classroom. Please contact the school principal or academic officer.',
  },
  onlyAssignedClassNotice: {
    km: 'បង្ហាញតែទិន្នន័យសម្រាប់ថ្នាក់ដែលលោកអ្នកទទួលបន្ទុកប៉ុណ្ណោះ',
    en: 'Showing data for your assigned class only',
  },
  actionRestrictedForTeachers: {
    km: 'សកម្មភាពនេះត្រូវបានអនុញ្ញាតសម្រាប់តែនាយកសាលា ឬមន្ត្រីសិក្សាធិការប៉ុណ្ណោះ!',
    en: 'This action is restricted to School Principal and Academic Officers only!',
  },
  // Authentication & Login
  loginTitle: {
    km: 'ចូលប្រើប្រព័ន្ធគ្រប់គ្រងសាលារៀន',
    en: 'Sign In to School Management System',
  },
  loginSubtitle: {
    km: 'ក្រសួងអប់រំ យុវជន និងកីឡា • MoEYS Digital Education System',
    en: 'Ministry of Education, Youth and Sport • Digital Education Platform',
  },
  usernameOrEmailOrId: {
    km: 'ឈ្មោះគណនី, អ៊ីមែល ឬអត្តលេខគ្រូ',
    en: 'Username, Email or Civil Servant ID',
  },
  password: {
    km: 'ពាក្យសម្ងាត់',
    en: 'Password',
  },
  rememberMe: {
    km: 'ចងចាំការចូលប្រើលើឧបករណ៍នេះ',
    en: 'Remember me on this device',
  },
  forgotPassword: {
    km: 'ភ្លេចពាក្យសម្ងាត់?',
    en: 'Forgot password?',
  },
  signInButton: {
    km: 'ចូលប្រើប្រព័ន្ធ (Sign In)',
    en: 'Sign In to System',
  },
  logoutButton: {
    km: 'ចាកចេញពីប្រព័ន្ធ',
    en: 'Log Out',
  },
  quickDemoAccountsTitle: {
    km: 'ចូលប្រើសាកល្បងរហ័ស (1-Click Demo Accounts)',
    en: 'Quick Demo Accounts (1-Click Login)',
  },
  loginSuccess: {
    km: 'ចូលប្រើប្រព័ន្ធបានជោគជ័យ!',
    en: 'Signed in successfully!',
  },
  loginFailedNotFound: {
    km: 'រកមិនឃើញគណនីដែលមានឈ្មោះ អ៊ីមែល ឬអត្តលេខនេះទេ!',
    en: 'No account found matching this username, email or ID!',
  },
  loginFailedWrongPassword: {
    km: 'ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! (ពាក្យសម្ងាត់គំរូ: pass123)',
    en: 'Incorrect password! (Default demo password: pass123)',
  },
  loginAccountInactive: {
    km: 'គណនីនេះត្រូវបានផ្អាកដំណើរការបណ្តោះអាសន្ន (Suspended)! សូមទាក់ទងនាយកសាលា។',
    en: 'This account is currently suspended! Please contact the school administrator.',
  },
  loginBackToHome: {
    km: 'ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រងទូទៅ',
    en: 'Go to Dashboard',
  },
  needHelpContact: {
    km: 'ត្រូវការជំនួយបច្ចេកទេស? សូមទាក់ទងការិយាល័យព័ត៌មានវិទ្យានៃក្រសួងអប់រំ យុវជន និងកីឡា',
    en: 'Need technical support? Contact the MoEYS IT Department support desk.',
  },
} as const;

export type TranslationKey = keyof typeof translations;


