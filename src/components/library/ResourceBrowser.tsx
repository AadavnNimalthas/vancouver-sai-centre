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

/**
 * Resources live in Google Drive: admins paste a Drive link and the
 * browser embeds Drive's preview player right on the page.
 */
function drivePreviewUrl(url: string): string | null {
  const file = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (file) return `https://drive.google.com/file/d/${file[1]}/preview`;
  const open = url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (open) return `https://drive.google.com/file/d/${open[1]}/preview`;
  const doc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if (doc) return `https://docs.google.com/${doc[1]}/d/${doc[2]}/preview`;
  return null;
}

export function ResourceBrowser({
  resources,
  signedIn,
}: {
  resources: Resource[];
  signedIn: boolean;
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ResourceKind | "all">("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

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
          const preview = !locked ? drivePreviewUrl(r.url) : null;
          const open = previewId === r.id;
          return (
            <div key={r.id} className={`card p-6 ${open ? "sm:col-span-2" : ""}`}>
              <div className="flex gap-5">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sand font-display text-xl text-terra-deep"
                  aria-hidden="true"
                >
                  {KIND_GLYPH[r.kind]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl leading-snug text-ink">{r.title}</h3>
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
                  <div className="mt-3 flex flex-wrap gap-4 text-[0.875rem]">
                    {locked ? (
                      <a href="/login" className="link-editorial">
                        Sign in to open this resource
                      </a>
                    ) : (
                      <>
                        {preview && (
                          <button
                            onClick={() => setPreviewId(open ? null : r.id)}
                            className="link-editorial"
                          >
                            {open ? "Close preview" : "Preview"}
                          </button>
                        )}
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-editorial"
                        >
                          Open in Drive
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {open && preview && (
                <iframe
                  src={preview}
                  title={`Preview: ${r.title}`}
                  className="mt-5 h-[480px] w-full rounded-lg border border-line"
                  allow="autoplay"
                />
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="py-14 text-center text-ink-soft">
          {resources.length === 0
            ? "The resource library is being built. Check back soon."
            : "Nothing matches that search. Try a different word, or clear the filters."}
        </p>
      )}
    </div>
  );
}
