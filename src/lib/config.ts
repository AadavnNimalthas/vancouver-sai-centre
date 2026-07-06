export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * When Supabase env vars are absent the app runs in demo mode: all reads
 * come from seed data and writes succeed without persisting. This keeps the
 * site fully browsable before a Supabase project is connected.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
