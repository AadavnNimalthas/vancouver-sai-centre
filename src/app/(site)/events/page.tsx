import type { Metadata } from "next";
import { addMonths, subMonths } from "date-fns";
import { AdminSetupPrompt } from "@/components/AdminSetupPrompt";
import type { OccurrenceDTO } from "@/components/events/EventsExplorer";
import { CalendarView } from "@/components/portal/CalendarView";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { getEvents } from "@/lib/data";
import { expandOccurrences } from "@/lib/recurrence";
import { roleAtLeast } from "@/lib/types";

export const metadata: Metadata = {
  title: "Events",
  description: "Programs, service projects, festivals, and retreats at the Vancouver Sai Centre.",
};

export default async function EventsPage() {
  const [events, user] = await Promise.all([getEvents(), getCurrentUser()]);
  const isAdmin = Boolean(user && roleAtLeast(user.role, "wing-lead"));
  const now = new Date();
  const occurrences: OccurrenceDTO[] = expandOccurrences(
    events,
    subMonths(now, 2),
    addMonths(now, 12)
  ).map((o) => ({
    key: o.key,
    slug: o.event.slug,
    title: o.event.title,
    category: o.event.category,
    startsAt: o.startsAt.toISOString(),
    endsAt: o.endsAt.toISOString(),
    location: o.event.location,
    recurring: o.event.recurrence !== "none",
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">What&rsquo;s on</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Events at the centre
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Weekly programs, service projects, festivals, and retreats.
          Everything is open to everyone. Switch between month, week, and
          list views below.
        </p>
      </Reveal>

      {occurrences.length === 0 && (
        <div className="mt-12 max-w-md">
          <p className="text-ink-soft">Nothing is scheduled at the moment.</p>
          <div className="mt-4">
            <AdminSetupPrompt
              isAdmin={isAdmin}
              title="No events yet"
              detail="Create and publish your first event from the event manager."
              href="/admin/events/new"
            />
          </div>
        </div>
      )}

      <Reveal delay={0.15} className="mt-12">
        <CalendarView occurrences={occurrences} />
      </Reveal>
    </div>
  );
}
