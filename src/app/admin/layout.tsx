import Link from "next/link";
import { redirect } from "next/navigation";
import { Logomark } from "@/components/Brand";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole("wing-lead");
  if (!user) redirect("/portal");

  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-white-warm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logomark size={30} />
            <span className="font-display text-lg text-ink">Vancouver Sai Centre</span>
            <span className="ml-1 rounded-full bg-ink px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-cream">
              Admin
            </span>
          </Link>
          <div className="flex items-center gap-4 text-[0.875rem] text-ink-soft">
            <Link href="/portal" className="link-editorial">Back to portal</Link>
            <span className="hidden sm:inline">
              {user.fullName} · {ROLE_LABELS[user.role]}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <AdminNav />
        <main className="py-10">{children}</main>
      </div>
    </div>
  );
}
