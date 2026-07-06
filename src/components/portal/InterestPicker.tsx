"use client";

import { useState, useTransition } from "react";
import { saveInterests } from "@/lib/actions";
import { INTEREST_TOPICS } from "@/lib/types";

export function InterestPicker({ initial }: { initial: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const toggle = (value: string) => {
    setMessage("");
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  function handleSave() {
    startTransition(async () => {
      const result = await saveInterests([...selected]);
      setMessage(result.message);
    });
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {INTEREST_TOPICS.map((topic) => {
          const on = selected.has(topic.value);
          return (
            <button
              key={topic.value}
              onClick={() => toggle(topic.value)}
              aria-pressed={on}
              className={`flex items-center justify-between gap-3 rounded-lg border p-5 text-left transition-all ${
                on
                  ? "border-gold bg-sand shadow-soft"
                  : "border-line bg-white-warm hover:border-gold-soft"
              }`}
            >
              <span className={`text-[0.95rem] ${on ? "font-semibold text-ink" : "text-ink-soft"}`}>
                {topic.label}
              </span>
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  on ? "border-terra bg-terra text-white" : "border-line"
                }`}
                aria-hidden="true"
              >
                {on && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4 L3.8 6.8 L9 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button onClick={handleSave} disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save preferences"}
        </button>
        {message && <p className="text-[0.9rem] text-ink-soft">{message}</p>}
      </div>
    </div>
  );
}
