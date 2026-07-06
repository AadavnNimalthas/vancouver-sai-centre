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

export function SaiRhythmsImporter({ onClose, onSuccess, bhajans }: SaiRhythmsImporterProps) {
  const [urlsText, setUrlsText] = useState("");
  const [singleUrl, setSingleUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitting, startSubmitTransition] = useTransition();
  const [importedData, setImportedData] = useState<Partial<import("@/lib/types").Bhajan> | null>(null);
  const [variationConfirm, setVariationConfirm] = useState<Bhajan | null>(null);

  // Bulk import states
  const [bulkProgress, setBulkProgress] = useState<{ current: number, total: number } | null>(null);
  const [bulkResults, setBulkResults] = useState<{ success: number; skipped: number; failed: { url: string, reason: string }[] } | null>(null);

  // Review editable states for single import
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [meaning, setMeaning] = useState("");
  const [tempo, setTempo] = useState<BhajanTempo>("medium");
  const [beatTaal, setBeatTaal] = useState("");
  const [language, setLanguage] = useState("Sanskrit");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  function applyData(data: Partial<Bhajan>) {
    setImportedData(data);
    setTitle(data.title || "");
    setLyrics(data.lyrics || "");
    setMeaning(data.meaning || "");
    setTempo(data.tempo || "medium");
    setBeatTaal(data.beatTaal || "");
    setLanguage(data.language || "Sanskrit");
    setCategory(data.category || "");
    setNotes(data.notes || "");
  }

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

    if (urls.length === 1) {
      // Single URL: Use existing review flow
      setSingleUrl(urls[0]);
      startTransition(async () => {
        const res = await importFromSaiRhythms(urls[0]);
        if (res.data) {
          applyData(res.data);
          if (!res.ok) setError(res.message);
        } else {
          setError(res.message);
        }
      });
    } else {
      // Bulk flow
      setBulkProgress({ current: 0, total: urls.length });
      processBulk(urls);
    }
  }

  async function processBulk(urls: string[]) {
    let success = 0;
    let skipped = 0;
    const failed: { url: string, reason: string }[] = [];

    for (let i = 0; i < urls.length; i++) {
      setBulkProgress({ current: i + 1, total: urls.length });
      
      const url = urls[i];
      try {
        const res = await importFromSaiRhythms(url);
        if (!res.data) {
          failed.push({ url, reason: res.message });
          continue;
        }
        
        const data = res.data;
        const title = data.title || "";
        const lyrics = capitalizeEachWord(data.lyrics || "");
        
        if (!title || !lyrics) {
          failed.push({ url, reason: "Missing required title or lyrics." });
          continue;
        }

        const { exactDuplicate } = checkDuplicateBhajan(title, lyrics, bhajans);
        if (exactDuplicate) {
          skipped++;
          continue;
        }

        const submitRes = await submitBhajan({
          title,
          lyrics,
          meaning: data.meaning || "No meaning provided.",
          tempo: data.tempo || "medium",
          beatTaal: data.beatTaal || "Unknown",
          language: data.language || "Sanskrit",
          category: data.category || "Sai",
          notes: "",
          sourceLink: url,
        });

        if (submitRes.ok) {
          success++;
        } else {
          failed.push({ url, reason: submitRes.message });
        }
      } catch (err: any) {
        failed.push({ url, reason: err.message || "Unknown error" });
      }
    }

    setBulkProgress(null);
    setBulkResults({ success, skipped, failed });
  }

  function handleSubmit(bypassCheck: boolean | React.MouseEvent = false) {
    if (!title || !lyrics || !meaning || !category || !beatTaal) {
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
    startSubmitTransition(async () => {
      const res = await submitBhajan({
        title,
        lyrics: formattedLyrics,
        meaning,
        tempo,
        beatTaal,
        language,
        category,
        notes,
        sourceLink: singleUrl,
      });

      if (res.ok) {
        onSuccess(res.message);
        onClose();
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      {!importedData && !bulkProgress && !bulkResults ? (
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
      ) : bulkResults ? (
        <div className="space-y-6">
          <div className="rounded-lg bg-sand/20 p-6 border border-line text-center space-y-2">
            <h3 className="font-display text-2xl text-ink font-bold">Import Complete</h3>
            <p className="text-ink-soft">
              Successfully imported <strong>{bulkResults.success}</strong> bhajans.
            </p>
            {bulkResults.skipped > 0 && (
              <p className="text-sm text-ink-faint">
                {bulkResults.skipped} skipped (already existed in the library).
              </p>
            )}
          </div>

          {bulkResults.failed.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold text-terra text-sm">Failed Imports ({bulkResults.failed.length}):</p>
              <div className="max-h-48 overflow-y-auto border border-terra/20 rounded p-2 bg-terra/5 space-y-2 text-xs">
                {bulkResults.failed.map((f, i) => (
                  <div key={i} className="flex flex-col gap-0.5 pb-2 border-b border-terra/10 last:border-0 last:pb-0">
                    <a href={f.url} target="_blank" rel="noreferrer" className="text-terra hover:underline break-all">
                      {f.url}
                    </a>
                    <span className="text-terra-deep">{f.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-line mt-4">
            <button
              type="button"
              onClick={() => {
                onSuccess(`Bulk import complete. Imported ${bulkResults.success} bhajans.`);
                onClose();
              }}
              className="btn btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <div className="rounded-lg bg-sand/20 p-4 border border-line">
            <p className="text-xs font-semibold text-gold uppercase tracking-wider">Imported from SaiRhythms</p>
            <p className="text-sm text-ink-soft mt-1">Please review the details below, then submit to the library.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Title *</label>
              <input
                className="field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="label">Deity / Category *</label>
              <select
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select Deity / Category</option>
                {(category && !(BHAJAN_DEITY_OPTIONS as readonly string[]).includes(category)
                  ? [...BHAJAN_DEITY_OPTIONS, category].sort()
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
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="label">Beat *</label>
              <input
                className="field"
                inputMode="numeric"
                placeholder="e.g. 6, 7, 8, 10"
                value={beatTaal}
                onChange={(e) => setBeatTaal(e.target.value)}
                disabled={submitting}
              />
              <p className="mt-1 text-[0.75rem] text-ink-faint">Number of beats only.</p>
            </div>
            <div>
              <label className="label">Tempo *</label>
              <select
                className="field"
                value={tempo}
                onChange={(e) => setTempo(e.target.value as BhajanTempo)}
                disabled={submitting}
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
              <input className="field" value={singleUrl} disabled />
            </div>
          </div>

          <div>
            <label className="label">Lyrics *</label>
            <textarea
              className="field text-sm leading-relaxed"
              rows={Math.min(14, Math.max(5, lyrics.split("\n").length + 1))}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              disabled={submitting}
            />
            <p className="mt-1 text-[0.75rem] text-ink-faint">One line per line, exactly as sung.</p>
          </div>

          {/* English meaning — mirrors the blue description box on SaiRhythms */}
          <div>
            <label className="label">Meaning (English) *</label>
            <textarea
              className="w-full rounded-md border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm leading-relaxed text-sky-950 outline-none transition-colors focus:border-sky-400 disabled:opacity-60"
              rows={Math.min(10, Math.max(3, meaning.split("\n").length + 1))}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="label">Practice Notes (Optional)</label>
            <input
              className="field"
              placeholder="e.g. Speed up on the second round"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </div>

          {error && <p className="text-sm text-terra font-medium">{error}</p>}
          {variationConfirm && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-2 mt-4">
              <p>
                A bhajan with a similar title or lyrics already exists: <strong>{variationConfirm.title}</strong>. Is this a new variation?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleSubmit(true)}
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

          <div className="flex justify-between gap-3 pt-2 border-t border-line mt-4">
            <button
              type="button"
              onClick={() => setImportedData(null)}
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
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit to Library"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
