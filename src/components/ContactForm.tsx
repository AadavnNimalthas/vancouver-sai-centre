"use client";

import { useState } from "react";
import { submitContact } from "@/lib/actions";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("busy");
    const fd = new FormData(e.currentTarget);
    const result = await submitContact({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    setStatus(result.ok ? "done" : "error");
    setMessage(result.message);
  }

  if (status === "done") {
    return (
      <div className="rounded-lg border border-gold-soft bg-sand p-10 text-center">
        <p className="font-display text-2xl text-ink">Message received</p>
        <p className="mt-3 text-ink-soft">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="subject">What is this about?</label>
        <select id="subject" name="subject" required className="field" defaultValue="">
          <option value="" disabled>Select…</option>
          <option>Visiting for the first time</option>
          <option>SSE (children’s classes)</option>
          <option>Volunteering</option>
          <option>Events & festivals</option>
          <option>Something else</option>
        </select>
      </div>
      <div>
        <label className="label" htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={5} required className="field" />
      </div>
      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={status === "busy"}>
        {status === "busy" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
