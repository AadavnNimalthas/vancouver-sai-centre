import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getAlbums } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo albums from festivals, seva projects, and retreats at the Vancouver Sai Centre.",
};

export default async function GalleryPage() {
  const albums = await getAlbums();

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Photos</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Photo gallery
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Photo albums from festivals, service projects, and retreats.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
        {albums.map((album) => (
          <RevealItem key={album.id}>
            <Link href={`/gallery/${album.id}`} className="group block">
              <div className="overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={album.coverUrl}
                  alt=""
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <p className="mt-4 text-[0.75rem] uppercase tracking-[0.16em] text-ink-faint">
                {formatShortDate(album.date)} · {album.photos.length} photos
              </p>
              <h2 className="mt-1 font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
                {album.title}
              </h2>
              <p className="mt-1 text-[0.9rem] text-ink-soft">{album.description}</p>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
