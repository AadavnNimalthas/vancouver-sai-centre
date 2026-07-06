"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
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
import type { OccurrenceDTO } from "@/components/events/EventsExplorer";
import { EVENT_CATEGORIES, categoryLabel, type EventCategory } from "@/lib/types";

type View = "month" | "week" | "list";

export function CalendarView({ occurrences }: { occurrences: OccurrenceDTO[] }) {
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => new Date());
  const [hidden, setHidden] = useState<Set<EventCategory>>(new Set());

  const visible = useMemo(
    () => occurrences.filter((o) => !hidden.has(o.category)),
    [occurrences, hidden]
  );

  const toggleCategory = (c: EventCategory) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const navigate = (dir: 1 | -1) =>
    setCursor((d) => (view === "week" ? addWeeks(d, dir) : addMonths(d, dir)));

  const heading =
    view === "week"
      ? `Week of ${format(startOfWeek(cursor), "MMM d, yyyy")}`
      : format(cursor, "MMMM yyyy");

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {view !== "list" && (
            <>
              <button onClick={() => navigate(-1)} className="btn btn-ghost !px-3" aria-label="Previous">
                ←
              </button>
              <button onClick={() => navigate(1)} className="btn btn-ghost !px-3" aria-label="Next">
                →
              </button>
              <button onClick={() => setCursor(new Date())} className="btn btn-ghost text-[0.85rem]">
                Today
              </button>
            </>
          )}
          <h2 className="ml-2 font-display text-2xl text-ink">
            {view === "list" ? "Upcoming" : heading}
          </h2>
        </div>

        <div className="flex rounded-full bg-sand p-1" role="group" aria-label="Calendar view">
          {(["month", "week", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 text-[0.85rem] font-medium capitalize transition-colors ${
                view === v ? "bg-white-warm text-ink shadow-soft" : "text-ink-soft"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Category filters */}
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Toggle categories">
        {EVENT_CATEGORIES.map((c) => {
          const off = hidden.has(c.value);
          return (
            <button
              key={c.value}
              onClick={() => toggleCategory(c.value)}
              aria-pressed={!off}
              className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.8rem] font-medium transition-all ${
                off
                  ? "bg-sand/50 text-ink-faint opacity-60"
                  : "bg-sand text-ink-soft"
              }`}
            >
              <span className={`size-2 rounded-full ${off ? "bg-line" : "bg-gold"}`} aria-hidden="true" />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {view === "month" && <MonthGrid cursor={cursor} occurrences={visible} />}
        {view === "week" && <WeekView cursor={cursor} occurrences={visible} />}
        {view === "list" && <ListView occurrences={visible} />}
      </div>
    </div>
  );
}

function occurrencesOn(occurrences: OccurrenceDTO[], day: Date) {
  return occurrences.filter((o) => isSameDay(new Date(o.startsAt), day));
}

function MonthGrid({ cursor, occurrences }: { cursor: Date; occurrences: OccurrenceDTO[] }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor)),
    end: endOfWeek(endOfMonth(cursor)),
  });

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white-warm">
      <div className="grid grid-cols-7 border-b border-line">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const todaysEvents = occurrencesOn(occurrences, day);
          const inMonth = isSameMonth(day, cursor);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[92px] border-b border-r border-line p-1.5 last:border-r-0 sm:min-h-[110px] ${
                inMonth ? "" : "bg-sand/40"
              }`}
            >
              <span
                className={`mb-1 flex size-6 items-center justify-center rounded-full text-[0.75rem] ${
                  isToday(day)
                    ? "bg-terra font-semibold text-white"
                    : inMonth
                      ? "text-ink"
                      : "text-ink-faint"
                }`}
              >
                {format(day, "d")}
              </span>
              <div className="space-y-1">
                {todaysEvents.slice(0, 3).map((o) => (
                  <Link
                    key={o.key}
                    href={`/events/${o.slug}`}
                    title={`${o.title} · ${format(new Date(o.startsAt), "h:mm a")}`}
                    className="block truncate rounded bg-sand px-1.5 py-0.5 text-[0.68rem] leading-relaxed text-ink-soft transition-colors hover:bg-gold-soft hover:text-ink"
                  >
                    {o.title}
                  </Link>
                ))}
                {todaysEvents.length > 3 && (
                  <p className="px-1.5 text-[0.65rem] text-ink-faint">
                    +{todaysEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, occurrences }: { cursor: Date; occurrences: OccurrenceDTO[] }) {
  const days = eachDayOfInterval({
    start: startOfWeek(cursor),
    end: addDays(startOfWeek(cursor), 6),
  });

  return (
    <div className="grid gap-3 md:grid-cols-7 md:gap-0 md:overflow-hidden md:rounded-lg md:border md:border-line md:bg-white-warm">
      {days.map((day) => {
        const todaysEvents = occurrencesOn(occurrences, day);
        return (
          <div key={day.toISOString()} className="rounded-lg border border-line bg-white-warm p-3 md:rounded-none md:border-0 md:border-r md:last:border-r-0">
            <p
              className={`pb-2 text-center text-[0.75rem] font-semibold uppercase tracking-[0.12em] ${
                isToday(day) ? "text-terra-deep" : "text-ink-faint"
              }`}
            >
              {format(day, "EEE d")}
            </p>
            <div className="space-y-2 border-t border-line pt-2">
              {todaysEvents.length === 0 && (
                <p className="py-3 text-center text-[0.7rem] text-ink-faint">—</p>
              )}
              {todaysEvents.map((o) => (
                <Link
                  key={o.key}
                  href={`/events/${o.slug}`}
                  className="block rounded bg-sand px-2 py-1.5 transition-colors hover:bg-gold-soft"
                >
                  <span className="block text-[0.65rem] uppercase tracking-wide text-ink-faint">
                    {format(new Date(o.startsAt), "h:mm a")}
                  </span>
                  <span className="block text-[0.78rem] leading-snug text-ink">{o.title}</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ occurrences }: { occurrences: OccurrenceDTO[] }) {
  const now = new Date();
  const upcoming = occurrences
    .filter((o) => new Date(o.endsAt) >= now)
    .slice(0, 40);

  const byDay = useMemo(() => {
    const groups = new Map<string, OccurrenceDTO[]>();
    for (const o of upcoming) {
      const key = format(new Date(o.startsAt), "EEEE, MMMM d, yyyy");
      groups.set(key, [...(groups.get(key) ?? []), o]);
    }
    return [...groups.entries()];
  }, [upcoming]);

  return (
    <div className="space-y-8">
      {byDay.length === 0 && (
        <p className="rounded-lg border border-line bg-white-warm p-10 text-center text-ink-soft">
          Nothing on the calendar for these filters.
        </p>
      )}
      {byDay.map(([day, items]) => (
        <section key={day}>
          <h3 className="eyebrow eyebrow-rule">{day}</h3>
          <div className="mt-2 border-t border-line">
            {items.map((o) => (
              <Link
                key={o.key}
                href={`/events/${o.slug}`}
                className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line py-4"
              >
                <span className="w-20 shrink-0 text-[0.85rem] text-ink-faint">
                  {format(new Date(o.startsAt), "h:mm a")}
                </span>
                <span className="font-display text-lg text-ink transition-colors group-hover:text-terra-deep">
                  {o.title}
                </span>
                <span className="text-[0.8rem] text-ink-soft">
                  {categoryLabel(o.category)} · {o.location}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
