export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vancouversaicentre.ca";

/**
 * Base URL for auth email links (email confirmation, magic link, password
 * reset). On the client we use the origin the app is actually served from, so
 * links come back to *this* site — and to the same origin the PKCE code
 * verifier was stored on, which is required for the code exchange to succeed.
 * On the server we fall back to NEXT_PUBLIC_SITE_URL, then the canonical domain.
 *
 * NOTE: this origin must also be allow-listed in Supabase → Authentication →
 * URL Configuration (Site URL + Redirect URLs); otherwise Supabase ignores
 * redirect_to and sends people to its own Site URL (often localhost).
 */
export function getSiteURL(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://vancouversaicentre.ca").replace(/\/+$/, "");
}

/**
 * When Supabase env vars are absent the app runs in demo mode: all reads
 * come from seed data and writes succeed without persisting. This keeps the
 * site fully browsable before a Supabase project is connected.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
