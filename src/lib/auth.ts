import "server-only";
import { isSupabaseConfigured } from "./config";
import { demoCurrentUser } from "./demo-data";
import { createClient } from "./supabase/server";
import { roleAtLeast, type Profile, type Role } from "./types";

/**
 * Returns the signed-in user's profile, or null.
 * In demo mode a sample administrator is always "signed in" so the portal
 * and admin areas are explorable.
 */
export async function getCurrentUser(): Promise<Profile | null> {
  if (!isSupabaseConfigured) return demoCurrentUser;

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
  };
}

export async function requireRole(minimum: Role): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user || !roleAtLeast(user.role, minimum)) return null;
  return user;
}
