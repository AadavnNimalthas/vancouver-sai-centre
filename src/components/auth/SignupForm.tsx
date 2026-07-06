"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignupForm({ demoMode }: { demoMode: boolean }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/portal`,
      },
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
      <p className="rounded-lg border border-gold-soft bg-sand px-5 py-4 text-center text-[0.9rem] leading-relaxed text-ink-soft">
        Account creation opens once a Supabase project is connected. For now
        the site runs locally with the built-in Web Team account.
      </p>
    );
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-gold-soft bg-sand p-8 text-center">
        <p className="font-display text-2xl text-ink">Confirm your email</p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          We sent a confirmation link to <strong>{email}</strong>. Open it to
          finish creating your account. After that you will stay signed in on
          this device.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input
          id="name"
          required
          autoComplete="name"
          className="field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="password">Choose a password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="mt-1.5 text-[0.8rem] text-ink-faint">At least 8 characters.</p>
      </div>
      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={status === "busy"}>
        {status === "busy" ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-[0.875rem] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="link-editorial">Sign in</Link>
      </p>
    </form>
  );
}
