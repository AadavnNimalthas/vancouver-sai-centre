"use client";

import { useState } from "react";
import { sendAnnouncement } from "@/lib/admin-actions";
import { INTEREST_TOPICS } from "@/lib/types";

export function NotificationComposer({
  followerCounts,
}: {
  followerCounts: Record<string, number>;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const reach = [...topics].reduce((sum, t) => sum + (followerCounts[t] ?? 0), 0);

  const toggle = (value: string) =>
    setTopics((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });

  async function handleSend() {
    if (!title || !body || topics.size === 0) {
      setStatus("error");
      setMessage("Add a title, a message, and at least one topic before sending.");
      return;
    }
    setStatus("busy");
    const result = await sendAnnouncement({ title, body, topics: [...topics] });
    setStatus(result.ok ? "done" : "error");
    setMessage(result.message);
    if (result.ok) {
      setTitle("");
      setBody("");
      setTopics(new Set());
    }
  }

  return (
    <div className="card p-7 sm:p-8">
      <h2 className="font-display text-2xl text-ink">New announcement</h2>
      <p className="mt-1 text-[0.875rem] text-ink-soft">
        Sent by email only to members following the topics you choose.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="an-title">Subject</label>
          <input id="an-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="an-body">Message</label>
          <textarea id="an-body" rows={5} className="field" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div>
          <p className="label">Send to followers of</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TOPICS.map((t) => {
              const on = topics.has(t.value);
              return (
                <button
                  key={t.value}
                  onClick={() => toggle(t.value)}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                    on ? "bg-ink text-cream" : "bg-sand text-ink-soft hover:bg-sand-deep"
                  }`}
                >
                  {t.label}
                  <span className={`ml-1.5 ${on ? "text-cream/60" : "text-ink-faint"}`}>
                    {followerCounts[t.value] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-line pt-6">
        <button onClick={handleSend} disabled={status === "busy"} className="btn btn-primary">
          {status === "busy" ? "Sending…" : `Send to ~${reach} member${reach === 1 ? "" : "s"}`}
        </button>
        {message && (
          <p className={`text-[0.9rem] ${status === "error" ? "text-terra-deep" : "text-ink-soft"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
