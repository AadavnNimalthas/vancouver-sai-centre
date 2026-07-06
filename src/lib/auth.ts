import "server-only";
import { isSupabaseConfigured } from "./config";
import { localAdmin } from "./demo-data";
import { getDemoDb } from "./demo-db-store";
import { createClient } from "./supabase/server";
import { roleAtLeast, type Profile, type Role } from "./types";

/**
 * Returns the signed-in user's profile, or null.
 * Without Supabase the site runs against the local database with a
 * built-in Web Team administrator account, so the whole CMS is usable
 * in local development.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  if (!isSupabaseConfigured) {
    const stored = getDemoDb().profiles.find((p) => p.id === localAdmin.id);
    return stored ?? localAdmin;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name ?? user.email ?? "",
    email: profile.email ?? user.email ?? "",
    role: (profile.role as Role) ?? "member",
    interests: profile.interests ?? [],
    joinedAt: profile.created_at,
    avatarUrl: profile.avatar_url,
    wing: profile.wing ?? null,
    extraWings: profile.extra_wings ?? [],
  };
}

export async function requireRole(minimum: Role): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.role, minimum)) return null;
  return user;
}
