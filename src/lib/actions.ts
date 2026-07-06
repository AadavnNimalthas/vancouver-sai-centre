"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";
import { getCurrentUser } from "./auth";
import { createClient } from "./supabase/server";
import { sendEmail } from "./email";
import { getDemoDb, mutateDemoDb, newId, saveDemoDb } from "./demo-db-store";
import type { Bhajan, Registration } from "./types";

export interface ActionResult {
  ok: boolean;
  message: string;
  waitlisted?: boolean;
  insertedId?: string;
}


/**
 * Register the current user (or a guest, by email) for an event.
 * Applies capacity limits: when full, the registration is waitlisted.
 */
export async function submitRegistration(input: {
  eventId: string;
  kind: "attendee" | "volunteer";
  answers: Record<string, unknown>;
  guestEmail?: string;
  guestName?: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();

  if (!isSupabaseConfigured) {
    return mutateDemoDb((db) => {
      const event = db.events.find((e) => e.id === input.eventId);
      if (!event) return { ok: false, message: "This event no longer exists." };
      if (input.kind === "attendee" && !event.registrationEnabled)
        return { ok: false, message: "Registration is not open for this event." };
      if (input.kind === "volunteer" && !event.volunteerSignupEnabled)
        return { ok: false, message: "Volunteer signup is not open for this event." };

      const already = db.registrations.some(
        (r) =>
          r.eventId === input.eventId &&
          r.userId === (user?.id ?? "") &&
          r.kind === input.kind &&
          r.status !== "cancelled"
      );
      if (user && already)
        return { ok: false, message: "You are already signed up for this event." };

      const active = db.registrations.filter(
        (r) =>
          r.eventId === input.eventId &&
          r.kind === "attendee" &&
          (r.status === "registered" || r.status === "checked-in")
      ).length;
      const waitlisted =
        input.kind === "attendee" && event.capacity !== null && active >= event.capacity;

      const registration: Registration = {
        id: newId("rg"),
        eventId: input.eventId,
        userId: user?.id ?? "",
        kind: input.kind,
        status: waitlisted ? "waitlisted" : "registered",
        answers: input.answers,
        createdAt: new Date().toISOString(),
        userName: user?.fullName ?? input.guestName,
        userEmail: user?.email ?? input.guestEmail,
      };
      db.registrations.push(registration);
      event.registeredCount = waitlisted ? active : active + (input.kind === "attendee" ? 1 : 0);

      revalidatePath("/portal/registrations");
      revalidatePath(`/events/${event.slug}`);
      return {
        ok: true,
        waitlisted,
        message: waitlisted
          ? "The event is full, so you have been added to the waitlist. We will email you if a spot opens."
          : input.kind === "volunteer"
            ? "Thank you for offering your time. The coordinator will be in touch."
            : "You are registered.",
      };
    });
  }

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, capacity, registration_enabled, volunteer_signup_enabled")
    .eq("id", input.eventId)
    .single();
  if (!event) return { ok: false, message: "This event no longer exists." };

  if (input.kind === "attendee" && !event.registration_enabled)
    return { ok: false, message: "Registration is not open for this event." };
  if (input.kind === "volunteer" && !event.volunteer_signup_enabled)
    return { ok: false, message: "Volunteer signup is not open for this event." };

  // Capacity check (attendees only; volunteers are never waitlisted)
  let status = "registered";
  if (input.kind === "attendee" && event.capacity) {
    const { count } = await supabase
      .from("registrations")
      .select("id", { count: "exact", head: true })
      .eq("event_id", input.eventId)
      .eq("kind", "attendee")
      .in("status", ["registered", "checked-in"]);
    if ((count ?? 0) >= event.capacity) status = "waitlisted";
  }

  const { error } = await supabase.from("registrations").insert({
    event_id: input.eventId,
    user_id: user?.id ?? null,
    guest_email: user ? null : (input.guestEmail ?? null),
    guest_name: user ? null : (input.guestName ?? null),
    kind: input.kind,
    status,
    answers: input.answers,
  });
  if (error) {
    if (error.code === "23505")
      return { ok: false, message: "You're already signed up for this event." };
    return { ok: false, message: "Something went wrong saving your registration. Please try again." };
  }

  const email = user?.email ?? input.guestEmail;
  if (email) {
    await sendEmail({
      to: email,
      subject:
        status === "waitlisted"
          ? `You are on the waitlist for ${event.title}`
          : `You are registered for ${event.title}`,
      heading: event.title,
      body:
        status === "waitlisted"
          ? "The event is currently at capacity, so we've added you to the waitlist. We'll email you the moment a spot opens."
          : input.kind === "volunteer"
            ? "Thank you for offering your time. The volunteer coordinator will be in touch with details."
            : "We look forward to seeing you. If your plans change, you can cancel from the member portal.",
    });
  }

  revalidatePath("/portal/registrations");
  return {
    ok: true,
    waitlisted: status === "waitlisted",
    message:
      status === "waitlisted"
        ? "The event is full, so you have been added to the waitlist. We will email you if a spot opens."
        : input.kind === "volunteer"
          ? "Thank you for offering your time. The coordinator will be in touch."
          : "You're registered. A confirmation email is on its way.",
  };
}

export async function cancelRegistration(registrationId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  if (!isSupabaseConfigured) {
    return mutateDemoDb((db) => {
      const reg = db.registrations.find(
        (r) => r.id === registrationId && r.userId === user.id
      );
      if (!reg) return { ok: false, message: "Could not cancel this registration." };
      reg.status = "cancelled";
      const event = db.events.find((e) => e.id === reg.eventId);
      if (event) {
        event.registeredCount = db.registrations.filter(
          (r) =>
            r.eventId === event.id &&
            r.kind === "attendee" &&
            (r.status === "registered" || r.status === "checked-in")
        ).length;
      }
      revalidatePath("/portal/registrations");
      return { ok: true, message: "Registration cancelled." };
    });
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("id", registrationId)
    .eq("user_id", user.id);
  if (error) return { ok: false, message: "Could not cancel this registration." };

  revalidatePath("/portal/registrations");
  return { ok: true, message: "Registration cancelled." };
}

export async function submitContact(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      db.contactMessages.push({
        id: newId("msg"),
        name: input.name,
        email: input.email,
        subject: input.subject,
        message: input.message,
        createdAt: new Date().toISOString(),
      });
    });
    return {
      ok: true,
      message: "Thank you. Your message has been received. We usually reply within two days.",
    };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name: input.name,
    email: input.email,
    subject: input.subject,
    message: input.message,
  });
  if (error) return { ok: false, message: "Something went wrong. Please try again." };

  await sendEmail({
    to: process.env.CONTACT_INBOX ?? "vancouversaicentre@gmail.com",
    subject: `Contact form: ${input.subject}`,
    heading: `Message from ${input.name}`,
    body: `${input.message}\n\nReply to: ${input.email}`,
  });
  return { ok: true, message: "Thank you. Your message has been received. We usually reply within two days." };
}

