import type { Metadata } from "next";
import Link from "next/link";
import { AdminSetupPrompt } from "@/components/AdminSetupPrompt";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { getAlbums } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { roleAtLeast } from "@/lib/types";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photo albums from the Vancouver Sai Centre.",
};

export default async function GalleryPage() {
  const [albums, user] = await Promise.all([getAlbums(), getCurrentUser()]);
  const isAdmin = Boolean(user && roleAtLeast(user.role, "wing-lead"));

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Photos</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Photo gallery
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Albums from festivals, service projects, and retreats.
        </p>
      </Reveal>

      {albums.length === 0 && (
        <div className="mt-12 max-w-md">
          <p className="text-ink-soft">No albums have been published yet.</p>
          <div className="mt-4">
            <AdminSetupPrompt
              isAdmin={isAdmin}
              title="No albums yet"
              detail="Paste a Google Photos album link in the Gallery console to publish the first album."
              href="/admin/gallery"
            />
          </div>
        </div>
      )}

      <RevealGroup className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
        {albums.map((album) => {
          const external = Boolean(album.googlePhotosUrl);
          const href = album.googlePhotosUrl ?? `/gallery/${album.id}`;
          return (
            <RevealItem key={album.id}>
              <Link
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group block"
              >
                <div className="overflow-hidden rounded-lg">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={album.coverUrl}
                      alt=""
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-sand font-display text-2xl text-ink-faint">
                      {album.title}
                    </div>
                  )}
                </div>
                <p className="mt-4 text-[0.75rem] uppercase tracking-[0.16em] text-ink-faint">
                  {formatShortDate(album.date)}
                  {external
                    ? " · opens in Google Photos"
                    : album.photos.length > 0
                      ? ` · ${album.photos.length} photos`
                      : ""}
                </p>
                <h2 className="mt-1 font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
                  {album.title}
                </h2>
                <p className="mt-1 text-[0.9rem] text-ink-soft">{album.description}</p>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
