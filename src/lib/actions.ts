"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "./config";
import { getCurrentUser } from "./auth";
import { createClient } from "./supabase/server";
import { sendEmail } from "./email";

export interface ActionResult {
  ok: boolean;
  message: string;
  waitlisted?: boolean;
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
  if (!isSupabaseConfigured) {
    return {
      ok: true,
      message:
        input.kind === "volunteer"
          ? "Thank you for offering your time. We have recorded your volunteer signup (demo mode, nothing was saved)."
          : "You are registered (demo mode, nothing was saved).",
    };
  }

  const supabase = await createClient();
  const user = await getCurrentUser();

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
  if (!isSupabaseConfigured)
    return { ok: true, message: "Registration cancelled (demo mode)." };

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

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
    return { ok: true, message: "Thank you. Your message has been received (demo mode)." };
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
  if (!isSupabaseConfigured)
    return { ok: true, message: "Preferences saved (demo mode)." };

  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ interests })
    .eq("id", user.id);
  if (error) return { ok: false, message: "Could not save your preferences." };

  revalidatePath("/portal/notifications");
  return { ok: true, message: "Preferences saved. You'll only hear about what you care about." };
}
