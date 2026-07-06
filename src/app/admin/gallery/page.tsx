import type { Metadata } from "next";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { getAlbums } from "@/lib/data";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  const albums = await getAlbums();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Gallery</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Publish photo albums from Google Photos. No coding needed.
        </p>
      </div>
      <GalleryManager albums={albums} />
    </div>
  );
}
