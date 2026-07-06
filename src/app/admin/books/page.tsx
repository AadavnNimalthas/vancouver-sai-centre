import type { Metadata } from "next";
import { BookManager } from "@/components/admin/BookManager";
import { getBooks } from "@/lib/data";

export const metadata: Metadata = { title: "Physical library" };

export default async function AdminBooksPage() {
  const books = await getBooks();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Physical library</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          The catalogue of Sai literature kept at the centre. Members browse
          it on the Library page and borrow books in person.
        </p>
      </div>
      <BookManager books={books} />
    </div>
  );
}
