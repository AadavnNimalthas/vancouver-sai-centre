import type { Metadata } from "next";
import Link from "next/link";
import { Logomark } from "@/components/Brand";
import { LoginForm } from "@/components/auth/LoginForm";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh items-center justify-center px-5 py-16">
      <div className="jyoti-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-10 flex flex-col items-center gap-4">
          <Logomark size={52} />
          <span className="font-semibold text-xl tracking-tight text-ink">Vancouver Sai Centre</span>
        </Link>
        <div className="card p-8 shadow-soft sm:p-10">
          <h1 className="text-center font-display text-3xl text-ink">Welcome back</h1>
          <p className="mt-2 text-center text-[0.9rem] text-ink-soft">
            Sign in to the member portal
          </p>
          <div className="mt-8">
            <LoginForm demoMode={!isSupabaseConfigured} />
          </div>
        </div>
        <p className="mt-6 text-center text-[0.85rem] text-ink-faint">
          <Link href="/" className="link-editorial">← Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
