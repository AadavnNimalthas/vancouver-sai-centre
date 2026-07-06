"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { FilterChip } from "@/components/events/EventsExplorer";
import { type Bhajan, type BhajanTempo, BHAJAN_DEITY_OPTIONS, BHAJAN_TEMPO_OPTIONS } from "@/lib/types";
import { capitalizeEachWord, checkDuplicateBhajan } from "@/lib/bhajan-utils";
import { SaiRhythmsImporter } from "./SaiRhythmsImporter";
import { submitBhajan } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

const TEMPO_GLYPH: Record<Bhajan["tempo"], string> = {
  melodic: "♫",
  slow: "●○○",
  medium: "●●○",
  fast: "●●●",
  very_fast: "●●●●",
};

export function BhajanBrowser({ bhajans, signedIn = true }: { bhajans: Bhajan[]; signedIn?: boolean }) {
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [tempo, setTempo] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [beatTaal, setBeatTaal] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"alpha" | "recent" | "used">("alpha");

  // Suggest modal state
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestMode, setSuggestMode] = useState<"none" | "manual" | "import">("none");
  const [successMessage, setSuccessMessage] = useState("");

  // Suggest form states
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [meaning, setMeaning] = useState("");
  const [tempoInput, setTempoInput] = useState<BhajanTempo>("medium");
  const [beatInput, setBeatInput] = useState("");
  const [langInput, setLangInput] = useState("Sanskrit");
  const [catInput, setCatInput] = useState("Sai");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [variationConfirm, setVariationConfirm] = useState<Bhajan | null>(null);

  const languages = useMemo(
    () => [...new Set(bhajans.map((b) => b.language))].filter(Boolean).sort(),
    [bhajans]
  );
  const categories = useMemo(
    () => [...new Set(bhajans.map((b) => b.category))].filter(Boolean).sort(),
    [bhajans]
  );
  const beatsList = useMemo(
    () => [...new Set(bhajans.map((b) => b.beatTaal))].filter(Boolean).sort(),
    [bhajans]
  );

  const filteredAndSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    // Filter
    const result = bhajans.filter((b) => {
      if (language !== "all" && b.language !== language) return false;
      if (tempo !== "all" && b.tempo !== tempo) return false;
      if (category !== "all" && b.category !== category) return false;
      if (beatTaal !== "all" && b.beatTaal !== beatTaal) return false;
      if (q && !`${b.title} ${b.meaning} ${b.lyrics}`.toLowerCase().includes(q))
        return false;
      return true;
    });

    // Sort
    if (sortBy === "alpha") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "recent") {
      result.sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad; // descending
      });
    } else if (sortBy === "used") {
      // Simulate "most used" by sorting mock IDs or lengths of lyrics
      result.sort((a, b) => {
        const au = (a.additionalMetadata?.useCount as number) || a.title.length % 7;
        const bu = (b.additionalMetadata?.useCount as number) || b.title.length % 7;
        return bu - au;
      });
    }

    return result;
  }, [bhajans, query, language, tempo, category, beatTaal, sortBy]);

  function handleSuggestManual(bypassCheck: boolean | React.MouseEvent = false) {
    if (!title || !lyrics || !meaning || !catInput || !beatInput) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");

    const formattedLyrics = capitalizeEachWord(lyrics);
    const shouldBypass = typeof bypassCheck === "boolean" ? bypassCheck : false;

    if (!shouldBypass) {
      const { exactDuplicate, variationDuplicate } = checkDuplicateBhajan(title, formattedLyrics, bhajans);
      if (exactDuplicate) {
        setError(`This exact bhajan already exists in the library under the title '${exactDuplicate.title}'.`);
        return;
      }
      if (variationDuplicate) {
        setVariationConfirm(variationDuplicate);
        return;
      }
    }

    setVariationConfirm(null);
    startTransition(async () => {
      const res = await submitBhajan({
        title,
        lyrics: formattedLyrics,
        meaning,
        tempo: tempoInput,
        beatTaal: beatInput,
        language: langInput,
        category: catInput,
        notes,
      });

      if (res.ok) {
        setSuccessMessage(res.message);
        setSuggestOpen(false);
        resetSuggestForm();
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(res.message);
      }
    });
  }

  function resetSuggestForm() {
    setTitle("");
    setLyrics("");
    setMeaning("");
    setTempoInput("medium");
    setBeatInput("");
    setLangInput("Sanskrit");
    setCatInput("Sai");
    setNotes("");
    setError("");
    setVariationConfirm(null);
    setSuggestMode("none");
  }

  return (
    <div>
      {successMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="search"
              placeholder="Search by title, meaning, or a line of the lyrics…"
              className="field !py-3.5 !text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search bhajans"
            />
          </div>
          {signedIn && (
            <div>
              <button
                onClick={() => {
                  setSuggestOpen(true);
                  resetSuggestForm();
                }}
                className="btn btn-primary w-full sm:w-auto h-[48px] font-semibold text-sm"
              >
                + Suggest a Bhajan
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4 border-b border-line pb-6">
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
              {BHAJAN_TEMPO_OPTIONS.map((opt) => (
                <FilterChip key={opt.value} active={tempo === opt.value} onClick={() => setTempo(opt.value)}>
                  {opt.label}
                </FilterChip>
              ))}
            </FilterRow>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <FilterRow label="Deity / theme">
              <FilterChip active={category === "all"} onClick={() => setCategory("all")}>All</FilterChip>
              {categories.map((c) => (
                <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>
                  {c}
                </FilterChip>
              ))}
            </FilterRow>

            {beatsList.length > 0 && (
              <FilterRow label="Beat / Taal">
                <FilterChip active={beatTaal === "all"} onClick={() => setBeatTaal("all")}>All</FilterChip>
                {beatsList.map((b) => (
                  <FilterChip key={b} active={beatTaal === b} onClick={() => setBeatTaal(b)}>
                    {b}
                  </FilterChip>
                ))}
              </FilterRow>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-line/45">
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Sort By
              </span>
              <select
                className="bg-transparent border-0 font-semibold text-sm text-ink-soft focus:ring-0 focus:outline-none cursor-pointer py-1"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="alpha">Alphabetical</option>
                <option value="recent">Recently Added</option>
                <option value="used">Most Used</option>
              </select>
            </div>
            
            <p className="text-[0.8rem] uppercase tracking-[0.16em] text-ink-faint">
              {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "bhajan" : "bhajans"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3">
        {filteredAndSorted.map((b) => (
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
            <p className="hidden text-[0.85rem] text-ink-soft sm:block">
              {b.language} {b.beatTaal ? `· ${b.beatTaal}` : ""}
            </p>
            <p
              className="text-[0.7rem] tracking-[0.2em] text-gold"
              title={`${b.tempo} tempo`}
              aria-label={`${b.tempo} tempo`}
            >
              {TEMPO_GLYPH[b.tempo]}
            </p>
          </Link>
        ))}
        {filteredAndSorted.length === 0 && (
          <p className="py-14 text-center text-ink-soft">
            No bhajans match. Try fewer filters or a shorter search.
          </p>
        )}
      </div>

      {/* Suggest Modal */}
      <AnimatePresence>
        {suggestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card relative w-full max-w-2xl bg-cream max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-lift"
            >
              <div className="border-b border-line px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">
                  {suggestMode === "manual"
                    ? "Suggest New Bhajan"
                    : suggestMode === "import"
                    ? "Import from SaiRhythms"
                    : "Add New Bhajan"}
                </h3>
                <button
                  onClick={() => setSuggestOpen(false)}
                  className="text-ink-soft hover:text-ink text-2xl leading-none"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {suggestMode === "none" && (
                  <div className="grid gap-6 sm:grid-cols-2 py-8">
                    <button
                      onClick={() => setSuggestMode("import")}
                      className="card p-6 border-line hover:border-gold bg-white-warm hover:bg-sand/15 transition-all text-left flex flex-col justify-between h-40"
                    >
                      <div>
                        <h4 className="font-display text-xl font-semibold text-ink">SaiRhythms Import</h4>
                        <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                          Paste a SaiRhythms URL to auto-extract lyrics, meaning, language, category, and speed notes.
                        </p>
                      </div>
                      <span className="text-xs text-gold font-bold uppercase tracking-wider">Use Importer &rarr;</span>
                    </button>

                    <button
                      onClick={() => setSuggestMode("manual")}
                      className="card p-6 border-line hover:border-gold bg-white-warm hover:bg-sand/15 transition-all text-left flex flex-col justify-between h-40"
                    >
                      <div>
                        <h4 className="font-display text-xl font-semibold text-ink">Manual Entry</h4>
                        <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                          Manually enter the bhajan title, lyrics, translation, theme, and beat pattern from scratch.
                        </p>
                      </div>
                      <span className="text-xs text-gold font-bold uppercase tracking-wider">Enter Manually &rarr;</span>
                    </button>
                  </div>
                )}

                {suggestMode === "manual" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Title *</label>
                        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Deity / Category *</label>
                        <select
                          className="field"
                          value={catInput}
                          onChange={(e) => setCatInput(e.target.value)}
                          disabled={pending}
                        >
                          <option value="">Select Deity / Category</option>
                          {BHAJAN_DEITY_OPTIONS.map((deity) => (
                            <option key={deity} value={deity}>{deity}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Language</label>
                        <input className="field" value={langInput} onChange={(e) => setLangInput(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Beat / Taal *</label>
                        <input className="field" placeholder="e.g. 8 Beat / Keherwa" value={beatInput} onChange={(e) => setBeatInput(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Tempo *</label>
                        <select
                          className="field"
                          value={tempoInput}
                          onChange={(e) => setTempoInput(e.target.value as BhajanTempo)}
                          disabled={pending}
                        >
                          {BHAJAN_TEMPO_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label">Lyrics *</label>
                      <textarea className="field font-mono text-sm leading-relaxed" rows={4} value={lyrics} onChange={(e) => setLyrics(e.target.value)} disabled={pending} />
                    </div>
                    <div>
                      <label className="label">Meaning *</label>
                      <textarea className="field text-sm" rows={2.5} value={meaning} onChange={(e) => setMeaning(e.target.value)} disabled={pending} />
                    </div>
                    <div>
                      <label className="label">Practice Notes (Optional)</label>
                      <input className="field" placeholder="Notes for singers/instrumentalists" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={pending} />
                    </div>
                    {error && <p className="text-sm text-terra font-medium">{error}</p>}
                    {variationConfirm && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-2">
                        <p>
                          A bhajan with a similar title or lyrics already exists: <strong>{variationConfirm.title}</strong>. Is this a new variation?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSuggestManual(true)}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors"
                          >
                            Yes, save as variation
                          </button>
                          <button
                            type="button"
                            onClick={() => setVariationConfirm(null)}
                            className="px-2.5 py-1 bg-sand/30 hover:bg-sand/50 rounded text-xs font-semibold transition-colors"
                          >
                            No, it&rsquo;s the same
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {suggestMode === "import" && (
                  <SaiRhythmsImporter
                    onClose={() => setSuggestMode("none")}
                    onSuccess={(msg) => {
                      setSuccessMessage(msg);
                      setSuggestOpen(false);
                      setTimeout(() => setSuccessMessage(""), 5000);
                    }}
                    bhajans={bhajans}
                  />
                )}
              </div>

              <div className="border-t border-line px-6 py-4 bg-sand/10 flex justify-between items-center gap-3">
                {suggestMode === "none" ? (
                  <button onClick={() => setSuggestOpen(false)} className="btn btn-ghost !px-4 !py-1.5 text-xs ml-auto">
                    Close
                  </button>
                ) : suggestMode === "manual" ? (
                  <>
                    <button onClick={() => setSuggestMode("none")} className="btn btn-ghost !px-4 !py-1.5 text-xs" disabled={pending}>
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => setSuggestOpen(false)} className="btn btn-ghost !px-4 !py-1.5 text-xs" disabled={pending}>
                        Cancel
                      </button>
                      <button onClick={handleSuggestManual} className="btn btn-primary !px-4 !py-1.5 text-xs font-semibold" disabled={pending}>
                        {pending ? "Submitting..." : "Submit Suggestion"}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
