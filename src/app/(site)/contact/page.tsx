import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit or write to the Vancouver Sai Centre. Newcomers are always welcome.",
};

export default async function ContactPage() {
  const site = await getSiteContent();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Contact</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Come as you are
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          The easiest introduction is to come to Sunday bhajans. If you would
          rather write first, we usually reply within two days.
        </p>
      </Reveal>

      <div className="mt-16 grid gap-16 lg:grid-cols-[1fr_1.3fr]">
        <Reveal delay={0.1}>
          <div className="space-y-10">
            <div>
              <h2 className="eyebrow eyebrow-rule">Visit</h2>
              <p className="mt-4 text-ink">
                Vancouver Sai Centre
                <br />
                {site.address}
              </p>
              {site.parkingInfo && (
                <p className="mt-3 text-[0.9rem] text-ink-soft">{site.parkingInfo}</p>
              )}
            </div>

            {site.whenMeet.length > 0 && (
              <div>
                <h2 className="eyebrow eyebrow-rule">Weekly rhythm</h2>
                <ul className="mt-4 space-y-2 text-[0.95rem] text-ink-soft">
                  {site.whenMeet.map((m) => (
                    <li key={m.label}>
                      <strong className="font-semibold text-ink">{m.time}:</strong>{" "}
                      {m.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="eyebrow eyebrow-rule">Write</h2>
              <p className="mt-4">
                <a href={`mailto:${site.contactEmail}`} className="link-editorial">
                  {site.contactEmail}
                </a>
              </p>
            </div>

            {site.mapEmbedUrl && (
              <iframe
                src={site.mapEmbedUrl}
                title="Map to the Vancouver Sai Centre"
                className="h-64 w-full rounded-lg border border-line"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="card p-8 sm:p-10">
            <h2 className="font-display text-3xl text-ink">Send a message</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
