"use client";

import { useState, useTransition } from "react";
import { deletePost, savePost, type PostInput } from "@/lib/admin-actions";
import { POST_PLACEMENTS, type Post, type PostPlacement } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

const EMPTY: PostInput = {
  title: "",
  description: "",
  body: "",
  imageUrl: null,
  videoUrl: null,
  instagramUrl: null,
  ctaLabel: null,
  ctaUrl: null,
  placements: ["announcements"],
  membersOnly: false,
  published: true,
};

export function PostManager({ posts }: { posts: Post[] }) {
  const [local, setLocal] = useState(posts);
  const [draft, setDraft] = useState<PostInput>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const togglePlacement = (p: PostPlacement) =>
    setDraft((d) => ({
      ...d,
      placements: d.placements.includes(p)
        ? d.placements.filter((x) => x !== p)
        : [...d.placements, p],
    }));

  function startEdit(post: Post) {
    setEditingId(post.id);
    setDraft({
      id: post.id,
      title: post.title,
      description: post.description,
      body: post.body,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      instagramUrl: post.instagramUrl,
      ctaLabel: post.ctaLabel,
      ctaUrl: post.ctaUrl,
      placements: post.placements,
      membersOnly: post.membersOnly,
      published: post.published,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setDraft(EMPTY);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await savePost(draft);
      setMessage(result.message);
      if (!result.ok) return;
      const asPost: Post = {
        id: editingId ?? `local-${Date.now()}`,
        title: draft.title,
        description: draft.description,
        body: draft.body,
        imageUrl: draft.imageUrl,
        videoUrl: draft.videoUrl,
        instagramUrl: draft.instagramUrl,
        ctaLabel: draft.ctaLabel,
        ctaUrl: draft.ctaUrl,
        placements: draft.placements,
        membersOnly: draft.membersOnly,
        published: draft.published,
        createdAt: new Date().toISOString(),
      };
      setLocal((ps) =>
        editingId ? ps.map((p) => (p.id === editingId ? asPost : p)) : [asPost, ...ps]
      );
      reset();
    });
  }

  function handleDelete(id: string) {
    setLocal((ps) => ps.filter((p) => p.id !== id));
    if (editingId === id) reset();
    startTransition(() => {
      deletePost(id);
    });
  }

  const placementLabel = (v: PostPlacement) =>
    POST_PLACEMENTS.find((p) => p.value === v)?.label ?? v;

  return (
    <div>
      <div className="card p-7 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {editingId ? "Edit post" : "New post"}
        </h2>
        <p className="mt-1 text-[0.85rem] text-ink-soft">
          Posts are visual first: every post needs an image, a video, or an
          Instagram link.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input className="field" value={draft.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <textarea
              className="field"
              rows={2}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Image URL (optional)</label>
            <input
              className="field"
              placeholder="/images/... or https://..."
              value={draft.imageUrl ?? ""}
              onChange={(e) => set("imageUrl", e.target.value || null)}
            />
          </div>
          <div>
            <label className="label">Video URL (optional)</label>
            <input
              className="field"
              placeholder="https://..."
              value={draft.videoUrl ?? ""}
              onChange={(e) => set("videoUrl", e.target.value || null)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Instagram post URL (optional)</label>
            <input
              className="field"
              placeholder="https://www.instagram.com/p/..."
              value={draft.instagramUrl ?? ""}
              onChange={(e) => set("instagramUrl", e.target.value || null)}
            />
            <p className="mt-1.5 text-[0.8rem] text-ink-faint">
              Paste a post link from @vancouver_sai_center and the carousel
              will show the Instagram embed instead of an image.
            </p>
          </div>
          <div>
            <label className="label">Button label (optional)</label>
            <input
              className="field"
              placeholder="Register"
              value={draft.ctaLabel ?? ""}
              onChange={(e) => set("ctaLabel", e.target.value || null)}
            />
          </div>
          <div>
            <label className="label">Button link</label>
            <input
              className="field"
              placeholder="/events/... or https://..."
              value={draft.ctaUrl ?? ""}
              onChange={(e) => set("ctaUrl", e.target.value || null)}
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="label">Where should this post appear?</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {POST_PLACEMENTS.map((p) => (
              <label
                key={p.value}
                className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink"
              >
                <input
                  type="checkbox"
                  checked={draft.placements.includes(p.value)}
                  onChange={() => togglePlacement(p.value)}
                  className="accent-[var(--color-terra)]"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border border-line bg-sand/50 p-4">
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink">
            <input
              type="checkbox"
              checked={!draft.membersOnly}
              onChange={(e) => set("membersOnly", !e.target.checked)}
              className="accent-[var(--color-terra)]"
            />
            Visible to the public
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => set("published", e.target.checked)}
              className="accent-[var(--color-terra)]"
            />
            Published
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={handleSave}
            disabled={pending || !draft.title}
            className="btn btn-primary"
          >
            {editingId ? "Save changes" : "Create post"}
          </button>
          {editingId && (
            <button onClick={reset} className="btn btn-ghost">
              Cancel
            </button>
          )}
          {message && <p className="text-[0.875rem] text-ink-soft">{message}</p>}
        </div>
      </div>

      <div className="card scroll-x mt-8">
        <table className="table-warm w-full min-w-[680px]">
          <thead>
            <tr>
              <th>Post</th>
              <th>Appears in</th>
              <th>Audience</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-soft">
                  No posts yet. Create the first one above.
                </td>
              </tr>
            )}
            {local.map((p) => (
              <tr key={p.id}>
                <td>
                  <p className="font-medium text-ink">
                    {p.title}
                    {!p.published && (
                      <span className="ml-2 rounded-full bg-sand px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-ink-faint">
                        Draft
                      </span>
                    )}
                  </p>
                  <p className="text-[0.8rem] text-ink-faint">{p.description}</p>
                </td>
                <td className="text-[0.85rem] text-ink-soft">
                  {p.placements.map(placementLabel).join(", ")}
                </td>
                <td className="text-ink-soft">{p.membersOnly ? "Members" : "Public"}</td>
                <td className="text-ink-soft">{formatShortDate(p.createdAt)}</td>
                <td className="whitespace-nowrap text-right">
                  <button onClick={() => startEdit(p)} className="link-editorial mr-4 text-[0.85rem]">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-[0.85rem] text-ink-faint underline underline-offset-4 transition-colors hover:text-terra-deep"
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
