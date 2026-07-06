import type { Metadata } from "next";
import { addMonths, subMonths } from "date-fns";
import type { OccurrenceDTO } from "@/components/events/EventsExplorer";
import { CoordinationPanel } from "@/components/admin/CoordinationPanel";
import { CalendarView } from "@/components/portal/CalendarView";
import { getCurrentUser } from "@/lib/auth";
import { getAccessRequests, getAllEvents } from "@/lib/data";
import { expandOccurrences } from "@/lib/recurrence";

export const metadata: Metadata = { title: "Coordination" };

export default async function CoordinationPage() {
  const [user, requests, events] = await Promise.all([
    getCurrentUser(),
    getAccessRequests(),
    getAllEvents(),
  ]);
  const now = new Date();
  const occurrences: OccurrenceDTO[] = expandOccurrences(
    events,
    subMonths(now, 1),
    addMonths(now, 6)
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
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Coordination</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          The shared organization calendar for all wings, and cross-wing
          access requests. Use the category toggles to see one wing at a time.
        </p>
      </div>

      <CoordinationPanel user={user!} requests={requests} />

      <div className="mt-10">
        <h2 className="eyebrow eyebrow-rule mb-6">Organization calendar</h2>
        <CalendarView occurrences={occurrences} />
      </div>
    </div>
  );
}
