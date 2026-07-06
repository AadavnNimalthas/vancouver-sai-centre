import type { Metadata } from "next";
import Link from "next/link";
import { getAllEvents, getForms } from "@/lib/data";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = { title: "Form builder" };

export default async function AdminFormsPage() {
  const [forms, events] = await Promise.all([getForms(), getAllEvents()]);
  const eventTitle = (id: string) => events.find((e) => e.id === id)?.title;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">Forms</h1>
          <p className="mt-2 max-w-lg text-ink-soft">
            Build registration and volunteer forms once and attach them to any
            event. This replaces external form tools.
          </p>
        </div>
        <Link href="/admin/forms/new" className="btn btn-primary">
          + New form
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {forms.map((f) => (
          <Link
            key={f.id}
            href={`/admin/forms/${f.id}`}
            className="card group block p-7 transition-shadow hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-2xl text-ink transition-colors group-hover:text-terra-deep">
                {f.title}
              </h2>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${
                  f.published ? "bg-gold-soft text-ink" : "bg-sand text-ink-faint"
                }`}
              >
                {f.published ? "Published" : "Draft"}
              </span>
            </div>
            <p className="mt-2 text-[0.9rem] text-ink-soft">{f.description}</p>
            <p className="mt-4 text-[0.8rem] text-ink-faint">
              {f.fields.length} questions · updated {formatShortDate(f.updatedAt)}
            </p>
            {f.attachedEventIds.length > 0 && (
              <p className="mt-2 text-[0.8rem] text-ink-soft">
                Attached to:{" "}
                {f.attachedEventIds.map((id) => eventTitle(id)).filter(Boolean).join(", ")}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
