import "server-only";
import { isSupabaseConfigured } from "./config";
import {
  demoAlbums,
  demoAnnouncements,
  demoBhajans,
  demoEvents,
  demoForms,
  demoPosts,
  demoProfiles,
  demoRegistrations,
  demoResources,
  demoSiteContent,
  demoWings,
} from "./demo-data";
import { createClient } from "./supabase/server";
import type {
  Album,
  Announcement,
  Bhajan,
  Post,
  PostPlacement,
  Profile,
  Registration,
  Resource,
  SaiEvent,
  SaiForm,
  SiteContent,
  Wing,
} from "./types";

/* ------------------------------------------------------------------ */
/* Row mappers: snake_case DB rows → app types                         */
/* ------------------------------------------------------------------ */

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapEvent(row: any): SaiEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    bannerUrl: row.banner_url,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location ?? "",
    capacity: row.capacity,
    registrationEnabled: row.registration_enabled,
    volunteerSignupEnabled: row.volunteer_signup_enabled,
    livestreamUrl: row.livestream_url,
    category: row.category,
    recurrence: row.recurrence ?? "none",
    recurrenceUntil: row.recurrence_until,
    formId: row.form_id,
    registeredCount: row.registered_count ?? 0,
    published: row.published,
  };
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email ?? "",
    role: row.role ?? "member",
    interests: row.interests ?? [],
    joinedAt: row.created_at,
    avatarUrl: row.avatar_url,
  };
}

function mapRegistration(row: any): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    userId: row.user_id,
    kind: row.kind,
    status: row.status,
    answers: row.answers ?? {},
    createdAt: row.created_at,
    eventTitle: row.events?.title,
    eventStartsAt: row.events?.starts_at,
    userName: row.profiles?.full_name,
    userEmail: row.profiles?.email,
  };
}

function mapForm(row: any): SaiForm {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    fields: row.fields ?? [],
    published: row.published,
    updatedAt: row.updated_at,
    attachedEventIds: row.attached_event_ids ?? [],
  };
}

function mapResource(row: any): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    kind: row.kind,
    url: row.url,
    tags: row.tags ?? [],
    membersOnly: row.members_only,
    createdAt: row.created_at,
  };
}

function mapBhajan(row: any): Bhajan {
  return {
    id: row.id,
    title: row.title,
    meaning: row.meaning ?? "",
    language: row.language,
    tempo: row.tempo,
    category: row.category,
    notes: row.notes ?? "",
    lyrics: row.lyrics ?? "",
    audioUrl: row.audio_url,
    videoUrl: row.video_url,
  };
}

function mapAlbum(row: any): Album {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    eventId: row.event_id,
    coverUrl: row.cover_url,
    date: row.date,
    photos: (row.photos ?? []).map((p: any) => ({
      id: p.id,
      url: p.url,
      caption: p.caption ?? "",
      width: p.width ?? 1200,
      height: p.height ?? 800,
    })),
  };
}

function mapAnnouncement(row: any): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body ?? "",
    topics: row.topics ?? [],
    sentAt: row.sent_at,
    createdAt: row.created_at,
    recipients: row.recipients ?? 0,
    openRate: row.open_rate,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/* ------------------------------------------------------------------ */
/* Reads (demo fallback when Supabase is not configured)               */
/* ------------------------------------------------------------------ */

export async function getEvents(): Promise<SaiEvent[]> {
  if (!isSupabaseConfigured) return demoEvents;
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("published", true)
    .order("starts_at");
  return (data ?? []).map(mapEvent);
}

export async function getAllEvents(): Promise<SaiEvent[]> {
  if (!isSupabaseConfigured) return demoEvents;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at");
  return (data ?? []).map(mapEvent);
}

export async function getEventBySlug(slug: string): Promise<SaiEvent | null> {
  if (!isSupabaseConfigured) return demoEvents.find((e) => e.slug === slug) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("slug", slug).single();
  return data ? mapEvent(data) : null;
}

