import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBhajan, getBhajans } from "@/lib/data";
import { BhajanDetails } from "@/components/library/BhajanDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const bhajan = await getBhajan(id);
  return { title: bhajan ? bhajan.title : "Bhajan" };
}

export default async function BhajanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bhajan = await getBhajan(id);
  if (!bhajan) notFound();

  // Fetch other versions/variations of the same bhajan (matching sourceLink)
  const allBhajans = await getBhajans(true);
  const link = bhajan.sourceLink;
  const versions = link
    ? allBhajans.filter(
        (b) =>
          b.sourceLink &&
          b.sourceLink.trim().toLowerCase() === link.trim().toLowerCase()
      )
    : [bhajan];

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8">
      <BhajanDetails versions={versions.length > 0 ? versions : [bhajan]} initialActiveId={bhajan.id} />
    </div>
  );
}
