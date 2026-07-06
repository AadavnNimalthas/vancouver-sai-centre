"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterChip } from "@/components/events/EventsExplorer";
import type { Bhajan } from "@/lib/types";

const TEMPO_GLYPH: Record<Bhajan["tempo"], string> = {
  slow: "●○○",
  medium: "●●○",
  fast: "●●●",
};

export function BhajanBrowser({ bhajans }: { bhajans: Bhajan[] }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [tempo, setTempo] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const languages = useMemo(
    () => [...new Set(bhajans.map((b) => b.language))].sort(),
    [bhajans]
  );
  const categories = useMemo(
    () => [...new Set(bhajans.map((b) => b.category))].sort(),
    [bhajans]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bhajans.filter((b) => {
      if (language !== "all" && b.language !== language) return false;
      if (tempo !== "all" && b.tempo !== tempo) return false;
      if (category !== "all" && b.category !== category) return false;
      if (q && !`${b.title} ${b.meaning} ${b.lyrics}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [bhajans, query, language, tempo, category]);

  return (
    <div>
      <div className="flex flex-col gap-5">
        <input
          type="search"
          placeholder="Search by title, meaning, or a line of the lyrics…"
          className="field !py-3.5 !text-base"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search bhajans"
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterRow label="Language">
            <FilterChip active={language === "all"} onClick={() => setLanguage("all")}>All</FilterChip>
            {languages.map((l) => (
              <FilterChip key={l} active={language === l} onClick={() => setLanguage(l)}>
                {l}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Tempo">
            <FilterChip active={tempo === "all"} onClick={() => setTempo("all")}>All</FilterChip>
            {(["slow", "medium", "fast"] as const).map((t) => (
              <FilterChip key={t} active={tempo === t} onClick={() => setTempo(t)}>
                {t[0].toUpperCase() + t.slice(1)}
              </FilterChip>
            ))}
          </FilterRow>
          <FilterRow label="Deity / theme">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>All</FilterChip>
            {categories.map((c) => (
              <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </FilterChip>
            ))}
          </FilterRow>
        </div>
      </div>

      <p className="mt-8 text-[0.8rem] uppercase tracking-[0.16em] text-ink-faint">
        {filtered.length} {filtered.length === 1 ? "bhajan" : "bhajans"}
      </p>

      <div className="mt-3 border-t border-line">
        {filtered.map((b) => (
          <Link
            key={b.id}
            href={`/library/bhajans/${b.id}`}
            className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-white-warm sm:grid-cols-[2fr_1fr_1fr_auto]"
          >
            <div className="min-w-0">
              <p className="font-display text-xl text-ink transition-colors group-hover:text-terra-deep">
                {b.title}
              </p>
              <p className="truncate text-[0.85rem] italic text-ink-soft">{b.meaning}</p>
            </div>
            <p className="hidden text-[0.85rem] text-ink-soft sm:block">{b.category}</p>
            <p className="hidden text-[0.85rem] text-ink-soft sm:block">{b.language}</p>
            <p
              className="text-[0.7rem] tracking-[0.2em] text-gold"
              title={`${b.tempo} tempo`}
              aria-label={`${b.tempo} tempo`}
            >
              {TEMPO_GLYPH[b.tempo]}
            </p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="py-14 text-center text-ink-soft">
            No bhajans match. Try fewer filters or a shorter search.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </span>
      {children}
    </div>
  );
}
