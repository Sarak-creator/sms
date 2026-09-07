import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig } from './types';

export const STORAGE_KEY_DB_CONFIG = 'moeys_sms_supabase_config';

let memoryCachedConfig: DatabaseConfig | null = null;

export function getStoredDatabaseConfig(): DatabaseConfig | null {
  if (memoryCachedConfig) return memoryCachedConfig;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB_CONFIG);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    memoryCachedConfig = parsed;
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredDatabaseConfig(config: DatabaseConfig) {
  memoryCachedConfig = config;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_DB_CONFIG, JSON.stringify(config));
  } catch {}
}

export function isSupabaseConfigured(customConfig?: DatabaseConfig): boolean {
  const config = customConfig || getStoredDatabaseConfig();
  const url = config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = config?.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key);
}

export function createSupabaseBrowserClient(customConfig?: DatabaseConfig): SupabaseClient | null {
  const config = customConfig || getStoredDatabaseConfig();
  const url = config?.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = config?.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Fetch and sync system configuration from the domain server endpoint (/api/database)
 * This enables any new device or new browser opening the domain link to automatically
 * receive the Supabase configuration without needing manual entry.
 */
export async function fetchServerDatabaseConfig(): Promise<DatabaseConfig | null> {
  const existing = getStoredDatabaseConfig();
  if (existing && existing.supabaseUrl && existing.supabaseAnonKey) {
    return existing;
  }

  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/database');
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.supabaseUrl && data.supabaseAnonKey) {
          const cfg: DatabaseConfig = {
            supabaseUrl: data.supabaseUrl,
            supabaseAnonKey: data.supabaseAnonKey,
            isConnected: true,
            isInitialized: true,
            connectedAt: new Date().toISOString(),
          };
          saveStoredDatabaseConfig(cfg);
          return cfg;
        }
      }
    } catch (e) {
      console.error('Error fetching server database configuration:', e);
    }
  }

  return null;
}

/**
 * Fetch and sync system configuration stored directly inside the Supabase database table
 */
export async function fetchDatabaseConfigFromSupabase(): Promise<DatabaseConfig | null> {
  let supabase = createSupabaseBrowserClient();
  if (!supabase) {
    await fetchServerDatabaseConfig();
    supabase = createSupabaseBrowserClient();
  }
  if (!supabase) return null;

  try {
    const { data } = await supabase.from('system_configurations').select('*').limit(1);
    if (data && data.length > 0) {
      const cfg: DatabaseConfig = {
        supabaseUrl: data[0].supabase_url,
        supabaseAnonKey: data[0].supabase_anon_key,
        supabaseServiceRoleKey: data[0].supabase_service_role_key || undefined,
        databaseUrl: data[0].database_url || undefined,
        directUrl: data[0].direct_url || undefined,
        isConnected: data[0].is_connected,
        isInitialized: data[0].is_initialized,
        connectedAt: data[0].connected_at,
      };
      saveStoredDatabaseConfig(cfg);
      return cfg;
    }
  } catch (err) {
    console.error('Error fetching database config from table:', err);
  }
  return null;
}
