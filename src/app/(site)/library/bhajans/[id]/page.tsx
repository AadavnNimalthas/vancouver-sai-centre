import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MalaDivider } from "@/components/MalaDivider";
import { Reveal } from "@/components/Reveal";
import { getBhajan } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bhajan = await getBhajan(id);
  return { title: bhajan ? bhajan.title : "Bhajan" };
}

export default async function BhajanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bhajan = await getBhajan(id);
  if (!bhajan) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <Link href="/library/bhajans" className="link-editorial text-[0.85rem]">
          ← All bhajans
        </Link>
        <div className="mt-10 text-center">
          <p className="eyebrow">
            {bhajan.category} · {bhajan.language} ·{" "}
            {bhajan.beatTaal ? `${bhajan.beatTaal} · ` : ""}
            <span className="capitalize">{bhajan.tempo}</span> tempo
          </p>
          <h1 className="mt-5 font-display text-5xl leading-[1.1] text-ink sm:text-6xl">
            {bhajan.title}
          </h1>
          <p className="mx-auto mt-6 max-w-md font-display text-xl italic leading-relaxed text-ink-soft">
            {bhajan.meaning}
          </p>
          <MalaDivider className="mt-10" />
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-12 rounded-lg bg-sand/70 px-6 py-12 text-center sm:px-12">
          <p className="whitespace-pre-line font-display text-2xl leading-[2] text-ink">
            {bhajan.lyrics}
          </p>
        </div>
      </Reveal>

      {(bhajan.audioUrl || bhajan.videoUrl || bhajan.sourceLink) && (
        <Reveal delay={0.1} className="mt-8 flex justify-center gap-4">
          {bhajan.audioUrl && (
            <a href={bhajan.audioUrl} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              ♪ Practice Recording
            </a>
          )}
          {bhajan.videoUrl && (
            <a href={bhajan.videoUrl} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              ▸ Watch Video
            </a>
          )}
          {bhajan.sourceLink && (
            <a href={bhajan.sourceLink} className="btn btn-quiet" target="_blank" rel="noopener noreferrer">
              View on CymRhythm
            </a>
          )}
        </Reveal>
      )}

      {bhajan.notes && (
        <Reveal delay={0.1} className="mt-12">
          <h2 className="eyebrow eyebrow-rule">Notes for singers</h2>
          <p className="prose-warm mt-4">{bhajan.notes}</p>
        </Reveal>
      )}
    </div>
  );
}
