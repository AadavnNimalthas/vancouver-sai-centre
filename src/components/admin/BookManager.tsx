"use client";

import { useState, useTransition } from "react";
import { deleteBook, saveBook } from "@/lib/admin-actions";
import type { Book } from "@/lib/types";

const EMPTY = { title: "", author: "", category: "", description: "", available: true };

export function BookManager({ books }: { books: Book[] }) {
  const [local, setLocal] = useState(books);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function startEdit(b: Book) {
    setEditingId(b.id);
    setDraft({
      title: b.title,
      author: b.author,
      category: b.category,
      description: b.description,
      available: b.available,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveBook({ id: editingId ?? undefined, ...draft });
      setMessage(result.message);
      if (!result.ok) return;
      const asBook: Book = {
        id: editingId ?? `local-${Date.now()}`,
        ...draft,
        createdAt: new Date().toISOString(),
      };
      setLocal((bs) =>
        editingId ? bs.map((b) => (b.id === editingId ? asBook : b)) : [asBook, ...bs]
      );
      reset();
    });
  }

  function handleDelete(id: string) {
    setLocal((bs) => bs.filter((b) => b.id !== id));
    if (editingId === id) reset();
    startTransition(() => {
      deleteBook(id);
    });
  }

  return (
    <div>
      <div className="card p-7 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {editingId ? "Edit book" : "Add a book"}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input className="field" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Author</label>
            <input className="field" value={draft.author} onChange={(e) => setDraft({ ...draft, author: e.target.value })} />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="field"
              placeholder="Discourses, biography, children..."
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink">
              <input
                type="checkbox"
                checked={draft.available}
                onChange={(e) => setDraft({ ...draft, available: e.target.checked })}
                className="accent-[var(--color-terra)]"
              />
              Available to borrow
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <input className="field" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button onClick={handleSave} disabled={pending || !draft.title} className="btn btn-primary">
            {editingId ? "Save changes" : "Add book"}
          </button>
          {editingId && <button onClick={reset} className="btn btn-ghost">Cancel</button>}
          {message && <p className="text-[0.875rem] text-ink-soft">{message}</p>}
        </div>
      </div>

      <div className="card scroll-x mt-8">
        <table className="table-warm w-full min-w-[640px]">
          <thead>
            <tr>
              <th>Book</th>
              <th>Author</th>
              <th>Category</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-soft">
                  No books catalogued yet.
                </td>
              </tr>
            )}
            {local.map((b) => (
              <tr key={b.id}>
                <td className="font-medium text-ink">{b.title}</td>
                <td className="text-ink-soft">{b.author}</td>
                <td className="text-ink-soft">{b.category}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${
                      b.available ? "bg-gold-soft text-ink" : "bg-sand text-ink-faint"
                    }`}
                  >
                    {b.available ? "Available" : "On loan"}
                  </span>
                </td>
                <td className="whitespace-nowrap text-right">
                  <button onClick={() => startEdit(b)} className="link-editorial mr-4 text-[0.85rem]">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
