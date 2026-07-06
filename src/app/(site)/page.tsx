import Link from "next/link";
import { AdminSetupPrompt } from "@/components/AdminSetupPrompt";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { MiniCalendar } from "@/components/home/MiniCalendar";
import { ValuesStrand } from "@/components/home/ValuesStrand";
import { EventRow } from "@/components/EventCard";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import {
  getAlbums,
  getEvents,
  getPosts,
  getSiteContent,
  getWings,
} from "@/lib/data";
import { expandOccurrences, upcomingOccurrences } from "@/lib/recurrence";
import { formatShortDate } from "@/lib/format";
import { roleAtLeast } from "@/lib/types";
import { endOfMonth, startOfMonth } from "date-fns";

export default async function HomePage() {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  const isAdmin = Boolean(user && roleAtLeast(user.role, "wing-lead"));

  const [featured, news, site, events, wings, albums] = await Promise.all([
    getPosts("featured", signedIn),
    getPosts("announcements", signedIn),
    getSiteContent(),
    getEvents(),
    getWings(),
    getAlbums(),
  ]);

  const now = new Date();
  const upcoming = upcomingOccurrences(events, now, 5);
  const monthOccurrences = expandOccurrences(events, startOfMonth(now), endOfMonth(now));
  const galleryPhotos = albums.flatMap((a) => a.photos).slice(0, 6);
  const visibleContacts = site.contacts.filter((c) => c.visible);

  return (
    <>
      {/* ── Featured posts ─────────────────────────────── */}
      <div className="pt-24">
        {featured.length > 0 ? (
          <FeaturedCarousel posts={featured} />
        ) : (
          <div className="mx-auto max-w-3xl px-5 py-10 text-center sm:px-8">
            <h1 className="font-display text-4xl text-ink sm:text-5xl">
              Vancouver Sai Centre
            </h1>
            <p className="mt-3 text-lg text-ink-soft">
              Sunday bhajans at 5 pm. Everyone is welcome.
            </p>
            <div className="mx-auto mt-6 max-w-md">
              <AdminSetupPrompt
                isAdmin={isAdmin}
                title="No featured posts yet"
                detail="Create a post and place it in the homepage carousel to fill this space."
                href="/admin/posts"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Who we are ─────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <Reveal>
            <h2 className="eyebrow eyebrow-rule">Who we are</h2>
            <p className="mt-5 font-display text-2xl leading-[1.5] text-ink sm:text-[1.7rem]">
              {site.intro}
            </p>
            <p className="mt-5 text-ink-soft">
              There is no membership fee. You can take part while practising
              your own faith. The easiest way to start is to come to Sunday
              bhajans.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/events" className="btn btn-primary">
                See what&rsquo;s on
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Plan a visit
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="card p-7">
              <h3 className="font-display text-xl text-ink">When we meet</h3>
              <ul className="mt-4 space-y-3 text-[0.925rem] text-ink-soft">
                <li>
                  <span className="font-semibold text-ink">Sundays, 3:00 pm</span>
                  <br />SSE classes for children
                </li>
                <li>
                  <span className="font-semibold text-ink">Sundays, 5:00 pm</span>
                  <br />Bhajans and satsang
                </li>
                <li>
                  <span className="font-semibold text-ink">Wednesdays, 7:30 pm</span>
                  <br />Study circle
                </li>
                <li>
                  <span className="font-semibold text-ink">Fridays, 7:00 pm</span>
                  <br />Young adults
                </li>
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-[0.875rem] text-ink-soft">
                {site.address}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Upcoming events ────────────────────────────── */}
      <section className="border-y border-line bg-white-warm/60">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="eyebrow eyebrow-rule">Coming up</h2>
                <p className="mt-3 font-display text-3xl text-ink sm:text-4xl">
                  Upcoming events
                </p>
              </div>
              <Link href="/events" className="link-editorial text-[0.95rem]">
                All events
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="mt-8 border-t border-line">
            {upcoming.map((occ) => (
              <EventRow key={occ.key} occurrence={occ} />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="eyebrow">Values we practise</h2>
          <p className="mt-4 font-display text-3xl text-ink sm:text-4xl">
            Love, truth, peace, right conduct, non-violence
          </p>
          <p className="mt-4 text-ink-soft">
            Everything at the centre, from bhajans to children&rsquo;s classes
            to service projects, comes back to these five values. Touch a bead
            to read about one.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-12">
          <ValuesStrand />
        </Reveal>
      </section>

      {/* ── Wings ──────────────────────────────────────── */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="eyebrow eyebrow-rule">How the centre is organized</h2>
                <p className="mt-3 font-display text-3xl text-ink sm:text-4xl">
                  The four wings
                </p>
              </div>
              <Link href="/wings" className="link-editorial text-[0.95rem]">
                More about each wing
              </Link>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2" stagger={0.08}>
            {wings.map((wing) => (
              <RevealItem key={wing.slug}>
                <Link
                  href={`/wings#${wing.slug}`}
                  className="card group block h-full p-7 transition-shadow duration-300 hover:shadow-soft"
                >
                  <h3 className="font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
                    {wing.name}
                  </h3>
                  <p className="mt-0.5 font-display text-[0.95rem] italic text-gold">
                    {wing.tagline}
                  </p>
                  <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-soft">
                    {wing.description.split(". ")[0]}.
                  </p>
                  <p className="mt-4 text-[0.8rem] text-ink-faint">
                    {wing.activities.slice(0, 2).join(" · ")}
                  </p>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Sai Baba & SSSIO ───────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="eyebrow eyebrow-rule">About the teacher</h2>
            <p className="mt-3 font-display text-3xl text-ink">{site.babaTitle}</p>
            <div className="prose-warm mt-5">
              {site.babaBody.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {!site.babaBody && (
              <AdminSetupPrompt
                isAdmin={isAdmin}
                title="This section has no text yet"
                detail="Write the introduction to Sri Sathya Sai Baba in Site content."
                href="/admin/site"
              />
            )}
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="eyebrow eyebrow-rule">The wider organization</h2>
            <p className="mt-3 font-display text-3xl text-ink">{site.sssioTitle}</p>
            <div className="prose-warm mt-5">
              {site.sssioBody.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </div>
        <MalaDivider className="mt-16" />
      </section>

      {/* ── This month ─────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <h2 className="eyebrow eyebrow-rule mb-5">This month</h2>
            <MiniCalendar occurrences={monthOccurrences} />
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="eyebrow eyebrow-rule mb-5">News and announcements</h2>
            {news.length === 0 && (
              <AdminSetupPrompt
                isAdmin={isAdmin}
                title="No announcements yet"
                detail="Create a post and place it in Latest announcements."
                href="/admin/posts"
              />
            )}
            <div className="divide-y divide-line border-t border-line">
              {news.slice(0, 4).map((post) => (
                <article key={post.id} className="py-5">
                  <time className="text-[0.75rem] uppercase tracking-[0.12em] text-ink-faint">
                    {formatShortDate(post.createdAt)}
                  </time>
                  <h3 className="mt-1 font-display text-xl leading-snug text-ink">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink-soft">
                    {post.description}
                  </p>
                  {post.ctaLabel && post.ctaUrl && (
                    <Link href={post.ctaUrl} className="link-editorial mt-2 inline-block text-[0.875rem]">
                      {post.ctaLabel}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Photos ─────────────────────────────────────── */}
      <section className="bg-sand">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="eyebrow eyebrow-rule">Photos</h2>
                <p className="mt-3 font-display text-3xl text-ink sm:text-4xl">
                  From centre life
                </p>
              </div>
              <Link href="/gallery" className="link-editorial text-[0.95rem]">
                See all albums
              </Link>
            </div>
          </Reveal>
          <RevealGroup className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3" stagger={0.06}>
            {galleryPhotos.map((photo, i) => (
              <RevealItem key={photo.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <Link href="/gallery" className="group block h-full overflow-hidden rounded-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ── Contacts ───────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
        <Reveal>
          <h2 className="eyebrow eyebrow-rule">Get in touch</h2>
          <p className="mt-3 font-display text-3xl text-ink sm:text-4xl">Contacts</p>
        </Reveal>
        {visibleContacts.length === 0 ? (
          <div className="mt-8 max-w-xl">
            <p className="text-ink-soft">
              Write to us at{" "}
              <a href="mailto:vancouversaicentre@gmail.com" className="link-editorial">
                vancouversaicentre@gmail.com
              </a>{" "}
              or use the <Link href="/contact" className="link-editorial">contact form</Link>.
            </p>
            <div className="mt-5">
              <AdminSetupPrompt
                isAdmin={isAdmin}
                title="No contact cards yet"
                detail="Add the executive and coordinator contact cards in Site content. Cards with visibility turned off stay hidden."
                href="/admin/site"
              />
            </div>
          </div>
        ) : (
          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {visibleContacts.map((c) => (
              <RevealItem key={c.id}>
                <div className="card h-full p-6">
                  <p className="font-display text-[0.95rem] italic text-gold">{c.role}</p>
                  <p className="mt-1 font-display text-xl text-ink">{c.name}</p>
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="link-editorial mt-2 block text-[0.875rem]">
                      {c.email}
                    </a>
                  )}
                  {c.phone && (
                    <p className="mt-1 text-[0.875rem] text-ink-soft">{c.phone}</p>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>

      {/* ── Other BC centres ───────────────────────────── */}
      <section className="border-t border-line bg-white-warm/60">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="eyebrow eyebrow-rule">Around the province</h2>
            <p className="mt-3 font-display text-3xl text-ink sm:text-4xl">
              Other Sai centres in BC
            </p>
            <p className="mt-3 max-w-xl text-ink-soft">
              If you live outside Vancouver, one of these centres may be closer
              to you. All centres follow the same program of devotion,
              education, and service.
            </p>
          </Reveal>
          {site.bcGroups.length === 0 ? (
            <div className="mt-8 max-w-xl">
              <AdminSetupPrompt
                isAdmin={isAdmin}
                title="No other centres listed yet"
                detail="Add nearby Sai centres and groups in Site content."
                href="/admin/site"
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {site.bcGroups.map((g) => (
                <div key={g.id} className="card p-7">
                  <h3 className="font-display text-2xl text-ink">{g.name}</h3>
                  <ul className="mt-3 space-y-1.5 text-[0.925rem] text-ink-soft">
                    {g.address && <li>{g.address}</li>}
                    {g.meetingTime && <li>{g.meetingTime}</li>}
                    {g.contact && <li>{g.contact}</li>}
                  </ul>
                  {g.link ? (
                    <a
                      href={g.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-editorial mt-3 inline-block text-[0.875rem]"
                    >
                      Visit their page
                    </a>
                  ) : (
                    !g.address &&
                    !g.contact && (
                      <p className="mt-3 text-[0.875rem] text-ink-soft">
                        <Link href="/contact" className="link-editorial">
                          Ask us
                        </Link>{" "}
                        for meeting details.
                      </p>
                    )
                  )}
                  {isAdmin && (!g.address || !g.meetingTime) && (
                    <p className="mt-3 text-[0.75rem] text-gold">
                      Admin note: details are incomplete.{" "}
                      <Link href="/admin/site" className="underline">
                        Fill them in
                      </Link>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
