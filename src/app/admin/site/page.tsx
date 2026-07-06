import type { Metadata } from "next";
import { SiteContentManager } from "@/components/admin/SiteContentManager";
import { getSiteContent, getWings } from "@/lib/data";

export const metadata: Metadata = { title: "Site content" };

export default async function AdminSitePage() {
  const [content, wings] = await Promise.all([getSiteContent(), getWings()]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Site content</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Everything on the homepage that is not an event or a post: the
          introduction, the Baba and SSSIO sections, contact cards, other BC
          centres, and the wing descriptions.
        </p>
      </div>
      <SiteContentManager content={content} wings={wings} />
    </div>
  );
}
