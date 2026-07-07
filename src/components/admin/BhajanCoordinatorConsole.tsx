"use client";

import { useState, useTransition } from "react";
import { updateBhajanStatus, editBhajan, deleteBhajan } from "@/lib/admin-actions";
import { formatShortDate } from "@/lib/format";
import {
  BHAJAN_DEITY_OPTIONS,
  BHAJAN_TEMPO_OPTIONS,
  type Bhajan,
  type BhajanTempo,
  type SaiForm,
  type FormResponse,
  type FormField,
} from "@/lib/types";
import { capitalizeEachWord, checkDuplicateBhajan } from "@/lib/bhajan-utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShareFormModal } from "./ShareFormModal";
import type { FormShareWithUser } from "@/lib/types";

interface BhajanCoordinatorConsoleProps {
  forms: SaiForm[];
  submissionsMap: Record<string, FormResponse[]>;
  sharesMap: Record<string, FormShareWithUser[]>;
  pendingBhajans: Bhajan[];
  allBhajans: Bhajan[];
}

export function BhajanCoordinatorConsole({
  forms,
  submissionsMap,
  sharesMap,
  pendingBhajans: initialPending,
  allBhajans: initialAll,
}: BhajanCoordinatorConsoleProps) {
  const [activeTab, setActiveTab] = useState<"sheets" | "suggested" | "library">("sheets");
  const [pending, startTransition] = useTransition();

  // Dynamic lists to support instant client-side state updates
  const [pendingList, setPendingList] = useState<Bhajan[]>(initialPending);
  const [bhajansList, setBhajansList] = useState<Bhajan[]>(initialAll);
  const [formsList, setFormsList] = useState<SaiForm[]>(forms);

  // Form selections
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id || "");

  // Editing bhajan state
  const [editingBhajan, setEditingBhajan] = useState<Bhajan | null>(null);
  const [variationConfirm, setVariationConfirm] = useState<Bhajan | null>(null);

  // Library search
  const [libSearch, setLibSearch] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const currentSubmissions = submissionsMap[selectedFormId] || [];
  const currentShares = sharesMap[selectedFormId] || [];

  // Distinct beat/taal values across the library, for the sign-up form limits
  const distinctBeats = Array.from(
    new Set(bhajansList.map((b) => b.beatTaal.trim()).filter(Boolean))
  ).sort();

  // Actions
  function handleStatusUpdate(bhajanId: string, status: "approved" | "rejected") {
    startTransition(async () => {
      const res = await updateBhajanStatus(bhajanId, status);
      if (res.ok) {
        setPendingList((prev) => prev.filter((b) => b.id !== bhajanId));
        if (status === "approved") {
          // Move from pending to bhajansList
          const approvedBhajan = pendingList.find((b) => b.id === bhajanId);
          if (approvedBhajan) {
            setBhajansList((prev) => [...prev, { ...approvedBhajan, status: "approved" }]);
          }
        }
      }
    });
  }


  function handleSaveBhajan(
    bypassCheck: boolean | React.MouseEvent = false,
    statusOverride?: "pending" | "approved"
  ) {
    if (!editingBhajan) return;
    if (!editingBhajan.title || !editingBhajan.lyrics || !editingBhajan.meaning || !editingBhajan.category || !editingBhajan.beatTaal) {
      alert("Title, lyrics, meaning, category, and beat/taal are required.");
      return;
    }

    const formattedLyrics = capitalizeEachWord(editingBhajan.lyrics);
    const shouldBypass = typeof bypassCheck === "boolean" ? bypassCheck : false;

    // Only run duplicate checks when creating a new bhajan
    if (!editingBhajan.id && !shouldBypass) {
      const { exactDuplicate, variationDuplicate } = checkDuplicateBhajan(
        editingBhajan.title,
        formattedLyrics,
        bhajansList,
        editingBhajan.sourceLink
      );
      if (exactDuplicate) {
        alert(`This exact bhajan already exists in the library under the title '${exactDuplicate.title}'.`);
        return;
      }
      if (variationDuplicate) {
        setVariationConfirm(variationDuplicate);
        return;
      }
    }

    const targetStatus = statusOverride || (editingBhajan.status === "pending" ? "pending" : "approved");

    setVariationConfirm(null);
    startTransition(async () => {
      const res = await editBhajan(editingBhajan.id, {
        title: editingBhajan.title,
        lyrics: formattedLyrics,
        meaning: editingBhajan.meaning,
        tempo: editingBhajan.tempo,
        beatTaal: editingBhajan.beatTaal,
        language: editingBhajan.language,
        category: editingBhajan.category,
        notes: editingBhajan.notes,
        sourceLink: editingBhajan.sourceLink,
        status: targetStatus,
      });

      if (res.ok) {
        if (!editingBhajan.id) {
          // New bhajan added - reload page to fetch newly added bhajan
          window.location.reload();
        } else {
          if (targetStatus === "approved") {
            // Remove from pendingList
            setPendingList((prev) => prev.filter((b) => b.id !== editingBhajan.id));
            // Add or update in bhajansList
            setBhajansList((prev) => {
              const exists = prev.some((b) => b.id === editingBhajan.id);
              if (exists) {
                return prev.map((b) => (b.id === editingBhajan.id ? { ...editingBhajan, lyrics: formattedLyrics, status: "approved" } : b));
              } else {
                return [...prev, { ...editingBhajan, lyrics: formattedLyrics, status: "approved" }];
              }
            });
          } else {
            // targetStatus is pending: update in pendingList, and make sure it is NOT in bhajansList
            setPendingList((prev) =>
              prev.map((b) => (b.id === editingBhajan.id ? { ...editingBhajan, lyrics: formattedLyrics, status: "pending" } : b))
            );
            setBhajansList((prev) => prev.filter((b) => b.id !== editingBhajan.id));
          }
          setEditingBhajan(null);
        }
      } else {
        alert(res.message);
      }
    });
  }

  function handleDeleteBhajan(bhajanId: string) {
    if (!confirm("Are you sure you want to delete this bhajan?")) return;
    startTransition(async () => {
      const res = await deleteBhajan(bhajanId);
      if (res.ok) {
        setBhajansList((prev) => prev.filter((b) => b.id !== bhajanId));
      } else {
        alert(res.message);
      }
    });
  }

  const filteredLibrary = bhajansList.filter((b) =>
    b.title.toLowerCase().includes(libSearch.toLowerCase()) ||
    b.category.toLowerCase().includes(libSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
        <div className="card p-5 border-line bg-white-warm text-center">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Bhajans in Book</p>
          <p className="mt-2 text-3xl font-display text-ink font-bold">{bhajansList.length}</p>
        </div>
        <div className="card p-5 border-line bg-white-warm text-center">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Pending Review</p>
          <p className={`mt-2 text-3xl font-display font-bold ${pendingList.length > 0 ? "text-terra" : "text-ink-soft"}`}>
            {pendingList.length}
          </p>
        </div>
        <div className="card p-5 border-line bg-white-warm text-center">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Sign-up Sheets</p>
          <p className="mt-2 text-3xl font-display text-ink font-bold">{formsList.length}</p>
        </div>
        <div className="card p-5 border-line bg-white-warm text-center">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Submissions</p>
          <p className="mt-2 text-3xl font-display text-ink font-bold">
            {Object.values(submissionsMap).reduce((sum, list) => sum + list.length, 0)}
          </p>
        </div>
      </div>

      <div className="flex border-b border-line gap-6 text-sm font-semibold overflow-x-auto pb-1 items-center justify-between">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab("sheets")}
            className={`pb-3 transition-colors relative ${activeTab === "sheets" ? "text-terra-deep border-b-2 border-terra" : "text-ink-soft hover:text-ink"}`}
          >
            Sign-Up Sheets
          </button>
          <button
            onClick={() => setActiveTab("suggested")}
            className={`pb-3 transition-colors relative ${activeTab === "suggested" ? "text-terra-deep border-b-2 border-terra" : "text-ink-soft hover:text-ink"}`}
          >
            Suggested Bhajans ({pendingList.length})
          </button>
          <button
            onClick={() => setActiveTab("library")}
            className={`pb-3 transition-colors relative ${activeTab === "library" ? "text-terra-deep border-b-2 border-terra" : "text-ink-soft hover:text-ink"}`}
          >
            Bhajan Library
          </button>
        </div>
        <a href="/admin/forms/new" className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold shrink-0 mb-3">
          + Create Form
        </a>
      </div>

      {/* Tab Panels */}
      <div>
        {/* Sheets Tab */}
        {activeTab === "sheets" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-ink-soft">Select Sign-up sheet:</label>
              <select
                className="field !py-1.5 !w-auto"
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
              >
                {formsList.map((f) => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
              <button 
                onClick={() => setShareModalOpen(true)}
                className="btn bg-sand border-line text-ink text-sm py-1.5 px-3"
              >
                Share
              </button>
            </div>

            {currentSubmissions.length === 0 ? (
              <div className="rounded-lg border border-line bg-sand/10 p-10 text-center text-ink-soft">
                No submissions received yet for this session.
              </div>
            ) : (
              <div className="space-y-4">
                {currentSubmissions.map((sub) => {
                  const currentForm = formsList.find(f => f.id === selectedFormId);
                  if (!currentForm) return null;
                  
                  return (
                  <div key={sub.id} className="card p-5 border-line bg-white-warm space-y-3">
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <div>
                        <span className="font-semibold text-ink">{sub.userName}</span>
                        <span className="text-xs text-ink-faint ml-2.5">({sub.userEmail})</span>
                      </div>
                      <span className="text-xs text-ink-faint">{formatShortDate(sub.createdAt)}</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 pt-2">
                      {currentForm.fields.map((field) => {
                        const answer = sub.answers[field.id];
                        if (!answer) return null;

                        if (field.type === "bhajan-select") {
                          const bh = bhajansList.find(b => b.id === answer);
                          if (!bh) return null;
                          return (
                            <div key={field.id} className="p-3 rounded bg-sand/20 border border-line/40 text-xs">
                              <p className="font-semibold text-ink-faint">{field.label}</p>
                              <a href={`/library/bhajans/${bh.id}`} target="_blank" rel="noopener noreferrer" className="font-display font-bold text-terra hover:text-terra-deep hover:underline mt-1 text-sm block">
                                {bh.title}
                              </a>
                              <p className="text-ink-soft mt-0.5">{bh.category} · {bh.language} · {bh.tempo.replace("_", " ")}</p>
                              {bh.status === "pending" && (
                                <span className="inline-block text-[0.6rem] font-bold text-terra uppercase mt-1">Pending Approval</span>
                              )}
                            </div>
                          );
                        }

                        // Render other generic fields
                        return (
                          <div key={field.id} className="p-3 rounded bg-sand/10 border border-line/30 text-xs">
                            <p className="font-semibold text-ink-faint">{field.label}</p>
                            <p className="text-ink mt-1">{String(answer)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Suggested Tab */}
        {activeTab === "suggested" && (
          <div className="space-y-4">
            {pendingList.length === 0 ? (
              <div className="rounded-lg border border-line bg-sand/10 p-10 text-center text-ink-soft">
                No pending bhajans to review. Great job!
              </div>
            ) : (
              <div className="space-y-4">
                {pendingList.map((bh) => (
                  <div key={bh.id} className="card p-5 border-line bg-white-warm space-y-4">
                    <div>
                      <h4 className="font-display text-xl font-bold text-ink">{bh.title}</h4>
                      <p className="text-xs text-ink-soft mt-1">
                        Category: **{bh.category}** · Language: **{bh.language}** · Tempo: **{bh.tempo.replace("_", " ")}** · Beat: **{bh.beatTaal || "Not specified"}**
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 bg-sand/20 p-4 rounded-lg border border-line/50 text-sm">
                      <div>
                        <p className="font-semibold text-ink-faint uppercase text-xs">Lyrics</p>
                        <p className="whitespace-pre-line mt-1.5 leading-relaxed font-mono">{bh.lyrics}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-ink-faint uppercase text-xs">Meaning</p>
                        <p className="mt-1.5 leading-relaxed text-ink-soft">{bh.meaning}</p>
                      </div>
                    </div>

                    {bh.notes && (
                      <div className="text-xs text-ink-soft">
                        <span className="font-semibold">Notes:</span> {bh.notes}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-line/60 justify-end">
                      <button
                        onClick={() => setEditingBhajan(bh)}
                        className="btn btn-ghost border border-line text-xs !px-4 !py-1.5 font-semibold text-ink"
                        disabled={pending}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(bh.id, "rejected")}
                        className="btn btn-ghost border border-red-200 text-red-700 hover:bg-red-50 text-xs !px-4 !py-1.5"
                        disabled={pending}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(bh.id, "approved")}
                        className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold"
                        disabled={pending}
                      >
                        Approve & Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-4">
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <input
                  type="search"
                  className="field"
                  placeholder="Search library by title or category..."
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                />
              </div>
              <button
                onClick={() =>
                  setEditingBhajan({
                    id: "",
                    title: "",
                    lyrics: "",
                    meaning: "",
                    tempo: "medium",
                    beatTaal: "",
                    language: "Sanskrit",
                    category: "Sai",
                    notes: "",
                    status: "approved",
                    sourceLink: null,
                    audioUrl: null,
                    videoUrl: null,
                  })
                }
                className="btn btn-primary text-xs !px-4 h-[38px] font-semibold shrink-0"
              >
                + Add Bhajan
              </button>
            </div>

            <div className="space-y-2">
              {filteredLibrary.map((b) => (
                <div key={b.id} className="card p-4 border-line bg-white-warm flex items-center justify-between gap-4">
                  <div>
                    <span className="font-semibold text-ink">{b.title}</span>
                    <span className="text-xs text-ink-faint ml-2.5">
                      ({b.category} · {b.language} · {b.tempo} · {b.beatTaal || "No beat"})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingBhajan(b)}
                      className="btn btn-ghost border border-line text-xs !px-3 !py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBhajan(b.id)}
                      className="btn btn-ghost border border-red-200 text-red-700 hover:bg-red-50 text-xs !px-3 !py-1"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Bhajan Modal */}
      <AnimatePresence>
        {editingBhajan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card relative w-full max-w-2xl bg-cream max-h-[85vh] flex flex-col justify-between overflow-hidden shadow-lift"
            >
              <div className="border-b border-line px-6 py-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-ink">
                  {editingBhajan.id ? "Edit Bhajan Details" : "Add New Bhajan"}
                </h3>
                <button
                  onClick={() => { setEditingBhajan(null); setVariationConfirm(null); }}
                  className="text-ink-soft hover:text-ink text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label">Title *</label>
                    <input
                      className="field"
                      value={editingBhajan.title}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Deity / Category *</label>
                    <select
                      className="field"
                      value={editingBhajan.category}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, category: e.target.value })}
                    >
                      <option value="">Select Deity / Category</option>
                      {(editingBhajan.category && !(BHAJAN_DEITY_OPTIONS as readonly string[]).includes(editingBhajan.category)
                        ? [...BHAJAN_DEITY_OPTIONS, editingBhajan.category].sort()
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
                      value={editingBhajan.language}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, language: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Beat / Taal *</label>
                    <input
                      className="field"
                      value={editingBhajan.beatTaal}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, beatTaal: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Tempo *</label>
                    <select
                      className="field"
                      value={editingBhajan.tempo}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, tempo: e.target.value as BhajanTempo })}
                    >
                      {BHAJAN_TEMPO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Source Link (Optional)</label>
                    <input
                      className="field"
                      value={editingBhajan.sourceLink || ""}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, sourceLink: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Lyrics *</label>
                  <textarea
                    className="field font-mono text-sm leading-relaxed"
                    rows={4}
                    value={editingBhajan.lyrics}
                    onChange={(e) => setEditingBhajan({ ...editingBhajan, lyrics: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Meaning *</label>
                  <textarea
                    className="field text-sm"
                    rows={2.5}
                    value={editingBhajan.meaning}
                    onChange={(e) => setEditingBhajan({ ...editingBhajan, meaning: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Notes</label>
                  <input
                    className="field"
                    value={editingBhajan.notes || ""}
                    onChange={(e) => setEditingBhajan({ ...editingBhajan, notes: e.target.value })}
                  />
                </div>
                {variationConfirm && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-sm space-y-2 mt-4">
                    <p>
                      A bhajan with a similar title or lyrics already exists: <strong>{variationConfirm.title}</strong>. Is this a new variation?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveBhajan(true)}
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

              <div className="border-t border-line px-6 py-4 bg-sand/10 flex justify-end gap-2">
                <button onClick={() => { setEditingBhajan(null); setVariationConfirm(null); }} className="btn btn-ghost text-xs !px-4 !py-1.5" disabled={pending}>
                  Cancel
                </button>
                {editingBhajan.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleSaveBhajan(false, "pending")}
                      className="btn btn-ghost border border-line text-xs !px-4 !py-1.5 font-semibold text-ink"
                      disabled={pending}
                    >
                      {pending ? "Saving..." : "Save as Pending"}
                    </button>
                    <button
                      onClick={() => handleSaveBhajan(false, "approved")}
                      className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold"
                      disabled={pending}
                    >
                      {pending ? "Saving..." : "Save & Approve"}
                    </button>
                  </>
                ) : (
                  <button onClick={() => handleSaveBhajan(false, "approved")} className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold" disabled={pending}>
                    {pending ? "Saving..." : editingBhajan.id ? "Save Changes" : "Add Bhajan"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterToggleRow({
  label,
  options,
  optionLabels,
  selected,
  onChange,
  emptyNote,
}: {
  label: string;
  options: string[];
  optionLabels?: Record<string, string>;
  selected: string[];
  onChange: (next: string[]) => void;
  emptyNote?: string;
}) {
  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );

  return (
    <div>
      <p className="label !mb-2">
        {label}
        <span className="ml-2 font-normal text-ink-faint">
          {selected.length === 0 ? "(no limit)" : `(${selected.length} selected)`}
        </span>
      </p>
      {options.length === 0 ? (
        <p className="text-[0.8rem] text-ink-faint">{emptyNote ?? "No options yet."}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                onClick={() => toggle(o)}
                aria-pressed={on}
                className={`rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors ${
                  on
                    ? "bg-terra text-white"
                    : "bg-white-warm text-ink-soft border border-line hover:border-gold"
                }`}
              >
                {optionLabels?.[o] ?? o}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
