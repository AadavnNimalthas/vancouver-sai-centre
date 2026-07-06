import type { Metadata } from "next";
import { ResourceBrowser } from "@/components/library/ResourceBrowser";
import { Reveal } from "@/components/Reveal";
import { getCurrentUser } from "@/lib/auth";
import { getResources } from "@/lib/data";

export const metadata: Metadata = {
  title: "Resources",
  description: "Study guides, discourses, forms, and recordings from the Vancouver Sai Centre.",
};

export default async function ResourcesPage() {
  const [resources, user] = await Promise.all([getResources(), getCurrentUser()]);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-36 sm:px-8">
      <Reveal>
        <p className="eyebrow eyebrow-rule">Library</p>
        <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.08] text-ink sm:text-6xl">
          Resources
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Study guides, discourses, recordings, and forms. Some materials are
          reserved for members.
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-12">
        <ResourceBrowser resources={resources} signedIn={Boolean(user)} />
      </Reveal>
    </div>
  );
}
