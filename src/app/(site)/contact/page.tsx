import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit, write, or call the Vancouver Sai Centre. Newcomers are always welcome.",
};

export default function ContactPage() {
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
                2215 East Pender Street
                <br />
                Vancouver, BC
              </p>
              <p className="mt-3 text-[0.9rem] text-ink-soft">
                Street parking is usually available nearby. Please remove your
                shoes in the foyer.
              </p>
            </div>
            <div>
              <h2 className="eyebrow eyebrow-rule">Weekly rhythm</h2>
              <ul className="mt-4 space-y-2 text-[0.95rem] text-ink-soft">
                <li><strong className="font-semibold text-ink">Sundays, 5:00 pm:</strong> Bhajans and satsang</li>
                <li><strong className="font-semibold text-ink">Sundays, 3:00 pm:</strong> SSE classes</li>
                <li><strong className="font-semibold text-ink">Wednesdays, 7:30 pm:</strong> Study circle</li>
                <li><strong className="font-semibold text-ink">Fridays, 7:00 pm:</strong> Young adults</li>
              </ul>
            </div>
            <div>
              <h2 className="eyebrow eyebrow-rule">Write</h2>
              <p className="mt-4">
                <a href="mailto:vancouversaicentre@gmail.com" className="link-editorial">
                  vancouversaicentre@gmail.com
                </a>
              </p>
            </div>
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
