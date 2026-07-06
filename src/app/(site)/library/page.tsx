import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "@/components/Reveal";
import { getBhajans, getBooks, getResources } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Library",
  description:
    "The physical Sai literature library, the resource library, and the bhajan book of the Vancouver Sai Centre.",
};

export default async function LibraryPage() {
  const [books, resources, bhajans] = await Promise.all([
    getBooks(),
    getResources(),
    getBhajans(),
  ]);
  const recentBooks = books.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Library</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          The library
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Three collections: books you can borrow at the centre, digital
          resources, and the bhajan book.
        </p>
      </Reveal>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.1}>
        <RevealItem>
          <Link href="/library/books" className="card group block h-full p-8 transition-shadow hover:shadow-soft">
            <p className="font-display text-3xl text-gold" aria-hidden="true">❡</p>
            <h2 className="mt-3 font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
              Physical library
            </h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">
              Sai literature kept at the centre. Browse the catalogue, then
              borrow in person.
            </p>
            <p className="mt-4 text-[0.8rem] text-ink-faint">{books.length} books</p>
          </Link>
        </RevealItem>
        <RevealItem>
          <Link href="/library/resources" className="card group block h-full p-8 transition-shadow hover:shadow-soft">
            <p className="font-display text-3xl text-gold" aria-hidden="true">▸</p>
            <h2 className="mt-3 font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
              Resource library
            </h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">
              PDFs, videos, audio, bhajan recordings, Study Circle materials,
              and discourses.
            </p>
            <p className="mt-4 text-[0.8rem] text-ink-faint">{resources.length} resources</p>
          </Link>
        </RevealItem>
        <RevealItem>
          <Link href="/library/bhajans" className="card group block h-full p-8 transition-shadow hover:shadow-soft">
            <p className="font-display text-3xl text-gold" aria-hidden="true">♬</p>
            <h2 className="mt-3 font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
              Bhajan library
            </h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">
              Lyrics, meanings, and recordings for the bhajans we sing.
            </p>
            <p className="mt-4 text-[0.8rem] text-ink-faint">{bhajans.length} bhajans</p>
          </Link>
        </RevealItem>
      </RevealGroup>

      {recentBooks.length > 0 && (
        <Reveal className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="eyebrow eyebrow-rule">Recently added books</h2>
            <Link href="/library/books" className="link-editorial text-[0.9rem]">
              Browse all books
            </Link>
          </div>
          <div className="mt-4 border-t border-line">
            {recentBooks.map((b) => (
              <div key={b.id} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line py-5">
                <div>
                  <p className="font-display text-xl text-ink">{b.title}</p>
                  <p className="text-[0.85rem] text-ink-soft">
                    {b.author}
                    {b.category && <> · {b.category}</>}
                  </p>
                </div>
                <span className="text-[0.8rem] uppercase tracking-[0.12em] text-ink-faint">
                  {formatShortDate(b.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
