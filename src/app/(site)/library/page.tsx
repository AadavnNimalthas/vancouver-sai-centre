import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getBhajans, getResources } from "@/lib/data";
import { RESOURCE_KINDS } from "@/lib/types";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Library",
  description: "Bhajans, study materials, discourses, and recordings from the Vancouver Sai Centre.",
};

export default async function LibraryPage() {
  const [bhajans, resources] = await Promise.all([getBhajans(), getResources()]);
  const recent = resources.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Library</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          The library
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Bhajans, study guides, recordings, and forms, all in one place.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2" stagger={0.12}>
        <RevealItem>
          <Link
            href="/library/bhajans"
            className="group relative block overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/gallery-akhanda.svg"
              alt=""
              className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-ink/10 to-transparent p-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-soft">
                {bhajans.length} bhajans
              </p>
              <h2 className="mt-2 font-display text-3xl text-cream">Bhajan library</h2>
              <p className="mt-1 text-[0.9rem] text-cream/80">
                Lyrics, meanings, and recordings for every bhajan we sing.
              </p>
            </div>
          </Link>
        </RevealItem>
        <RevealItem>
          <Link
            href="/library/resources"
            className="group relative block overflow-hidden rounded-lg"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/gallery-study.svg"
              alt=""
              className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/70 via-ink/10 to-transparent p-8">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-gold-soft">
                {RESOURCE_KINDS.map((k) => k.label).join(" · ")}
              </p>
              <h2 className="mt-2 font-display text-3xl text-cream">Resource library</h2>
              <p className="mt-1 text-[0.9rem] text-cream/80">
                Study guides, discourses, forms, and recordings.
              </p>
            </div>
          </Link>
        </RevealItem>
      </RevealGroup>

      <Reveal className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="eyebrow eyebrow-rule">Recently added</h2>
          <Link href="/library/resources" className="link-editorial text-[0.9rem]">
            Browse all resources
          </Link>
        </div>
        <div className="mt-4 border-t border-line">
          {recent.map((r) => (
            <Link
              key={r.id}
              href="/library/resources"
              className="group flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-5"
            >
              <div>
                <p className="font-display text-xl text-ink transition-colors group-hover:text-terra-deep">
                  {r.title}
                </p>
                <p className="text-[0.85rem] text-ink-soft">{r.description}</p>
              </div>
              <span className="text-[0.8rem] uppercase tracking-[0.12em] text-ink-faint">
                {formatShortDate(r.createdAt)}
              </span>
            </Link>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
