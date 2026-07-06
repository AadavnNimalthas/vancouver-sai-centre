import type { Metadata } from "next";
import Link from "next/link";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { getPosts, getWings } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import type { Post, PostPlacement } from "@/lib/types";

export const metadata: Metadata = {
  title: "Wings",
  description:
    "The four wings of the Vancouver Sai Centre: Devotional, Education, Service, and Young Adults.",
};

export default async function WingsPage() {
  const user = await getCurrentUser();
  const signedIn = Boolean(user);
  const wings = await getWings();

  const wingPosts: Record<string, Post[]> = {};
  await Promise.all(
    wings.map(async (w) => {
      wingPosts[w.slug] = await getPosts(`wing-${w.slug}` as PostPlacement, signedIn);
    })
  );

  return (
    <div className="pb-24 pt-36">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow eyebrow-rule">About the wings</p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
            The four wings
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            The centre&rsquo;s activities are organized into four wings. Most
            families take part in more than one.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto mt-20 max-w-5xl px-5 sm:px-8">
        {wings.map((wing, i) => (
          <Reveal key={wing.slug}>
            <section
              id={wing.slug}
              className={`scroll-mt-28 py-16 ${i > 0 ? "border-t border-line" : ""}`}
            >
              <div
                className={`grid items-start gap-10 ${wing.imageUrl ? "lg:grid-cols-2 lg:gap-16" : ""}`}
              >
                {wing.imageUrl && (
                  <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={wing.imageUrl}
                      alt=""
                      className="aspect-[4/3] w-full rounded-lg object-cover shadow-soft"
                    />
                  </div>
                )}
                <div>
                  <p className="font-display text-lg italic text-gold">{wing.tagline}</p>
                  <h2 className="mt-1 font-display text-4xl text-ink">{wing.name}</h2>
                  <p className="prose-warm mt-5">{wing.description}</p>
                  {wing.activities.length > 0 && (
                    <ul className="mt-7 space-y-2.5">
                      {wing.activities.map((a) => (
                        <li
                          key={a}
                          className="flex items-center gap-3 text-[0.95rem] text-ink-soft"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full bg-gold"
                            aria-hidden="true"
                          />
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {wing.subgroups.length > 0 && (
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  {wing.subgroups.map((sg) => (
                    <div key={sg.id} className="card p-6">
                      <h3 className="font-display text-xl text-ink">{sg.title}</h3>
                      <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">
                        {sg.description}
                      </p>
                      {sg.links.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-4">
                          {sg.links.map((l) => (
                            <a key={l.url} href={l.url} className="link-editorial text-[0.875rem]">
                              {l.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(wingPosts[wing.slug] ?? []).length > 0 && (
                <div className="mt-10">
                  <h3 className="eyebrow eyebrow-rule mb-3">From the {wing.name}</h3>
                  <div className="divide-y divide-line border-t border-line">
                    {wingPosts[wing.slug].map((post) => (
                      <article key={post.id} className="py-4">
                        <time className="text-[0.7rem] uppercase tracking-[0.12em] text-ink-faint">
                          {formatShortDate(post.createdAt)}
                        </time>
                        <p className="mt-0.5 font-display text-lg text-ink">{post.title}</p>
                        <p className="mt-1 text-[0.875rem] text-ink-soft">{post.description}</p>
                        {post.ctaLabel && post.ctaUrl && (
                          <Link
                            href={post.ctaUrl}
                            className="link-editorial mt-1.5 inline-block text-[0.85rem]"
                          >
                            {post.ctaLabel}
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-8 max-w-2xl px-5 text-center sm:px-8">
        <MalaDivider className="mb-10" />
        <h2 className="font-display text-3xl text-ink">Not sure where to start?</h2>
        <p className="mt-4 text-lg text-ink-soft">
          Come to Sunday bhajans and say hello. Someone will be happy to point
          you in the right direction.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/events" className="btn btn-primary">See upcoming events</Link>
          <Link href="/contact" className="btn btn-outline">Ask a question</Link>
        </div>
      </Reveal>
    </div>
  );
}
