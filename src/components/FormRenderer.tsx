"use client";

import { useMemo, useState } from "react";
import type { Bhajan, FormField, SaiForm } from "@/lib/types";

/**
 * Renders an admin-built form definition as a live form.
 * Used on event pages for registration and inside the form builder preview.
 */
export function FormRenderer({
  form,
  submitLabel = "Submit",
  onSubmit,
  disabled = false,
  bhajans = [],
}: {
  form: SaiForm;
  submitLabel?: string;
  onSubmit?: (answers: Record<string, unknown>) => Promise<{ ok: boolean; message: string }>;
  disabled?: boolean;
  /** Approved bhajans, needed when the form contains a bhajan-select field. */
  bhajans?: Bhajan[];
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (id: string, value: unknown) =>
    setAnswers((a) => ({ ...a, [id]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onSubmit || disabled) return;
    setStatus("busy");
    const labelled: Record<string, unknown> = {};
    for (const f of form.fields) {
      if (answers[f.id] !== undefined) labelled[f.label] = answers[f.id];
    }
    const result = await onSubmit(labelled);
    setStatus(result.ok ? "done" : "error");
    setMessage(result.message);
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-gold-soft bg-sand p-8 text-center">
        <p className="font-display text-2xl text-ink">Received with gratitude</p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {form.description && (
        <p className="text-[0.95rem] text-ink-soft">{form.description}</p>
      )}
      {form.fields.map((field) => (
        <FieldControl
          key={field.id}
          field={field}
          value={answers[field.id]}
          onChange={(v) => set(field.id, v)}
          bhajans={bhajans}
        />
      ))}
      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}
      <button
        type="submit"
        className="btn btn-primary w-full sm:w-auto"
        disabled={disabled || status === "busy"}
      >
        {status === "busy" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

function FieldControl({
  field,
  value,
  onChange,
  bhajans,
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  bhajans: Bhajan[];
}) {
  const required = field.required;
  const label = (
    <label className="label" htmlFor={field.id}>
      {field.label}
      {required && <span className="ml-1 text-terra" aria-hidden="true">*</span>}
    </label>
  );
  const help = field.helpText && (
    <p className="mt-1.5 text-[0.8rem] text-ink-faint">{field.helpText}</p>
  );

  switch (field.type) {
    case "short-text":
    case "email":
    case "phone":
    case "number":
    case "date": {
      const typeMap = {
        "short-text": "text",
        email: "email",
        phone: "tel",
        number: "number",
        date: "date",
      } as const;
      return (
        <div>
          {label}
          <input
            id={field.id}
            type={typeMap[field.type]}
            required={required}
            className="field"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help}
        </div>
      );
    }
    case "long-text":
      return (
        <div>
          {label}
          <textarea
            id={field.id}
            required={required}
            rows={4}
            className="field"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          {help}
        </div>
      );
    case "dropdown":
      return (
        <div>
          {label}
          <select
            id={field.id}
            required={required}
            className="field"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>
              Select…
            </option>
            {field.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          {help}
        </div>
      );
    case "radio":
      return (
        <fieldset>
          <legend className="label">{field.label}{required && <span className="ml-1 text-terra">*</span>}</legend>
          <div className="space-y-2">
            {field.options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-3 text-[0.95rem] text-ink-soft">
                <input
                  type="radio"
                  name={field.id}
                  required={required}
                  checked={value === o}
                  onChange={() => onChange(o)}
                  className="accent-[var(--color-terra)]"
                />
                {o}
              </label>
            ))}
          </div>
          {help}
        </fieldset>
      );
    case "checkbox": {
      const selected = (value as string[]) ?? [];
      return (
        <fieldset>
          <legend className="label">{field.label}{required && <span className="ml-1 text-terra">*</span>}</legend>
          <div className="space-y-2">
            {field.options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-3 text-[0.95rem] text-ink-soft">
                <input
                  type="checkbox"
                  checked={selected.includes(o)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...selected, o]
                        : selected.filter((s) => s !== o)
                    )
                  }
                  className="accent-[var(--color-terra)]"
                />
                {o}
              </label>
            ))}
          </div>
          {help}
        </fieldset>
      );
    }
    case "file":
      return (
        <div>
          {label}
          <input
            id={field.id}
            type="file"
            required={required}
            className="field !py-2 file:mr-3 file:rounded file:border-0 file:bg-sand file:px-3 file:py-1.5 file:text-[0.85rem] file:font-medium file:text-ink"
            onChange={(e) => onChange(e.target.files?.[0]?.name ?? "")}
          />
          {help}
        </div>
      );
    case "bhajan-select":
      return (
        <BhajanSelectControl
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          bhajans={bhajans}
        />
      );
    case "consent":
      return (
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-sand/50 p-4 text-[0.9rem] leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            required={required}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="mt-1 accent-[var(--color-terra)]"
          />
          <span>
            {field.label}
            {field.helpText && (
              <span className="mt-1 block text-[0.8rem] text-ink-faint">{field.helpText}</span>
            )}
          </span>
        </label>
      );
  }
}

