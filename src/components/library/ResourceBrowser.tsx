"use client";

import { useMemo, useState } from "react";
import { FilterChip } from "@/components/events/EventsExplorer";
import { RESOURCE_KINDS, type Resource, type ResourceKind } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

const KIND_GLYPH: Record<ResourceKind, string> = {
  pdf: "❡",
  video: "▸",
  audio: "♪",
  bhajan: "♬",
  study: "✎",
  discourse: "❝",
};

export function ResourceBrowser({
  resources,
  signedIn,
}: {
  resources: Resource[];
  signedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ResourceKind | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (q && !`${r.title} ${r.description} ${r.tags.join(" ")}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [resources, query, kind]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search resources…"
        className="field !py-3.5 !text-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search resources"
      />
      <div className="mt-5 flex flex-wrap gap-2">
        <FilterChip active={kind === "all"} onClick={() => setKind("all")}>All</FilterChip>
        {RESOURCE_KINDS.map((k) => (
          <FilterChip key={k.value} active={kind === k.value} onClick={() => setKind(k.value)}>
            {k.label}
          </FilterChip>
        ))}
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {filtered.map((r) => {
          const locked = r.membersOnly && !signedIn;
          return (
            <a
              key={r.id}
              href={locked ? "/login" : r.url}
              className="card group flex gap-5 p-6 transition-shadow hover:shadow-soft"
            >
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sand font-display text-xl text-terra-deep"
                aria-hidden="true"
              >
                {KIND_GLYPH[r.kind]}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-terra-deep">
                    {r.title}
                  </h3>
                  {r.membersOnly && (
                    <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-ink">
                      Members
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-soft">
                  {r.description}
                </p>
                <p className="mt-3 text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">
                  {formatShortDate(r.createdAt)}
                  {r.tags.length > 0 && <> · {r.tags.join(" · ")}</>}
                </p>
                {locked && (
                  <p className="mt-2 text-[0.8rem] text-terra-deep">
                    Sign in to open this resource
                  </p>
                )}
              </div>
            </a>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="py-14 text-center text-ink-soft">
          Nothing matches that search. Try a different word, or clear the filters.
        </p>
      )}
    </div>
  );
}
