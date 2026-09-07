import { createSupabaseBrowserClient } from './client';
import { StudentData, TeacherData, UserData, SpecializationData, ChapterData } from '../schoolData';
import { ClassRoom, SchoolInfo } from '../mockData';

export async function fetchAllDataFromSupabase() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return null;

  try {
    // 1. Fetch School Info
    const { data: schools } = await supabase.from('schools').select('*').limit(1);
    const schoolData: SchoolInfo | null = schools && schools.length > 0
      ? {
          nameKhmer: schools[0].name_khmer,
          nameEnglish: schools[0].name_english,
          code: schools[0].code,
          province: schools[0].province,
          district: schools[0].district,
          principalName: schools[0].principal_name,
          academicYear: schools[0].academic_year,
          phone: schools[0].phone,
          email: schools[0].email,
          address: schools[0].address,
        }
      : null;

    // 2. Fetch Users
    const { data: usersData } = await supabase.from('users').select('*');
    const users: UserData[] | null = usersData
      ? usersData.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email || '',
          khmerName: u.full_name_km,
          latinName: u.full_name_latin,
          role: u.role,
          status: u.status,
          passwordHash: u.password_hash || '',
          teacherId: u.teacher_id,
          assignedClassIds: u.assigned_class_ids || [],
          assignedSubjectCodes: u.assigned_subject_codes || [],
          permissions: u.permissions || {},
          avatarColor: u.avatar_color || 'from-blue-600 to-indigo-600',
        }))
      : null;

    // 3. Fetch Classes
    const { data: classesData } = await supabase.from('classes').select('*');
    const classes: ClassRoom[] | null = classesData
      ? classesData.map((c) => ({
          id: c.id,
          name: c.name,
          gradeLevel: c.grade_level,
          track: c.track,
          shift: c.shift,
          roomNumber: c.room_number,
          homeroomTeacherId: c.homeroom_teacher_id || '',
          homeroomTeacherName: c.homeroom_teacher_name || '',
          totalStudents: c.total_students || 0,
          femaleStudents: c.female_students || 0,
        }))
      : null;

    // 4. Fetch Teachers
    const { data: teachersData } = await supabase.from('teachers').select('*');
    const teachers: TeacherData[] | null = teachersData
      ? teachersData.map((t) => ({
          civilServantId: t.civil_servant_id,
          khmerName: t.khmer_name,
          latinName: t.latin_name,
          gender: t.gender,
          cadre: t.cadre,
          specialization: t.specialization,
          standardQuota: t.standard_quota,
          assignedShift: t.assigned_shift,
          phoneNumber: t.phone_number,
          dob: new Date(t.dob),
        }))
      : null;

    // 5. Fetch Students
    const { data: studentsData } = await supabase.from('students').select('*').order('roll_number', { ascending: true });
    const students: StudentData[] | null = studentsData
      ? studentsData.map((s) => ({
          studentNationalId: s.student_national_id,
          khmerName: s.khmer_name,
          latinName: s.latin_name,
          gender: s.gender,
          dob: new Date(s.dob),
          pobProvince: s.pob_province,
          pobDistrict: s.pob_district,
          fatherName: s.father_name || '',
          motherName: s.mother_name || '',
          guardianPhone: s.guardian_phone || '',
          rollNumber: s.roll_number || 1,
          classId: s.class_id || '',
        }))
      : null;

    // 6. Fetch Monthly Scores
    const { data: monthlyData } = await supabase.from('monthly_scores').select('*');
    const monthlyScoresMap: Record<number, Record<string, Record<string, number>>> = {};
    if (monthlyData) {
      monthlyData.forEach((row) => {
        if (!monthlyScoresMap[row.month_index]) {
          monthlyScoresMap[row.month_index] = {};
        }
        monthlyScoresMap[row.month_index][row.student_id] = row.scores_json || {};
      });
    }

    // 7. Fetch Semester Exam Scores
    const { data: semesterExamData } = await supabase.from('semester_exam_scores').select('*');
    const semesterExamScoresMap: Record<number, Record<string, Record<string, number>>> = { 1: {}, 2: {} };
    if (semesterExamData) {
      semesterExamData.forEach((row) => {
        const sem = Number(row.semester);
        if (!semesterExamScoresMap[sem]) {
          semesterExamScoresMap[sem] = {};
        }
        semesterExamScoresMap[sem][row.student_id] = row.scores_json || {};
      });
    }

    // 8. Fetch Attendance
    const { data: attendanceData } = await supabase.from('attendance_records').select('*');
    const attendance: Record<string, any> = {};
    if (attendanceData) {
      attendanceData.forEach((row) => {
        attendance[row.student_id] = row.status;
      });
    }

    // 9. Fetch Specializations
    const { data: specializationsData } = await supabase.from('specializations').select('*');
    const specializations: SpecializationData[] | null = specializationsData
      ? specializationsData.map((s) => ({
          id: s.id || `spec-${s.code.toLowerCase()}`,
          code: s.code,
          nameKhmer: s.name_khmer,
          nameEnglish: s.name_english,
          category: s.category || 'STEM',
          department: s.department || 'ដេប៉ាតឺម៉ង់មុខវិជ្ជា',
          standardWeeklyHours: s.standard_weekly_hours || 18,
          description: s.description || '',
          coefficient: s.coefficient ? Number(s.coefficient) : 1.0,
          maxScore: s.max_score ? Number(s.max_score) : 100,
          passingScore: s.passing_score ? Number(s.passing_score) : 50,
          isCore: s.is_core || false,
        }))
      : null;

    // 10. Fetch Chapters
    const { data: chaptersData } = await supabase.from('chapters').select('*');
    const chapters: ChapterData[] | null = chaptersData
      ? chaptersData.map((c) => ({
          id: c.id,
          subjectCode: c.subject_code,
          subjectName: c.subject_code,
          gradeLevel: c.grade_level || 'GRADE_11',
          semester: 1,
          totalLessons: 4,
          totalTeachingHours: c.total_hours || 4,
          chapterNumber: c.chapter_number,
          titleKhmer: c.title_khmer,
          titleEnglish: c.title_english,
          description: c.description || '',
        }))
      : null;

    return {
      school: schoolData,
      users,
      classes,
      teachers,
      students,
      monthlyScoresMap,
      semesterExamScoresMap,
      attendance,
      specializations,
      chapters,
    };
  } catch (error) {
    console.error('Error fetching Supabase data:', error);
    return null;
  }
}

