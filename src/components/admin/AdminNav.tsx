"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/site", label: "Site content" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/users", label: "Members" },
  { href: "/admin/resources", label: "Resources" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="scroll-x -mx-5 flex gap-1 border-b border-line px-5 sm:mx-0 sm:px-0">
      {LINKS.map((l) => {
        const active = pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-[0.9rem] transition-colors ${
              active
                ? "border-terra font-semibold text-terra-deep"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
