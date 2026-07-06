"use client";

import { useState } from "react";
import type { FormField, SaiForm } from "@/lib/types";

/**
 * Renders an admin-built form definition as a live form.
 * Used on event pages for registration and inside the form builder preview.
 */
export function FormRenderer({
  form,
  submitLabel = "Submit",
  onSubmit,
  disabled = false,
}: {
  form: SaiForm;
  submitLabel?: string;
  onSubmit?: (answers: Record<string, unknown>) => Promise<{ ok: boolean; message: string }>;
  disabled?: boolean;
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
}: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
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
