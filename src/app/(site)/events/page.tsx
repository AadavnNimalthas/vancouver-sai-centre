import type { Metadata } from "next";
import { addMonths } from "date-fns";
import { EventsExplorer, type OccurrenceDTO } from "@/components/events/EventsExplorer";
import { Reveal } from "@/components/Reveal";
import { getEvents } from "@/lib/data";
import { expandOccurrences } from "@/lib/recurrence";

export const metadata: Metadata = {
  title: "Events",
  description: "Bhajans, study circles, service projects, and celebrations at the Vancouver Sai Centre.",
};

export default async function EventsPage() {
  const events = await getEvents();
  const now = new Date();
  const occurrences: OccurrenceDTO[] = expandOccurrences(events, now, addMonths(now, 6)).map(
    (o) => ({
      key: o.key,
      slug: o.event.slug,
      title: o.event.title,
      category: o.event.category,
      startsAt: o.startsAt.toISOString(),
      endsAt: o.endsAt.toISOString(),
      location: o.event.location,
      recurring: o.event.recurrence !== "none",
    })
  );

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">What&rsquo;s on</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Events at the centre
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Weekly programs, service projects, festivals, and retreats. Everything
          is open to everyone.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-14">
        <EventsExplorer occurrences={occurrences} />
      </Reveal>
    </div>
  );
}
