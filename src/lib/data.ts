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
import { getDemoDb } from "./demo-db-store";
import { createClient } from "./supabase/server";
import type {
  Album,
  Announcement,
  Bhajan,
  BhajanSignUpForm,
  BhajanSubmission,
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
    lyrics: row.lyrics ?? "",
    meaning: row.meaning ?? "",
    tempo: row.tempo ?? "medium",
    beatTaal: row.beat_taal ?? "",
    language: row.language ?? "Sanskrit",
    category: row.category ?? "",
    notes: row.notes ?? "",
    sourceLink: row.source_link ?? null,
    audioUrl: row.audio_url ?? null,
    videoUrl: row.video_url ?? null,
    status: row.status ?? "approved",
    createdBy: row.created_by ?? null,
    additionalMetadata: row.additional_metadata ?? {},
    createdAt: row.created_at,
  };
}

function mapBhajanSignUpForm(row: any): BhajanSignUpForm {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    openDate: row.open_date,
    closeDate: row.close_date,
    bhajansRequired: row.bhajans_required ?? 1,
    allowedCategories: row.allowed_categories ?? [],
    published: row.published ?? false,
    createdAt: row.created_at,
  };
}

function mapBhajanSubmission(row: any): BhajanSubmission {
  return {
    id: row.id,
    formId: row.form_id,
    userId: row.user_id,
    bhajanIds: row.bhajan_ids ?? [],
    createdAt: row.created_at,
    userName: row.profiles?.full_name,
    userEmail: row.profiles?.email,
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

export async function getBhajans(onlyApproved = true): Promise<Bhajan[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const list = db.bhajans;
    return onlyApproved ? list.filter((b) => b.status === "approved") : list;
  }
  const supabase = await createClient();
  let query = supabase.from("bhajans").select("*");
  if (onlyApproved) {
    query = query.eq("status", "approved");
  }
  const { data } = await query.order("title");
  return (data ?? []).map(mapBhajan);
}

export async function getBhajan(id: string): Promise<Bhajan | null> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    return db.bhajans.find((b) => b.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("bhajans").select("*").eq("id", id).single();
  return data ? mapBhajan(data) : null;
}

export async function getBhajanCategories(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const approved = db.bhajans.filter((b) => b.status === "approved");
    const categories = approved.map((b) => b.category).filter(Boolean);
    return Array.from(new Set(categories)).sort();
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("bhajans")
    .select("category")
    .eq("status", "approved");
  const categories = (data ?? []).map((row) => row.category).filter(Boolean);
  return Array.from(new Set(categories)).sort();
}

export async function getBhajanSignUpForms(onlyPublished = true): Promise<BhajanSignUpForm[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const list = db.signupForms;
    return onlyPublished ? list.filter((f) => f.published) : list;
  }
  const supabase = await createClient();
  let query = supabase.from("bhajan_signup_forms").select("*");
  if (onlyPublished) {
    query = query.eq("published", true);
  }
  const { data } = await query.order("close_date", { ascending: true });
  return (data ?? []).map(mapBhajanSignUpForm);
}

export async function getBhajanSignUpForm(id: string): Promise<BhajanSignUpForm | null> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    return db.signupForms.find((f) => f.id === id) ?? null;
  }
  const supabase = await createClient();
  const { data } = await supabase.from("bhajan_signup_forms").select("*").eq("id", id).single();
  return data ? mapBhajanSignUpForm(data) : null;
}

export async function getFavoriteBhajanIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    return db.favorites.filter((f) => f.userId === userId).map((f) => f.bhajanId);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("member_bhajan_favorites")
    .select("bhajan_id")
    .eq("user_id", userId);
  return (data ?? []).map((f) => f.bhajan_id);
}

