"use client";

import { useState, useTransition } from "react";
import { updateBhajanStatus, saveBhajanSignUpForm, editBhajan, deleteBhajan } from "@/lib/admin-actions";
import { formatShortDate } from "@/lib/format";
import type { Bhajan, BhajanSignUpForm, BhajanSubmission } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface BhajanCoordinatorConsoleProps {
  forms: BhajanSignUpForm[];
  submissionsMap: Record<string, BhajanSubmission[]>;
  pendingBhajans: Bhajan[];
  allBhajans: Bhajan[];
}

export function BhajanCoordinatorConsole({
  forms,
  submissionsMap,
  pendingBhajans: initialPending,
  allBhajans: initialAll,
}: BhajanCoordinatorConsoleProps) {
  const [activeTab, setActiveTab] = useState<"sheets" | "suggested" | "forms" | "library">("sheets");
  const [pending, startTransition] = useTransition();

  // Dynamic lists to support instant client-side state updates
  const [pendingList, setPendingList] = useState<Bhajan[]>(initialPending);
  const [bhajansList, setBhajansList] = useState<Bhajan[]>(initialAll);
  const [formsList, setFormsList] = useState<BhajanSignUpForm[]>(forms);

  // Form selections
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id || "");
  const [editingForm, setEditingForm] = useState<Partial<BhajanSignUpForm> | null>(null);

  // Editing bhajan state
  const [editingBhajan, setEditingBhajan] = useState<Bhajan | null>(null);

  // Library search
  const [libSearch, setLibSearch] = useState("");

  const currentSubmissions = submissionsMap[selectedFormId] || [];

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

  function handleSaveForm() {
    if (!editingForm?.title || !editingForm?.openDate || !editingForm?.closeDate || !editingForm?.bhajansRequired) {
      alert("Please fill in all required form fields.");
      return;
    }
    startTransition(async () => {
      const res = await saveBhajanSignUpForm({
        id: editingForm.id,
        title: editingForm.title || "",
        description: editingForm.description || "",
        openDate: editingForm.openDate || "",
        closeDate: editingForm.closeDate || "",
        bhajansRequired: editingForm.bhajansRequired || 1,
        allowedCategories: editingForm.allowedCategories || [],
        published: editingForm.published ?? false,
      });

      if (res.ok) {
        alert(res.message);
        // Refresh local list (simplification: page refresh is triggered inside server actions)
        setEditingForm(null);
        window.location.reload();
      } else {
        alert(res.message);
      }
    });
  }

  function handleSaveBhajan() {
    if (!editingBhajan) return;
    startTransition(async () => {
      const res = await editBhajan(editingBhajan.id, {
        title: editingBhajan.title,
        lyrics: editingBhajan.lyrics,
        meaning: editingBhajan.meaning,
        tempo: editingBhajan.tempo,
        beatTaal: editingBhajan.beatTaal,
        language: editingBhajan.language,
        category: editingBhajan.category,
        notes: editingBhajan.notes,
        sourceLink: editingBhajan.sourceLink,
      });

      if (res.ok) {
        setBhajansList((prev) =>
          prev.map((b) => (b.id === editingBhajan.id ? editingBhajan : b))
        );
        setEditingBhajan(null);
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

      {/* Tabs */}
      <div className="flex border-b border-line gap-6 text-sm font-semibold overflow-x-auto pb-1">
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
          onClick={() => setActiveTab("forms")}
          className={`pb-3 transition-colors relative ${activeTab === "forms" ? "text-terra-deep border-b-2 border-terra" : "text-ink-soft hover:text-ink"}`}
        >
          Manage Sign-up Forms
        </button>
        <button
          onClick={() => setActiveTab("library")}
          className={`pb-3 transition-colors relative ${activeTab === "library" ? "text-terra-deep border-b-2 border-terra" : "text-ink-soft hover:text-ink"}`}
        >
          Bhajan Library
        </button>
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
            </div>

            {currentSubmissions.length === 0 ? (
              <div className="rounded-lg border border-line bg-sand/10 p-10 text-center text-ink-soft">
                No submissions received yet for this session.
              </div>
            ) : (
              <div className="space-y-4">
                {currentSubmissions.map((sub) => (
                  <div key={sub.id} className="card p-5 border-line bg-white-warm space-y-3">
                    <div className="flex items-center justify-between border-b border-line pb-2.5">
                      <div>
                        <span className="font-semibold text-ink">{sub.userName}</span>
                        <span className="text-xs text-ink-faint ml-2.5">({sub.userEmail})</span>
                      </div>
                      <span className="text-xs text-ink-faint">{formatShortDate(sub.createdAt)}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {sub.bhajans?.map((bh, i) => (
                        <div key={bh.id} className="p-3 rounded bg-sand/20 border border-line/40 text-xs">
                          <p className="font-semibold text-ink-faint">Slot #{i + 1}</p>
                          <p className="font-display font-bold text-ink mt-1 text-sm">{bh.title}</p>
                          <p className="text-ink-soft mt-0.5">{bh.category} · {bh.language} · {bh.tempo}</p>
                          {bh.status === "pending" && (
                            <span className="inline-block text-[0.6rem] font-bold text-terra uppercase mt-1">Pending Approval</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                        Category: **{bh.category}** · Language: **{bh.language}** · Tempo: **{bh.tempo}** · Beat: **{bh.beatTaal || "Not specified"}**
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

        {/* Forms Tab */}
        {activeTab === "forms" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-ink text-sm sm:text-base">Devotional Sign-up Forms</h3>
              {!editingForm && (
                <button
                  onClick={() =>
                    setEditingForm({
                      title: "",
                      description: "",
                      openDate: new Date().toISOString().slice(0, 10),
                      closeDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                      bhajansRequired: 2,
                      allowedCategories: [],
                      published: false,
                    })
                  }
                  className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold"
                >
                  + Create Form
                </button>
              )}
            </div>

            {editingForm ? (
              <div className="card p-6 border-line bg-white-warm space-y-4">
                <h4 className="font-display text-lg font-bold text-ink">{editingForm.id ? "Edit Sign-up Form" : "Create Sign-up Form"}</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Form Title *</label>
                    <input
                      className="field"
                      value={editingForm.title || ""}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label">Slots Required *</label>
                    <input
                      type="number"
                      className="field"
                      min={1}
                      value={editingForm.bhajansRequired || 1}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, bhajansRequired: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div>
                    <label className="label">Open Date *</label>
                    <input
                      type="date"
                      className="field"
                      value={editingForm.openDate?.slice(0, 10) || ""}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, openDate: new Date(e.target.value).toISOString() }))}
                    />
                  </div>
                  <div>
                    <label className="label">Close Date *</label>
                    <input
                      type="date"
                      className="field"
                      value={editingForm.closeDate?.slice(0, 10) || ""}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, closeDate: new Date(e.target.value).toISOString() }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Description (Optional)</label>
                    <textarea
                      className="field"
                      rows={2.5}
                      value={editingForm.description || ""}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Allowed Categories (Comma separated list, leave blank for any category)</label>
                    <input
                      className="field"
                      placeholder="e.g. Ganesha, Shiva, Sai, Krishna"
                      value={editingForm.allowedCategories?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingForm((prev) => ({
                          ...prev,
                          allowedCategories: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="published"
                      className="rounded border-line text-terra focus:ring-terra"
                      checked={editingForm.published || false}
                      onChange={(e) => setEditingForm((prev) => ({ ...prev, published: e.target.checked }))}
                    />
                    <label htmlFor="published" className="text-sm font-semibold text-ink-soft cursor-pointer">
                      Publish Immediately
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-line/60">
                  <button onClick={() => setEditingForm(null)} className="btn btn-ghost text-xs !px-4 !py-1.5" disabled={pending}>
                    Cancel
                  </button>
                  <button onClick={handleSaveForm} className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold" disabled={pending}>
                    {pending ? "Saving..." : "Save Form"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {formsList.map((f) => (
                  <div key={f.id} className="card p-4 border-line bg-white-warm flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-semibold text-ink">{f.title}</h4>
                      <p className="text-xs text-ink-soft mt-1">
                        Slots: **{f.bhajansRequired}** · Published: **{f.published ? "Yes" : "No"}** · Deadline: **{formatShortDate(f.closeDate)}**
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingForm(f)}
                      className="btn btn-ghost border border-line text-xs !px-3 !py-1"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="search"
                className="field"
                placeholder="Search library by title or category..."
                value={libSearch}
                onChange={(e) => setLibSearch(e.target.value)}
              />
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
                <h3 className="font-display text-xl font-bold text-ink">Edit Bhajan Details</h3>
                <button
                  onClick={() => setEditingBhajan(null)}
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
                    <input
                      className="field"
                      value={editingBhajan.category}
                      onChange={(e) => setEditingBhajan({ ...editingBhajan, category: e.target.value })}
                    />
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
                      onChange={(e: any) => setEditingBhajan({ ...editingBhajan, tempo: e.target.value })}
                    >
                      <option value="slow">Slow</option>
                      <option value="medium">Medium</option>
                      <option value="fast">Fast</option>
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
              </div>

              <div className="border-t border-line px-6 py-4 bg-sand/10 flex justify-end gap-2">
                <button onClick={() => setEditingBhajan(null)} className="btn btn-ghost text-xs !px-4 !py-1.5" disabled={pending}>
                  Cancel
                </button>
                <button onClick={handleSaveBhajan} className="btn btn-primary text-xs !px-4 !py-1.5 font-semibold" disabled={pending}>
                  {pending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
