"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/lib/types";

/**
 * Masonry photo grid with a full-screen lightbox.
 * Keyboard: Esc closes, arrows navigate.
 */
export function PhotoMasonry({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) => (i === null ? null : (i + dir + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  return (
    <>
      <div className="masonry">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setIndex(i)}
            className="group block w-full overflow-hidden rounded-lg"
            aria-label={`Open photo: ${photo.caption || "untitled"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt={photo.caption}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              className="w-full transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {index !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[90] flex flex-col bg-ink/95 backdrop-blur-sm"
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <div className="flex items-center justify-between px-5 py-4 text-cream/70">
              <span className="text-[0.8rem] tracking-[0.14em]">
                {index + 1} / {photos.length}
              </span>
              <button
                onClick={close}
                className="rounded px-3 py-1 text-[0.85rem] uppercase tracking-[0.14em] transition-colors hover:text-cream"
              >
                Close ✕
              </button>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-14 pb-10">
              <NavButton dir={-1} onClick={(e) => { e.stopPropagation(); step(-1); }} />
              <motion.img
                key={photos[index].id}
                src={photos[index].url}
                alt={photos[index].caption}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="max-h-full max-w-full rounded object-contain shadow-lift"
                onClick={(e) => e.stopPropagation()}
              />
              <NavButton dir={1} onClick={(e) => { e.stopPropagation(); step(1); }} />
            </div>

            {photos[index].caption && (
              <p className="pb-8 text-center font-display text-lg italic text-cream/80">
                {photos[index].caption}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavButton({
  dir,
  onClick,
}: {
  dir: 1 | -1;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 1 ? "Next photo" : "Previous photo"}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full p-3 text-2xl text-cream/60 transition-colors hover:text-cream ${
        dir === 1 ? "right-3" : "left-3"
      }`}
    >
      {dir === 1 ? "→" : "←"}
    </button>
  );
}
