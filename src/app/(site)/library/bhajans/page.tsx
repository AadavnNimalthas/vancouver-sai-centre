import type { Metadata } from "next";
import { BhajanBrowser } from "@/components/library/BhajanBrowser";
import { Reveal } from "@/components/Reveal";
import { getBhajans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Bhajan Library",
  description: "Search the centre bhajan book by title, language, tempo, and theme.",
};

export default async function BhajansPage() {
  const bhajans = await getBhajans();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Bhajan library</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Bhajan library
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Lyrics, meanings, and tempo notes for the bhajans we sing at the
          centre. Useful for lead singers learning something new.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-12">
        <BhajanBrowser bhajans={bhajans} />
      </Reveal>
    </div>
  );
}
