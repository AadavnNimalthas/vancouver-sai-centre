import type { Metadata } from "next";
import { RegistrationList } from "@/components/portal/RegistrationList";
import { getCurrentUser } from "@/lib/auth";
import { getRegistrationsForUser } from "@/lib/data";

export const metadata: Metadata = { title: "My registrations" };

export default async function RegistrationsPage() {
  const user = (await getCurrentUser())!;
  const registrations = await getRegistrationsForUser(user.id);
  const attending = registrations.filter((r) => r.kind === "attendee");

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">My registrations</h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Events you’ve registered to attend. If your plans change, cancelling
        early frees a spot for someone on the waitlist.
      </p>
      <div className="mt-10">
        <RegistrationList registrations={attending} />
      </div>
    </div>
  );
}
