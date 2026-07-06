"use client";

import { useState, useTransition } from "react";
import { parseCymRhythmUrl } from "@/lib/cymrhythm";
import { submitBhajan } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

interface CymRhythmImporterProps {
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function CymRhythmImporter({ onClose, onSuccess }: CymRhythmImporterProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [submitting, startSubmitTransition] = useTransition();
  const [importedData, setImportedData] = useState<any>(null);

  // Review editable states
  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [meaning, setMeaning] = useState("");
  const [tempo, setTempo] = useState<"slow" | "medium" | "fast">("medium");
  const [beatTaal, setBeatTaal] = useState("");
  const [language, setLanguage] = useState("Sanskrit");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  function handleFetch() {
    if (!url) {
      setError("Please paste a CymRhythm URL.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const data = await parseCymRhythmUrl(url);
        setImportedData(data);
        setTitle(data.title || "");
        setLyrics(data.lyrics || "");
        setMeaning(data.meaning || "");
        setTempo(data.tempo || "medium");
        setBeatTaal(data.beatTaal || "8 Beat / Keherwa");
        setLanguage(data.language || "Sanskrit");
        setCategory(data.category || "Sai");
        setNotes(data.notes || "");
      } catch (err: any) {
        setError(err.message || "Failed to parse the URL. Please verify it and try again.");
      }
    });
  }

  function handleSubmit() {
    if (!title || !lyrics || !meaning || !category || !beatTaal) {
      setError("Title, lyrics, meaning, category (theme), and beat/taal are required.");
      return;
    }
    setError("");
    startSubmitTransition(async () => {
      const res = await submitBhajan({
        title,
        lyrics,
        meaning,
        tempo,
        beatTaal,
        language,
        category,
        notes,
        sourceLink: url,
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
      {!importedData ? (
        <div className="space-y-4">
          <div>
            <label className="label text-ink-soft">Paste CymRhythm Bhajan URL</label>
            <input
              type="url"
              className="field"
              placeholder="https://www.cymrhythm.com/bhajans/shiva-shambho"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={pending}
            />
            <p className="mt-1.5 text-[0.8rem] text-ink-faint">
              Example: Try pasting `https://www.cymrhythm.com/bhajans/shiva-shambho` to see auto-extraction work.
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
              {pending ? "Extracting..." : "Import Bhajan"}
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
            <p className="text-xs font-semibold text-gold uppercase tracking-wider">Successfully Extracted</p>
            <p className="text-sm text-ink-soft mt-1">Please review and refine the extracted bhajan details below.</p>
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
              <input
                className="field"
                placeholder="e.g. Shiva, Ganesha, Sai, Krishna"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={submitting}
              />
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
              <label className="label">Beat / Taal *</label>
              <input
                className="field"
                placeholder="e.g. 8 Beat / Keherwa"
                value={beatTaal}
                onChange={(e) => setBeatTaal(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div>
              <label className="label">Tempo *</label>
              <select
                className="field"
                value={tempo}
                onChange={(e: any) => setTempo(e.target.value)}
                disabled={submitting}
              >
                <option value="slow">Slow</option>
                <option value="medium">Medium</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <div>
              <label className="label">Source Link (CymRhythm)</label>
              <input className="field" value={url} disabled />
            </div>
          </div>

          <div>
            <label className="label">Lyrics *</label>
            <textarea
              className="field font-mono text-sm leading-relaxed"
              rows={5}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="label">Meaning *</label>
            <textarea
              className="field text-sm"
              rows={3}
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

          <div className="flex justify-between gap-3 pt-2 border-t border-line">
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
