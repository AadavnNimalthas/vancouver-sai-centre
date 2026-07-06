import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getBhajans, getBhajanSignUpForms, getBhajanSubmissions } from "@/lib/data";
import { BhajanCoordinatorConsole } from "@/components/admin/BhajanCoordinatorConsole";
import { Reveal } from "@/components/Reveal";
import type { BhajanSubmission } from "@/lib/types";

export const metadata: Metadata = {
  title: "Bhajans Coordinator Console · Admin",
};

export default async function AdminBhajansPage() {
  // Authorize Devotional Coordinators / Wing Leads
  const user = await requireRole("wing-lead");
  if (!user) redirect("/portal");

  // Fetch signup forms, all library bhajans
  const [forms, allBhajans] = await Promise.all([
    getBhajanSignUpForms(false), // Fetch drafts too
    getBhajans(false), // Fetch pending/archived too
  ]);

  // Load submissions and shares for all forms in parallel
  const submissionsMap: Record<string, BhajanSubmission[]> = {};
  const sharesMap: Record<string, any[]> = {};
  await Promise.all(
    forms.map(async (form) => {
      const [subs, shares] = await Promise.all([
        getBhajanSubmissions(form.id),
        import("@/lib/data").then(m => m.getFormShares(form.id, true))
      ]);
      submissionsMap[form.id] = subs;
      sharesMap[form.id] = shares;
    })
  );

  const pendingBhajans = allBhajans.filter((b) => b.status === "pending");
  const approvedBhajans = allBhajans.filter((b) => b.status === "approved" || !b.status);

  return (
    <div className="space-y-6">
      <Reveal>
        <p className="eyebrow">Administration</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Bhajan Coordinator Console
        </h1>
        <p className="mt-4 max-w-xl text-[0.95rem] text-ink-soft leading-relaxed">
          Review member song requests, manage active Sunday and festival sign-up sheets, approve library suggestions, and coordinate devotional sessions.
        </p>
      </Reveal>

      <div className="border-t border-line/60 pt-6">
        <BhajanCoordinatorConsole
          forms={forms}
          submissionsMap={submissionsMap}
          sharesMap={sharesMap}
          pendingBhajans={pendingBhajans}
          allBhajans={approvedBhajans}
        />
      </div>
    </div>
  );
}
