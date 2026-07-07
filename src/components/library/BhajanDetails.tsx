"use client";

import { useState } from "react";
import Link from "next/link";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal } from "@/components/Reveal";
import type { Bhajan } from "@/lib/types";

interface BhajanDetailsProps {
  versions: Bhajan[];
  initialActiveId: string;
}

export function BhajanDetails({ versions, initialActiveId }: BhajanDetailsProps) {
  const [activeId, setActiveId] = useState(initialActiveId);
  const activeBhajan = versions.find((v) => v.id === activeId) || versions[0];

  if (!activeBhajan) return null;

  return (
    <div>
      <Reveal>
        <Link href="/library/bhajans" className="link-editorial text-[0.85rem]">
          ← All bhajans
        </Link>
        <div className="mt-10 text-center">
          <p className="eyebrow">
            {activeBhajan.category} · {activeBhajan.language} ·{" "}
            {activeBhajan.beatTaal ? `${activeBhajan.beatTaal} · ` : ""}
            <span className="capitalize">{activeBhajan.tempo.replace("_", " ")}</span> tempo
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.1] text-ink sm:text-6xl">
            {activeBhajan.title}
          </h1>
          
          {/* Versions Tabs */}
          {versions.length > 1 && (
            <div className="flex flex-wrap gap-2 justify-center mt-6 border-b border-line/45 pb-4">
              {versions.map((v, idx) => {
                const isActive = v.id === activeId;
                const label = `Version ${idx + 1} (${v.language}${v.beatTaal ? ` · ${v.beatTaal} Beat` : ""})`;
                return (
                  <button
                    key={v.id}
                    onClick={() => setActiveId(v.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-terra text-white border-terra shadow-sm"
                        : "bg-white-warm text-ink-soft border-line hover:bg-sand/30"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          <p className="mx-auto mt-6 max-w-md font-display text-xl italic leading-relaxed text-ink-soft">
            {activeBhajan.meaning}
          </p>
          <MalaDivider className="mt-10" />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 rounded-lg bg-sand/70 px-6 py-12 text-center sm:px-12">
          <p className="whitespace-pre-line font-display text-2xl leading-[2] text-ink">
            {activeBhajan.lyrics}
          </p>
        </div>
      </Reveal>

      {(activeBhajan.audioUrl || activeBhajan.videoUrl || activeBhajan.sourceLink) && (
        <Reveal delay={0.1} className="mt-8 flex justify-center gap-4">
          {activeBhajan.audioUrl && (
            <a href={activeBhajan.audioUrl} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              ♪ Practice Recording
            </a>
          )}
          {activeBhajan.videoUrl && (
            <a href={activeBhajan.videoUrl} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              ▸ Watch Video
            </a>
          )}
          {activeBhajan.sourceLink && (
            <a href={activeBhajan.sourceLink} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              View on SaiRhythms
            </a>
          )}
        </Reveal>
      )}

      {activeBhajan.notes && (
        <Reveal delay={0.1} className="mt-12">
          <h2 className="eyebrow eyebrow-rule">Notes for singers</h2>
          <p className="prose-warm mt-4">{activeBhajan.notes}</p>
        </Reveal>
      )}
    </div>
  );
}
