"use client";

import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import type { FormResponse, SaiForm } from "@/lib/types";

/**
 * Card for a published form-builder form surfaced in the portal's
 * Active Sign-ups, alongside the coordinator's bhajan sheets.
 */
export function GeneralFormCard({
  form,
  response,
}: {
  form: SaiForm;
  response?: FormResponse | null;
}) {
  const bhajanSlots = form.fields.filter((f) => f.type === "bhajan-select").length;

  return (
    <div className="card hover:shadow-soft transition-all duration-300 overflow-hidden flex flex-col justify-between h-full border-line bg-white-warm">
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
              response
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-green-50 text-green-700 border-green-200"
            }`}
          >
            {response ? "Submitted" : "Open"}
          </span>
          <span className="text-xs text-ink-faint">
            Updated {formatShortDate(form.updatedAt)}
          </span>
        </div>

        <h3 className="font-display text-xl leading-snug text-ink sm:text-2xl">
          {form.title}
        </h3>
        {form.description && (
          <p className="mt-3 line-clamp-3 text-[0.9rem] leading-relaxed text-ink-soft">
            {form.description}
          </p>
        )}

        <div className="mt-5 space-y-2 border-t border-line/60 pt-4 text-xs text-ink-soft">
          <div className="flex justify-between">
            <span className="text-ink-faint">Questions:</span>
            <span className="font-semibold text-ink">{form.fields.length}</span>
          </div>
          {bhajanSlots > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-faint">Bhajan slots:</span>
              <span className="font-semibold text-ink">{bhajanSlots}</span>
            </div>
          )}
          {response && (
            <div className="flex justify-between">
              <span className="text-ink-faint">You submitted:</span>
              <span className="font-semibold text-ink">{formatShortDate(response.createdAt)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-line/40 bg-sand/10 px-6 py-4">
        <Link
          href={`/portal/forms/${form.id}`}
          className="btn btn-primary !px-5 !py-1.5 inline-flex items-center text-xs"
        >
          {response ? "Modify Sign-Up" : "Submit Sign-Up"}
        </Link>
      </div>
    </div>
  );
}