export async function getBhajanSubmissions(formId: string): Promise<BhajanSubmission[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const list = db.submissions.filter((s) => s.formId === formId);
    return list.map((sub) => {
      const profile = demoProfiles.find((p) => p.id === sub.userId);
      const bhajans = sub.bhajanIds
        .map((bid) => db.bhajans.find((b) => b.id === bid))
        .filter(Boolean) as Bhajan[];
      return {
        ...sub,
        userName: profile?.fullName ?? "Demo Member",
        userEmail: profile?.email ?? "member@example.com",
        bhajans,
      };
    });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("bhajan_submissions")
    .select("*, profiles(full_name, email)")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []).map(mapBhajanSubmission);
  
  const allBhajanIds = Array.from(new Set(submissions.flatMap((s) => s.bhajanIds)));
  if (allBhajanIds.length > 0) {
    const { data: bData } = await supabase.from("bhajans").select("*").in("id", allBhajanIds);
    const bhMap = new Map((bData ?? []).map((row) => [row.id, mapBhajan(row)]));
    submissions.forEach((s) => {
      s.bhajans = s.bhajanIds.map((bid) => bhMap.get(bid)).filter(Boolean) as Bhajan[];
    });
  }
  return submissions;
}

export async function getBhajanSubmissionsForUser(userId: string): Promise<BhajanSubmission[]> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const list = db.submissions.filter((s) => s.userId === userId);
    return list.map((sub) => ({
      ...sub,
      bhajans: sub.bhajanIds
        .map((bid) => db.bhajans.find((b) => b.id === bid))
        .filter(Boolean) as Bhajan[],
    }));
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("bhajan_submissions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []).map(mapBhajanSubmission);
  const allBhajanIds = Array.from(new Set(submissions.flatMap((s) => s.bhajanIds)));
  if (allBhajanIds.length > 0) {
    const { data: bData } = await supabase.from("bhajans").select("*").in("id", allBhajanIds);
    const bhMap = new Map((bData ?? []).map((row) => [row.id, mapBhajan(row)]));
    submissions.forEach((s) => {
      s.bhajans = s.bhajanIds.map((bid) => bhMap.get(bid)).filter(Boolean) as Bhajan[];
    });
  }
  return submissions;
}

export async function getMyBhajans(userId: string): Promise<{
  favorites: Bhajan[];
  recentlyUsed: Bhajan[];
  submitted: Bhajan[];
}> {
  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const favIds = db.favorites.filter((f) => f.userId === userId).map((f) => f.bhajanId);
    const favorites = db.bhajans.filter((b) => favIds.includes(b.id));
    
    const userSubs = db.submissions.filter((s) => s.userId === userId);
    const recentIds = Array.from(new Set(userSubs.flatMap((s) => s.bhajanIds)));
    const recentlyUsed = db.bhajans.filter((b) => recentIds.includes(b.id));

    const submitted = db.bhajans.filter((b) => b.createdBy === userId);

    return { favorites, recentlyUsed, submitted };
  }

  const supabase = await createClient();
  
  const { data: favData } = await supabase
    .from("member_bhajan_favorites")
    .select("bhajans(*)")
    .eq("user_id", userId);
  const favorites = (favData ?? []).map((row: any) => mapBhajan(row.bhajans)).filter(Boolean);

  const { data: subData } = await supabase
    .from("bhajan_submissions")
    .select("bhajan_ids")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);
  const recentIds = Array.from(new Set((subData ?? []).flatMap((row) => row.bhajan_ids)));
  
  let recentlyUsed: Bhajan[] = [];
  if (recentIds.length > 0) {
    const { data: recBhajans } = await supabase
      .from("bhajans")
      .select("*")
      .in("id", recentIds);
    recentlyUsed = (recBhajans ?? []).map(mapBhajan);
  }

  const { data: subBhajans } = await supabase
    .from("bhajans")
    .select("*")
    .eq("created_by", userId)
    .order("title");
  const submitted = (subBhajans ?? []).map(mapBhajan);

  return { favorites, recentlyUsed, submitted };
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
