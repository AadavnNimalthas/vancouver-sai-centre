import type { Metadata } from "next";
import Link from "next/link";
import { CategoryChip } from "@/components/EventCard";
import { getAllEvents } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Event manager" };

export default async function AdminEventsPage() {
  const events = await getAllEvents();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Events</h1>
          <p className="mt-2 text-ink-soft">
            Create, edit, and publish everything on the Centre’s calendar.
          </p>
        </div>
        <Link href="/admin/events/new" className="btn btn-primary">
          + New event
        </Link>
      </div>

      <div className="card scroll-x">
        <table className="table-warm w-full min-w-[720px]">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Category</th>
              <th>Signups</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="font-medium text-ink">{e.title}</td>
                <td className="text-ink-soft">
                  {formatShortDate(e.startsAt)}
                  {e.recurrence !== "none" && (
                    <span className="ml-2 text-[0.7rem] uppercase tracking-wide text-gold">
                      {e.recurrence}
                    </span>
                  )}
                </td>
                <td><CategoryChip category={e.category} /></td>
                <td className="tabular-nums text-ink-soft">
                  {e.registeredCount}
                  {e.capacity ? ` / ${e.capacity}` : ""}
                </td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${
                      e.published ? "bg-gold-soft text-ink" : "bg-sand text-ink-faint"
                    }`}
                  >
                    {e.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="text-right">
                  <Link href={`/admin/events/${e.id}`} className="link-editorial text-[0.85rem]">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
