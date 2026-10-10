import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

export function createClient(
  url: string = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseUrl,
  key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseAnonKey
) {
  if ((!url || url === supabaseUrl) && (!key || key === supabaseAnonKey) && supabase) {
    return supabase;
  }
  return createSupabaseClient(url, key);
}

