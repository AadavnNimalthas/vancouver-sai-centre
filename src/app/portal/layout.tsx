import Link from "next/link";
import { redirect } from "next/navigation";
import { Logomark } from "@/components/Brand";
import { PortalNav } from "@/components/portal/PortalNav";
import { getCurrentUser } from "@/lib/auth";
import { roleAtLeast } from "@/lib/types";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isAdmin = roleAtLeast(user.role, "wing-lead");

  return (
    <div className="min-h-svh">
      <header className="border-b border-line bg-cream">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Logomark size={30} />
            <span className="font-display text-lg text-ink">Vancouver Sai Centre</span>
            <span className="ml-1 rounded-full bg-sand px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
              Portal
            </span>
          </Link>
          <div className="flex items-center gap-3 text-[0.875rem] text-ink-soft">
            <span className="hidden sm:inline">{user.fullName}</span>
            <span className="flex size-9 items-center justify-center rounded-full bg-gold-soft font-display text-base text-ink">
              {user.fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-10 lg:self-start">
          <PortalNav isAdmin={isAdmin} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
