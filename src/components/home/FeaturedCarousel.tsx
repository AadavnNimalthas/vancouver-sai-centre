"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { Post } from "@/lib/types";

/**
 * The featured area at the top of the homepage: a quiet, scrollable row of
 * admin-created posts. Supports images, video, and Instagram embeds.
 */
export function FeaturedCarousel({ posts }: { posts: Post[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const slide = el.children[i] as HTMLElement | undefined;
    if (slide) el.scrollTo({ left: slide.offsetLeft - 20, behavior: "smooth" });
  }, []);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    let best = 0;
    let bestDist = Infinity;
    [...el.children].forEach((child, i) => {
      const dist = Math.abs((child as HTMLElement).offsetLeft - el.scrollLeft - 20);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActive(best);
  }, []);

  if (posts.length === 0) return null;

  return (
    <section aria-label="Featured" className="relative">
      <div
        ref={scroller}
        onScroll={onScroll}
        className="scroll-x flex snap-x snap-mandatory gap-4 px-5 pb-2 sm:px-8 lg:px-[max(2rem,calc((100vw-72rem)/2))]"
      >
        {posts.map((post) => (
          <FeaturedSlide key={post.id} post={post} />
        ))}
        {/* trailing spacer so the last slide can snap into view */}
        <div className="w-1 shrink-0" aria-hidden="true" />
      </div>

      {posts.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            onClick={() => scrollToIndex(Math.max(0, active - 1))}
            className="btn btn-ghost !px-2.5 !py-1 text-lg"
            aria-label="Previous"
          >
            ←
          </button>
          <div className="flex gap-2">
            {posts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to: ${p.title}`}
                aria-current={active === i}
                className={`size-2 rounded-full transition-colors ${
                  active === i ? "bg-terra" : "bg-gold-soft hover:bg-gold"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => scrollToIndex(Math.min(posts.length - 1, active + 1))}
            className="btn btn-ghost !px-2.5 !py-1 text-lg"
            aria-label="Next"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}

function FeaturedSlide({ post }: { post: Post }) {
  const external = post.ctaUrl?.startsWith("http");

  // Instagram posts render as an embed beside the caption text.
  if (post.instagramUrl) {
    const embedUrl = post.instagramUrl.replace(/\/?$/, "/") + "embed";
    return (
      <article className="flex w-[88%] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-line bg-white-warm sm:w-[70%] sm:flex-row lg:w-[58%]">
        <iframe
          src={embedUrl}
          title={post.title}
          className="h-[380px] w-full border-0 sm:h-auto sm:w-1/2"
          loading="lazy"
        />
        <div className="flex flex-1 flex-col justify-center p-7">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-gold">
            From our Instagram
          </p>
          <h2 className="mt-2 font-display text-2xl leading-snug text-ink">{post.title}</h2>
          {post.description && (
            <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{post.description}</p>
          )}
          <a
            href={post.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-editorial mt-4 text-[0.9rem]"
          >
            See the post
          </a>
        </div>
      </article>
    );
  }

  return (
    <article className="relative w-[88%] shrink-0 snap-start overflow-hidden rounded-lg sm:w-[70%] lg:w-[58%]">
      {post.videoUrl ? (
        <video
          src={post.videoUrl}
          poster={post.imageUrl ?? undefined}
          controls
          playsInline
          className="h-[380px] w-full bg-ink object-cover sm:h-[420px]"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.imageUrl ?? "/images/hero-dawn.svg"}
          alt=""
          className="h-[380px] w-full object-cover sm:h-[420px]"
        />
      )}

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/75 via-ink/20 to-transparent p-7 sm:p-9">
        <h2 className="max-w-lg font-display text-2xl leading-snug text-cream sm:text-3xl">
          {post.title}
        </h2>
        {post.description && (
          <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-cream/85">
            {post.description}
          </p>
        )}
        {post.ctaLabel && post.ctaUrl && (
          <div className="mt-5">
            {external ? (
              <a
                href={post.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary !px-5 !py-2.5 text-[0.875rem]"
              >
                {post.ctaLabel}
              </a>
            ) : (
              <Link href={post.ctaUrl} className="btn btn-primary !px-5 !py-2.5 text-[0.875rem]">
                {post.ctaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
