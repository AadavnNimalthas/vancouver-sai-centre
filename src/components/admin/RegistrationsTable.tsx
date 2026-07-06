"use client";

import { useState, useTransition } from "react";
import { setRegistrationStatus } from "@/lib/admin-actions";
import { StatusBadge } from "@/components/portal/StatusBadge";
import type { Registration, RegistrationStatus } from "@/lib/types";

export function RegistrationsTable({ registrations }: { registrations: Registration[] }) {
  const [local, setLocal] = useState(registrations);
  const [, startTransition] = useTransition();

  const counts = {
    registered: local.filter((r) => r.status === "registered").length,
    checkedIn: local.filter((r) => r.status === "checked-in").length,
    waitlisted: local.filter((r) => r.status === "waitlisted").length,
  };
  const attendanceBase = counts.registered + counts.checkedIn;
  const attendanceRate =
    attendanceBase > 0 ? Math.round((counts.checkedIn / attendanceBase) * 100) : 0;

  function update(id: string, status: RegistrationStatus) {
    setLocal((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(() => {
      setRegistrationStatus(id, status);
    });
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Registered" value={counts.registered} />
        <Stat label="Checked in" value={counts.checkedIn} />
        <Stat label="Waitlisted" value={counts.waitlisted} />
        <Stat label="Attendance rate" value={`${attendanceRate}%`} />
      </div>

      <div className="card scroll-x mt-6">
        <table className="table-warm w-full min-w-[640px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Type</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {local.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-ink-soft">
                  No signups yet.
                </td>
              </tr>
            )}
            {local.map((r) => (
              <tr key={r.id}>
                <td className="font-medium text-ink">{r.userName ?? "Guest"}</td>
                <td className="text-ink-soft">{r.userEmail ?? "—"}</td>
                <td className="text-ink-soft">{r.kind === "volunteer" ? "Volunteer" : "Attendee"}</td>
                <td><StatusBadge status={r.status} /></td>
                <td className="text-right">
                  {r.status === "registered" && (
                    <button onClick={() => update(r.id, "checked-in")} className="btn btn-quiet !px-3 !py-1.5 text-[0.8rem]">
                      Check in
                    </button>
                  )}
                  {r.status === "waitlisted" && (
                    <button onClick={() => update(r.id, "registered")} className="btn btn-quiet !px-3 !py-1.5 text-[0.8rem]">
                      Promote
                    </button>
                  )}
                  {r.status === "checked-in" && (
                    <button onClick={() => update(r.id, "registered")} className="text-[0.8rem] text-ink-faint underline underline-offset-4">
                      Undo
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className="mt-1 text-[1.6rem] font-semibold text-ink">{value}</p>
    </div>
  );
}
