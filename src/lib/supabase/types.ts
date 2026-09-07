export interface DatabaseConfig {
  databaseUrl?: string;
  directUrl?: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey?: string;
  isConnected?: boolean;
  connectedAt?: string;
  isInitialized?: boolean;
}

export interface InitialSchoolSetupForm {
  schoolNameKhmer: string;
  schoolNameEnglish: string;
  schoolCode: string;
  province: string;
  district: string;
  academicYear: string;
  principalKhmerName: string;
  principalLatinName: string;
  principalPhone: string;
  principalUsername: string;
  principalPassword: string;
  principalEmail: string;
}
