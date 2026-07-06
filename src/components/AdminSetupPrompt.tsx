import Link from "next/link";

/**
 * Shown in place of a homepage section that has no content yet.
 * Rendered only for signed-in admins; the public sees nothing.
 */
export function AdminSetupPrompt({
  isAdmin,
  title,
  detail,
  href,
}: {
  isAdmin: boolean;
  title: string;
  detail: string;
  href: string;
}) {
  if (!isAdmin) return null;
  return (
    <div className="rounded-lg border border-dashed border-gold bg-sand/40 p-6">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-gold">
        Only admins can see this
      </p>
      <p className="mt-2 font-medium text-ink">{title}</p>
      <p className="mt-1 text-[0.9rem] text-ink-soft">{detail}</p>
      <Link href={href} className="link-editorial mt-3 inline-block text-[0.9rem]">
        Open the admin console
      </Link>
    </div>
  );
}
