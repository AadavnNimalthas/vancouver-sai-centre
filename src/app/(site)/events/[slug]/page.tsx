import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryChip } from "@/components/EventCard";
import { RegistrationPanel } from "@/components/events/RegistrationPanel";
import { Reveal } from "@/components/Reveal";
import { getEventBySlug, getForm } from "@/lib/data";
import { formatEventDate, formatEventTime } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  return { title: event?.title ?? "Event" };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event || !event.published) notFound();

  const form = event.formId ? await getForm(event.formId) : null;
  const full =
    event.capacity !== null && event.registeredCount >= event.capacity;
  const spotsLeft =
    event.capacity !== null
      ? Math.max(0, event.capacity - event.registeredCount)
      : null;
  const canSignUp = event.registrationEnabled || event.volunteerSignupEnabled;

  return (
    <article className="pb-24">
      {/* Banner */}
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.bannerUrl ?? "/images/hero-dawn.svg"}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cream via-transparent to-transparent" />
      </div>

      <div className="mx-auto -mt-24 max-w-4xl px-5 sm:px-8">
        <Reveal>
          <div className="relative">
            <CategoryChip category={event.category} />
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink sm:text-6xl">
              {event.title}
            </h1>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card mt-10 grid gap-6 p-7 sm:grid-cols-3 sm:gap-4 sm:p-8">
            <InfoBlock label="Date">
              {formatEventDate(event.startsAt, event.endsAt)}
              {event.recurrence !== "none" && (
                <span className="mt-1 block text-[0.8rem] text-gold">
                  Repeats {event.recurrence}
                </span>
              )}
            </InfoBlock>
            <InfoBlock label="Time">
              {formatEventTime(event.startsAt, event.endsAt)}
            </InfoBlock>
            <InfoBlock label="Location">{event.location}</InfoBlock>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="eyebrow eyebrow-rule">About this gathering</h2>
              <div className="prose-warm mt-5 text-[1.05rem]">
                {event.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            <aside className="space-y-4">
              {spotsLeft !== null && (
                <div className="card p-6">
                  <p className="eyebrow">Capacity</p>
                  <p className="mt-3 font-display text-4xl text-ink">
                    {full ? "Full" : spotsLeft}
                    {!full && (
                      <span className="ml-2 text-base font-sans text-ink-soft">
                        spots remaining
                      </span>
                    )}
                  </p>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-sand-deep">
                    <div
                      className="h-full rounded-full bg-terra transition-all"
                      style={{
                        width: `${Math.min(100, (event.registeredCount / (event.capacity || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  {full && (
                    <p className="mt-3 text-[0.85rem] text-ink-soft">
                      Waitlist is open below.
                    </p>
                  )}
                </div>
              )}

              {event.livestreamUrl && (
                <div className="card p-6">
                  <p className="eyebrow">Can’t attend in person?</p>
                  <p className="mt-2 text-[0.9rem] text-ink-soft">
                    This gathering will be streamed live.
                  </p>
                  <Link href="/live" className="btn btn-quiet mt-4 w-full">
                    Watch live
                  </Link>
                </div>
              )}

              {canSignUp && (
                <a href="#register" className="btn btn-primary w-full">
                  {event.registrationEnabled ? "Register" : "Volunteer"}
                </a>
              )}
            </aside>
          </div>
        </Reveal>

        {canSignUp && (
          <Reveal delay={0.1} className="mt-16">
            <RegistrationPanel
              eventId={event.id}
              form={form}
              registrationEnabled={event.registrationEnabled}
              volunteerEnabled={event.volunteerSignupEnabled}
              full={full}
            />
          </Reveal>
        )}
      </div>
    </article>
  );
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink">{children}</p>
    </div>
  );
}
