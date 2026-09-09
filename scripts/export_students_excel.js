const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Import or read seed students from allClassesSeedData.ts
const seedFilePath = path.join(__dirname, '..', 'src', 'lib', 'allClassesSeedData.ts');
const seedContent = fs.readFileSync(seedFilePath, 'utf8');

// Classroom label mapping
const CLASS_MAP = {
  'c-1-gen-a': { nameKhmer: 'ថ្នាក់ទី ១ A', gradeLevel: 'ថ្នាក់ទី ១ (Grade 1)' },
  'c-4-gen-a': { nameKhmer: 'ថ្នាក់ទី ៤ A', gradeLevel: 'ថ្នាក់ទី ៤ (Grade 4)' },
  'c-6-gen-a': { nameKhmer: 'ថ្នាក់ទី ៦ A', gradeLevel: 'ថ្នាក់ទី ៦ (Grade 6)' },
  'c-10-gen-a': { nameKhmer: 'ថ្នាក់ទី ១០ A', gradeLevel: 'ថ្នាក់ទី ១០ (Grade 10)' },
  'c-12-soc-1': { nameKhmer: 'ថ្នាក់ទី ១២ សង្គម ១', gradeLevel: 'ថ្នាក់ទី ១២ (Grade 12)' },
};

// Extract students using Regex or JS execution
// Parse students directly from the seed file
function parseSeedStudents(content) {
  const students = [];

  // Match literal objects in the file
  const literalPattern = /\{[\s\S]*?studentNationalId:\s*['"](.*?)['"][\s\S]*?khmerName:\s*['"](.*?)['"][\s\S]*?latinName:\s*['"](.*?)['"][\s\S]*?gender:\s*['"](.*?)['"][\s\S]*?dob:\s*new Date\(['"](.*?)['"]\)[\s\S]*?pobProvince:\s*['"](.*?)['"][\s\S]*?pobDistrict:\s*['"](.*?)['"][\s\S]*?fatherName:\s*['"](.*?)['"][\s\S]*?fatherOccupation:\s*['"](.*?)['"][\s\S]*?motherName:\s*['"](.*?)['"][\s\S]*?motherOccupation:\s*['"](.*?)['"][\s\S]*?guardianPhone:\s*['"](.*?)['"][\s\S]*?rollNumber:\s*(\d+)[\s\S]*?classId:\s*['"](.*?)['"][\s\S]*?\}/g;

  let match;
  while ((match = literalPattern.exec(content)) !== null) {
    students.push({
      studentNationalId: match[1],
      khmerName: match[2],
      latinName: match[3],
      gender: match[4],
      dob: match[5],
      pobProvince: match[6],
      pobDistrict: match[7],
      fatherName: match[8],
      fatherOccupation: match[9],
      motherName: match[10],
      motherOccupation: match[11],
      guardianPhone: match[12],
      rollNumber: parseInt(match[13], 10),
      classId: match[14],
    });
  }

  // Also parse programmatic Array.from sections for Grade 4, 6, 10, 12
  const fatherOccupations = ['មន្ត្រីរាជការ', 'អាជីវករ', 'កសិករ', 'គ្រូបង្រៀន', 'បុគ្គលិកក្រុមហ៊ុន', 'វិស្វករ', 'ពាណិជ្ជករ', 'វេជ្ជបណ្ឌិត', 'អ្នកបើកបរ', 'មេការសំណង់'];
  const motherOccupations = ['អាជីវករ', 'មេផ្ទះ', 'គ្រូបង្រៀន', 'មន្ត្រីរាជការ', 'បុគ្គលិកធនាគារ', 'កសិករ', 'គិលានុបដ្ឋាយិកា', 'សហគ្រិន', 'បុគ្គលិកក្រុមហ៊ុន', 'អ្នកកាត់ដេរ'];

  const arrayConfigs = [
    {
      grade: 'GRADE_4',
      classId: 'c-4-gen-a',
      count: 32,
      birthYear: 2015,
      idPrefix: 'STU-G04-',
      maleNames: ['សុខ រិទ្ធី', 'ចាន់ សុភ័ក្ត្រ', 'ហេង វិបុល', 'គង់ វណ្ណៈ', 'ម៉ៅ ពិសិដ្ឋ', 'ឈុន សម្បត្តិ', 'តាំង គីមឡុង', 'ស៊ុន វឌ្ឍនៈ', 'លាង រតនៈ', 'អ៊ុំ វិរៈ', 'ឌួង ចាន់ដារ៉ា', 'នូ ប៊ុនធឿន', 'ឡាយ ឧត្តម', 'វ៉ាន់ សុខុម', 'ជា សុវណ្ណារ៉ា', 'រស់ ពិសី'],
      femaleNames: ['កែវ ធីតា', 'សុខ ស្រីពេជ្រ', 'ហេង សុជាតា', 'គង់ ម៉ាលីកា', 'ម៉ៅ ចិន្តា', 'ឈុន ស្រីមុំ', 'តាំង ស្រីនីត', 'ស៊ុន ចរិយា', 'លាង មុនីកា', 'អ៊ុំ ពិសី', 'ឌួង ចាន់ណា', 'នូ សុជាតា', 'ឡាយ ស្រីកែវ', 'វ៉ាន់ ស្រីអូន', 'ជា គឹមហួរ', 'រស់ ស្រីលក្ខណ៍'],
      provinces: ['រាជធានីភ្នំពេញ', 'ខេត្តកណ្តាល', 'ខេត្តកំពង់ចាម', 'ខេត្តតាកែវ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង', 'ខេត្តកំពង់ធំ']
    },
    {
      grade: 'GRADE_6',
      classId: 'c-6-gen-a',
      count: 34,
      birthYear: 2013,
      idPrefix: 'STU-G06-',
      maleNames: ['ហេង វិបុល', 'សុខ រិទ្ធី', 'ចាន់ សុភ័ក្ត្រ', 'គង់ វណ្ណៈ', 'ម៉ៅ ពិសិដ្ឋ', 'ឈុន សម្បត្តិ', 'តាំង គីមឡុង', 'ស៊ុន វឌ្ឍនៈ', 'លាង រតនៈ', 'អ៊ុំ វិរៈ', 'ឌួង ចាន់ដារ៉ា', 'នូ ប៊ុនធឿន', 'ឡាយ ឧត្តម', 'វ៉ាន់ សុខុម', 'ជា សុវណ្ណារ៉ា', 'រស់ ពិសី'],
      femaleNames: ['ហេង សុជាតា', 'កែវ ធីតា', 'សុខ ស្រីពេជ្រ', 'គង់ ម៉ាលីកា', 'ម៉ៅ ចិន្តា', 'ឈុន ស្រីមុំ', 'តាំង ស្រីនីត', 'ស៊ុន ចរិយា', 'លាង មុនីកា', 'អ៊ុំ ពិសី', 'ឌួង ចាន់ណា', 'នូ សុជាតា', 'ឡាយ ស្រីកែវ', 'វ៉ាន់ ស្រីអូន', 'ជា គឹមហួរ', 'រស់ ស្រីលក្ខណ៍'],
      provinces: ['រាជធានីភ្នំពេញ', 'ខេត្តកណ្តាល', 'ខេត្តកំពង់ចាម', 'ខេត្តកំពង់ស្ពឺ', 'ខេត្តតាកែវ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង']
    },
    {
      grade: 'GRADE_10',
      classId: 'c-10-gen-a',
      count: 35,
      birthYear: 2009,
      idPrefix: 'STU-G10-',
      maleNames: ['អ៊ុក សុធារ៉ា', 'ឌួង ចាន់ណា', 'តាំង គីមឡុង', 'ជា សុភ័ក្ត្រ', 'គង់ វណ្ណៈ', 'រស់ ពិសិដ្ឋ', 'អ៊ុំ វិបុល', 'វ៉ាន់ វឌ្ឍនៈ', 'សេង វណ្ណឌី', 'កែវ សុខា', 'ឈុន ពិសិដ្ឋ', 'លី សុខុម', 'ស៊ុន សុវណ្ណារ៉ា', 'ម៉ៅ ចិន្តា', 'ឡាយ ប៊ុនរ៉ុង', 'ហុង សម្បត្តិ'],
      femaleNames: ['ឌួង ចាន់ណា', 'នូ សុជាតា', 'ឡាយ សុផល', 'ពៅ សុភី', 'យឹម ស្រីនីត', 'លឹម គឹមហួរ', 'ឈុន ស្រីមុំ', 'អ៊ុក ស្រីពេជ្រ', 'ទេព ធីតា', 'ឈុន សុភ័ក្ត្រ', 'កែវ ធីតា', 'ស៊ុន ស្រីកែវ', 'ហេង សុជាតា', 'ហុង ពិសី', 'សេង មុនីកា', 'សោម ចរិយា'],
      provinces: ['រាជធានីភ្នំពេញ', 'ខេត្តកណ្តាល', 'ខេត្តកំពង់ចាម', 'ខេត្តកំពង់ឆ្នាំង', 'ខេត្តតាកែវ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង']
    },
    {
      grade: 'GRADE_12',
      classId: 'c-12-soc-1',
      count: 32,
      birthYear: 2006,
      idPrefix: 'STU-G12-',
      maleNames: ['ហុង សម្បត្តិ', 'សេង វណ្ណឌី', 'កែវ សុខា', 'ឈុន ពិសិដ្ឋ', 'លី សុខុម', 'ស៊ុន សុវណ្ណារ៉ា', 'ម៉ៅ ចិន្តា', 'អ៊ុក សុធារ៉ា', 'ឡាយ ប៊ុនរ៉ុង', 'ឌួង ចាន់ណា', 'តាំង គីមឡុង', 'ជា សុភ័ក្ត្រ', 'គង់ វណ្ណៈ', 'រស់ ពិសិដ្ឋ', 'អ៊ុំ វិបុល', 'វ៉ាន់ វឌ្ឍនៈ'],
      femaleNames: ['អ៊ុក ស្រីពេជ្រ', 'ទេព ធីតា', 'ឈុន សុភ័ក្ត្រ', 'កែវ ធីតា', 'ស៊ុន ស្រីកែវ', 'ហេង សុជាតា', 'ហុង ពិសី', 'សេង មុនីកា', 'សោម ចរិយា', 'យឹម ស្រីនីត', 'លឹម គឹមហួរ', 'ឈុន ស្រីមុំ', 'ឌួង ចាន់ណា', 'នូ សុជាតា', 'ឡាយ សុផល', 'ពៅ សុភី'],
      provinces: ['រាជធានីភ្នំពេញ', 'ខេត្តកណ្តាល', 'ខេត្តកំពង់ចាម', 'ខេត្តកំពង់ឆ្នាំង', 'ខេត្តតាកែវ', 'ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង']
    }
  ];

  arrayConfigs.forEach(cfg => {
    for (let i = 0; i < cfg.count; i++) {
      const num = i + 1;
      const isFemale = num % 2 === 0;
      const idStr = String(num).padStart(3, '0');
      const khmerName = isFemale ? cfg.femaleNames[i % cfg.femaleNames.length] : cfg.maleNames[i % cfg.maleNames.length];
      const latinName = isFemale ? `STUDENT ${cfg.grade} F${num}` : `STUDENT ${cfg.grade} M${num}`;
      const province = cfg.provinces[i % cfg.provinces.length];
      const dobMonth = String((i % 12) + 1).padStart(2, '0');
      const dobDay = String((i % 27) + 1).padStart(2, '0');

      students.push({
        studentNationalId: `${cfg.idPrefix}${idStr}`,
        khmerName: khmerName,
        latinName: latinName,
        gender: isFemale ? 'FEMALE' : 'MALE',
        dob: `${cfg.birthYear}-${dobMonth}-${dobDay}`,
        pobProvince: province,
        pobDistrict: 'ស្រុក/ខណ្ឌគំរូ',
        fatherName: `ឪពុក ${khmerName}`,
        fatherOccupation: fatherOccupations[i % fatherOccupations.length],
        motherName: `ម្តាយ ${khmerName}`,
        motherOccupation: motherOccupations[i % motherOccupations.length],
        guardianPhone: `012 ${String(cfg.birthYear).slice(-2)}0 ${idStr}`,
        rollNumber: num,
        classId: cfg.classId,
      });
    }
  });

  return students;
}

const allStudents = parseSeedStudents(seedContent);
console.log(`Parsed ${allStudents.length} total students.`);

// Format student records for Excel output
function formatForExcel(studentList) {
  return studentList.map((s, idx) => {
    const clsInfo = CLASS_MAP[s.classId] || { nameKhmer: s.classId || 'មិនទាន់ចាត់តាំង', gradeLevel: 'ទូទៅ' };
    const formattedDob = s.dob ? new Date(s.dob).toLocaleDateString('en-GB') : '';

    return {
      'ល.រ (No.)': s.rollNumber || idx + 1,
      'អត្តលេខសិស្ស (National ID)': s.studentNationalId,
      'គោត្តនាម និងនាម (Khmer Name)': s.khmerName,
      'ឈ្មោះឡាតាំង (Latin Name)': s.latinName,
      'ភេទ (Gender)': s.gender === 'FEMALE' ? 'ស្រី (F)' : 'ប្រុស (M)',
      'ថ្នាក់រៀន (Classroom)': clsInfo.nameKhmer,
      'កម្រិតថ្នាក់ (Grade Level)': clsInfo.gradeLevel,
      'ថ្ងៃខែឆ្នាំកំណើត (DOB)': formattedDob,
      'រាជធានី/ខេត្តកំណើត (POB Province)': s.pobProvince,
      'ស្រុក/ខណ្ឌកំណើត (POB District)': s.pobDistrict,
      'ឈ្មោះឪពុក (Father Name)': s.fatherName,
      'មុខរបរឪពុក (Father Occupation)': s.fatherOccupation || '',
      'ឈ្មោះម្តាយ (Mother Name)': s.motherName,
      'មុខរបរម្តាយ (Mother Occupation)': s.motherOccupation || '',
      'លេខទូរស័ព្ទអាណាព្យាបាល (Guardian Phone)': s.guardianPhone,
      'ស្ថានភាព (Status)': 'កំពុងសិក្សា (Active)',
    };
  });
}

// Create Workbook
const wb = XLSX.utils.book_new();

// 1. Sheet: All Students
const allData = formatForExcel(allStudents);
const wsAll = XLSX.utils.json_to_sheet(allData);

// Set column widths
const colWidths = [
  { wch: 10 }, // No
  { wch: 22 }, // National ID
  { wch: 25 }, // Khmer Name
  { wch: 24 }, // Latin Name
  { wch: 12 }, // Gender
  { wch: 18 }, // Classroom
  { wch: 22 }, // Grade Level
  { wch: 14 }, // DOB
  { wch: 20 }, // Province
  { wch: 18 }, // District
  { wch: 20 }, // Father Name
  { wch: 24 }, // Father Occupation
  { wch: 20 }, // Mother Name
  { wch: 24 }, // Mother Occupation
  { wch: 20 }, // Phone
  { wch: 20 }, // Status
];

wsAll['!cols'] = colWidths;
XLSX.utils.book_append_sheet(wb, wsAll, 'សិស្សទាំងអស់ (All)');

// 2. Class-specific sheets
const classGroups = [
  { classId: 'c-1-gen-a', sheetName: 'ថ្នាក់ទី ១A (Grade 1)' },
  { classId: 'c-4-gen-a', sheetName: 'ថ្នាក់ទី ៤A (Grade 4)' },
  { classId: 'c-6-gen-a', sheetName: 'ថ្នាក់ទី ៦A (Grade 6)' },
  { classId: 'c-10-gen-a', sheetName: 'ថ្នាក់ទី ១០A (Grade 10)' },
  { classId: 'c-12-soc-1', sheetName: 'ថ្នាក់ទី ១២សង្គម (Grade 12)' },
];

classGroups.forEach(cg => {
  const filtered = allStudents.filter(s => s.classId === cg.classId);
  if (filtered.length > 0) {
    const sheetData = formatForExcel(filtered);
    const wsClass = XLSX.utils.json_to_sheet(sheetData);
    wsClass['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, wsClass, cg.sheetName);
  }
});

// Output path
const outputPath = path.join(__dirname, '..', 'MoEYS_Students_Export.xlsx');
XLSX.writeFile(wb, outputPath);
console.log(`Excel file successfully created at: ${outputPath}`);
