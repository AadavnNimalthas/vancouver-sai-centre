"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";
import { requireRole } from "./auth";
import { createClient } from "./supabase/server";
import { sendEmail } from "./email";
import type { ActionResult } from "./actions";
import type {
  FormField,
  PostPlacement,
  RegistrationStatus,
  Role,
  SiteContent,
  Wing,
} from "./types";

async function guard(minimum: Role = "wing-lead") {
  const user = await requireRole(minimum);
  if (!user) throw new Error("Not authorized");
  return user;
}

export interface EventInput {
  id?: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string | null;
  startsAt: string;
  endsAt: string;
  location: string;
  capacity: number | null;
  registrationEnabled: boolean;
  volunteerSignupEnabled: boolean;
  livestreamUrl: string | null;
  category: string;
  recurrence: string;
  recurrenceUntil: string | null;
  formId: string | null;
  published: boolean;
}

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Event saved (demo mode, changes are not persisted)." };

  const supabase = await createClient();
  const row = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    banner_url: input.bannerUrl,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    location: input.location,
    capacity: input.capacity,
    registration_enabled: input.registrationEnabled,
    volunteer_signup_enabled: input.volunteerSignupEnabled,
    livestream_url: input.livestreamUrl,
    category: input.category,
    recurrence: input.recurrence,
    recurrence_until: input.recurrenceUntil,
    form_id: input.formId,
    published: input.published,
  };
  const { error } = input.id
    ? await supabase.from("events").update(row).eq("id", input.id)
    : await supabase.from("events").insert(row);
  if (error) return { ok: false, message: `Could not save the event: ${error.message}` };

  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { ok: true, message: "Event saved." };
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured)
    return { ok: true, message: "Event deleted (demo mode)." };
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not delete the event." };
  revalidatePath("/admin/events");
  return { ok: true, message: "Event deleted." };
}

export async function saveForm(input: {
  id?: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
}): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Form saved (demo mode, changes are not persisted)." };

  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    fields: input.fields,
    published: input.published,
    updated_at: new Date().toISOString(),
  };
  const { error } = input.id
    ? await supabase.from("forms").update(row).eq("id", input.id)
    : await supabase.from("forms").insert(row);
  if (error) return { ok: false, message: "Could not save the form." };
  revalidatePath("/admin/forms");
  return { ok: true, message: "Form saved." };
}

export async function sendAnnouncement(input: {
  title: string;
  body: string;
  topics: string[];
}): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured)
    return {
      ok: true,
      message:
        "Announcement queued (demo mode). With Supabase + Resend connected it would go to every member following: " +
        input.topics.join(", "),
    };

  const supabase = await createClient();

  // Recipients: members whose interests overlap the chosen topics.
  const { data: recipients } = await supabase
    .from("profiles")
    .select("email, interests")
    .overlaps("interests", input.topics);
  const emails = (recipients ?? []).map((r) => r.email).filter(Boolean);

  const { error } = await supabase.from("announcements").insert({
    title: input.title,
    body: input.body,
    topics: input.topics,
    sent_at: new Date().toISOString(),
    recipients: emails.length,
  });
  if (error) return { ok: false, message: "Could not record the announcement." };

  // Send in modest batches to respect provider limits.
  for (let i = 0; i < emails.length; i += 40) {
    await sendEmail({
      to: emails.slice(i, i + 40),
      subject: input.title,
      heading: input.title,
      body: input.body,
    });
  }

  revalidatePath("/admin/notifications");
  return { ok: true, message: `Announcement sent to ${emails.length} member${emails.length === 1 ? "" : "s"}.` };
}

export async function setUserRole(userId: string, role: Role): Promise<ActionResult> {
  await guard("administrator");
  if (!isSupabaseConfigured)
    return { ok: true, message: "Role updated (demo mode, changes are not persisted)." };
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, message: "Could not update the role." };
  revalidatePath("/admin/users");
  return { ok: true, message: "Role updated." };
}

export async function setRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Updated (demo mode)." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("registrations")
    .update({ status })
    .eq("id", registrationId);
  if (error) return { ok: false, message: "Could not update the registration." };
  revalidatePath("/admin/events");
  return { ok: true, message: "Updated." };
}

export async function saveResource(input: {
  id?: string;
  title: string;
  description: string;
  kind: string;
  url: string;
  tags: string[];
  membersOnly: boolean;
}): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Resource saved (demo mode, changes are not persisted)." };
  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    kind: input.kind,
    url: input.url,
    tags: input.tags,
    members_only: input.membersOnly,
  };
  const { error } = input.id
    ? await supabase.from("resources").update(row).eq("id", input.id)
    : await supabase.from("resources").insert(row);
  if (error) return { ok: false, message: "Could not save the resource." };
  revalidatePath("/admin/resources");
  revalidatePath("/library/resources");
  return { ok: true, message: "Resource saved." };
}

export interface PostInput {
  id?: string;
  title: string;
  description: string;
  body: string;
  imageUrl: string | null;
  videoUrl: string | null;
  instagramUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  placements: PostPlacement[];
  membersOnly: boolean;
  published: boolean;
}

export async function savePost(input: PostInput): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Post saved (demo mode, changes are not persisted)." };

  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    body: input.body,
    image_url: input.imageUrl,
    video_url: input.videoUrl,
    instagram_url: input.instagramUrl,
    cta_label: input.ctaLabel,
    cta_url: input.ctaUrl,
    placements: input.placements,
    members_only: input.membersOnly,
    published: input.published,
  };
  const { error } = input.id
    ? await supabase.from("posts").update(row).eq("id", input.id)
    : await supabase.from("posts").insert(row);
  if (error) return { ok: false, message: "Could not save the post." };

  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true, message: "Post saved." };
}

export async function deletePost(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Post removed (demo mode)." };
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the post." };
  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true, message: "Post removed." };
}

export async function saveSiteContent(content: SiteContent): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured)
    return { ok: true, message: "Site content saved (demo mode, changes are not persisted)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_content")
    .upsert({ id: "site", content, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: "Could not save the site content." };

  revalidatePath("/");
  revalidatePath("/contact");
  return { ok: true, message: "Site content saved." };
}

export async function saveWing(wing: Wing): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Wing saved (demo mode, changes are not persisted)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("wings")
    .update({
      name: wing.name,
      tagline: wing.tagline,
      description: wing.description,
      activities: wing.activities,
    })
    .eq("slug", wing.slug);
  if (error) return { ok: false, message: "Could not save the wing." };

  revalidatePath("/");
  revalidatePath("/wings");
  return { ok: true, message: "Wing saved." };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured)
    return { ok: true, message: "Resource removed (demo mode)." };
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the resource." };
  revalidatePath("/admin/resources");
  return { ok: true, message: "Resource removed." };
}
