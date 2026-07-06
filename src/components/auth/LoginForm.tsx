"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (demoMode) {
    return (
      <div className="text-center">
        <p className="rounded-lg border border-gold-soft bg-sand px-5 py-4 text-[0.9rem] leading-relaxed text-ink-soft">
          The site is running in <strong className="text-ink">demo mode</strong>.
          No Supabase project is connected yet, so the portal is open to
          explore as a sample member.
        </p>
        <Link href="/portal" className="btn btn-primary mt-6 w-full">
          Enter the member portal
        </Link>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-gold-soft bg-sand p-8 text-center">
        <p className="font-display text-2xl text-ink">Check your email</p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          We’ve sent a sign-in link to <strong>{email}</strong>. It’s valid for
          one hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          className="field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="mt-2 text-[0.8rem] text-ink-faint">
          No password needed. We will email you a sign-in link. If this is
          your first time, the same link creates your account.
        </p>
      </div>
      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={status === "busy"}>
        {status === "busy" ? "Sending link…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
