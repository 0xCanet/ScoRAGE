import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return null;
  }

  return createClient(env.supabaseUrl, env.supabaseAnonKey);
}