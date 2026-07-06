import type { Metadata } from "next";
import { ResourceBrowser } from "@/components/library/ResourceBrowser";
import { getResources } from "@/lib/data";

export const metadata: Metadata = { title: "Resources" };

export default async function PortalResourcesPage() {
  const resources = await getResources();

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Resources</h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        The full library, including member-only study materials and recordings.
      </p>
      <div className="mt-10">
        <ResourceBrowser resources={resources} signedIn />
      </div>
    </div>
  );
}
