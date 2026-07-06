"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";
import { requireRole } from "./auth";
import { createClient } from "./supabase/server";
import { sendEmail } from "./email";
import { getDemoDb, mutateDemoDb, newId, saveDemoDb } from "./demo-db-store";
import type { ActionResult } from "./actions";
import {
  canManageWing,
  wingForCategory,
  type EventCategory,
  type FormField,
  type PostPlacement,
  type Profile,
  type RegistrationStatus,
  type Role,
  type SiteContent,
  type Wing,
  type WingSlug,
  type BhajanTempo,
} from "./types";


async function guard(minimum: Role = "wing-lead") {
  const user = await requireRole(minimum);
  if (!user) throw new Error("Not authorized");
  return user;
}

/** Wing coordinators may only touch content in their own wing(s). */
function checkWingScope(user: Profile, category: string): string | null {
  if (canManageWing(user, wingForCategory(category as EventCategory))) return null;
  return "Wing coordinators can only manage content for their own wing.";
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
  const user = await guard();
  const scopeError = checkWingScope(user, input.category);
  if (scopeError) return { ok: false, message: scopeError };

  const slug =
    input.slug ||
    input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.events.findIndex((e) => e.id === input.id);
        if (idx >= 0)
          db.events[idx] = { ...db.events[idx], ...input, id: input.id, slug } as never;
      } else {
        db.events.push({
          ...input,
          id: newId("ev"),
          slug,
          category: input.category as EventCategory,
          recurrence: input.recurrence as never,
          registeredCount: 0,
        });
      }
    });
    revalidatePath("/");
    revalidatePath("/events");
    revalidatePath("/admin/events");
    return { ok: true, message: "Event saved." };
  }

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

  if (error) return { ok: false, message: `Could not save event: ${error.message}` };
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { ok: true, message: "Event saved." };
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const user = await guard();
  
  if (!isSupabaseConfigured) {
    return mutateDemoDb((db) => {
      const idx = db.events.findIndex((e) => e.id === eventId);
      if (idx === -1) return { ok: false, message: "Event not found" };
      const scopeError = checkWingScope(user, db.events[idx].category);
      if (scopeError) return { ok: false, message: scopeError };
      db.events.splice(idx, 1);
      db.registrations = db.registrations.filter((r) => r.eventId !== eventId);
      revalidatePath("/");
      revalidatePath("/events");
      revalidatePath("/admin/events");
      return { ok: true, message: "Event deleted." };
    });
  }

  const supabase = await createClient();
  const { data: ev } = await supabase.from("events").select("category").eq("id", eventId).single();
  if (!ev) return { ok: false, message: "Event not found" };

  const scopeError = checkWingScope(user, ev.category);
  if (scopeError) return { ok: false, message: scopeError };

  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) return { ok: false, message: `Could not delete event: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/admin/events");
  return { ok: true, message: "Event deleted." };
}

export async function shareForm(formId: string, email: string, isBhajanForm: boolean): Promise<ActionResult> {
  const user = await guard();

  if (!isSupabaseConfigured) {
    return mutateDemoDb((db) => {
      const profile = db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
      if (!profile) return { ok: false, message: "No account found for that email address." };
      
      const share = {
        id: newId("share"),
        generalFormId: isBhajanForm ? null : formId,
        bhajanFormId: isBhajanForm ? formId : null,
        userId: profile.id,
        sharedBy: user.id,
        createdAt: new Date().toISOString()
      };
      
      db.formShares = db.formShares || [];
      if (!db.formShares.some(s => 
        (isBhajanForm ? s.bhajanFormId === formId : s.generalFormId === formId) && s.userId === profile.id
      )) {
        db.formShares.push(share);
      }
      return { ok: true, message: `Shared with ${profile.fullName}` };
    });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("id, full_name").ilike("email", email).maybeSingle();
  if (!profile) return { ok: false, message: "No account found for that email address." };

  const { error } = await supabase.from("form_shares").insert({
    general_form_id: isBhajanForm ? null : formId,
    bhajan_form_id: isBhajanForm ? formId : null,
    user_id: profile.id,
    shared_by: user.id,
  });

  if (error) {
    if (error.code === '23505') return { ok: true, message: "They already have access to this sheet." };
    return { ok: false, message: `Could not share form: ${error.message}` };
  }

  return { ok: true, message: `Shared with ${profile.full_name}` };
}

export async function revokeFormShare(shareId: string): Promise<ActionResult> {
  const user = await guard();

  if (!isSupabaseConfigured) {
    return mutateDemoDb((db) => {
      if (db.formShares) {
        db.formShares = db.formShares.filter(s => s.id !== shareId);
      }
      return { ok: true, message: "Access revoked." };
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("form_shares").delete().eq("id", shareId);
  if (error) return { ok: false, message: "Could not revoke access." };
  
  return { ok: true, message: "Access revoked." };
}

export async function saveForm(input: {
  id?: string;
  title: string;
  description: string;
  fields: FormField[];
  published: boolean;
  wing: string | null;
}): Promise<ActionResult> {
  const user = await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.forms.findIndex((f) => f.id === input.id);
        if (idx >= 0)
          db.forms[idx] = {
            ...db.forms[idx],
            title: input.title,
            description: input.description,
            fields: input.fields,
            published: input.published,
            updatedAt: new Date().toISOString(),
            wing: input.wing as any,
          };
      } else {
        db.forms.push({
          id: newId("form"),
          title: input.title,
          description: input.description,
          fields: input.fields,
          published: input.published,
          updatedAt: new Date().toISOString(),
          attachedEventIds: [],
          wing: input.wing as any,
          createdBy: user.id,
        });
      }
    });
    revalidatePath("/admin/forms");
    return { ok: true, message: "Form saved." };
  }

  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    fields: input.fields,
    published: input.published,
    updated_at: new Date().toISOString(),
    wing: input.wing,
  };
  
  if (!input.id) {
    (row as any).created_by = user.id;
  }
  
  const { error } = input.id
    ? await supabase.from("forms").update(row).eq("id", input.id)
    : await supabase.from("forms").insert(row);
  if (error) return { ok: false, message: "Could not save the form." };
  revalidatePath("/admin/forms");
  return { ok: true, message: "Form saved." };
}

export async function deleteForm(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.forms = db.forms.filter((f) => f.id !== id);
      // an event whose form is deleted simply has no form attached anymore
      db.events = db.events.map((e) =>
        e.formId === id ? { ...e, formId: null } : e
      );
    });
    revalidatePath("/admin/forms");
    return { ok: true, message: "Form deleted." };
  }
  const supabase = await createClient();
  // events.form_id is ON DELETE SET NULL, so attached events detach cleanly
  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not delete the form." };
  revalidatePath("/admin/forms");
  return { ok: true, message: "Form deleted." };
}

export async function sendAnnouncement(input: {
  title: string;
  body: string;
  topics: string[];
}): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured) {
    const recipients = getDemoDb().profiles.filter((p) =>
      p.interests.some((i) => input.topics.includes(i))
    ).length;
    mutateDemoDb((db) => {
      db.announcements.unshift({
        id: newId("an"),
        title: input.title,
        body: input.body,
        topics: input.topics,
        sentAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        recipients,
        openRate: null,
      });
    });
    revalidatePath("/admin/notifications");
    return {
      ok: true,
      message: `Announcement recorded for ${recipients} member${recipients === 1 ? "" : "s"}. Email sending starts once Supabase and Resend are connected.`,
    };
  }

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
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const profile = db.profiles.find((p) => p.id === userId);
      if (profile) profile.role = role;
    });
    revalidatePath("/admin/users");
    return { ok: true, message: "Role updated." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) return { ok: false, message: "Could not update the role." };
  revalidatePath("/admin/users");
  return { ok: true, message: "Role updated." };
}

export async function setUserWing(userId: string, wing: WingSlug | null): Promise<ActionResult> {
  await guard("administrator");
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const profile = db.profiles.find((p) => p.id === userId);
      if (profile) profile.wing = wing;
    });
    revalidatePath("/admin/users");
    return { ok: true, message: "Wing updated." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ wing }).eq("id", userId);
  if (error) return { ok: false, message: "Could not update the wing." };
  revalidatePath("/admin/users");
  return { ok: true, message: "Wing updated." };
}

export async function setRegistrationStatus(
  registrationId: string,
  status: RegistrationStatus
): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const reg = db.registrations.find((r) => r.id === registrationId);
      if (reg) {
        reg.status = status;
        const event = db.events.find((e) => e.id === reg.eventId);
        if (event)
          event.registeredCount = db.registrations.filter(
            (r) =>
              r.eventId === event.id &&
              r.kind === "attendee" &&
              (r.status === "registered" || r.status === "checked-in")
          ).length;
      }
    });
    revalidatePath("/admin/events");
    return { ok: true, message: "Updated." };
  }
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
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.resources.findIndex((r) => r.id === input.id);
        if (idx >= 0)
          db.resources[idx] = { ...db.resources[idx], ...input, id: input.id } as never;
      } else {
        db.resources.push({
          id: newId("rs"),
          title: input.title,
          description: input.description,
          kind: input.kind as never,
          url: input.url,
          tags: input.tags,
          membersOnly: input.membersOnly,
          createdAt: new Date().toISOString(),
        });
      }
    });
    revalidatePath("/admin/resources");
    revalidatePath("/library/resources");
    return { ok: true, message: "Resource saved." };
  }
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

const WING_PLACEMENTS: Record<string, WingSlug> = {
  "wing-devotional": "devotional",
  "wing-service": "service",
  "wing-education": "education",
  "wing-young-adults": "young-adults",
};

export async function savePost(input: PostInput): Promise<ActionResult> {
  const user = await guard();

  // Posts are visual-first: an image, video, or Instagram post is required.
  if (!input.imageUrl && !input.videoUrl && !input.instagramUrl)
    return {
      ok: false,
      message: "Posts need an image, a video, or an Instagram link. Text-only posts are not allowed.",
    };
  if (input.placements.length === 0)
    return { ok: false, message: "Choose at least one place for this post to appear." };

  // Wing coordinators can only post into their own wing sections.
  if (user.role === "wing-lead") {
    const outside = input.placements.some((pl) => {
      const wing = WING_PLACEMENTS[pl];
      return !wing || !canManageWing(user, wing);
    });
    if (outside)
      return {
        ok: false,
        message: "Wing coordinators can only publish posts to their own wing pages. Site-wide placements need an executive.",
      };
  }

  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.posts.findIndex((p) => p.id === input.id);
        if (idx >= 0) db.posts[idx] = { ...db.posts[idx], ...input, id: input.id };
      } else {
        db.posts.unshift({
          ...input,
          id: newId("post"),
          createdAt: new Date().toISOString(),
        });
      }
    });
    revalidatePath("/");
    revalidatePath("/admin/posts");
    return { ok: true, message: "Post saved." };
  }

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
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.posts = db.posts.filter((p) => p.id !== id);
    });
    revalidatePath("/");
    revalidatePath("/admin/posts");
    return { ok: true, message: "Post removed." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the post." };
  revalidatePath("/");
  revalidatePath("/admin/posts");
  return { ok: true, message: "Post removed." };
}

export async function saveSiteContent(content: SiteContent): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.siteContent = content;
    });
    revalidatePath("/");
    revalidatePath("/contact");
    return { ok: true, message: "Site content saved. The public site is updated." };
  }

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
  const user = await guard();
  if (user.role === "wing-lead" && !canManageWing(user, wing.slug as WingSlug))
    return { ok: false, message: "You can only edit your own wing." };

  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const idx = db.wings.findIndex((w) => w.slug === wing.slug);
      if (idx >= 0) db.wings[idx] = wing;
    });
    revalidatePath("/");
    revalidatePath("/wings");
    return { ok: true, message: "Wing saved. The public site is updated." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("wings")
    .update({
      name: wing.name,
      tagline: wing.tagline,
      description: wing.description,
      activities: wing.activities,
      image_url: wing.imageUrl,
      subgroups: wing.subgroups,
    })
    .eq("slug", wing.slug);
  if (error) return { ok: false, message: "Could not save the wing." };

  revalidatePath("/");
  revalidatePath("/wings");
  return { ok: true, message: "Wing saved." };
}

export async function deleteResource(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.resources = db.resources.filter((r) => r.id !== id);
    });
    revalidatePath("/admin/resources");
    revalidatePath("/library/resources");
    return { ok: true, message: "Resource removed." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the resource." };
  revalidatePath("/admin/resources");
  return { ok: true, message: "Resource removed." };
}

export async function saveBhajanSignUpForm(input: {
  id?: string;
  title: string;
  description: string;
  openDate: string;
  closeDate: string;
  bhajansRequired: number;
  allowedCategories: string[];
  allowedTempos: BhajanTempo[];
  allowedBeats: string[];
  published: boolean;
}): Promise<ActionResult> {
  const user = await guard("executive");

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    if (input.id) {
      const idx = db.signupForms.findIndex((f) => f.id === input.id);
      if (idx >= 0) {
        db.signupForms[idx] = {
          ...db.signupForms[idx],
          title: input.title,
          description: input.description,
          openDate: input.openDate,
          closeDate: input.closeDate,
          bhajansRequired: input.bhajansRequired,
          allowedCategories: input.allowedCategories,
          allowedTempos: input.allowedTempos,
          allowedBeats: input.allowedBeats,
          published: input.published,
        };
      }
    } else {
      db.signupForms.push({
        id: `f-${Date.now()}`,
        title: input.title,
        description: input.description,
        openDate: input.openDate,
        closeDate: input.closeDate,
        bhajansRequired: input.bhajansRequired,
        allowedCategories: input.allowedCategories,
        allowedTempos: input.allowedTempos,
        allowedBeats: input.allowedBeats,
        published: input.published,
        createdAt: new Date().toISOString(),
      });
    }
    saveDemoDb(db);
    revalidatePath("/portal/bhajans");
    revalidatePath("/admin/bhajans");
    return { ok: true, message: "Bhajan sign-up form saved." };
  }

  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    open_date: input.openDate,
    close_date: input.closeDate,
    bhajans_required: input.bhajansRequired,
    allowed_categories: input.allowedCategories,
    allowed_tempos: input.allowedTempos,
    allowed_beats: input.allowedBeats,
    published: input.published,
  };

  const { error } = input.id
    ? await supabase.from("bhajan_signup_forms").update(row).eq("id", input.id)
    : await supabase.from("bhajan_signup_forms").insert({ ...row, created_by: user.id });

  if (error) return { ok: false, message: `Could not save form: ${error.message}` };

  revalidatePath("/admin/bhajans");
  revalidatePath("/portal/bhajans");
  return { ok: true, message: "Bhajan sign-up form saved." };
}

export async function deleteBhajanSignUpForm(id: string): Promise<ActionResult> {
  await guard();
  
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (db.signupForms) db.signupForms = db.signupForms.filter((f) => f.id !== id);
      db.submissions = db.submissions.filter((s) => s.formId !== id);
    });
    revalidatePath("/admin/bhajans");
    revalidatePath("/portal/bhajans");
    return { ok: true, message: "Form deleted." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bhajan_signup_forms").delete().eq("id", id);
  
  if (error) return { ok: false, message: `Could not delete form: ${error.message}` };

  revalidatePath("/admin/bhajans");
  revalidatePath("/portal/bhajans");
  return { ok: true, message: "Form deleted." };
}

export async function updateBhajanStatus(
  bhajanId: string,
  status: "approved" | "rejected" | "archived"
): Promise<ActionResult> {
  await guard("wing-lead");

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const idx = db.bhajans.findIndex((b) => b.id === bhajanId);
    if (idx >= 0) {
      db.bhajans[idx].status = status;
      saveDemoDb(db);
    }
    revalidatePath("/library/bhajans");
    revalidatePath("/admin/bhajans");
    return { ok: true, message: `Bhajan status updated to ${status}.` };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bhajans")
    .update({ status })
    .eq("id", bhajanId);

  if (error) return { ok: false, message: `Could not update status: ${error.message}` };

  revalidatePath("/library/bhajans");
  revalidatePath("/admin/bhajans");
  return { ok: true, message: `Bhajan status updated to ${status}.` };
}

export async function editBhajan(
  id: string,
  patch: {
    title: string;
    lyrics: string;
    meaning: string;
    tempo: BhajanTempo;
    beatTaal: string;
    language: string;
    category: string;
    notes: string;
    sourceLink?: string | null;
    audioUrl?: string | null;
    videoUrl?: string | null;
  }
): Promise<ActionResult> {
  await guard("wing-lead");

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    if (id) {
      const idx = db.bhajans.findIndex((b) => b.id === id);
      if (idx >= 0) {
        db.bhajans[idx] = {
          ...db.bhajans[idx],
          ...patch,
        };
      }
    } else {
      db.bhajans.push({
        id: `bh-${Date.now()}`,
        title: patch.title,
        lyrics: patch.lyrics,
        meaning: patch.meaning,
        tempo: patch.tempo,
        beatTaal: patch.beatTaal,
        language: patch.language,
        category: patch.category,
        notes: patch.notes,
        sourceLink: patch.sourceLink ?? null,
        audioUrl: patch.audioUrl ?? null,
        videoUrl: patch.videoUrl ?? null,
        status: "approved",
        createdAt: new Date().toISOString(),
      });
    }
    saveDemoDb(db);
    revalidatePath("/library/bhajans");
    revalidatePath("/admin/bhajans");
    return { ok: true, message: id ? "Bhajan updated successfully!" : "Bhajan added successfully!" };
  }

  const supabase = await createClient();
  const row = {
    title: patch.title,
    lyrics: patch.lyrics,
    meaning: patch.meaning,
    tempo: patch.tempo,
    beat_taal: patch.beatTaal,
    language: patch.language,
    category: patch.category,
    notes: patch.notes,
    source_link: patch.sourceLink || null,
    audio_url: patch.audioUrl || null,
    video_url: patch.videoUrl || null,
    status: "approved",
  };

  const { error } = id
    ? await supabase.from("bhajans").update(row).eq("id", id)
    : await supabase.from("bhajans").insert(row);

  if (error) return { ok: false, message: `Could not save bhajan: ${error.message}` };

  revalidatePath("/library/bhajans");
  revalidatePath("/admin/bhajans");
  return { ok: true, message: id ? "Bhajan updated successfully!" : "Bhajan added successfully!" };
}

export async function deleteBhajan(id: string): Promise<ActionResult> {
  await guard("wing-lead");

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    db.bhajans = db.bhajans.filter((b) => b.id !== id);
    saveDemoDb(db);
    revalidatePath("/library/bhajans");
    revalidatePath("/admin/bhajans");
    return { ok: true, message: "Bhajan deleted successfully." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("bhajans").delete().eq("id", id);
  if (error) return { ok: false, message: `Could not delete bhajan: ${error.message}` };

  revalidatePath("/library/bhajans");
  revalidatePath("/admin/bhajans");
  return { ok: true, message: "Bhajan deleted successfully." };
}


/* ------------------------------------------------------------------ */
/* Physical library books                                              */
/* ------------------------------------------------------------------ */

export async function saveBook(input: {
  id?: string;
  title: string;
  author: string;
  category: string;
  description: string;
  available: boolean;
}): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.books.findIndex((b) => b.id === input.id);
        if (idx >= 0) db.books[idx] = { ...db.books[idx], ...input, id: input.id };
      } else {
        db.books.unshift({
          ...input,
          id: newId("bk"),
          createdAt: new Date().toISOString(),
        });
      }
    });
    revalidatePath("/library/books");
    revalidatePath("/admin/books");
    return { ok: true, message: "Book saved." };
  }
  const supabase = await createClient();
  const row = {
    title: input.title,
    author: input.author,
    category: input.category,
    description: input.description,
    available: input.available,
  };
  const { error } = input.id
    ? await supabase.from("books").update(row).eq("id", input.id)
    : await supabase.from("books").insert(row);
  if (error) return { ok: false, message: "Could not save the book." };
  revalidatePath("/library/books");
  revalidatePath("/admin/books");
  return { ok: true, message: "Book saved." };
}

export async function deleteBook(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.books = db.books.filter((b) => b.id !== id);
    });
    revalidatePath("/library/books");
    revalidatePath("/admin/books");
    return { ok: true, message: "Book removed." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the book." };
  revalidatePath("/library/books");
  revalidatePath("/admin/books");
  return { ok: true, message: "Book removed." };
}

/* ------------------------------------------------------------------ */
/* Gallery albums (Google Photos workflow)                             */
/* ------------------------------------------------------------------ */

export async function saveAlbum(input: {
  id?: string;
  title: string;
  description: string;
  coverUrl: string;
  date: string;
  googlePhotosUrl: string | null;
}): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      if (input.id) {
        const idx = db.albums.findIndex((a) => a.id === input.id);
        if (idx >= 0) db.albums[idx] = { ...db.albums[idx], ...input, id: input.id };
      } else {
        db.albums.unshift({
          ...input,
          id: newId("al"),
          eventId: null,
          photos: [],
        });
      }
    });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { ok: true, message: "Album published." };
  }
  const supabase = await createClient();
  const row = {
    title: input.title,
    description: input.description,
    cover_url: input.coverUrl,
    date: input.date,
    google_photos_url: input.googlePhotosUrl,
  };
  const { error } = input.id
    ? await supabase.from("albums").update(row).eq("id", input.id)
    : await supabase.from("albums").insert(row);
  if (error) return { ok: false, message: "Could not save the album." };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true, message: "Album published." };
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  await guard();
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.albums = db.albums.filter((a) => a.id !== id);
    });
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    return { ok: true, message: "Album removed." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) return { ok: false, message: "Could not remove the album." };
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true, message: "Album removed." };
}

/* ------------------------------------------------------------------ */
/* Cross-wing access requests                                          */
/* ------------------------------------------------------------------ */

export async function requestWingAccess(wing: WingSlug): Promise<ActionResult> {
  const user = await guard(); // wing-lead and up can ask
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.accessRequests.unshift({
        id: newId("ar"),
        requesterId: user.id,
        requesterName: user.fullName,
        wing,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    });
    revalidatePath("/admin/coordination");
    return { ok: true, message: "Request sent. A coordinator will review it." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("access_requests").insert({
    requester_id: user.id,
    wing,
    status: "pending",
  });
  if (error) return { ok: false, message: "Could not send the request." };
  revalidatePath("/admin/coordination");
  return { ok: true, message: "Request sent. A coordinator will review it." };
}

export async function resolveWingAccess(
  requestId: string,
  approve: boolean
): Promise<ActionResult> {
  await guard("executive");
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const req = db.accessRequests.find((r) => r.id === requestId);
      if (!req) return;
      req.status = approve ? "approved" : "denied";
      if (approve) {
        const profile = db.profiles.find((p) => p.id === req.requesterId);
        if (profile && !profile.extraWings.includes(req.wing))
          profile.extraWings.push(req.wing);
      }
    });
    revalidatePath("/admin/coordination");
    return { ok: true, message: approve ? "Access granted." : "Request declined." };
  }
  const supabase = await createClient();
  const { data: req } = await supabase
    .from("access_requests")
    .select("requester_id, wing")
    .eq("id", requestId)
    .single();
  if (!req) return { ok: false, message: "Request not found." };

  const { error } = await supabase
    .from("access_requests")
    .update({ status: approve ? "approved" : "denied" })
    .eq("id", requestId);
  if (error) return { ok: false, message: "Could not update the request." };

  if (approve) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("extra_wings")
      .eq("id", req.requester_id)
      .single();
    const extra = new Set<string>(profile?.extra_wings ?? []);
    extra.add(req.wing);
    await supabase
      .from("profiles")
      .update({ extra_wings: [...extra] })
      .eq("id", req.requester_id);
  }
  revalidatePath("/admin/coordination");
  return { ok: true, message: approve ? "Access granted." : "Request declined." };
}
