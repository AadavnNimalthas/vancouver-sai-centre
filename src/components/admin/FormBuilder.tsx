"use client";

import { Reorder, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormRenderer } from "@/components/FormRenderer";
import { saveForm } from "@/lib/admin-actions";
import {
  BHAJAN_DEITY_OPTIONS,
  BHAJAN_TEMPO_OPTIONS,
  FORM_FIELD_TYPES,
  type BhajanFieldFilters,
  type FormField,
  type FormFieldType,
  type SaiForm,
} from "@/lib/types";

const OPTION_TYPES: FormFieldType[] = ["dropdown", "radio", "checkbox"];

function newField(type: FormFieldType): FormField {
  const label = FORM_FIELD_TYPES.find((t) => t.value === type)?.label ?? "Field";
  return {
    id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    label:
      type === "consent" ? "I agree" : type === "bhajan-select" ? "Bhajan 1" : label,
    helpText: "",
    required: type === "consent" || type === "bhajan-select",
    options: OPTION_TYPES.includes(type) ? ["Option 1", "Option 2"] : [],
    bhajanFilters:
      type === "bhajan-select" ? { categories: [], tempos: [], beats: [] } : undefined,
  };
}

export function FormBuilder({ form }: { form: SaiForm | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(form?.title ?? "");
  const [description, setDescription] = useState(form?.description ?? "");
  const [fields, setFields] = useState<FormField[]>(form?.fields ?? []);
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const updateField = (id: string, patch: Partial<FormField>) =>
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const removeField = (id: string) => {
    setFields((fs) => fs.filter((f) => f.id !== id));
    if (selected === id) setSelected(null);
  };

  const addField = (type: FormFieldType) => {
    const f = newField(type);
    setFields((fs) => [...fs, f]);
    setSelected(f.id);
  };

  async function handleSave(publish: boolean) {
    setBusy(true);
    const result = await saveForm({
      id: form?.id,
      title: title || "Untitled form",
      description,
      fields,
      published: publish,
    });
    setMessage(result.message);
    setBusy(false);
    if (result.ok) router.refresh();
  }

  const previewForm: SaiForm = {
    id: form?.id ?? "preview",
    title,
    description,
    fields,
    published: false,
    updatedAt: "",
    attachedEventIds: [],
  };

  return (
    <div>
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex rounded-full bg-sand p-1" role="group" aria-label="Builder mode">
          {(["build", "preview"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreview(mode === "preview")}
              aria-pressed={preview === (mode === "preview")}
              className={`rounded-full px-5 py-1.5 text-[0.85rem] font-medium capitalize transition-colors ${
                preview === (mode === "preview")
                  ? "bg-white-warm text-ink shadow-soft"
                  : "text-ink-soft"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {message && <p className="text-[0.85rem] text-ink-soft">{message}</p>}
          <button onClick={() => handleSave(false)} disabled={busy} className="btn btn-quiet">
            Save draft
          </button>
          <button onClick={() => handleSave(true)} disabled={busy} className="btn btn-primary">
            {busy ? "Saving…" : "Publish"}
          </button>
        </div>
      </div>

      {preview ? (
        <div className="card mx-auto mt-8 max-w-xl p-8 sm:p-10">
          <h2 className="font-display text-3xl text-ink">{title || "Untitled form"}</h2>
          <div className="mt-6">
            <FormRenderer form={previewForm} submitLabel="Submit (preview)" disabled />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* Canvas */}
          <div>
            <div className="card p-6 sm:p-8">
              <input
                className="w-full border-0 bg-transparent font-display text-3xl text-ink outline-none placeholder:text-ink-faint"
                placeholder="Form title…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Form title"
              />
              <input
                className="mt-2 w-full border-0 bg-transparent text-[0.95rem] text-ink-soft outline-none placeholder:text-ink-faint"
                placeholder="A short description shown above the form…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                aria-label="Form description"
              />
            </div>

            {fields.length === 0 && (
              <p className="mt-6 rounded-lg border border-dashed border-gold-soft bg-sand/40 p-10 text-center text-ink-soft">
                Add your first question from the palette →
              </p>
            )}

            <Reorder.Group
              axis="y"
              values={fields}
              onReorder={setFields}
              className="mt-6 space-y-3"
            >
              {fields.map((field) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  selected={selected === field.id}
                  onSelect={() => setSelected(selected === field.id ? null : field.id)}
                  onChange={(patch) => updateField(field.id, patch)}
                  onRemove={() => removeField(field.id)}
                />
              ))}
            </Reorder.Group>
          </div>

          {/* Palette */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="eyebrow mb-3">Add a question</p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {FORM_FIELD_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => addField(t.value)}
                  className="rounded-md border border-line bg-white-warm px-4 py-2.5 text-left text-[0.85rem] text-ink-soft transition-colors hover:border-gold hover:text-ink"
                >
                  + {t.label}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function FieldCard({
  field,
  selected,
  onSelect,
  onChange,
  onRemove,
}: {
  field: FormField;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<FormField>) => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  const typeLabel = FORM_FIELD_TYPES.find((t) => t.value === field.type)?.label;

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={controls}
      className="card overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onPointerDown={(e) => controls.start(e)}
          className="cursor-grab touch-none px-1 text-ink-faint transition-colors hover:text-ink active:cursor-grabbing"
          aria-label={`Drag to reorder: ${field.label}`}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
            {[0, 6].map((cx) =>
              [2, 8, 14].map((cy) => <circle key={`${cx}${cy}`} cx={cx + 2} cy={cy} r="1.4" />)
            )}
          </svg>
        </button>

        <button onClick={onSelect} className="flex min-w-0 flex-1 items-baseline gap-3 text-left">
          <span className="truncate font-medium text-ink">{field.label}</span>
          <span className="shrink-0 text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
            {typeLabel}
            {field.required && " · required"}
          </span>
        </button>

        <button
          onClick={onRemove}
          className="px-1 text-ink-faint transition-colors hover:text-terra-deep"
          aria-label={`Remove ${field.label}`}
        >
          ✕
        </button>
      </div>

      {selected && (
        <div className="space-y-4 border-t border-line bg-sand/40 px-5 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Question label</label>
              <input
                className="field"
                value={field.label}
                onChange={(e) => onChange({ label: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Help text (optional)</label>
              <input
                className="field"
                value={field.helpText}
                onChange={(e) => onChange({ helpText: e.target.value })}
              />
            </div>
          </div>

          {field.type === "bhajan-select" && (
            <BhajanFilterConfig
              filters={field.bhajanFilters ?? { categories: [], tempos: [], beats: [] }}
              onChange={(bhajanFilters) => onChange({ bhajanFilters })}
            />
          )}

          {OPTION_TYPES.includes(field.type) && (
            <div>
              <label className="label">Options (one per line)</label>
              <textarea
                className="field"
                rows={3}
                value={field.options.join("\n")}
                onChange={(e) => onChange({ options: e.target.value.split("\n") })}
                onBlur={(e) =>
                  onChange({ options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean) })
                }
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2.5 text-[0.9rem] text-ink">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onChange({ required: e.target.checked })}
              className="accent-[var(--color-terra)]"
            />
            Required
          </label>
        </div>
      )}
    </Reorder.Item>
  );
}

function BhajanFilterConfig({
  filters,
  onChange,
}: {
  filters: BhajanFieldFilters;
  onChange: (f: BhajanFieldFilters) => void;
}) {
  const toggle = (key: "categories" | "tempos", value: string) => {
    const list = filters[key];
    onChange({
      ...filters,
      [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-line bg-white-warm p-4">
      <p className="text-[0.8rem] leading-relaxed text-ink-soft">
        Members will pick a bhajan from the library. Limit what they can pick
        below; leave a group empty for no limit.
      </p>
      <div>
        <p className="label !mb-1.5">Categories {filters.categories.length === 0 && <span className="font-normal text-ink-faint">(no limit)</span>}</p>
        <div className="flex flex-wrap gap-1.5">
          {BHAJAN_DEITY_OPTIONS.map((c) => (
            <FilterPill key={c} on={filters.categories.includes(c)} onClick={() => toggle("categories", c)}>
              {c}
            </FilterPill>
          ))}
        </div>
      </div>
      <div>
        <p className="label !mb-1.5">Tempo {filters.tempos.length === 0 && <span className="font-normal text-ink-faint">(no limit)</span>}</p>
        <div className="flex flex-wrap gap-1.5">
          {BHAJAN_TEMPO_OPTIONS.map((t) => (
            <FilterPill key={t.value} on={filters.tempos.includes(t.value)} onClick={() => toggle("tempos", t.value)}>
              {t.label}
            </FilterPill>
          ))}
        </div>
      </div>
      <div>
        <p className="label !mb-1.5">Beat / taal</p>
        <input
          className="field"
          placeholder="e.g. 8 beat, keherwa (comma separated, blank for no limit)"
          value={filters.beats.join(", ")}
          onChange={(e) =>
            onChange({
              ...filters,
              beats: e.target.value.split(",").map((b) => b.trim()).filter(Boolean),
            })
          }
        />
      </div>
    </div>
  );
}

function FilterPill({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors ${
        on
          ? "bg-terra text-white"
          : "border border-line bg-sand/40 text-ink-soft hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}
