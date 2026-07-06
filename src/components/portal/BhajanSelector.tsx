"use client";

import { useState, useTransition } from "react";
import { type Bhajan, type BhajanTempo, BHAJAN_DEITY_OPTIONS, BHAJAN_TEMPO_OPTIONS } from "@/lib/types";
import { capitalizeEachWord, checkDuplicateBhajan } from "@/lib/bhajan-utils";
import { SaiRhythmsImporter } from "../library/SaiRhythmsImporter";
import { submitBhajan } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface BhajanSelectorProps {
  slotName: string;
  selectedBhajanId: string | null;
  onSelect: (bhajan: Bhajan | null) => void;
  allBhajans: Bhajan[];
  myBhajans: {
    favorites: Bhajan[];
    recentlyUsed: Bhajan[];
    submitted: Bhajan[];
  };
  allowedCategories: string[];
  allowedTempos?: string[];
  allowedBeats?: string[];
}

export function BhajanSelector({
  slotName,
  selectedBhajanId,
  onSelect,
  allBhajans,
  myBhajans,
  allowedCategories,
  allowedTempos = [],
  allowedBeats = [],
}: BhajanSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "fav" | "recent" | "suggest">("all");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [suggestMode, setSuggestMode] = useState<"none" | "manual" | "import">("none");

  // New bhajan manual suggest states
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [meaning, setMeaning] = useState("");
  const [tempo, setTempo] = useState<BhajanTempo>("medium");
  const [beatTaal, setBeatTaal] = useState("");
  const [language, setLanguage] = useState("Sanskrit");
  const [category, setCategory] = useState(allowedCategories[0] || "Sai");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [variationConfirm, setVariationConfirm] = useState<Bhajan | null>(null);

  const selectedBhajan = allBhajans.find((b) => b.id === selectedBhajanId);

  // Categories list based on allowed categories or all deity options
  const categoriesList = allowedCategories.length > 0
    ? allowedCategories
    : BHAJAN_DEITY_OPTIONS;

  // Filter list
  let currentList: Bhajan[] = [];
  if (activeTab === "all") {
    currentList = allBhajans;
  } else if (activeTab === "fav") {
    currentList = myBhajans.favorites;
  } else if (activeTab === "recent") {
    currentList = myBhajans.recentlyUsed;
  } else if (activeTab === "suggest") {
    currentList = myBhajans.submitted;
  }

  // Apply the sign-up form's limits (empty array = no limit)
  if (allowedCategories.length > 0) {
    currentList = currentList.filter((b) => allowedCategories.includes(b.category));
  }
  if (allowedTempos.length > 0) {
    currentList = currentList.filter((b) => allowedTempos.includes(b.tempo));
  }
  if (allowedBeats.length > 0) {
    currentList = currentList.filter((b) =>
      allowedBeats.some((beat) => beat.toLowerCase() === b.beatTaal.trim().toLowerCase())
    );
  }

  // Filter by search and selected category
  const filteredList = currentList.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.lyrics.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  function handleSelect(bhajan: Bhajan) {
    onSelect(bhajan);
    setIsOpen(false);
    resetSearchState();
  }

  function resetSearchState() {
    setSearch("");
    setSelectedCategory("");
    setActiveTab("all");
    setSuggestMode("none");
    setError("");
    setVariationConfirm(null);
  }

  function handleSuggestManual(bypassCheck: boolean | React.MouseEvent = false) {
    if (!title || !lyrics || !meaning || !category || !beatTaal) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");

    const formattedLyrics = capitalizeEachWord(lyrics);
    const shouldBypass = typeof bypassCheck === "boolean" ? bypassCheck : false;

    if (!shouldBypass) {
      const { exactDuplicate, variationDuplicate } = checkDuplicateBhajan(title, formattedLyrics, allBhajans);
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
        tempo,
        beatTaal,
        language,
        category,
        notes,
      });

      if (res.ok && res.insertedId) {
        // Auto-select the newly suggested bhajan (with local state)
        const mockNewBhajan: Bhajan = {
          id: res.insertedId,
          title,
          lyrics: formattedLyrics,
          meaning,
          tempo,
          beatTaal,
          language,
          category,
          notes,
          status: "pending",
          audioUrl: null,
          videoUrl: null,
        };
        onSelect(mockNewBhajan);
        setIsOpen(false);
        resetSearchState();
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="card p-5 border-line bg-white-warm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow block text-xs">{slotName}</span>
          {selectedBhajan ? (
            <div className="mt-1">
              <span className="font-display text-lg font-semibold text-ink">{selectedBhajan.title}</span>
              <span className="ml-2.5 inline-block text-[0.8rem] text-ink-faint">
                ({selectedBhajan.category} · {selectedBhajan.language})
              </span>
            </div>
          ) : (
            <p className="text-sm text-ink-faint mt-1 italic">No bhajan selected yet.</p>
          )}
        </div>

        <div className="flex gap-2">
          {selectedBhajan && (
            <button
              onClick={() => onSelect(null)}
              className="btn btn-ghost !px-3 !py-1 text-xs border border-line"
            >
              Clear Selection
            </button>
          )}
          <button
            onClick={() => {
              setIsOpen(true);
              resetSearchState();
            }}
            className="btn btn-primary !px-4 !py-1.5 text-xs font-semibold"
          >
            {selectedBhajan ? "Change Bhajan" : "Search Library"}
          </button>
        </div>
        {selectedBhajan && (
        <div className="mt-2 text-xs text-ink-soft bg-sand/10 border border-line/30 p-2.5 rounded max-w-lg leading-relaxed">
          <p className="font-semibold text-ink-faint uppercase tracking-wider text-[0.65rem] mb-1">Lyrics Preview</p>
          <p className="font-mono whitespace-pre-wrap italic">
            {selectedBhajan.lyrics.split("\n").slice(0, 3).join("\n")}
            {selectedBhajan.lyrics.split("\n").length > 3 ? " ..." : ""}
          </p>
        </div>
      )}
    </div>

      {/* Modal Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card relative w-full max-w-2xl bg-cream max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-lift"
            >
              {/* Header */}
              <div className="border-b border-line px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">
                  {suggestMode === "manual"
                    ? "Suggest New Bhajan"
                    : suggestMode === "import"
                    ? "Import from SaiRhythms"
                    : `Select Bhajan for ${slotName}`}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-ink-soft hover:text-ink text-2xl leading-none"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {suggestMode === "none" && (
                  <>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <input
                          type="search"
                          placeholder="Search title, lyrics..."
                          className="field"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>
                      <div className="sm:w-48">
                        <select
                          className="field"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="">All Allowed Categories</option>
                          {categoriesList.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-line gap-4 text-xs font-semibold overflow-x-auto pb-1 items-center justify-between">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setActiveTab("all")}
                          className={`pb-2 transition-colors ${activeTab === "all" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"}`}
                        >
                          All Library
                        </button>
                        <button
                          onClick={() => setActiveTab("fav")}
                          className={`pb-2 transition-colors ${activeTab === "fav" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"}`}
                        >
                          My Favourites ({myBhajans.favorites.length})
                        </button>
                        <button
                          onClick={() => setActiveTab("recent")}
                          className={`pb-2 transition-colors ${activeTab === "recent" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"}`}
                        >
                          Recently Used ({myBhajans.recentlyUsed.length})
                        </button>
                        <button
                          onClick={() => setActiveTab("suggest")}
                          className={`pb-2 transition-colors ${activeTab === "suggest" ? "text-terra-deep border-b-2 border-terra" : "text-ink-faint hover:text-ink"}`}
                        >
                          My Suggestions ({myBhajans.submitted.length})
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setSuggestMode("manual");
                          setTitle("");
                          setLyrics("");
                          setMeaning("");
                          setNotes("");
                          setError("");
                        }}
                        className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold shrink-0 mb-3"
                      >
                        + Suggest a Bhajan
                      </button>
                    </div>

                    {/* Bhajans List */}
                    <div className="space-y-2 max-h-[35vh] overflow-y-auto pr-1">
                      {filteredList.length === 0 ? (
                        <div className="py-12 text-center">
                          <p className="text-sm text-ink-soft">No matching bhajans found.</p>
                          <p className="text-xs text-ink-faint mt-1">If the bhajan doesn&rsquo;t exist, suggest it below.</p>
                        </div>
                      ) : (
                        filteredList.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => handleSelect(b)}
                            className="p-3 rounded-lg border border-line hover:border-gold hover:bg-sand/10 transition-colors cursor-pointer flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-ink text-sm sm:text-base">{b.title}</p>
                              <p className="text-xs text-ink-soft mt-0.5">
                                {b.category} · {b.language} · {b.tempo.replace("_", " ")} · {b.beatTaal || "No beat set"}
                              </p>
                              <p className="text-xs font-mono text-ink-soft/85 mt-1.5 italic bg-sand/15 p-1.5 rounded border border-line/20 whitespace-pre-wrap max-w-lg leading-relaxed">
                                {b.lyrics.split("\n").slice(0, 2).join("\n")}
                                {b.lyrics.split("\n").length > 2 ? " ..." : ""}
                              </p>
                              {b.status === "pending" && (
                                <span className="inline-block text-[0.65rem] uppercase font-bold text-terra bg-terra/5 border border-terra/20 px-1.5 py-0.5 rounded mt-1">
                                  Pending Review
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gold font-semibold uppercase tracking-wider">Select</span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {suggestMode === "manual" && (
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="label">Title *</label>
                        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Category *</label>
                        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} disabled={pending}>
                          <option value="">Select Deity / Category</option>
                          {(category && !(categoriesList as readonly string[]).includes(category)
                            ? [...categoriesList, category].sort()
                            : categoriesList
                          ).map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Language</label>
                        <input className="field" value={language} onChange={(e) => setLanguage(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Beat / Taal *</label>
                        <input className="field" placeholder="e.g. 8 Beat / Keherwa" value={beatTaal} onChange={(e) => setBeatTaal(e.target.value)} disabled={pending} />
                      </div>
                      <div>
                        <label className="label">Tempo *</label>
                        <select className="field" value={tempo} onChange={(e) => setTempo(e.target.value as BhajanTempo)} disabled={pending}>
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
                      <input className="field" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={pending} />
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
                    onSuccess={() => {
                      // We handle auto-selection inside success callback by fetching latest suggested bhajans
                      // In this component, SaiRhythmsImporter will suggest the bhajan and trigger onSuccess.
                      // Since we mock it in SaiRhythmsImporter.tsx, it'll run revalidate.
                      // Let's pass parent handler so we can auto-attach.
                      // To do that, let's look at how to get the ID. SaiRhythmsImporter returns onSuccess with message.
                      // For a smooth demo, we'll let the user search and select the newly added item from "My Suggestions".
                    }}
                    bhajans={allBhajans}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-line px-6 py-4 bg-sand/10 flex flex-wrap justify-between items-center gap-3">
                {suggestMode === "none" ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSuggestMode("import")}
                        className="btn btn-quiet !px-3.5 !py-1.5 text-xs font-semibold"
                      >
                        Import from SaiRhythms
                      </button>
                      <button
                        onClick={() => {
                          setSuggestMode("manual");
                          setTitle("");
                          setLyrics("");
                          setMeaning("");
                          setNotes("");
                          setError("");
                        }}
                        className="btn btn-quiet !px-3.5 !py-1.5 text-xs font-semibold"
                      >
                        Suggest Manually
                      </button>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="btn btn-ghost !px-4 !py-1.5 text-xs"
                    >
                      Cancel
                    </button>
                  </>
                ) : suggestMode === "manual" ? (
                  <>
                    <button
                      onClick={() => setSuggestMode("none")}
                      className="btn btn-ghost !px-4 !py-1.5 text-xs"
                      disabled={pending}
                    >
                      Back
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSuggestMode("none")}
                        className="btn btn-ghost !px-4 !py-1.5 text-xs"
                        disabled={pending}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSuggestManual}
                        className="btn btn-primary !px-4 !py-1.5 text-xs font-semibold"
                        disabled={pending}
                      >
                        {pending ? "Submitting..." : "Submit & Select"}
                      </button>
                    </div>
                  </>
                ) : (
                  // Handled inside CymRhythmImporter
                  null
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
