"use client";

import { useState, useTransition } from "react";
import { deleteAlbum, saveAlbum } from "@/lib/admin-actions";
import type { Album } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

const EMPTY = {
  title: "",
  description: "",
  coverUrl: "",
  date: new Date().toISOString().slice(0, 10),
  googlePhotosUrl: "",
};

export function GalleryManager({ albums }: { albums: Album[] }) {
  const [local, setLocal] = useState(albums);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function startEdit(a: Album) {
    setEditingId(a.id);
    setDraft({
      title: a.title,
      description: a.description,
      coverUrl: a.coverUrl,
      date: a.date,
      googlePhotosUrl: a.googlePhotosUrl ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAlbum({
        id: editingId ?? undefined,
        title: draft.title,
        description: draft.description,
        coverUrl: draft.coverUrl,
        date: draft.date,
        googlePhotosUrl: draft.googlePhotosUrl || null,
      });
      setMessage(result.message);
      if (!result.ok) return;
      const asAlbum: Album = {
        id: editingId ?? `local-${Date.now()}`,
        title: draft.title,
        description: draft.description,
        coverUrl: draft.coverUrl,
        date: draft.date,
        googlePhotosUrl: draft.googlePhotosUrl || null,
        eventId: null,
        photos: local.find((a) => a.id === editingId)?.photos ?? [],
      };
      setLocal((as) =>
        editingId ? as.map((a) => (a.id === editingId ? asAlbum : a)) : [asAlbum, ...as]
      );
      reset();
    });
  }

  function handleDelete(id: string) {
    setLocal((as) => as.filter((a) => a.id !== id));
    if (editingId === id) reset();
    startTransition(() => {
      deleteAlbum(id);
    });
  }

  return (
    <div>
      <div className="card p-7 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {editingId ? "Edit album" : "Publish an album"}
        </h2>
        <p className="mt-1 text-[0.875rem] text-ink-soft">
          Paste a shared Google Photos album link, add a title and a short
          description, and publish. The gallery page links straight to the
          album, so photos are managed in Google Photos.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Google Photos album link</label>
            <input
              className="field"
              placeholder="https://photos.app.goo.gl/..."
              value={draft.googlePhotosUrl}
              onChange={(e) => setDraft({ ...draft, googlePhotosUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Album title</label>
            <input
              className="field"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="field"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <input
              className="field"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Cover image URL</label>
            <input
              className="field"
              placeholder="A photo URL to use as the album cover"
              value={draft.coverUrl}
              onChange={(e) => setDraft({ ...draft, coverUrl: e.target.value })}
            />
            <p className="mt-1.5 text-[0.8rem] text-ink-faint">
              Tip: open any photo in the album, right-click it, and copy the
              image address.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={handleSave}
            disabled={pending || !draft.title}
            className="btn btn-primary"
          >
            {editingId ? "Save changes" : "Publish album"}
          </button>
          {editingId && (
            <button onClick={reset} className="btn btn-ghost">Cancel</button>
          )}
          {message && <p className="text-[0.875rem] text-ink-soft">{message}</p>}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {local.length === 0 && (
          <p className="card col-span-full p-10 text-center text-ink-soft">
            No albums yet. Publish the first one above.
          </p>
        )}
        {local.map((a) => (
          <div key={a.id} className="card overflow-hidden">
            {a.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.coverUrl} alt="" className="aspect-[3/2] w-full object-cover" />
            ) : (
              <div className="flex aspect-[3/2] items-center justify-center bg-sand text-ink-faint">
                No cover image
              </div>
            )}
            <div className="p-5">
              <p className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">
                {formatShortDate(a.date)}
              </p>
              <h3 className="mt-1 font-display text-xl text-ink">{a.title}</h3>
              <p className="mt-1 text-[0.85rem] text-ink-soft">{a.description}</p>
              <div className="mt-3 flex gap-4 text-[0.85rem]">
                <button onClick={() => startEdit(a)} className="link-editorial">Edit</button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-ink-faint underline underline-offset-4 hover:text-terra-deep"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
