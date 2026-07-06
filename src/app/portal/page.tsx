import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getEvents, getRegistrationsForUser, getAnnouncements } from "@/lib/data";
import { upcomingOccurrences } from "@/lib/recurrence";
import { formatEventDate, formatEventTime, formatMonthDay, formatShortDate } from "@/lib/format";
import { INTEREST_TOPICS } from "@/lib/types";
import { StatusBadge } from "@/components/portal/StatusBadge";

export const metadata: Metadata = { title: "Dashboard" };

export default async function PortalDashboard() {
  const user = (await getCurrentUser())!;
  const [events, registrations, announcements] = await Promise.all([
    getEvents(),
    getRegistrationsForUser(user.id),
    getAnnouncements(),
  ]);
  const upcoming = upcomingOccurrences(events, new Date(), 3);
  const active = registrations.filter((r) => r.status !== "cancelled");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user.fullName.split(" ")[0];

  return (
    <div>
      <p className="eyebrow">{greeting}</p>
      <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
        Sai Ram, {firstName}
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <StatCard label="Your registrations" value={String(active.length)} href="/portal/registrations" />
        <StatCard
          label="Interests followed"
          value={`${user.interests.length} of ${INTEREST_TOPICS.length}`}
          href="/portal/notifications"
        />
        <StatCard
          label="Member since"
          value={new Date(user.joinedAt).getFullYear().toString()}
          href="/portal/notifications"
        />
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="eyebrow eyebrow-rule">Coming up at the Centre</h2>
            <Link href="/portal/calendar" className="link-editorial text-[0.875rem]">
              Full calendar
            </Link>
          </div>
          <div className="mt-4 border-t border-line">
            {upcoming.map((o) => {
              const d = formatMonthDay(o.startsAt);
              return (
                <Link
                  key={o.key}
                  href={`/events/${o.event.slug}`}
                  className="group flex items-center gap-5 border-b border-line py-5"
                >
                  <div className="flex w-12 shrink-0 flex-col items-center">
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-terra-deep">{d.month}</span>
                    <span className="font-display text-3xl leading-none text-ink">{d.day}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg text-ink transition-colors group-hover:text-terra-deep">
                      {o.event.title}
                    </p>
                    <p className="text-[0.85rem] text-ink-soft">
                      {formatEventTime(o.startsAt, o.endsAt)} · {o.event.location}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          <h2 className="eyebrow eyebrow-rule mt-12">Your next commitments</h2>
          <div className="mt-4 space-y-3">
            {active.length === 0 && (
              <p className="rounded-lg border border-line bg-white-warm p-6 text-[0.925rem] text-ink-soft">
                You haven’t registered for anything yet.{" "}
                <Link href="/events" className="link-editorial">Browse events</Link> to get started.
              </p>
            )}
            {active.slice(0, 4).map((r) => (
              <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-display text-lg text-ink">{r.eventTitle}</p>
                  <p className="text-[0.85rem] text-ink-soft">
                    {r.eventStartsAt && formatEventDate(r.eventStartsAt)} ·{" "}
                    {r.kind === "volunteer" ? "Volunteering" : "Attending"}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </section>

        <aside>
          <h2 className="eyebrow eyebrow-rule">Announcements</h2>
          <div className="mt-4 space-y-5">
            {announcements.slice(0, 3).map((a) => (
              <article key={a.id} className="border-b border-line pb-5">
                <time className="text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
                  {a.sentAt ? formatShortDate(a.sentAt) : "Draft"}
                </time>
                <h3 className="mt-1.5 font-display text-lg leading-snug text-ink">{a.title}</h3>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">{a.body}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="card group block p-6 transition-shadow hover:shadow-soft">
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-ink-faint">
        {label}
      </p>
      <p className="mt-2 font-display text-4xl text-ink transition-colors group-hover:text-terra-deep">
        {value}
      </p>
    </Link>
  );
}
