import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getBhajanSignUpForms, getMyBhajans, getFavoriteBhajanIds, getBhajanSubmissionsForUser, getMyFormResponses, getPublishedForms } from "@/lib/data";
import { BhajanFormCard } from "@/components/portal/BhajanFormCard";
import { GeneralFormCard } from "@/components/portal/GeneralFormCard";
import { BhajanHistoryList } from "@/components/portal/BhajanHistoryList";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Bhajans · Portal",
};

export default async function PortalBhajansPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch signup forms, published builder forms, submissions, favorites
  const [allForms, publishedForms, myResponses, myBhajans, favoriteIds, submissions] = await Promise.all([
    getBhajanSignUpForms(true), // Only published
    getPublishedForms(), // Forms pushed from the form builder
    getMyFormResponses(user.id),
    getMyBhajans(user.id),
    getFavoriteBhajanIds(user.id),
    getBhajanSubmissionsForUser(user.id),
  ]);

  // Map submissions to forms for checking submission state
  const submissionsMap = new Map(submissions.map((s) => [s.formId, s]));
  const responsesMap = new Map(myResponses.map((r) => [r.formId, r]));

  // Separate active (now between open and close) and closed
  const now = new Date();
  const activeForms = allForms.filter((f) => {
    const open = new Date(f.openDate);
    const close = new Date(f.closeDate);
    return now >= open && now <= close;
  });

  return (
    <div className="space-y-10">
      <Reveal>
        <p className="eyebrow">Member Portal</p>
        <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">
          Bhajan Offerings
        </h1>
        <p className="mt-4 max-w-xl text-[0.95rem] text-ink-soft leading-relaxed">
          Manage your devotional offerings. Quickly submit bhajans for upcoming sessions using entries from the central library.
        </p>
      </Reveal>

      {/* Active Signups */}
      <Reveal delay={0.1}>
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-ink">Active Sign-ups</h2>
          {activeForms.length === 0 ? (
            <div className="rounded-lg border border-line bg-sand/15 p-6 text-center text-sm text-ink-soft">
              There are no active bhajan sign-up forms at this time. Check back later!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeForms.map((form) => (
                <BhajanFormCard
                  key={form.id}
                  form={form}
                  submission={submissionsMap.get(form.id)}
                />
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* My Bhajans (History/Bookmarks) */}
      <Reveal delay={0.15}>
        <section className="space-y-4 border-t border-line/60 pt-8">
          <div>
            <h2 className="font-display text-2xl text-ink">My Bhajans</h2>
            <p className="text-xs text-ink-soft mt-1">
              Your bookmarks and historical list of devotional offerings for rapid reuse in sign-up forms.
            </p>
          </div>
          <BhajanHistoryList
            favorites={myBhajans.favorites}
            recentlyUsed={myBhajans.recentlyUsed}
            submitted={myBhajans.submitted}
            favoriteIds={favoriteIds}
          />
        </section>
      </Reveal>
    </div>
  );
}
