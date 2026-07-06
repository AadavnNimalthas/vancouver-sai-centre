"use client";

import { useState, useTransition } from "react";
import { requestWingAccess, resolveWingAccess } from "@/lib/admin-actions";
import {
  WING_LABELS,
  WING_SLUGS,
  roleAtLeast,
  type AccessRequest,
  type Profile,
  type WingSlug,
} from "@/lib/types";
import { formatShortDate } from "@/lib/format";

export function CoordinationPanel({
  user,
  requests,
}: {
  user: Profile;
  requests: AccessRequest[];
}) {
  const [local, setLocal] = useState(requests);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const canApprove = roleAtLeast(user.role, "executive");
  const isCoordinator = user.role === "wing-lead";
  const myWings = new Set<WingSlug>(
    [user.wing, ...user.extraWings].filter(Boolean) as WingSlug[]
  );
  const requestable = WING_SLUGS.filter((w) => !myWings.has(w));

  function handleRequest(wing: WingSlug) {
    startTransition(async () => {
      const result = await requestWingAccess(wing);
      setMessage(result.message);
      if (result.ok) {
        setLocal((rs) => [
          {
            id: `local-${Date.now()}`,
            requesterId: user.id,
            requesterName: user.fullName,
            wing,
            status: "pending",
            createdAt: new Date().toISOString(),
          },
          ...rs,
        ]);
      }
    });
  }

  function handleResolve(id: string, approve: boolean) {
    setLocal((rs) =>
      rs.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "denied" } : r))
    );
    startTransition(() => {
      resolveWingAccess(id, approve);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {isCoordinator && (
        <section className="card p-7">
          <h2 className="font-display text-2xl text-ink">Your wing access</h2>
          <p className="mt-1 text-[0.875rem] text-ink-soft">
            You coordinate{" "}
            <strong className="text-ink">
              {user.wing ? WING_LABELS[user.wing] : "no wing yet"}
            </strong>
            {user.extraWings.length > 0 && (
              <>
                {" "}
                and also have access to{" "}
                {user.extraWings.map((w) => WING_LABELS[w as WingSlug]).join(", ")}
              </>
            )}
            .
          </p>
          {requestable.length > 0 && (
            <>
              <p className="label mt-5">Request visibility into another wing</p>
              <div className="flex flex-wrap gap-2">
                {requestable.map((w) => (
                  <button
                    key={w}
                    onClick={() => handleRequest(w)}
                    disabled={pending}
                    className="btn btn-quiet !px-4 !py-2 text-[0.85rem]"
                  >
                    + {WING_LABELS[w]}
                  </button>
                ))}
              </div>
            </>
          )}
          {message && <p className="mt-4 text-[0.875rem] text-ink-soft">{message}</p>}
        </section>
      )}

      <section className="card p-7">
        <h2 className="font-display text-2xl text-ink">Access requests</h2>
        <p className="mt-1 text-[0.875rem] text-ink-soft">
          {canApprove
            ? "Approve or decline requests from wing coordinators."
            : "Requests are reviewed by the executive team."}
        </p>
        <div className="mt-4 divide-y divide-line">
          {local.length === 0 && (
            <p className="py-6 text-center text-[0.9rem] text-ink-soft">
              No requests yet.
            </p>
          )}
          {local.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div>
                <p className="text-[0.925rem] text-ink">
                  <strong>{r.requesterName || "A coordinator"}</strong> requests access
                  to <strong>{WING_LABELS[r.wing]}</strong>
                </p>
                <p className="text-[0.8rem] text-ink-faint">{formatShortDate(r.createdAt)}</p>
              </div>
              {r.status === "pending" && canApprove ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(r.id, true)}
                    className="btn btn-primary !px-4 !py-1.5 text-[0.8rem]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, false)}
                    className="btn btn-ghost !px-3 !py-1.5 text-[0.8rem]"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <span
                  className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold ${
                    r.status === "approved"
                      ? "bg-gold-soft text-ink"
                      : r.status === "denied"
                        ? "bg-sand text-ink-faint"
                        : "bg-terra/10 text-terra-deep"
                  }`}
                >
                  {r.status === "pending" ? "Awaiting review" : r.status}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
