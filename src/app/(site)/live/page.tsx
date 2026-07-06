import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { getEvents } from "@/lib/data";
import { upcomingOccurrences } from "@/lib/recurrence";
import { formatEventDate, formatEventTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Watch Live",
  description: "Join Sunday bhajans and major celebrations live from anywhere.",
};

export default async function LivePage() {
  const events = await getEvents();
  const streamed = upcomingOccurrences(events, new Date(), 30).filter(
    (o) => o.event.livestreamUrl
  );
  const next = streamed[0];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">From anywhere</p>
        <h1 className="mt-4 font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Watch live
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Sunday bhajans and major celebrations are streamed for devotees who
          can’t be with us in the hall. The stream opens about ten minutes
          before each program begins.
        </p>
      </Reveal>

      {next && (
        <Reveal delay={0.15}>
          <div className="card mt-14 overflow-hidden">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={next.event.bannerUrl ?? "/images/gallery-lamp.svg"}
                alt=""
                className="aspect-video w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/10">
                <a
                  href={next.event.livestreamUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary !px-10 !py-4 text-base shadow-lift"
                >
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  Open the livestream
                </a>
              </div>
            </div>
            <div className="p-8">
              <p className="eyebrow">Next broadcast</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{next.event.title}</h2>
              <p className="mt-2 text-ink-soft">
                {formatEventDate(next.startsAt)} · {formatEventTime(next.startsAt, next.endsAt)} Pacific
              </p>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.2} className="mt-16">
        <h2 className="eyebrow eyebrow-rule">Upcoming broadcasts</h2>
        <div className="mt-4 border-t border-line">
          {streamed.slice(0, 6).map((o) => (
            <div
              key={o.key}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-5"
            >
              <div>
                <p className="font-display text-xl text-ink">{o.event.title}</p>
                <p className="text-[0.875rem] text-ink-soft">
                  {formatEventDate(o.startsAt)} · {formatEventTime(o.startsAt, o.endsAt)}
                </p>
              </div>
              <Link href={`/events/${o.event.slug}`} className="link-editorial text-[0.9rem]">
                Event details
              </Link>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
