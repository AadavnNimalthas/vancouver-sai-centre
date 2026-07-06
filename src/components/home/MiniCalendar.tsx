import Link from "next/link";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Occurrence } from "@/lib/recurrence";

/** A small month-at-a-glance grid for the homepage. Dots mark days with events. */
export function MiniCalendar({ occurrences }: { occurrences: Occurrence[] }) {
  const now = new Date();
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(now)),
    end: endOfWeek(endOfMonth(now)),
  });

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between px-1">
        <p className="font-display text-xl text-ink">{format(now, "MMMM yyyy")}</p>
        <Link href="/portal/calendar" className="link-editorial text-[0.8rem]">
          Full calendar
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-7 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="pb-1 text-[0.65rem] font-semibold text-ink-faint">
            {d}
          </span>
        ))}
        {days.map((day) => {
          const hasEvents = occurrences.some((o) => isSameDay(o.startsAt, day));
          const inMonth = isSameMonth(day, now);
          return (
            <Link
              key={day.toISOString()}
              href="/events"
              className="group flex flex-col items-center py-1"
              aria-label={format(day, "MMMM d")}
            >
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[0.8rem] transition-colors group-hover:bg-sand ${
                  isToday(day)
                    ? "bg-terra font-semibold text-white group-hover:bg-terra"
                    : inMonth
                      ? "text-ink"
                      : "text-ink-faint/50"
                }`}
              >
                {format(day, "d")}
              </span>
              <span
                className={`mt-0.5 size-1 rounded-full ${
                  hasEvents && inMonth ? "bg-gold" : "bg-transparent"
                }`}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
