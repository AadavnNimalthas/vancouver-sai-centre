import type { Metadata } from "next";
import { UserTable } from "@/components/admin/UserTable";
import { getCurrentUser } from "@/lib/auth";
import { getProfiles } from "@/lib/data";
import { roleAtLeast } from "@/lib/types";

export const metadata: Metadata = { title: "Members" };

export default async function AdminUsersPage() {
  const [profiles, user] = await Promise.all([getProfiles(), getCurrentUser()]);
  const canEditRoles = Boolean(user && roleAtLeast(user.role, "administrator"));

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Members</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          {profiles.length} members.{" "}
          {canEditRoles
            ? "Roles control what each person can see and manage."
            : "Only administrators can change roles."}
        </p>
      </div>
      <UserTable profiles={profiles} canEditRoles={canEditRoles} />
    </div>
  );
}
