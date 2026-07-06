"use client";

import { useMemo, useState } from "react";
import { FilterChip } from "@/components/events/EventsExplorer";
import type { Book } from "@/lib/types";

export function BookBrowser({ books }: { books: Book[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(books.map((b) => b.category).filter(Boolean))].sort(),
    [books]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      if (category !== "all" && b.category !== category) return false;
      if (q && !`${b.title} ${b.author} ${b.description}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [books, query, category]);

  return (
    <div>
      <input
        type="search"
        placeholder="Search by title or author…"
        className="field !py-3.5 !text-base"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search books"
      />
      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="mt-8 border-t border-line">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-5"
          >
            <div className="min-w-0">
              <p className="font-display text-xl text-ink">{b.title}</p>
              <p className="text-[0.875rem] text-ink-soft">
                {b.author}
                {b.category && <> · {b.category}</>}
              </p>
              {b.description && (
                <p className="mt-1 text-[0.85rem] text-ink-soft">{b.description}</p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold ${
                b.available ? "bg-gold-soft text-ink" : "bg-sand text-ink-faint"
              }`}
            >
              {b.available ? "Available" : "On loan"}
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-14 text-center text-ink-soft">
            {books.length === 0
              ? "The catalogue is being built. Check back soon."
              : "No books match that search."}
          </p>
        )}
      </div>
    </div>
  );
}
