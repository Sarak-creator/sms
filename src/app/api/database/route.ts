import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SCHEMA_SQL } from '@/lib/supabase/schemaSql';
import { SEED_SPECIALIZATIONS } from '@/lib/schoolData';

import defaultDbConfig from '@/config/database.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || defaultDbConfig?.supabaseUrl;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || defaultDbConfig?.supabaseAnonKey;

  if (supabaseUrl && supabaseAnonKey) {
    return NextResponse.json({
      success: true,
      configured: true,
      supabaseUrl,
      supabaseAnonKey,
      databaseUrl: defaultDbConfig?.databaseUrl || process.env.DATABASE_URL,
      directUrl: defaultDbConfig?.directUrl || process.env.DIRECT_URL,
    });
  }

  return NextResponse.json({
    success: true,
    configured: false,
    message: 'No domain database configured yet.',
  });
}

// Helper function to execute SQL via PostgreSQL client
async function executeSqlViaPg(connectionString: string, sql: string) {
  const { Client } = await import('pg');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query(sql);
    return { success: true };
  } finally {
    await client.end();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, config, schoolData, principalData } = body;

    const supabaseUrl = config?.supabaseUrl?.trim();
    const supabaseAnonKey = config?.supabaseAnonKey?.trim();
    const supabaseServiceRoleKey = config?.supabaseServiceRoleKey?.trim() || supabaseAnonKey;
    const databaseUrl = config?.databaseUrl?.trim();
    const directUrl = config?.directUrl?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'សូមបំពេញ NEXT_PUBLIC_SUPABASE_URL និង NEXT_PUBLIC_SUPABASE_ANON_KEY ជាមុនសិន!' },
        { status: 400 }
      );
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: { persistSession: false },
    });

    // -------------------------------------------------------------
    // 1. ACTION: TEST_CONNECTION
    // -------------------------------------------------------------
    if (action === 'TEST_CONNECTION') {
      try {
        const { error } = await supabase.from('schools').select('id').limit(1);
        if (error && error.code !== '42P01' && !error.message?.includes('does not exist')) {
          return NextResponse.json({
            success: false,
            error: `ការភ្ជាប់ Supabase បរាជ័យ: ${error.message}`,
          });
        }
        return NextResponse.json({
          success: true,
          message: 'បានតភ្ជាប់ទៅកាន់ Supabase Database ដោយជោគជ័យ!',
        });
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `មិនអាចភ្ជាប់ទៅកាន់ Supabase បានទេ: ${err?.message || 'Network error'}`,
        });
      }
    }

    // -------------------------------------------------------------
    // 2. ACTION: CREATE_TABLES (Execute DDL & Save Config into Database Table)
    // -------------------------------------------------------------
    if (action === 'CREATE_TABLES' || action === 'INIT_NEW_DATABASE') {
      let pgExecuted = false;
      let pgError = null;

      // 1. Execute DDL Schema via PostgreSQL client
      const pgConnString = directUrl || databaseUrl;
      if (pgConnString) {
        try {
          await executeSqlViaPg(pgConnString, SUPABASE_SCHEMA_SQL);
          pgExecuted = true;
        } catch (err: any) {
          pgError = err?.message || 'PostgreSQL direct execution failed';
          console.error('PG SQL execution error:', err);
        }
      }

      // If no direct PG connection string or PG failed, try Supabase RPC exec_sql
      if (!pgExecuted) {
        try {
          const { error: rpcError } = await supabase.rpc('exec_sql', { sql: SUPABASE_SCHEMA_SQL });
          if (!rpcError) {
            pgExecuted = true;
          }
        } catch {}
      }

      // 2. Save Supabase Configuration into public.system_configurations Table in Supabase
      const configRecord = {
        id: 'primary-config',
        supabase_url: supabaseUrl,
        supabase_anon_key: supabaseAnonKey,
        supabase_service_role_key: supabaseServiceRoleKey || null,
        database_url: databaseUrl || null,
        direct_url: directUrl || null,
        is_connected: true,
        is_initialized: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        const { error: configError } = await supabase
          .from('system_configurations')
          .upsert([configRecord]);

        if (configError) {
          console.error('Save configuration to database table error:', configError);
        }
      } catch (err) {
        console.error('Config save error:', err);
      }

      // 3. Seed Core Standard MoEYS Specializations/Subjects
      try {
        const specsToInsert = SEED_SPECIALIZATIONS.map((s) => ({
          id: s.id || `spec-${s.code.toLowerCase()}`,
          code: s.code,
          name_khmer: s.nameKhmer,
          name_english: s.nameEnglish,
          category: s.category,
          department: s.department,
          standard_weekly_hours: s.standardWeeklyHours,
          description: s.description || '',
          coefficient: s.coefficient || 1.0,
          max_score: s.maxScore || 100,
          passing_score: s.passingScore || 50,
          is_core: s.isCore || false,
        }));
        await supabase.from('specializations').upsert(specsToInsert);
      } catch (e) {
        console.log('Specialization auto-seed note:', e);
      }

      return NextResponse.json({
        success: true,
        pgExecuted,
        pgError,
        message: 'បានបង្កើត Tables និងរក្សាទុក Configuration ទៅក្នុង Database Table រួចរាល់!',
        configRecord,
      });
    }

    // -------------------------------------------------------------
    // 3. ACTION: REGISTER_SCHOOL (Create School & Principal Admin Account)
    // -------------------------------------------------------------
    if (action === 'REGISTER_SCHOOL') {
      // 1. Insert/Upsert School Record
      const initialSchool = {
        id: 'current-school',
        name_khmer: schoolData?.schoolNameKhmer || 'វិទ្យាល័យ ហ៊ុន សែន វត្តភ្នំ',
        name_english: schoolData?.schoolNameEnglish || 'Hun Sen Wat Phnom High School',
        code: schoolData?.schoolCode || 'SCH-KH-120101',
        province: schoolData?.province || 'រាជធានីភ្នំពេញ',
        district: schoolData?.district || 'ខណ្ឌដូនពេញ',
        principal_name: schoolData?.principalKhmerName || 'នាយកសាលា',
        academic_year: schoolData?.academicYear || '២០២៤ - ២០២៥',
        phone: schoolData?.principalPhone || '',
        email: schoolData?.principalEmail || '',
        address: schoolData?.address || '',
      };

      const { error: schoolError } = await supabase.from('schools').upsert([initialSchool]);
      if (schoolError) {
        console.error('School insertion error:', schoolError);
      }

      // 2. Insert Principal User Record
      const principalUser = {
        id: 'user-principal-01',
        username: principalData?.principalUsername?.trim() || 'principal',
        email: principalData?.principalEmail?.trim() || 'principal@school.moeys.gov.kh',
        full_name_km: principalData?.principalKhmerName?.trim() || initialSchool.principal_name,
        full_name_latin: principalData?.principalLatinName?.trim() || 'PRINCIPAL ADMIN',
        role: 'PRINCIPAL',
        status: 'ACTIVE',
        password_hash: principalData?.principalPassword || 'admin',
        permissions: {
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
      };

      const { error: userError } = await supabase.from('users').upsert([principalUser]);
      if (userError) {
        console.error('Principal user insertion error:', userError);
      }

      // 3. Ensure Configuration is up-to-date in system_configurations Table
      try {
        await supabase.from('system_configurations').upsert([
          {
            id: 'primary-config',
            supabase_url: supabaseUrl,
            supabase_anon_key: supabaseAnonKey,
            supabase_service_role_key: supabaseServiceRoleKey || null,
            database_url: databaseUrl || null,
            direct_url: directUrl || null,
            is_connected: true,
            is_initialized: true,
            updated_at: new Date().toISOString(),
          },
        ]);
      } catch {}

      const principalUserFormatted = {
        id: principalUser.id,
        username: principalUser.username,
        email: principalUser.email,
        khmerName: principalUser.full_name_km,
        latinName: principalUser.full_name_latin,
        role: 'PRINCIPAL' as const,
        status: 'ACTIVE' as const,
        passwordHash: principalUser.password_hash,
        assignedClassIds: [],
        assignedSubjectCodes: [],
        permissions: principalUser.permissions,
        avatarColor: 'from-blue-600 to-indigo-600',
      };

      return NextResponse.json({
        success: true,
        message: 'ចុះឈ្មោះសាលារៀន និងគណនីនាយកសាលាបានជោគជ័យ!',
        principalUser: principalUserFormatted,
        school: initialSchool,
      });
    }

    // -------------------------------------------------------------
    // 4. ACTION: CONNECT_OLD_DATABASE
    // -------------------------------------------------------------
    if (action === 'CONNECT_OLD_DATABASE') {
      let existingSchool = null;
      let existingUsers: any[] = [];
      let savedConfig = null;

      try {
        const { data: configRes } = await supabase.from('system_configurations').select('*').limit(1);
        if (configRes && configRes.length > 0) {
          savedConfig = configRes[0];
        }

        const { data: schoolRes } = await supabase.from('schools').select('*').limit(1);
        if (schoolRes && schoolRes.length > 0) {
          existingSchool = schoolRes[0];
        }

        const { data: usersRes } = await supabase.from('users').select('*');
        if (usersRes) {
          existingUsers = usersRes;
        }
      } catch {}

      return NextResponse.json({
        success: true,
        message: 'បានភ្ជាប់ទៅកាន់ Database ចាស់ដោយជោគជ័យ!',
        existingSchool,
        usersCount: existingUsers.length,
        savedConfig,
      });
    }

    // -------------------------------------------------------------
    // 5. ACTION: GET_CONFIGURATION
    // -------------------------------------------------------------
    if (action === 'GET_CONFIGURATION') {
      try {
        const { data } = await supabase.from('system_configurations').select('*').limit(1);
        if (data && data.length > 0) {
          return NextResponse.json({
            success: true,
            config: {
              supabaseUrl: data[0].supabase_url,
              supabaseAnonKey: data[0].supabase_anon_key,
              supabaseServiceRoleKey: data[0].supabase_service_role_key,
              databaseUrl: data[0].database_url,
              directUrl: data[0].direct_url,
              isConnected: data[0].is_connected,
              isInitialized: data[0].is_initialized,
            },
          });
        }
      } catch {}

      return NextResponse.json({ success: true, config: null });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('API /api/database error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server processing error' },
      { status: 500 }
    );
  }
}
