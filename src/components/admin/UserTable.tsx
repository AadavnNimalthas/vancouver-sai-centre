"use client";

import { useState, useTransition } from "react";
import { setUserRole, setUserWing } from "@/lib/admin-actions";
import {
  ROLES,
  ROLE_LABELS,
  WING_LABELS,
  WING_SLUGS,
  type Profile,
  type Role,
  type WingSlug,
} from "@/lib/types";
import { formatShortDate } from "@/lib/format";

export function UserTable({
  profiles,
  canEditRoles,
}: {
  profiles: Profile[];
  canEditRoles: boolean;
}) {
  const [query, setQuery] = useState("");
  const [local, setLocal] = useState(profiles);
  const [, startTransition] = useTransition();

  const filtered = local.filter((p) =>
    `${p.fullName} ${p.email}`.toLowerCase().includes(query.toLowerCase())
  );

  function changeRole(id: string, role: Role) {
    setLocal((rows) => rows.map((p) => (p.id === id ? { ...p, role } : p)));
    startTransition(() => {
      setUserRole(id, role);
    });
  }

  function changeWing(id: string, wing: WingSlug | null) {
    setLocal((rows) => rows.map((p) => (p.id === id ? { ...p, wing } : p)));
    startTransition(() => {
      setUserWing(id, wing);
    });
  }

  return (
    <div>
      <input
        type="search"
        placeholder="Search members by name or email…"
        className="field max-w-md"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search members"
      />

      <div className="card scroll-x mt-6">
        <table className="table-warm w-full min-w-[680px]">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Interests</th>
              <th>Role</th>
              <th>Wing</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="font-medium text-ink">{p.fullName}</td>
                <td className="text-ink-soft">{p.email}</td>
                <td className="text-ink-soft">{formatShortDate(p.joinedAt)}</td>
                <td className="tabular-nums text-ink-soft">{p.interests.length}</td>
                <td>
                  {canEditRoles ? (
                    <select
                      className="field !w-auto !py-1.5 text-[0.85rem]"
                      value={p.role}
                      onChange={(e) => changeRole(p.id, e.target.value as Role)}
                      aria-label={`Role for ${p.fullName}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-ink-soft">{ROLE_LABELS[p.role]}</span>
                  )}
                </td>
                <td>
                  {p.role === "wing-lead" && canEditRoles ? (
                    <select
                      className="field !w-auto !py-1.5 text-[0.85rem]"
                      value={p.wing ?? ""}
                      onChange={(e) =>
                        changeWing(p.id, (e.target.value || null) as WingSlug | null)
                      }
                      aria-label={`Wing for ${p.fullName}`}
                    >
                      <option value="">No wing</option>
                      {WING_SLUGS.map((w) => (
                        <option key={w} value={w}>
                          {WING_LABELS[w]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-ink-soft">
                      {p.wing ? WING_LABELS[p.wing] : "—"}
                    </span>
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
