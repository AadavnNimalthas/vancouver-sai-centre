import type { Metadata } from "next";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { getResources } from "@/lib/data";

export const metadata: Metadata = { title: "Resource manager" };

export default async function AdminResourcesPage() {
  const resources = await getResources();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Resources</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Everything in the public and member libraries. Upload files to
          Supabase Storage and link them here.
        </p>
      </div>
      <ResourceManager resources={resources} />
    </div>
  );
}
