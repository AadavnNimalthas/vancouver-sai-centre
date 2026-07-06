import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoMasonry } from "@/components/gallery/Lightbox";
import { Reveal } from "@/components/Reveal";
import { getAlbum } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const album = await getAlbum(id);
  return { title: album ? album.title : "Album" };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <Link href="/gallery" className="link-editorial text-[0.85rem]">
          ← All albums
        </Link>
        <p className="eyebrow mt-10">{formatShortDate(album.date)}</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          {album.title}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
          {album.description}
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-12">
        <PhotoMasonry photos={album.photos} />
      </Reveal>
    </div>
  );
}
