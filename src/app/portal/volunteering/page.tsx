import type { Metadata } from "next";
import Link from "next/link";
import { RegistrationList } from "@/components/portal/RegistrationList";
import { getCurrentUser } from "@/lib/auth";
import { getEvents, getRegistrationsForUser } from "@/lib/data";
import { upcomingOccurrences } from "@/lib/recurrence";
import { formatEventDate, formatEventTime } from "@/lib/format";

export const metadata: Metadata = { title: "Volunteering" };

export default async function VolunteeringPage() {
  const user = (await getCurrentUser())!;
  const [events, registrations] = await Promise.all([
    getEvents(),
    getRegistrationsForUser(user.id),
  ]);
  const nowDate = new Date();
  const mySignups = registrations.filter(
    (r) =>
      r.kind === "volunteer" &&
      (!r.eventStartsAt || new Date(r.eventStartsAt) >= nowDate)
  );
  const signedUpEventIds = new Set(mySignups.map((r) => r.eventId));
  const opportunities = upcomingOccurrences(events, new Date(), 20).filter(
    (o) => o.event.volunteerSignupEnabled && !signedUpEventIds.has(o.event.id)
  );
  // De-dupe recurring events: show the next occurrence only
  const seen = new Set<string>();
  const unique = opportunities.filter((o) => {
    if (seen.has(o.event.id)) return false;
    seen.add(o.event.id);
    return true;
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Volunteering</h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Sign up for a project below. Where you offer your time is up to you.
      </p>

      <h2 className="eyebrow eyebrow-rule mt-12">Your signups</h2>
      <div className="mt-4">
        <RegistrationList registrations={mySignups} />
      </div>

      <h2 className="eyebrow eyebrow-rule mt-12">Where help is needed</h2>
      <div className="mt-4 space-y-4">
        {unique.length === 0 && (
          <p className="rounded-lg border border-line bg-white-warm p-8 text-center text-ink-soft">
            There are no open volunteer calls right now. Check back soon.
          </p>
        )}
        {unique.map((o) => (
          <div key={o.key} className="card flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <p className="font-display text-xl text-ink">{o.event.title}</p>
              <p className="mt-1 text-[0.875rem] text-ink-soft">
                {formatEventDate(o.startsAt)} · {formatEventTime(o.startsAt, o.endsAt)} ·{" "}
                {o.event.location}
              </p>
            </div>
            <Link href={`/events/${o.event.slug}#register`} className="btn btn-quiet">
              Sign up to help
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
