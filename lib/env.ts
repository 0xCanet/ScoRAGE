const readEnv = (value: string | undefined): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const env = {
  appUrl: readEnv(process.env.NEXT_PUBLIC_APP_URL) ?? 'http://localhost:3000',
  supabaseUrl: readEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? readEnv(process.env.SUPABASE_URL),
  supabaseAnonKey:
    readEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ?? readEnv(process.env.SUPABASE_ANON_KEY),
  supabaseServiceRoleKey: readEnv(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

export const hasSupabaseUrl = Boolean(env.supabaseUrl);

export const hasSupabaseReadAccess = Boolean(env.supabaseUrl && (env.supabaseAnonKey || env.supabaseServiceRoleKey));

export const hasSupabaseWriteAccess = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);