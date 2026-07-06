import type { Metadata } from "next";
import { addMonths, subMonths } from "date-fns";
import type { OccurrenceDTO } from "@/components/events/EventsExplorer";
import { CalendarView } from "@/components/portal/CalendarView";
import { getEvents } from "@/lib/data";
import { expandOccurrences } from "@/lib/recurrence";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const events = await getEvents();
  const now = new Date();
  const occurrences: OccurrenceDTO[] = expandOccurrences(
    events,
    subMonths(now, 2),
    addMonths(now, 8)
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
    <div>
      <h1 className="mb-8 font-display text-4xl text-ink">Calendar</h1>
      <CalendarView occurrences={occurrences} />
    </div>
  );
}
