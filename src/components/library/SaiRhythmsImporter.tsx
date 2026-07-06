"use client";

import { useState, useTransition } from "react";
import { importFromSaiRhythms, submitBhajan } from "@/lib/actions";
import { motion } from "framer-motion";
import { type Bhajan, type BhajanTempo, BHAJAN_DEITY_OPTIONS, BHAJAN_TEMPO_OPTIONS } from "@/lib/types";
import { capitalizeEachWord, checkDuplicateBhajan } from "@/lib/bhajan-utils";

interface SaiRhythmsImporterProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
  bhajans: Bhajan[];
}

interface ImportedBhajanItem {
  id: string;
  url: string;
  title: string;
  lyrics: string;
  meaning: string;
  tempo: BhajanTempo;
  beatTaal: string;
  language: string;
  category: string;
  notes: string;
  
  isOpen: boolean;
  status: "idle" | "submitting" | "success" | "error";
  error: string | null;
  variationConfirm: Bhajan | null;
  bypassCheck: boolean;
}

function getTitleFromUrl(url: string): string {
  try {
    const parts = url.split("/");
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2] || "";
    return lastPart
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "SaiRhythms Song";
  }
}

export function SaiRhythmsImporter({ onClose, onSuccess, bhajans }: SaiRhythmsImporterProps) {
  const [urlsText, setUrlsText] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitting, startSubmitTransition] = useTransition();
  const [importedBhajans, setImportedBhajans] = useState<ImportedBhajanItem[]>([]);

  // Bulk progress state
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number } | null>(null);

  function handleFetch() {
    const urls = urlsText.split(/\s+/).filter(u => u.includes("sairhythms.sathyasai.org"));
    if (urls.length === 0) {
      setError("Please paste at least one valid SaiRhythms link.");
      return;
    }
    if (urls.length > 100) {
      setError("Please limit to 100 links at a time.");
      return;
    }
    setError("");

    setBulkProgress({ current: 0, total: urls.length });

    startTransition(async () => {
      const items: ImportedBhajanItem[] = [];
      for (let i = 0; i < urls.length; i++) {
        setBulkProgress({ current: i + 1, total: urls.length });
        const url = urls[i];
        try {
          const res = await importFromSaiRhythms(url);
          if (res.data) {
            const data = res.data;
            items.push({
              id: `import-${i}-${Date.now()}`,
              url,
              title: data.title || "",
              lyrics: data.lyrics || "",
              meaning: data.meaning || "",
              tempo: data.tempo || "medium",
              beatTaal: data.beatTaal || "",
              language: data.language || "Sanskrit",
              category: data.category || "",
              notes: data.notes || "",
              isOpen: i === 0,
              status: "idle",
              error: res.ok ? null : res.message,
              variationConfirm: null,
              bypassCheck: false,
            });
          } else {
            items.push({
              id: `import-${i}-${Date.now()}`,
              url,
              title: "",
              lyrics: "",
              meaning: "",
              tempo: "medium",
              beatTaal: "",
              language: "Sanskrit",
              category: "",
              notes: "",
              isOpen: i === 0,
              status: "error",
              error: res.message || "Failed to extract data.",
              variationConfirm: null,
              bypassCheck: false,
            });
          }
        } catch (err: any) {
          items.push({
            id: `import-${i}-${Date.now()}`,
            url,
            title: "",
            lyrics: "",
            meaning: "",
            tempo: "medium",
            beatTaal: "",
            language: "Sanskrit",
            category: "",
            notes: "",
            isOpen: i === 0,
            status: "error",
            error: err.message || "Failed to fetch page.",
            variationConfirm: null,
            bypassCheck: false,
          });
        }
      }
      setBulkProgress(null);
      setImportedBhajans(items);
    });
  }

  function updateItem(id: string, fields: Partial<ImportedBhajanItem>) {
    setImportedBhajans(prev =>
      prev.map(item => (item.id === id ? { ...item, ...fields } : item))
    );
  }

  function removeItem(id: string) {
    setImportedBhajans(prev => prev.filter(item => item.id !== id));
  }

  function toggleOpen(id: string) {
    setImportedBhajans(prev =>
      prev.map(item => (item.id === id ? { ...item, isOpen: !item.isOpen } : item))
    );
  }

  function handleSubmitAll() {
    setError("");

    // 1. Validation check
    let hasValidationError = false;
    const validated = importedBhajans.map(item => {
      if (item.status === "success") return item;

      const isInvalid =
        !item.title.trim() ||
        !item.lyrics.trim() ||
        !item.category.trim() ||
        !item.beatTaal.trim() ||
        !item.meaning.trim();

      if (isInvalid) {
        hasValidationError = true;
        return {
          ...item,
          status: "error" as const,
          error: "Please fill in all required fields (Title, Deity/Category, Beat, Lyrics, Meaning).",
          isOpen: true,
        };
      }
      return item;
    });

    if (hasValidationError) {
      setImportedBhajans(validated);
      setError("Some bhajans have validation errors. Please check and correct them.");
      return;
    }

    // 2. Submit non-succeeded items
    startSubmitTransition(async () => {
      const itemsToSubmit = validated.filter(b => b.status !== "success");
      let currentItems = [...validated];

      for (const item of itemsToSubmit) {
        setImportedBhajans(prev =>
          prev.map(p => (p.id === item.id ? { ...p, status: "submitting", error: null } : p))
        );

        const formattedLyrics = capitalizeEachWord(item.lyrics);

        if (!item.bypassCheck) {
          const { exactDuplicate, variationDuplicate } = checkDuplicateBhajan(
            item.title,
            formattedLyrics,
            bhajans
          );
          if (exactDuplicate) {
            currentItems = currentItems.map(p =>
              p.id === item.id
                ? {
                    ...p,
                    status: "error",
                    error: `This exact bhajan already exists in the library under the title '${exactDuplicate.title}'.`,
                    isOpen: true,
                  }
                : p
            );
            setImportedBhajans(currentItems);
            continue;
          }
          if (variationDuplicate) {
            currentItems = currentItems.map(p =>
              p.id === item.id
                ? {
                    ...p,
                    status: "error",
                    variationConfirm: variationDuplicate,
                    isOpen: true,
                  }
                : p
            );
            setImportedBhajans(currentItems);
            continue;
          }
        }

        try {
          const res = await submitBhajan({
            title: item.title,
            lyrics: formattedLyrics,
            meaning: item.meaning,
            tempo: item.tempo,
            beatTaal: item.beatTaal,
            language: item.language,
            category: item.category,
            notes: item.notes,
            sourceLink: item.url,
          });

          if (res.ok) {
            currentItems = currentItems.map(p =>
              p.id === item.id
                ? {
                    ...p,
                    status: "success",
                    error: null,
                    variationConfirm: null,
                    isOpen: false,
                  }
                : p
            );
            setImportedBhajans(currentItems);
          } else {
            currentItems = currentItems.map(p =>
              p.id === item.id
                ? {
                    ...p,
                    status: "error",
                    error: res.message,
                    isOpen: true,
                  }
                : p
            );
            setImportedBhajans(currentItems);
          }
        } catch (err: any) {
          currentItems = currentItems.map(p =>
            p.id === item.id
              ? {
                  ...p,
                  status: "error",
                  error: err.message || "An error occurred during submission.",
                  isOpen: true,
                }
              : p
          );
          setImportedBhajans(currentItems);
        }
      }

      const allSucceeded = currentItems.every(p => p.status === "success");
      if (allSucceeded && currentItems.length > 0) {
        onSuccess(`Successfully imported ${currentItems.length} bhajan(s).`);
        onClose();
      }
    });
  }

  const successCount = importedBhajans.filter(b => b.status === "success").length;
  const totalCount = importedBhajans.length;

  return (
    <div className="space-y-6">
      {importedBhajans.length === 0 && !bulkProgress ? (
        <div className="space-y-4">
          <div>
            <label className="label text-ink-soft">Paste SaiRhythms song links (up to 100)</label>
            <textarea
              className="field"
              rows={5}
              placeholder="https://sairhythms.sathyasai.org/song/sai-ram-sai-ram&#10;https://sairhythms.sathyasai.org/song/shiva-shambho"
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              disabled={pending}
            />
            <p className="mt-1.5 text-[0.8rem] text-ink-faint">
              Paste one or multiple links (separated by spaces or new lines). If you paste multiple links, we'll import them all at once!
            </p>
          </div>

          {error && <p className="text-sm text-terra font-medium">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost" disabled={pending}>
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFetch}
              className="btn btn-primary"
              disabled={pending}
            >
              {pending ? "Extracting..." : "Import Bhajan(s)"}
            </button>
          </div>
        </div>
      ) : bulkProgress ? (
        <div className="space-y-6 text-center py-8">
          <h3 className="font-display text-xl text-ink font-bold">Importing Bhajans</h3>
          <p className="text-ink-soft">
            Processing {bulkProgress.current} of {bulkProgress.total}...
          </p>
          <div className="w-full bg-sand/30 rounded-full h-3 max-w-sm mx-auto overflow-hidden border border-line mt-4">
            <div
              className="bg-terra h-3 rounded-full transition-all duration-300"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="flex justify-between items-center pb-2 border-b border-line">
            <div>
              <h3 className="font-display text-xl font-bold text-ink">Review Imported Bhajans</h3>
              <p className="text-xs text-ink-soft mt-1">
                Verify the details for each song below before adding them to the library.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-sand border border-line rounded">
              {successCount} / {totalCount} Submitted
            </span>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {importedBhajans.map((item, idx) => (
              <div
                key={item.id}
                className="card overflow-hidden border border-line transition-all duration-200"
              >
                {/* Accordion Header */}
                <div
                  onClick={() => toggleOpen(item.id)}
                  className="flex items-center justify-between px-4 py-3 bg-sand-deep/5 hover:bg-sand/30 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider whitespace-nowrap">
                      Bhajan {idx + 1}
                    </span>
                    <span className="font-medium text-ink truncate max-w-[120px] sm:max-w-md">
                      {item.title.trim() || getTitleFromUrl(item.url)}
                    </span>
                    
                    {/* Status Badges */}
                    {item.status === "success" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Submitted
                      </span>
                    )}
                    {item.status === "submitting" && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 animate-pulse">
                        <svg className="animate-spin h-3.5 w-3.5 text-sky-700" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting
                      </span>
                    )}
                    {item.status === "error" && item.error && !item.variationConfirm && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 max-w-[150px] truncate" title={item.error}>
                        Error: {item.error}
                      </span>
                    )}
                    {item.status === "error" && item.variationConfirm && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Needs Confirmation
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="p-1.5 text-ink-faint hover:text-terra rounded-md hover:bg-sand transition-colors"
                      title="Remove from list"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <span className="text-ink-faint">
                      {item.isOpen ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>

                {/* Accordion Body */}
                {item.isOpen && (
                  <div className="p-4 border-t border-line bg-white-warm space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label">Title *</label>
                        <input
                          className="field"
                          value={item.title}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          disabled={submitting || item.status === "success"}
                        />
                      </div>
                      <div>
                        <label className="label">Deity / Category *</label>
                        <select
                          className="field"
                          value={item.category}
                          onChange={(e) => updateItem(item.id, { category: e.target.value })}
                          disabled={submitting || item.status === "success"}
                        >
                          <option value="">Select Deity / Category</option>
                          {(item.category && !(BHAJAN_DEITY_OPTIONS as readonly string[]).includes(item.category)
                            ? [...BHAJAN_DEITY_OPTIONS, item.category].sort()
                            : BHAJAN_DEITY_OPTIONS
                          ).map((deity) => (
                            <option key={deity} value={deity}>{deity}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Language</label>
                        <input
                          className="field"
                          value={item.language}
                          onChange={(e) => updateItem(item.id, { language: e.target.value })}
                          disabled={submitting || item.status === "success"}
                        />
                      </div>
                      <div>
                        <label className="label">Beat *</label>
                        <input
                          className="field"
                          inputMode="numeric"
                          placeholder="e.g. 6, 7, 8, 10"
                          value={item.beatTaal}
                          onChange={(e) => updateItem(item.id, { beatTaal: e.target.value })}
                          disabled={submitting || item.status === "success"}
                        />
                        <p className="mt-1 text-[0.75rem] text-ink-faint">Number of beats only.</p>
                      </div>
                      <div>
                        <label className="label">Tempo *</label>
                        <select
                          className="field"
                          value={item.tempo}
                          onChange={(e) => updateItem(item.id, { tempo: e.target.value as BhajanTempo })}
                          disabled={submitting || item.status === "success"}
                        >
                          {BHAJAN_TEMPO_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Source Link (SaiRhythms)</label>
                        <input className="field" value={item.url} disabled />
                      </div>
                    </div>

                    <div>
                      <label className="label">Lyrics *</label>
                      <textarea
                        className="field text-sm leading-relaxed"
                        rows={Math.min(14, Math.max(5, item.lyrics.split("\n").length + 1))}
                        value={item.lyrics}
                        onChange={(e) => updateItem(item.id, { lyrics: e.target.value })}
                        disabled={submitting || item.status === "success"}
                      />
                      <p className="mt-1 text-[0.75rem] text-ink-faint">One line per line, exactly as sung.</p>
                    </div>

                    <div>
                      <label className="label">Meaning (English) *</label>
                      <textarea
                        className="w-full rounded-md border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm leading-relaxed text-sky-950 outline-none transition-colors focus:border-sky-400 disabled:opacity-60"
                        rows={Math.min(10, Math.max(3, item.meaning.split("\n").length + 1))}
                        value={item.meaning}
                        onChange={(e) => updateItem(item.id, { meaning: e.target.value })}
                        disabled={submitting || item.status === "success"}
                      />
                    </div>

                    <div>
                      <label className="label">Practice Notes (Optional)</label>
                      <input
                        className="field"
                        placeholder="e.g. Speed up on the second round"
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                        disabled={submitting || item.status === "success"}
                      />
                    </div>

                    {item.error && item.status !== "submitting" && !item.variationConfirm && (
                      <p className="text-sm text-terra font-medium">{item.error}</p>
                    )}

                    {item.variationConfirm && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-2 mt-2">
                        <p>
                          A bhajan with a similar title or lyrics already exists: <strong>{item.variationConfirm.title}</strong>. Is this a new variation?
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateItem(item.id, { bypassCheck: true, variationConfirm: null, status: "idle", error: null });
                            }}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700 transition-colors"
                          >
                            Yes, save as variation
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(item.id);
                            }}
                            className="px-2.5 py-1 bg-sand/30 hover:bg-sand/50 rounded text-xs font-semibold transition-colors"
                          >
                            No, it&rsquo;s the same (Remove)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-sm text-terra font-medium">{error}</p>}

          <div className="flex justify-between gap-3 pt-2 border-t border-line mt-4">
            <button
              type="button"
              onClick={() => setImportedBhajans([])}
              className="btn btn-ghost"
              disabled={submitting}
            >
              Back
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="btn btn-ghost" disabled={submitting}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAll}
                className="btn btn-primary"
                disabled={submitting || successCount === totalCount}
              >
                {submitting ? "Submitting..." : `Submit ${totalCount - successCount} Bhajan(s)`}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
