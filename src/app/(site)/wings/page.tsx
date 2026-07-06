import type { Metadata } from "next";
import Link from "next/link";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal } from "@/components/Reveal";
import { getWings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Wings",
  description: "The four wings of the Vancouver Sai Centre: Devotional, Service, Education, and Young Adults.",
};

const WING_IMAGES: Record<string, string> = {
  devotional: "/images/gallery-bhajan-hall.svg",
  service: "/images/gallery-seva.svg",
  education: "/images/gallery-sse.svg",
  "young-adults": "/images/gallery-ya.svg",
};

export default async function WingsPage() {
  const wings = await getWings();

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
              className={`grid scroll-mt-28 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-16 ${
                i > 0 ? "border-t border-line" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={WING_IMAGES[wing.slug]}
                  alt=""
                  className="aspect-[4/3] w-full rounded-lg object-cover shadow-soft"
                />
              </div>
              <div>
                <p className="eyebrow">{wing.tagline}</p>
                <h2 className="mt-3 font-display text-4xl text-ink">{wing.name}</h2>
                <p className="prose-warm mt-5">{wing.description}</p>
                <ul className="mt-7 space-y-2.5">
                  {wing.activities.map((a) => (
                    <li key={a} className="flex items-center gap-3 text-[0.95rem] text-ink-soft">
                      <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
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