/**
 * "Add bhajan" picker: members search the bhajan book (narrowed by any
 * limits the admin set on the question) and pick one.
 */
/** The second line of the lyrics, shown as subtext to tell variations apart. */
function bhajanSubtext(b: Bhajan): string {
  const lines = b.lyrics
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[1] ?? "";
}

/** Beat, deity, speed — the fine print on every list row. */
function bhajanMeta(b: Bhajan): string {
  return [b.beatTaal || "no beat", b.category, b.tempo.replace(/_/g, " ")]
    .filter(Boolean)
    .join(" · ");
}

function BhajanSelectControl({
  field,
  value,
  onChange,
  bhajans,
}: {
  field: FormField;
  value: string | undefined;
  onChange: (v: unknown) => void;
  bhajans: Bhajan[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filters = field.bhajanFilters;

  const allowed = useMemo(() => {
    let list = bhajans.filter((b) => b.status === "approved");
    if (filters?.categories?.length)
      list = list.filter((b) => filters.categories.includes(b.category));
    if (filters?.tempos?.length)
      list = list.filter((b) => filters.tempos.includes(b.tempo));
    if (filters?.beats?.length)
      list = list.filter((b) =>
        filters.beats.some((beat) => beat.toLowerCase() === b.beatTaal.trim().toLowerCase())
      );
    return list;
  }, [bhajans, filters]);

  const shown = allowed.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.lyrics.toLowerCase().includes(search.toLowerCase())
  );

  const limitBits = [
    filters?.categories?.length ? filters.categories.join(", ") : null,
    filters?.tempos?.length ? `tempo: ${filters.tempos.join(", ")}` : null,
    filters?.beats?.length ? `beat: ${filters.beats.join(", ")}` : null,
  ].filter(Boolean);

  const selectedBhajan = value ? bhajans.find((b) => b.title === value) : undefined;

  return (
    <div>
      <p className="label">
        {field.label}
        {field.required && <span className="ml-1 text-terra" aria-hidden="true">*</span>}
      </p>
      {limitBits.length > 0 && (
        <p className="mb-2 text-[0.8rem] text-ink-faint">Limited to {limitBits.join(" · ")}</p>
      )}

      {value ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-terra/50 bg-terra/5 px-4 py-3">
          <span className="min-w-0">
            <span className="block truncate font-display text-lg text-terra-deep">{value}</span>
            {selectedBhajan && (
              <span className="mt-0.5 block text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
                {bhajanMeta(selectedBhajan)}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              onChange(undefined);
              setOpen(true);
            }}
            className="shrink-0 text-[0.85rem] text-terra-deep underline underline-offset-4 hover:text-terra"
          >
            Change
          </button>
        </div>
      ) : !open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-terra px-5 py-2 text-[0.9rem] font-medium text-white transition-colors hover:bg-terra-deep"
        >
          + Add bhajan
        </button>
      ) : (
        <div className="rounded-lg border border-terra/40 bg-white-warm p-4">
          <input
            type="search"
            autoFocus
            className="field"
            placeholder="Filter the list, or scroll…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Filter bhajans"
          />
          <div className="mt-3 max-h-80 overflow-y-auto" role="listbox" aria-label="Bhajan list">
            {shown.length === 0 && (
              <p className="py-6 text-center text-[0.875rem] text-ink-soft">
                {allowed.length === 0
                  ? "No bhajans in the library match this question's limits yet."
                  : "No bhajans match that search."}
              </p>
            )}
            {shown.map((b) => {
              const subtext = bhajanSubtext(b);
              return (
                <button
                  key={b.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => {
                    onChange(b.title);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="block w-full border-b border-line/60 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-terra/10"
                >
                  <span className="block font-medium text-ink">{b.title}</span>
                  {subtext && (
                    <span className="mt-0.5 block truncate text-[0.8rem] text-ink-soft">
                      {subtext}
                    </span>
                  )}
                  <span className="mt-1 block text-[0.7rem] uppercase tracking-[0.08em] text-ink-faint">
                    {bhajanMeta(b)}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-[0.85rem] text-ink-faint underline underline-offset-4 hover:text-terra-deep"
          >
            Cancel
          </button>
        </div>
      )}
      {field.helpText && <p className="mt-1.5 text-[0.8rem] text-ink-faint">{field.helpText}</p>}
    </div>
  );
}
