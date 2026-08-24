import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    console.log('[SahyogSeva] Connected to Supabase backend successfully.');
  } catch (err) {
    console.warn('[SahyogSeva] Supabase initialization failed, falling back to local cooperative DB:', err);
  }
} else {
  console.info('[SahyogSeva] Running with local cooperative database store (Demo / Zero-config mode).');
}

export const supabase = supabaseInstance;
