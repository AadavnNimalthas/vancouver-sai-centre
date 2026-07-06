"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { saveEvent, type EventInput } from "@/lib/admin-actions";
import { EVENT_CATEGORIES, type SaiEvent, type SaiForm } from "@/lib/types";

function toLocalInput(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventEditor({
  event,
  forms,
}: {
  event: SaiEvent | null;
  forms: SaiForm[];
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<EventInput>({
    id: event?.id,
    slug: event?.slug ?? "",
    title: event?.title ?? "",
    description: event?.description ?? "",
    bannerUrl: event?.bannerUrl ?? null,
    startsAt: event?.startsAt ?? "",
    endsAt: event?.endsAt ?? "",
    location: event?.location ?? "Vancouver Sai Centre, 3855 Albert St, Burnaby",
    capacity: event?.capacity ?? null,
    registrationEnabled: event?.registrationEnabled ?? false,
    volunteerSignupEnabled: event?.volunteerSignupEnabled ?? false,
    livestreamUrl: event?.livestreamUrl ?? null,
    category: event?.category ?? "devotional",
    recurrence: event?.recurrence ?? "none",
    recurrenceUntil: event?.recurrenceUntil ?? null,
    formId: event?.formId ?? null,
    published: event?.published ?? false,
  });

  const set = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function handleSave(publish?: boolean) {
    setBusy(true);
    const payload = {
      ...draft,
      published: publish ?? draft.published,
      slug:
        draft.slug ||
        draft.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };
    const result = await saveEvent(payload);
    setMessage(result.message);
    setBusy(false);
    if (result.ok) router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="ev-title">Title</label>
          <input id="ev-title" className="field" value={draft.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="ev-desc">Description</label>
          <textarea id="ev-desc" rows={5} className="field" value={draft.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ev-start">Starts</label>
          <input
            id="ev-start"
            type="datetime-local"
            className="field"
            value={toLocalInput(draft.startsAt)}
            onChange={(e) => set("startsAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
        </div>
        <div>
          <label className="label" htmlFor="ev-end">Ends</label>
          <input
            id="ev-end"
            type="datetime-local"
            className="field"
            value={toLocalInput(draft.endsAt)}
            onChange={(e) => set("endsAt", e.target.value ? new Date(e.target.value).toISOString() : "")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="ev-loc">Location</label>
          <input id="ev-loc" className="field" value={draft.location} onChange={(e) => set("location", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="ev-cat">Category</label>
          <select id="ev-cat" className="field" value={draft.category} onChange={(e) => set("category", e.target.value)}>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ev-cap">Capacity (blank = unlimited)</label>
          <input
            id="ev-cap"
            type="number"
            min={1}
            className="field"
            value={draft.capacity ?? ""}
            onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ev-rec">Repeats</label>
          <select id="ev-rec" className="field" value={draft.recurrence} onChange={(e) => set("recurrence", e.target.value)}>
            <option value="none">Does not repeat</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every two weeks</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        {draft.recurrence !== "none" && (
          <div>
            <label className="label" htmlFor="ev-until">Repeats until</label>
            <input
              id="ev-until"
              type="date"
              className="field"
              value={draft.recurrenceUntil ?? ""}
              onChange={(e) => set("recurrenceUntil", e.target.value || null)}
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="ev-live">Livestream link (optional)</label>
          <input
            id="ev-live"
            type="url"
            className="field"
            placeholder="https://…"
            value={draft.livestreamUrl ?? ""}
            onChange={(e) => set("livestreamUrl", e.target.value || null)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ev-banner">Banner image URL</label>
          <input
            id="ev-banner"
            className="field"
            placeholder="/images/… or https://…"
            value={draft.bannerUrl ?? ""}
            onChange={(e) => set("bannerUrl", e.target.value || null)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ev-form">Signup form</label>
          <select
            id="ev-form"
            className="field"
            value={draft.formId ?? ""}
            onChange={(e) => set("formId", e.target.value || null)}
          >
            <option value="">No form attached</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-lg border border-line bg-sand/50 p-5">
        <Toggle
          label="Registration open"
          checked={draft.registrationEnabled}
          onChange={(v) => set("registrationEnabled", v)}
        />
        <Toggle
          label="Volunteer signup open"
          checked={draft.volunteerSignupEnabled}
          onChange={(v) => set("volunteerSignupEnabled", v)}
        />
        <Toggle
          label="Published"
          checked={draft.published}
          onChange={(v) => set("published", v)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button onClick={() => handleSave()} disabled={busy} className="btn btn-primary">
          {busy ? "Saving…" : "Save event"}
        </button>
        {!draft.published && (
          <button onClick={() => handleSave(true)} disabled={busy} className="btn btn-outline">
            Save & publish
          </button>
        )}
        {message && <p className="text-[0.9rem] text-ink-soft">{message}</p>}
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked ? "bg-terra" : "bg-sand-deep"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
      <span className="text-[0.9rem] text-ink">{label}</span>
    </label>
  );
}
