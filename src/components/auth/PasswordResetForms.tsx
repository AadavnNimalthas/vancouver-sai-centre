"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/config";

export function RequestResetForm({ demoMode }: { demoMode: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/auth/callback?next=/update-password`,
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
      <p className="rounded-lg border border-gold-soft bg-sand px-5 py-4 text-center text-[0.9rem] text-ink-soft">
        Password reset opens once a Supabase project is connected.
      </p>
    );
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-gold-soft bg-sand p-8 text-center">
        <p className="font-display text-2xl text-ink">Check your email</p>
        <p className="mt-3 text-[0.95rem] text-ink-soft">
          If an account exists for <strong>{email}</strong>, a reset link is
          on its way.
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
          autoComplete="email"
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p className="mt-2 text-[0.8rem] text-ink-faint">
          We will email you a link to choose a new password.
        </p>
      </div>
      {status === "error" && (
        <p className="rounded border border-terra/40 bg-terra/5 px-4 py-3 text-[0.9rem] text-terra-deep">
          {message}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={status === "busy"}>
        {status === "busy" ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-[0.875rem] text-ink-soft">
        <Link href="/login" className="link-editorial">Back to sign in</Link>
      </p>
    </form>
  );
}

export function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("busy");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(
        error.message.includes("session")
          ? "This reset link has expired. Please request a new one."
          : error.message
      );
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="label" htmlFor="new-password">New password</label>
        <input
          id="new-password"
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
          {message}{" "}
          <Link href="/reset-password" className="underline">Request a new link</Link>
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={status === "busy"}>
        {status === "busy" ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
