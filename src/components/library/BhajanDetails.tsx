"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal } from "@/components/Reveal";
import type { Bhajan } from "@/lib/types";
import { transliterate } from "@/lib/transliteration";
import { ShrinkableLine } from "./ShrinkableLine";

interface BhajanDetailsProps {
  versions: Bhajan[];
  initialActiveId: string;
}

const LANGUAGE_TO_SCRIPT: Record<string, { key: "devanagari" | "telugu" | "tamil"; label: string }> = {
  sanskrit: { key: "devanagari", label: "Devanagari" },
  hindi: { key: "devanagari", label: "Devanagari" },
  marathi: { key: "devanagari", label: "Devanagari" },
  nepali: { key: "devanagari", label: "Devanagari" },
  telugu: { key: "telugu", label: "Telugu" },
  tamil: { key: "tamil", label: "Tamil" },
};

export function BhajanDetails({ versions, initialActiveId }: BhajanDetailsProps) {
  const [activeId, setActiveId] = useState(initialActiveId);
  const [selectedScript, setSelectedScript] = useState<"english" | "devanagari" | "telugu" | "tamil">("english");
  const [transliteratedLyrics, setTransliteratedLyrics] = useState("");
  const [isTransliterating, setIsTransliterating] = useState(false);
  
  const activeBhajan = versions.find((v) => v.id === activeId) || versions[0];
  const nativeScript = activeBhajan?.language ? LANGUAGE_TO_SCRIPT[activeBhajan.language.toLowerCase()] : null;
  const scriptOptions: Array<{key: string, label: string}> = [ { key: "english", label: "English" } ];
  if (nativeScript) {
    scriptOptions.push(nativeScript);
  }

  useEffect(() => {
    if (selectedScript !== "english" && (!nativeScript || nativeScript.key !== selectedScript)) {
      setSelectedScript("english");
    }
  }, [activeBhajan?.id, nativeScript?.key, selectedScript]);

  useEffect(() => {
    if (!activeBhajan) return;
    
    if (selectedScript === "english") {
      setTransliteratedLyrics(activeBhajan.lyrics);
      setIsTransliterating(false);
      return;
    }
    
    let active = true;
    setIsTransliterating(true);
    
    transliterate(activeBhajan.lyrics, selectedScript).then((res) => {
      if (active) {
        setTransliteratedLyrics(res);
        setIsTransliterating(false);
      }
    }).catch(() => {
      if (active) {
        setTransliteratedLyrics(activeBhajan.lyrics);
        setIsTransliterating(false);
      }
    });
    
    return () => { active = false; };
  }, [selectedScript, activeBhajan?.lyrics]);

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
        <div className="mt-12 flex flex-col items-center">
          {/* Script Selector Tabs */}
          {scriptOptions.length > 1 && (
            <div className="flex gap-1.5 rounded-full bg-sand/40 p-1 mb-6 select-none">
              {scriptOptions.map((s) => {
                const active = selectedScript === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setSelectedScript(s.key as any)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      active
                        ? "bg-white-warm text-ink shadow-soft"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="w-full rounded-lg bg-sand/70 px-6 py-12 text-center sm:px-12 overflow-hidden">
            <div className={`flex flex-col text-ink ${
              selectedScript === "english"
                ? "font-display text-2xl leading-[2]"
                : "font-sans text-2xl leading-[2.2] tracking-wide"
            } ${isTransliterating ? "opacity-50" : "opacity-100"} transition-opacity duration-300`}>
              {(transliteratedLyrics || activeBhajan.lyrics).split('\n').map((line, idx) => (
                <ShrinkableLine key={idx} text={line} />
              ))}
            </div>
          </div>
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
