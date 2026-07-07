"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/config";

/**
 * Sign in with a password or an emailed link. Sessions are persistent:
 * Supabase keeps members signed in and refreshes tokens automatically,
 * so seniors and mobile users are not asked to sign in again and again.
 */
export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "link">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const supabase = createClient();

    if (mode === "password") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus("error");
        setMessage(
          error.message === "Invalid login credentials"
            ? "That email and password do not match. You can reset your password below."
            : error.message
        );
        return;
      }
      router.push("/portal");
      router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
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
          No Supabase project is connected yet, so the site is using its
          local database and you are signed in as the Web Team account.
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
          We sent a sign-in link to <strong>{email}</strong>. It is valid for
          one hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex rounded-full bg-sand p-1" role="group" aria-label="Sign-in method">
        {(
          [
            ["password", "Password"],
            ["link", "Email me a link"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setStatus("idle");
            }}
            aria-pressed={mode === value}
            className={`flex-1 rounded-full px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
              mode === value ? "bg-white-warm text-ink shadow-soft" : "text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="field"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {mode === "password" && (
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="mt-2 text-right text-[0.8rem]">
            <Link href="/reset-password" className="link-editorial">
              Forgot your password?
            </Link>
          </p>
        </div>
      )}

      {mode === "link" && (
        <p className="text-[0.8rem] text-ink-faint">
          No password needed. We will email you a one-time sign-in link.
        </p>
      )}

      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full" disabled={status === "busy"}>
        {status === "busy"
          ? "Signing in…"
          : mode === "password"
            ? "Sign in"
            : "Email me a sign-in link"}
      </button>

      <p className="text-center text-[0.875rem] text-ink-soft">
        New to the centre?{" "}
        <Link href="/signup" className="link-editorial">
          Create an account
        </Link>
      </p>
    </form>
  );
}
