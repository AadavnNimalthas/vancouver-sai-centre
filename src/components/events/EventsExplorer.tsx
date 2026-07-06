"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { EVENT_CATEGORIES, categoryLabel, type EventCategory } from "@/lib/types";

export interface OccurrenceDTO {
  key: string;
  slug: string;
  title: string;
  category: EventCategory;
  startsAt: string;
  endsAt: string;
  location: string;
  recurring: boolean;
}

export function EventsExplorer({ occurrences }: { occurrences: OccurrenceDTO[] }) {
  const [filter, setFilter] = useState<EventCategory | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? occurrences : occurrences.filter((o) => o.category === filter)),
    [filter, occurrences]
  );

  // Group by month for editorial rhythm
  const byMonth = useMemo(() => {
    const groups = new Map<string, OccurrenceDTO[]>();
    for (const o of filtered) {
      const key = format(new Date(o.startsAt), "MMMM yyyy");
      groups.set(key, [...(groups.get(key) ?? []), o]);
    }
    return [...groups.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="scroll-x -mx-5 flex gap-2 px-5 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {EVENT_CATEGORIES.map((c) => (
          <FilterChip
            key={c.value}
            active={filter === c.value}
            onClick={() => setFilter(c.value)}
          >
            {c.label}
          </FilterChip>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          {byMonth.length === 0 && (
            <p className="rounded-lg border border-line bg-white-warm p-10 text-center text-ink-soft">
              Nothing is scheduled in this category yet. Check back soon, or{" "}
              <Link href="/portal/notifications" className="link-editorial">
                subscribe to be notified
              </Link>
              .
            </p>
          )}
          {byMonth.map(([month, items]) => (
            <section key={month} className="mb-12">
              <h2 className="eyebrow eyebrow-rule mb-2">{month}</h2>
              <div className="border-t border-line">
                {items.map((o) => {
                  const start = new Date(o.startsAt);
                  return (
                    <Link
                      key={o.key}
                      href={`/events/${o.slug}`}
                      className="group flex items-start gap-6 border-b border-line py-6 transition-colors hover:bg-white-warm sm:items-center sm:gap-8"
                    >
                      <div className="flex w-14 shrink-0 flex-col items-center">
                        <span className="font-display text-[2.2rem] leading-none text-ink">
                          {format(start, "d")}
                        </span>
                        <span className="mt-1 text-[0.65rem] uppercase tracking-[0.16em] text-ink-faint">
                          {format(start, "EEE")}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="font-display text-xl text-ink transition-colors group-hover:text-terra-deep">
                            {o.title}
                          </h3>
                          {o.recurring && (
                            <span className="text-[0.7rem] uppercase tracking-[0.14em] text-gold">
                              recurring
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[0.875rem] text-ink-soft">
                          {format(start, "h:mm a")} · {o.location} ·{" "}
                          <span className="text-ink-faint">{categoryLabel(o.category)}</span>
                        </p>
                      </div>
                      <span className="hidden text-gold transition-transform duration-300 group-hover:translate-x-1 sm:block" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
        active
          ? "bg-ink text-cream"
          : "bg-sand text-ink-soft hover:bg-sand-deep hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
