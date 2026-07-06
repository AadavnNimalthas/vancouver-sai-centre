"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";

const LINKS = [
  { href: "/portal", label: "Dashboard" },
  { href: "/portal/calendar", label: "Calendar" },
  { href: "/portal/registrations", label: "My registrations" },
  { href: "/portal/volunteering", label: "Volunteering" },
  { href: "/portal/notifications", label: "Notifications" },
  { href: "/portal/resources", label: "Resources" },
];

export function PortalNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <nav aria-label="Portal" className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active =
          l.href === "/portal" ? pathname === "/portal" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-4 py-2.5 text-[0.925rem] transition-colors ${
              active
                ? "bg-sand font-semibold text-terra-deep"
                : "text-ink-soft hover:bg-sand/60 hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}

      {isAdmin && (
        <>
          <p className="eyebrow mt-6 px-4 pb-1">Administration</p>
          <Link
            href="/admin"
            className="rounded-md px-4 py-2.5 text-[0.925rem] text-ink-soft transition-colors hover:bg-sand/60 hover:text-ink"
          >
            Admin console →
          </Link>
        </>
      )}

      <button
        onClick={signOut}
        className="mt-8 rounded-md px-4 py-2.5 text-left text-[0.875rem] text-ink-faint transition-colors hover:bg-sand/60 hover:text-ink"
      >
        Sign out
      </button>
    </nav>
  );
}
