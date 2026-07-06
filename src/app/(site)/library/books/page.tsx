import type { Metadata } from "next";
import Link from "next/link";
import { BookBrowser } from "@/components/library/BookBrowser";
import { Reveal } from "@/components/Reveal";
import { getBooks } from "@/lib/data";

export const metadata: Metadata = {
  title: "Physical library",
  description: "Sai literature you can borrow at the Vancouver Sai Centre.",
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <Link href="/library" className="link-editorial text-[0.85rem]">
          ← Library
        </Link>
        <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Physical library
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Sai literature kept at the centre. Find a book here, then ask the
          librarian on any Sunday to borrow it.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-12">
        <BookBrowser books={books} />
      </Reveal>
    </div>
  );
}
