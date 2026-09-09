import { createSupabaseBrowserClient } from './client';
import { StudentData, TeacherData, UserData, SpecializationData, ChapterData } from '../schoolData';
import { ClassRoom, SchoolInfo, SchoolSettings } from '../mockData';
import { HolidayData } from '../holidayData';

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
          settings: schools[0].settings || undefined,
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
          subjectDivisor: c.subject_divisor ? Number(c.subject_divisor) : undefined,
          semesterDivisor: c.semester_divisor ? Number(c.semester_divisor) : undefined,
          disabledColumnKeys: Array.isArray(c.disabled_column_keys) ? c.disabled_column_keys : [],
          examSubjectKeys: Array.isArray(c.exam_subject_keys) ? c.exam_subject_keys : [],
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
          fatherOccupation: s.father_occupation || '',
          motherName: s.mother_name || '',
          motherOccupation: s.mother_occupation || '',
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

    // 11. Fetch Holidays & Academic Calendar Events
    const { data: holidaysData } = await supabase.from('holidays').select('*').order('date_from', { ascending: true });
    const holidays: HolidayData[] | null = holidaysData
      ? holidaysData.map((h) => ({
          id: h.id,
          titleKhmer: h.title_khmer,
          titleEnglish: h.title_english || '',
          dateFrom: h.date_from,
          dateTo: h.date_to,
          type: h.type,
          isDayOff: h.is_day_off ?? true,
          description: h.description || '',
          academicYear: h.academic_year || '២០២៤ - ២០២៥',
        }))
      : null;

    // 12. Fetch Dedicated System Settings from public.system_settings table
    try {
      const { data: systemSettingsData } = await supabase.from('system_settings').select('*').limit(1);
      if (schoolData && systemSettingsData && systemSettingsData.length > 0) {
        const sys = systemSettingsData[0];
        schoolData.settings = {
          defaultDivisor: sys.default_divisor ? Number(sys.default_divisor) : (schoolData.settings?.defaultDivisor ?? 21),
          passingThreshold: sys.passing_threshold ? Number(sys.passing_threshold) : (schoolData.settings?.passingThreshold ?? 50),
          autoCalculateRank: sys.auto_calculate_rank ?? true,
          autoSaveAlert: sys.auto_save_alert ?? true,
          academicMonths: Array.isArray(sys.academic_months) && sys.academic_months.length > 0
            ? sys.academic_months
            : schoolData.settings?.academicMonths,
          ...(sys.custom_settings || {}),
        };
      }
    } catch {}

    // 13. Fetch Dedicated Class Settings from public.class_settings table
    try {
      const { data: classSettingsData } = await supabase.from('class_settings').select('*');
      if (classes && classSettingsData && classSettingsData.length > 0) {
        const csMap = new Map(classSettingsData.map((cs) => [cs.class_id, cs]));
        classes.forEach((c) => {
          const cs = csMap.get(c.id);
          if (cs) {
            if (cs.subject_divisor !== null && cs.subject_divisor !== undefined) {
              c.subjectDivisor = Number(cs.subject_divisor);
            }
            if (cs.semester_divisor !== null && cs.semester_divisor !== undefined) {
              c.semesterDivisor = Number(cs.semester_divisor);
            }
            if (Array.isArray(cs.disabled_column_keys) && cs.disabled_column_keys.length > 0) {
              c.disabledColumnKeys = cs.disabled_column_keys;
            }
            if (Array.isArray(cs.exam_subject_keys) && cs.exam_subject_keys.length > 0) {
              c.examSubjectKeys = cs.exam_subject_keys;
            }
          }
        });
      }
    } catch {}

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
      holidays,
    };
  } catch (error) {
    console.error('Error fetching Supabase data:', error);
    return null;
  }
}

// ----------------------------------------------------------------------
// SYNC MUTATIONS TO SUPABASE
// ----------------------------------------------------------------------

export async function syncSystemSettingsToSupabase(settings: SchoolSettings) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  try {
    await supabase.from('system_settings').upsert([
      {
        id: 'default-settings',
        school_id: 'current-school',
        default_divisor: settings.defaultDivisor ?? 21,
        passing_threshold: settings.passingThreshold ?? 50,
        auto_calculate_rank: settings.autoCalculateRank ?? true,
        auto_save_alert: settings.autoSaveAlert ?? true,
        academic_months: settings.academicMonths || [],
        custom_settings: {},
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn('Sync to system_settings table warning:', err);
  }
}

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
      settings: school.settings || {},
      updated_at: new Date().toISOString(),
    },
  ]);

  if (school.settings) {
    await syncSystemSettingsToSupabase(school.settings);
  }
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
      father_occupation: student.fatherOccupation || null,
      mother_name: student.motherName,
      mother_occupation: student.motherOccupation || null,
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

export async function syncClassSettingsToSupabase(
  classId: string,
  subjectDivisor: number,
  semesterDivisor: number,
  disabledColumnKeys: string[],
  examSubjectKeys?: string[]
) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  try {
    await supabase.from('class_settings').upsert([
      {
        id: `cfg-${classId}`,
        class_id: classId,
        subject_divisor: subjectDivisor,
        semester_divisor: semesterDivisor,
        disabled_column_keys: disabledColumnKeys || [],
        exam_subject_keys: examSubjectKeys || [],
        updated_at: new Date().toISOString(),
      },
    ]);
  } catch (err) {
    console.warn('Sync to class_settings table warning:', err);
  }
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
      subject_divisor: cls.subjectDivisor ?? 21,
      semester_divisor: cls.semesterDivisor ?? 14,
      disabled_column_keys: cls.disabledColumnKeys || [],
      exam_subject_keys: cls.examSubjectKeys || [],
      updated_at: new Date().toISOString(),
    },
  ]);

  // Sync to dedicated class_settings table in Supabase
  await syncClassSettingsToSupabase(
    cls.id,
    cls.subjectDivisor ?? 21,
    cls.semesterDivisor ?? 14,
    cls.disabledColumnKeys || [],
    cls.examSubjectKeys || []
  );
}

export async function deleteClassFromSupabase(classId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  try {
    await supabase.from('class_settings').delete().eq('class_id', classId);
  } catch {}
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

// ----------------------------------------------------------------------
// HOLIDAYS & CALENDAR SYNC
// ----------------------------------------------------------------------

export async function syncHolidayToSupabase(holiday: HolidayData) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  await supabase.from('holidays').upsert([
    {
      id: holiday.id,
      title_khmer: holiday.titleKhmer,
      title_english: holiday.titleEnglish || null,
      date_from: holiday.dateFrom,
      date_to: holiday.dateTo,
      type: holiday.type,
      is_day_off: holiday.isDayOff,
      description: holiday.description || null,
      academic_year: holiday.academicYear || '២០២៤ - ២០២៥',
      updated_at: new Date().toISOString(),
    },
  ]);
}

export async function deleteHolidayFromSupabase(holidayId: string) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;
  await supabase.from('holidays').delete().eq('id', holidayId);
}

export async function seedDefaultHolidaysToSupabase(holidays: HolidayData[]) {
  const supabase = createSupabaseBrowserClient();
  if (!supabase) return;

  const records = holidays.map((h) => ({
    id: h.id,
    title_khmer: h.titleKhmer,
    title_english: h.titleEnglish || null,
    date_from: h.dateFrom,
    date_to: h.dateTo,
    type: h.type,
    is_day_off: h.isDayOff,
    description: h.description || null,
    academic_year: h.academicYear || '២០២៤ - ២០២៥',
    updated_at: new Date().toISOString(),
  }));

  await supabase.from('holidays').upsert(records);
}

