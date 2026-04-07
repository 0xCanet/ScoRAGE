import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

export function createSupabaseServerClient(): SupabaseClient | null {
  const key = env.supabaseServiceRoleKey ?? env.supabaseAnonKey;

  if (!env.supabaseUrl || !key) {
    return null;
  }

  return createClient(env.supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}