import Link from "next/link";
import { Logomark } from "./Brand";
import { MalaDivider } from "./MalaDivider";

const VALUES = ["Love", "Truth", "Peace", "Right Conduct", "Non-Violence"];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-sand">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <MalaDivider className="mb-12" />

        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logomark size={40} />
              <span className="font-semibold text-lg text-ink">Vancouver Sai Centre</span>
            </div>
            <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-ink-soft">
              Helping individuals discover the divinity within through devotion,
              education, and selfless service.
            </p>
            <p className="mt-6 text-[0.8rem] uppercase tracking-[0.18em] text-ink-faint">
              {VALUES.join(" · ")}
            </p>
          </div>

          <FooterCol
            title="Visit"
            links={[
              { href: "/events", label: "Events" },
              { href: "/live", label: "Watch live" },
              { href: "/wings", label: "Wings" },
              { href: "/contact", label: "Contact us" },
            ]}
          />
          <FooterCol
            title="Learn"
            links={[
              { href: "/library", label: "Resource library" },
              { href: "/library/bhajans", label: "Bhajan library" },
              { href: "/gallery", label: "Photo gallery" },
            ]}
          />
          <FooterCol
            title="Members"
            links={[
              { href: "/portal", label: "Member portal" },
              { href: "/portal/calendar", label: "Calendar" },
              { href: "/portal/volunteering", label: "Volunteer" },
              { href: "/login", label: "Sign in" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-[0.8rem] text-ink-faint sm:flex-row sm:items-center">
          <p>
            Sunday bhajans 5:00 pm · 3855 Albert St, Burnaby BC ·{" "}
            <a href="mailto:vancouversaicentre@gmail.com" className="link-editorial">
              vancouversaicentre@gmail.com
            </a>
          </p>
          <p>© {new Date().getFullYear()} Vancouver Sai Centre</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h3 className="eyebrow mb-4 !font-sans">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[0.9rem] text-ink-soft transition-colors hover:text-terra-deep"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
