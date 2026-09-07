import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConfig } from './types';

export const STORAGE_KEY_DB_CONFIG = 'moeys_sms_supabase_config';
export const STORAGE_KEY_DB_PROFILES = 'moeys_sms_db_profiles';

export interface DatabaseProfile {
  id: string;
  name: string;
  config: DatabaseConfig;
  lastUsedAt: string;
}

let memoryCachedConfig: DatabaseConfig | null = null;

/**
 * Decode and apply database configuration from URL query params (e.g. ?db=... or #db=...)
 * This allows 1-click database connection on any device without entering credentials.
 */
export function decodeDatabaseConfigFromUrl(): DatabaseConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    let raw = params.get('db');
    if (!raw && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      raw = hashParams.get('db');
    }
    if (!raw) return null;

    let jsonStr: string;
    try {
      jsonStr = atob(decodeURIComponent(raw));
    } catch {
      jsonStr = decodeURIComponent(raw);
    }
    const parsed = JSON.parse(jsonStr);
    const url = parsed.supabaseUrl || parsed.url;
    const key = parsed.supabaseAnonKey || parsed.key;

    if (url && key) {
      const cfg: DatabaseConfig = {
        supabaseUrl: url,
        supabaseAnonKey: key,
        supabaseServiceRoleKey: parsed.supabaseServiceRoleKey || parsed.serviceKey || undefined,
        databaseUrl: parsed.databaseUrl || undefined,
        directUrl: parsed.directUrl || undefined,
        isConnected: true,
        isInitialized: true,
        connectedAt: new Date().toISOString(),
      };
      saveStoredDatabaseConfig(cfg);
      saveDatabaseProfile(parsed.schoolName || `Database (${new URL(url).hostname})`, cfg);

      // Clean the URL without page reload
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete('db');
      if (cleanUrl.hash.includes('db=')) cleanUrl.hash = '';
      window.history.replaceState({}, '', cleanUrl.toString());
      return cfg;
    }
  } catch (err) {
    console.error('Failed to decode database configuration from URL:', err);
  }
  return null;
}

/**
 * Generate a 1-click shareable database connection link for teachers, staff, or new devices
 */
export function generateShareableDatabaseLink(config: DatabaseConfig, schoolName?: string): string {
  if (typeof window === 'undefined') return '';
  const payload = {
    url: config.supabaseUrl,
    key: config.supabaseAnonKey,
    serviceKey: config.supabaseServiceRoleKey,
    databaseUrl: config.databaseUrl,
    directUrl: config.directUrl,
    schoolName: schoolName || undefined,
  };
  const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
  const origin = window.location.origin;
  return `${origin}/login?db=${encoded}`;
}

/**
 * Multiple Database Profiles Management (Quick Switcher)
 */
export function getSavedDatabaseProfiles(): DatabaseProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DB_PROFILES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDatabaseProfile(name: string, config: DatabaseConfig) {
  if (typeof window === 'undefined') return;
  try {
    const profiles = getSavedDatabaseProfiles();
    const existingIndex = profiles.findIndex((p) => p.config.supabaseUrl === config.supabaseUrl);
    const updated: DatabaseProfile = {
      id: existingIndex >= 0 ? profiles[existingIndex].id : `profile-${Date.now()}`,
      name: name.trim() || `Database (${new URL(config.supabaseUrl).hostname})`,
      config,
      lastUsedAt: new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      profiles[existingIndex] = updated;
    } else {
      profiles.unshift(updated);
    }
    localStorage.setItem(STORAGE_KEY_DB_PROFILES, JSON.stringify(profiles));
  } catch {}
}

export function removeDatabaseProfile(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const profiles = getSavedDatabaseProfiles().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_DB_PROFILES, JSON.stringify(profiles));
  } catch {}
}

export function getStoredDatabaseConfig(): DatabaseConfig | null {
  if (typeof window !== 'undefined') {
    const fromUrl = decodeDatabaseConfigFromUrl();
    if (fromUrl) {
      memoryCachedConfig = fromUrl;
      return fromUrl;
    }
  }
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
