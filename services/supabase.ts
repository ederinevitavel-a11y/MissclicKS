import { createClient } from '@supabase/supabase-js';

// Default active project provided by user
const DEFAULT_SUPABASE_URL = 'https://gbhrsehpzddnvswlmeuu.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaHJzZWhwemRkbnZzd2xtZXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NTI2MTIsImV4cCI6MjEwODAyODYxMn0.5xmrK5fT40uZ-WQ3yDaBlX0Po3o2QdRYbNccUNs-JIs';

// Old restricted project that ran out of quota
const OLD_RESTRICTED_REF = 'stlcmrvhwwyzxziryxzq';

let rawUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

// If the environment still has the old blocked/restricted project or is empty, use the new credentials
if (!rawUrl || rawUrl.includes(OLD_RESTRICTED_REF) || !supabaseAnonKey || supabaseAnonKey.includes(OLD_RESTRICTED_REF)) {
  rawUrl = DEFAULT_SUPABASE_URL;
  supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY;
}

const supabaseUrl = rawUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
