import Link from "next/link";
import { Logomark } from "@/components/Brand";

/** Shared shell for the sign-in, sign-up, and password pages. */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh items-center justify-center px-5 py-16">
      <div className="jyoti-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-10 flex flex-col items-center gap-4">
          <Logomark size={52} />
          <span className="font-display text-2xl text-ink">Vancouver Sai Centre</span>
        </Link>
        <div className="card p-8 shadow-soft sm:p-10">
          <h1 className="text-center font-display text-3xl text-ink">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-center text-[0.9rem] text-ink-soft">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
        <p className="mt-6 text-center text-[0.85rem] text-ink-faint">
          <Link href="/" className="link-editorial">← Back to the site</Link>
        </p>
      </div>
    </div>
  );
}