export async function getForm(id: string): Promise<SaiForm | null> {
  if (!isSupabaseConfigured) return demoForms.find((f) => f.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("forms").select("*").eq("id", id).single();
  return data ? mapForm(data) : null;
}

export async function getForms(): Promise<SaiForm[]> {
  if (!isSupabaseConfigured) return demoForms;
  const supabase = await createClient();
  const { data } = await supabase.from("forms").select("*").order("updated_at", { ascending: false });
  return (data ?? []).map(mapForm);
}

export async function getBhajans(): Promise<Bhajan[]> {
  if (!isSupabaseConfigured) return demoBhajans;
  const supabase = await createClient();
  const { data } = await supabase.from("bhajans").select("*").order("title");
  return (data ?? []).map(mapBhajan);
}

export async function getBhajan(id: string): Promise<Bhajan | null> {
  if (!isSupabaseConfigured) return demoBhajans.find((b) => b.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("bhajans").select("*").eq("id", id).single();
  return data ? mapBhajan(data) : null;
}

export async function getResources(): Promise<Resource[]> {
  if (!isSupabaseConfigured) return demoResources;
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(mapResource);
}

export async function getAlbums(): Promise<Album[]> {
  if (!isSupabaseConfigured) return demoAlbums;
  const supabase = await createClient();
  const { data } = await supabase
    .from("albums")
    .select("*, photos(*)")
    .order("date", { ascending: false });
  return (data ?? []).map(mapAlbum);
}

export async function getAlbum(id: string): Promise<Album | null> {
  if (!isSupabaseConfigured) return demoAlbums.find((a) => a.id === id) ?? null;
  const supabase = await createClient();
  const { data } = await supabase.from("albums").select("*, photos(*)").eq("id", id).single();
  return data ? mapAlbum(data) : null;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  if (!isSupabaseConfigured) return demoAnnouncements;
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapAnnouncement);
}

export async function getProfiles(): Promise<Profile[]> {
  if (!isSupabaseConfigured) return demoProfiles;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("full_name");
  return (data ?? []).map(mapProfile);
}

export async function getRegistrationsForUser(userId: string): Promise<Registration[]> {
  if (!isSupabaseConfigured) return demoRegistrations.filter((r) => r.userId === userId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRegistration);
}

export async function getRegistrationsForEvent(eventId: string): Promise<Registration[]> {
  if (!isSupabaseConfigured) return demoRegistrations.filter((r) => r.eventId === eventId);
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at), profiles(full_name, email)")
    .eq("event_id", eventId)
    .order("created_at");
  return (data ?? []).map(mapRegistration);
}

export async function getAllRegistrations(): Promise<Registration[]> {
  if (!isSupabaseConfigured) return demoRegistrations;
  const supabase = await createClient();
  const { data } = await supabase
    .from("registrations")
    .select("*, events(title, starts_at), profiles(full_name, email)")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapRegistration);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPost(row: any): Post {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    body: row.body ?? "",
    imageUrl: row.image_url,
    videoUrl: row.video_url,
    instagramUrl: row.instagram_url,
    ctaLabel: row.cta_label,
    ctaUrl: row.cta_url,
    placements: row.placements ?? [],
    membersOnly: row.members_only ?? false,
    published: row.published,
    createdAt: row.created_at,
  };
}

function mapWing(row: any): Wing {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    activities: row.activities ?? [],
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getWings(): Promise<Wing[]> {
  if (!isSupabaseConfigured) return demoWings;
  const supabase = await createClient();
  const { data } = await supabase.from("wings").select("*").order("position");
  if (!data || data.length === 0) return demoWings;
  return data.map(mapWing);
}

export async function getAllPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured) return demoPosts;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map(mapPost);
}

/**
 * Published posts for one placement. Members-only posts are filtered out
 * unless the viewer is signed in.
 */
export async function getPosts(
  placement: PostPlacement,
  signedIn: boolean
): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter(
    (p) =>
      p.published &&
      p.placements.includes(placement) &&
      (!p.membersOnly || signedIn)
  );
}

/**
 * Site content edited from the admin console (intro, Baba and SSSIO sections,
 * contact cards, other BC centres, Instagram handle). Stored as a single
 * JSON document; missing keys fall back to defaults.
 */
export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) return demoSiteContent;
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", "site")
    .single();
  if (!data?.content) return demoSiteContent;
  return { ...demoSiteContent, ...(data.content as Partial<SiteContent>) };
}
