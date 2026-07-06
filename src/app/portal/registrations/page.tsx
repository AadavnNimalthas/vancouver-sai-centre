import type { Metadata } from "next";
import { RegistrationList } from "@/components/portal/RegistrationList";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/data";

export const metadata: Metadata = { title: "My registrations" };

export default async function RegistrationsPage() {
  const user = (await getCurrentUser())!;
  const registrations = await getRegistrationsForUser(user.id);
  const now = new Date();
  // Only active registrations: past events drop off automatically.
  const attending = registrations.filter(
    (r) =>
      r.kind === "attendee" &&
      (!r.eventStartsAt || new Date(r.eventStartsAt) >= now)
  );

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">My registrations</h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Your active registrations. Past events drop off this list
        automatically. If your plans change, cancelling early frees a spot
        for someone on the waitlist.
      </p>
      <div className="mt-10">
        <RegistrationList registrations={attending} />
      </div>
    </div>
  );
}
