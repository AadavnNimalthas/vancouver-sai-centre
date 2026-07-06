import Link from "next/link";
import { formatEventTime, formatMonthDay } from "@/lib/format";
import { categoryLabel, type EventCategory } from "@/lib/types";
import type { Occurrence } from "@/lib/recurrence";

/** A soft, lowercase label rather than an app-style badge. */
export function CategoryChip({ category }: { category: EventCategory }) {
  return (
    <span className="inline-block rounded bg-sand px-2.5 py-0.5 font-display text-[0.95rem] italic leading-relaxed text-terra-deep">
      {categoryLabel(category).toLowerCase()}
    </span>
  );
}

/**
 * Editorial event row: date block on the left, details right.
 * Used on the homepage and events index.
 */
export function EventRow({ occurrence }: { occurrence: Occurrence }) {
  const { event, startsAt, endsAt } = occurrence;
  const d = formatMonthDay(startsAt);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex items-start gap-6 border-b border-line py-7 transition-colors last:border-b-0 hover:bg-white-warm sm:items-center sm:gap-8"
    >
      <div className="flex w-16 shrink-0 flex-col items-center text-center">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terra-deep">
          {d.month}
        </span>
        <span className="font-display text-[2.6rem] leading-none text-ink">{d.day}</span>
        <span className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
          {d.weekday}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl text-ink transition-colors group-hover:text-terra-deep sm:text-2xl">
            {event.title}
          </h3>
          <CategoryChip category={event.category} />
        </div>
        <p className="mt-1 text-[0.9rem] text-ink-soft">
          {formatEventTime(startsAt, endsAt)} · {event.location}
        </p>
      </div>

      <span
        className="hidden text-gold transition-transform duration-300 group-hover:translate-x-1 sm:block"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
