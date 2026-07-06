"use client";

import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import type { BhajanSignUpForm, BhajanSubmission } from "@/lib/types";

interface BhajanFormCardProps {
  form: BhajanSignUpForm;
  submission?: BhajanSubmission | null;
}

export function BhajanFormCard({ form, submission }: BhajanFormCardProps) {
  const now = new Date();
  const open = new Date(form.openDate);
  const close = new Date(form.closeDate);

  const isOpen = now >= open && now <= close;
  const isUpcoming = now < open;
  const isClosed = now > close;

  let statusText = "Open";
  let statusClass = "bg-green-50 text-green-700 border-green-200";

  if (submission) {
    statusText = "Submitted";
    statusClass = "bg-blue-50 text-blue-700 border-blue-200";
  } else if (isClosed) {
    statusText = "Closed";
    statusClass = "bg-neutral-50 text-neutral-500 border-neutral-200";
  } else if (isUpcoming) {
    statusText = "Upcoming";
    statusClass = "bg-gold-soft/20 text-gold border-gold-soft";
  }

  const daysLeft = Math.ceil((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="card hover:shadow-soft transition-all duration-300 overflow-hidden flex flex-col justify-between h-full border-line bg-white-warm">
      <div className="p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className={`inline-block text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusClass}`}>
            {statusText}
          </span>
          {!isClosed && isOpen && (
            <span className="text-xs text-ink-faint">
              {daysLeft === 1 ? "Closes today" : `Closes in ${daysLeft} days`}
            </span>
          )}
        </div>

        <h3 className="font-display text-xl sm:text-2xl text-ink leading-snug">
          {form.title}
        </h3>
        <p className="mt-3 text-[0.9rem] text-ink-soft line-clamp-3 leading-relaxed">
          {form.description}
        </p>

        <div className="mt-5 space-y-2 border-t border-line/60 pt-4 text-xs text-ink-soft">
          <div className="flex justify-between">
            <span className="text-ink-faint">Bhajans Required:</span>
            <span className="font-semibold text-ink">{form.bhajansRequired}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Categories:</span>
            <span className="font-semibold text-ink text-right">
              {[
                form.allowedCategories.length === 0 ? "Any category" : form.allowedCategories.join(", "),
                (form.allowedTempos?.length ?? 0) > 0 ? `Tempo: ${form.allowedTempos.join(", ")}` : null,
                (form.allowedBeats?.length ?? 0) > 0 ? `Beat: ${form.allowedBeats.join(", ")}` : null,
              ].filter(Boolean).join(" · ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-faint">Deadline:</span>
            <span className="font-semibold text-ink">{formatShortDate(form.closeDate)}</span>
          </div>
        </div>
      </div>

      <div className="bg-sand/10 border-t border-line/40 px-6 py-4 flex items-center justify-end">
        {isClosed ? (
          <span className="text-sm font-semibold text-ink-faint">Sign-ups are closed</span>
        ) : isUpcoming ? (
          <span className="text-sm font-semibold text-ink-faint">Opens {formatShortDate(form.openDate)}</span>
        ) : (
          <Link
            href={`/portal/bhajans/signup/${form.id}`}
            className="btn btn-primary !px-5 !py-1.5 text-xs inline-flex items-center"
          >
            {submission ? "Modify Sign-Up" : "Submit Sign-Up"}
          </Link>
        )}
      </div>
    </div>
  );
}