// ----------------------------------------------------------------------
// SYNC MUTATIONS TO SUPABASE
// ----------------------------------------------------------------------

export async function syncSchoolToSupabase(school: SchoolInfo) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('schools').upsert([
    {
      id: 'current-school',
      code: school.code || 'SCH-001',
      name_khmer: school.nameKhmer,
      name_english: school.nameEnglish,
      province: school.province,
      district: school.district,
      principal_name: school.principalName,
      academic_year: school.academicYear,
      phone: school.phone,
      email: school.email,
      address: school.address,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function syncUserToSupabase(user: UserData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('users').upsert([
    {
      id: user.id,
      username: user.username,
      email: user.email || null,
      full_name_km: user.khmerName,
      full_name_latin: user.latinName,
      role: user.role,
      status: user.status,
      password_hash: user.passwordHash || null,
      teacher_id: user.teacherId || null,
      assigned_class_ids: user.assignedClassIds || [],
      permissions: user.permissions || {},
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteUserFromSupabase(userId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('users').delete().eq('id', userId);
}

export async function syncStudentToSupabase(student: StudentData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('students').upsert([
    {
      student_national_id: student.studentNationalId,
      khmer_name: student.khmerName,
      latin_name: student.latinName,
      gender: student.gender,
      dob: student.dob instanceof Date ? student.dob.toISOString().split('T')[0] : student.dob,
      pob_province: student.pobProvince,
      pob_district: student.pobDistrict,
      father_name: student.fatherName,
      mother_name: student.motherName,
      guardian_phone: student.guardianPhone,
      roll_number: student.rollNumber,
      class_id: student.classId || null,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteStudentFromSupabase(studentNationalId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('students').delete().eq('student_national_id', studentNationalId);
}

export async function syncTeacherToSupabase(teacher: TeacherData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('teachers').upsert([
    {
      civil_servant_id: teacher.civilServantId,
      khmer_name: teacher.khmerName,
      latin_name: teacher.latinName,
      gender: teacher.gender,
      cadre: teacher.cadre,
      specialization: teacher.specialization,
      standard_quota: teacher.standardQuota,
      assigned_shift: teacher.assignedShift,
      phone_number: teacher.phoneNumber,
      dob: teacher.dob instanceof Date ? teacher.dob.toISOString().split('T')[0] : teacher.dob,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteTeacherFromSupabase(civilServantId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('teachers').delete().eq('civil_servant_id', civilServantId);
}

export async function syncClassToSupabase(cls: ClassRoom) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('classes').upsert([
    {
      id: cls.id,
      name: cls.name,
      grade_level: cls.gradeLevel,
      track: cls.track,
      shift: cls.shift,
      room_number: cls.roomNumber,
      homeroom_teacher_id: cls.homeroomTeacherId || null,
      homeroom_teacher_name: cls.homeroomTeacherName || null,
      total_students: cls.totalStudents || 0,
      female_students: cls.femaleStudents || 0,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteClassFromSupabase(classId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('classes').delete().eq('id', classId);
}

export async function syncMonthlyScoreToSupabase(monthIndex: number, studentId: string, scoresJson: Record<string, number>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('monthly_scores').upsert([
    {
      id: `m${monthIndex}-${studentId}`,
      month_index: monthIndex,
      student_id: studentId,
      scores_json: scoresJson,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function syncSemesterExamScoreToSupabase(semester: number, studentId: string, scoresJson: Record<string, number>) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('semester_exam_scores').upsert([
    {
      id: `sem${semester}-${studentId}`,
      semester: semester,
      student_id: studentId,
      scores_json: scoresJson,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function syncAttendanceToSupabase(studentId: string, status: string, dateStr?: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  const date = dateStr || new Date().toISOString().split('T')[0];
  await supabase.from('attendance_records').upsert([
    {
      id: `${date}-${studentId}`,
      student_id: studentId,
      date,
      status,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function syncSpecializationToSupabase(spec: SpecializationData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('specializations').upsert([
    {
      id: spec.id || `spec-${spec.code.toLowerCase()}`,
      code: spec.code,
      name_khmer: spec.nameKhmer,
      name_english: spec.nameEnglish,
      category: spec.category,
      department: spec.department,
      standard_weekly_hours: spec.standardWeeklyHours || 18,
      description: spec.description || '',
      coefficient: spec.coefficient || 1.0,
      max_score: spec.maxScore || 100,
      passing_score: spec.passingScore || 50,
      is_core: spec.isCore || false,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteSpecializationFromSupabase(code: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('specializations').delete().eq('code', code);
}

export async function syncChapterToSupabase(chapter: ChapterData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('chapters').upsert([
    {
      id: chapter.id,
      subject_code: chapter.subjectCode,
      grade_level: chapter.gradeLevel,
      chapter_number: chapter.chapterNumber,
      title_khmer: chapter.titleKhmer,
      title_english: chapter.titleEnglish,
      description: chapter.description || '',
      total_hours: chapter.totalTeachingHours || 4,
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteChapterFromSupabase(id: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('chapters').delete().eq('id', id);
}

export async function wipeAllSupabaseData() {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    // Delete in cascade order
    await supabase.from('attendance_records').delete().neq('id', '___NON_EXISTENT___');
    await supabase.from('monthly_scores').delete().neq('id', '___NON_EXISTENT___');
    await supabase.from('semester_exam_scores').delete().neq('id', '___NON_EXISTENT___');
    await supabase.from('students').delete().neq('student_national_id', '___NON_EXISTENT___');
    await supabase.from('classes').delete().neq('id', '___NON_EXISTENT___');
    await supabase.from('teachers').delete().neq('civil_servant_id', '___NON_EXISTENT___');
    return true;
  } catch (err) {
    console.error('Error wiping Supabase data:', err);
    return false;
  }
}
