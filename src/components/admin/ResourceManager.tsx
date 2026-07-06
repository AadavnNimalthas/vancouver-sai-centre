"use client";

import { useState, useTransition } from "react";
import { deleteResource, saveResource } from "@/lib/admin-actions";
import { RESOURCE_KINDS, type Resource } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

const EMPTY = {
  title: "",
  description: "",
  kind: "pdf",
  url: "",
  tags: "",
  membersOnly: false,
};

export function ResourceManager({ resources }: { resources: Resource[] }) {
  const [local, setLocal] = useState(resources);
  const [draft, setDraft] = useState(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function startEdit(r: Resource) {
    setEditingId(r.id);
    setDraft({
      title: r.title,
      description: r.description,
      kind: r.kind,
      url: r.url,
      tags: r.tags.join(", "),
      membersOnly: r.membersOnly,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveResource({
        id: editingId ?? undefined,
        title: draft.title,
        description: draft.description,
        kind: draft.kind,
        url: draft.url || "#",
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        membersOnly: draft.membersOnly,
      });
      setMessage(result.message);
      if (result.ok) {
        if (editingId) {
          setLocal((rs) =>
            rs.map((r) =>
              r.id === editingId
                ? {
                    ...r,
                    title: draft.title,
                    description: draft.description,
                    kind: draft.kind as Resource["kind"],
                    url: draft.url || "#",
                    tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
                    membersOnly: draft.membersOnly,
                  }
                : r
            )
          );
        } else {
          setLocal((rs) => [
            {
              id: `local-${Date.now()}`,
              title: draft.title,
              description: draft.description,
              kind: draft.kind as Resource["kind"],
              url: draft.url || "#",
              tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
              membersOnly: draft.membersOnly,
              createdAt: new Date().toISOString(),
            },
            ...rs,
          ]);
        }
        setDraft(EMPTY);
        setEditingId(null);
      }
    });
  }

  function handleDelete(id: string) {
    setLocal((rs) => rs.filter((r) => r.id !== id));
    startTransition(() => {
      deleteResource(id);
    });
  }

  return (
    <div>
      <div className="card p-7 sm:p-8">
        <h2 className="font-display text-2xl text-ink">
          {editingId ? "Edit resource" : "Add a resource"}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input className="field" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="field" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>
              {RESOURCE_KINDS.map((k) => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <input className="field" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Link (URL or storage path)</label>
            <input className="field" placeholder="https://…" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="field" placeholder="bhajans, study circle" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-5">
          <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink">
            <input
              type="checkbox"
              checked={draft.membersOnly}
              onChange={(e) => setDraft({ ...draft, membersOnly: e.target.checked })}
              className="accent-[var(--color-terra)]"
            />
            Members only
          </label>
          <button onClick={handleSave} disabled={pending || !draft.title} className="btn btn-primary">
            {editingId ? "Save changes" : "Add resource"}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setDraft(EMPTY);
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
          )}
          {message && <p className="text-[0.875rem] text-ink-soft">{message}</p>}
        </div>
      </div>

      <div className="card scroll-x mt-8">
        <table className="table-warm w-full min-w-[640px]">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Type</th>
              <th>Access</th>
              <th>Added</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.map((r) => (
              <tr key={r.id}>
                <td>
                  <p className="font-medium text-ink">{r.title}</p>
                  <p className="text-[0.8rem] text-ink-faint">{r.tags.join(" · ")}</p>
                </td>
                <td className="capitalize text-ink-soft">{r.kind}</td>
                <td className="text-ink-soft">{r.membersOnly ? "Members" : "Public"}</td>
                <td className="text-ink-soft">{formatShortDate(r.createdAt)}</td>
                <td className="whitespace-nowrap text-right">
                  <button onClick={() => startEdit(r)} className="link-editorial mr-4 text-[0.85rem]">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
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
