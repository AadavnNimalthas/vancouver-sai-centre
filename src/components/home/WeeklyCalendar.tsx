import Link from "next/link";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isToday,
  startOfWeek,
} from "date-fns";
import type { Occurrence } from "@/lib/recurrence";

/** A small weekly schedule calendar for the homepage showing occurrences. */
export function WeeklyCalendar({ occurrences }: { occurrences: Occurrence[] }) {
  const now = new Date();
  const start = startOfWeek(now);
  const end = endOfWeek(now);
  
  const days = eachDayOfInterval({
    start,
    end,
  });

  return (
    <div className="card p-6 bg-white shadow-sm border border-line h-full flex flex-col justify-between">
      <div>
        <div className="flex items-baseline justify-between border-b border-line/45 pb-3">
          <h3 className="font-display text-lg text-ink font-semibold">Weekly Schedule</h3>
          <Link href="/portal/calendar" className="link-editorial text-[0.75rem] font-semibold">
            Full calendar
          </Link>
        </div>
        
        <div className="mt-4 space-y-3.5">
          {days.map((day) => {
            const dayEvents = occurrences.filter((o) => isSameDay(o.startsAt, day));
            const active = isToday(day);

            return (
              <div key={day.toISOString()} className="flex items-start gap-3.5 text-xs">
                {/* Day indicator */}
                <div className="flex flex-col items-center min-w-[2.2rem] py-0.5 select-none">
                  <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${active ? "text-terra" : "text-ink-faint"}`}>
                    {format(day, "EEE")}
                  </span>
                  <span className={`mt-0.5 flex size-6.5 items-center justify-center rounded-full text-[0.85rem] font-semibold transition-all ${
                    active 
                      ? "bg-terra text-white shadow-sm" 
                      : "bg-sand/35 text-ink-soft"
                  }`}>
                    {format(day, "d")}
                  </span>
                </div>

                {/* Day Events list */}
                <div className="flex-1 min-w-0 pt-0.5">
                  {dayEvents.length > 0 ? (
                    <div className="space-y-1.5">
                      {dayEvents.slice(0, 2).map((ev, idx) => (
                        <Link
                          key={idx}
                          href="/events"
                          className="block group"
                        >
                          <p className="font-semibold text-ink group-hover:text-terra transition-colors leading-normal truncate">
                            {ev.event.title}
                          </p>
                          <p className="text-[0.7rem] text-ink-faint">
                            {format(ev.startsAt, "h:mm a")}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-ink-faint/60 italic pt-1.5">No events</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