export async function saveInterests(interests: string[]): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  if (!isSupabaseConfigured) {
    mutateDemoDb((db) => {
      const profile = db.profiles.find((p) => p.id === user.id);
      if (profile) profile.interests = interests;
    });
    revalidatePath("/portal/notifications");
    return { ok: true, message: "Preferences saved." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ interests })
    .eq("id", user.id);
  if (error) return { ok: false, message: "Could not save your preferences." };

  revalidatePath("/portal/notifications");
  return { ok: true, message: "Preferences saved. You'll only hear about what you care about." };
}

export async function submitBhajan(input: {
  title: string;
  lyrics: string;
  meaning: string;
  tempo: "slow" | "medium" | "fast";
  beatTaal: string;
  language: string;
  category: string;
  notes: string;
  sourceLink?: string | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  const userId = user?.id ?? "local-admin";

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const newId = `bh-${Date.now()}`;
    const newBhajan: Bhajan = {
      id: newId,
      title: input.title,
      lyrics: input.lyrics,
      meaning: input.meaning,
      tempo: input.tempo,
      beatTaal: input.beatTaal,
      language: input.language || "Sanskrit",
      category: input.category || "Sai",
      notes: input.notes || "",
      sourceLink: input.sourceLink || null,
      audioUrl: input.audioUrl || null,
      videoUrl: input.videoUrl || null,
      status: "pending",
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    db.bhajans.push(newBhajan);
    saveDemoDb(db);
    revalidatePath("/library/bhajans");
    revalidatePath("/portal/bhajans");
    return { ok: true, message: "Bhajan submitted and is pending administrator approval.", insertedId: newId };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bhajans")
    .insert({
      title: input.title,
      lyrics: input.lyrics,
      meaning: input.meaning,
      tempo: input.tempo,
      beat_taal: input.beatTaal,
      language: input.language,
      category: input.category,
      notes: input.notes,
      source_link: input.sourceLink || null,
      audio_url: input.audioUrl || null,
      video_url: input.videoUrl || null,
      status: "pending",
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: `Could not submit bhajan: ${error.message}` };
  }

  revalidatePath("/library/bhajans");
  revalidatePath("/portal/bhajans");
  return { ok: true, message: "Bhajan submitted and is pending administrator approval.", insertedId: data.id };
}

export async function toggleBhajanFavorite(bhajanId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const idx = db.favorites.findIndex((f) => f.userId === user.id && f.bhajanId === bhajanId);
    let faved = false;
    if (idx >= 0) {
      db.favorites.splice(idx, 1);
    } else {
      db.favorites.push({ userId: user.id, bhajanId });
      faved = true;
    }
    saveDemoDb(db);
    revalidatePath("/portal/bhajans");
    revalidatePath("/library/bhajans");
    return { ok: true, message: faved ? "Added to favourites." : "Removed from favourites." };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("member_bhajan_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("bhajan_id", bhajanId)
    .maybeSingle();

  if (data) {
    const { error } = await supabase.from("member_bhajan_favorites").delete().eq("id", data.id);
    if (error) return { ok: false, message: "Could not remove favourite." };
    revalidatePath("/portal/bhajans");
    revalidatePath("/library/bhajans");
    return { ok: true, message: "Removed from favourites." };
  } else {
    const { error } = await supabase.from("member_bhajan_favorites").insert({
      user_id: user.id,
      bhajan_id: bhajanId,
    });
    if (error) return { ok: false, message: "Could not add favourite." };
    revalidatePath("/portal/bhajans");
    revalidatePath("/library/bhajans");
    return { ok: true, message: "Added to favourites." };
  }
}

export async function submitBhajanSignup(input: {
  formId: string;
  bhajanIds: string[];
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  if (!isSupabaseConfigured) {
    const db = getDemoDb();
    const idx = db.submissions.findIndex((s) => s.formId === input.formId && s.userId === user.id);
    if (idx >= 0) {
      db.submissions[idx].bhajanIds = input.bhajanIds;
      db.submissions[idx].createdAt = new Date().toISOString();
    } else {
      db.submissions.push({
        id: `sub-${Date.now()}`,
        formId: input.formId,
        userId: user.id,
        bhajanIds: input.bhajanIds,
        createdAt: new Date().toISOString(),
      });
    }
    saveDemoDb(db);
    revalidatePath(`/portal/bhajans/signup/${input.formId}`);
    revalidatePath(`/admin/bhajans`);
    return { ok: true, message: "Bhajan sign-up submitted successfully!" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("bhajan_submissions")
    .upsert(
      {
        form_id: input.formId,
        user_id: user.id,
        bhajan_ids: input.bhajanIds,
        created_at: new Date().toISOString(),
      },
      { onConflict: "form_id,user_id" }
    );

  if (error) {
    return { ok: false, message: `Could not submit sign-up: ${error.message}` };
  }

  revalidatePath(`/portal/bhajans/signup/${input.formId}`);
  revalidatePath(`/admin/bhajans`);
  return { ok: true, message: "Bhajan sign-up submitted successfully!" };
}

