"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cancelRegistration } from "@/lib/actions";
import { formatEventDate } from "@/lib/format";
import type { Registration } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function RegistrationList({ registrations }: { registrations: Registration[] }) {
  const [cancelled, setCancelled] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function handleCancel(id: string) {
    startTransition(async () => {
      const result = await cancelRegistration(id);
      if (result.ok) setCancelled((prev) => new Set(prev).add(id));
    });
  }

  const visible = registrations.filter((r) => r.status !== "cancelled");

  if (visible.length === 0) {
    return (
      <p className="rounded-lg border border-line bg-white-warm p-10 text-center text-ink-soft">
        No registrations yet.{" "}
        <Link href="/events" className="link-editorial">Browse upcoming events</Link>{" "}
        to join one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visible.map((r) => {
        const isCancelled = cancelled.has(r.id);
        return (
          <div
            key={r.id}
            className={`card flex flex-wrap items-center justify-between gap-4 p-6 transition-opacity ${
              isCancelled ? "opacity-50" : ""
            }`}
          >
            <div className="min-w-0">
              <p className="font-display text-xl text-ink">{r.eventTitle}</p>
              <p className="mt-1 text-[0.875rem] text-ink-soft">
                {r.eventStartsAt && formatEventDate(r.eventStartsAt)} ·{" "}
                {r.kind === "volunteer" ? "Volunteering" : "Attending"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={isCancelled ? "cancelled" : r.status} />
              {!isCancelled && (
                <button
                  onClick={() => handleCancel(r.id)}
                  disabled={pending}
                  className="text-[0.85rem] text-ink-faint underline decoration-line underline-offset-4 transition-colors hover:text-terra-deep"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
