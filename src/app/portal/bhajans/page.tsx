import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMyBhajans, getFavoriteBhajanIds, getMyFormResponses, getPublishedForms } from "@/lib/data";
import { GeneralFormCard } from "@/components/portal/GeneralFormCard";
import { BhajanHistoryList } from "@/components/portal/BhajanHistoryList";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Bhajans · Portal",
};

export default async function PortalBhajansPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch published builder forms, submissions, favorites
  const [allPublishedForms, myResponses, myBhajans, favoriteIds] = await Promise.all([
    getPublishedForms(), // Forms pushed from the form builder
    getMyFormResponses(user.id),
    getMyBhajans(user.id),
    getFavoriteBhajanIds(user.id),
  ]);

  const responsesMap = new Map(myResponses.map((r) => [r.formId, r]));

  // Only show bhajan forms here
  const activeForms = allPublishedForms.filter((f) => f.wing === "bhajans" || f.wing === "devotional");

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
              There are no active sign-up forms at this time. Check back later!
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeForms.map((form) => (
                <GeneralFormCard
                  key={form.id}
                  form={form}
                  response={responsesMap.get(form.id)}
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
