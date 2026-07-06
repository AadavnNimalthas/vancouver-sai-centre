import { getCurrentUser } from "@/lib/auth";
import { getSiteContent } from "@/lib/data";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, site] = await Promise.all([getCurrentUser(), getSiteContent()]);
  const bhajanTime = site.whenMeet.find((m) =>
    m.label.toLowerCase().includes("bhajan")
  );

  return (
    <>
      <SiteHeader signedIn={Boolean(user)} />
      <main>{children}</main>
      <SiteFooter
        address={site.address}
        email={site.contactEmail}
        valueNames={site.values.map((v) => v.name)}
        meetLine={bhajanTime ? `${bhajanTime.label}, ${bhajanTime.time}` : ""}
      />
    </>
  );
}
