import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBhajanSignUpForm, getBhajanSubmissions, getForm, getFormShares } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Reveal } from "@/components/Reveal";
import { formatShortDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Shared Sign-Up Sheet · Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SharedFormPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { type } = await searchParams;
  const isBhajanForm = type === "bhajan";

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Verify access via form_shares
  const shares = await getFormShares(id, isBhajanForm);
  const hasAccess = shares.some(s => s.userId === user.id) || 
    ["administrator", "executive", "president"].includes(user.role);

  if (!hasAccess) {
    return (
      <div className="py-20 text-center">
        <h1 className="font-display text-3xl text-ink">Access Denied</h1>
        <p className="mt-4 text-ink-soft max-w-md mx-auto">
          You don't have permission to view this sign-up sheet. If you believe this is an error, please ask the coordinator to share it with your account email.
        </p>
        <Link href="/portal" className="btn btn-primary mt-8 inline-block">
          Return to Portal
        </Link>
      </div>
    );
  }

  if (isBhajanForm) {
    const form = await getBhajanSignUpForm(id);
    if (!form) notFound();

    const submissions = await getBhajanSubmissions(id);

    return (
      <div className="space-y-8 max-w-4xl">
        <Reveal>
          <Link href="/portal" className="link-editorial text-[0.85rem]">
            &larr; Back to Portal
          </Link>
          <h1 className="mt-6 font-display text-3xl sm:text-4xl text-ink leading-tight">
            {form.title} (Shared)
          </h1>
          <p className="mt-3 text-[0.95rem] text-ink-soft leading-relaxed">
            {form.description}
          </p>
        </Reveal>

        <div className="border-t border-line/60 pt-6">
          <h2 className="text-xl font-display font-bold text-ink mb-6">Submissions ({submissions.length})</h2>
          {submissions.length === 0 ? (
            <div className="rounded-lg border border-line bg-sand/10 p-10 text-center text-ink-soft">
              No submissions received yet for this session.
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="card p-5 border-line bg-white-warm space-y-3">
                  <div className="flex items-center justify-between border-b border-line pb-2.5">
                    <div>
                      <span className="font-semibold text-ink">{sub.userName}</span>
                      <span className="text-xs text-ink-faint ml-2.5">({sub.userEmail})</span>
                    </div>
                    <span className="text-xs text-ink-faint">{formatShortDate(sub.createdAt)}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {sub.bhajans?.map((bh, i) => (
                      <div key={bh.id} className="p-3 rounded bg-sand/20 border border-line/40 text-xs">
                        <p className="font-semibold text-ink-faint">Slot #{i + 1}</p>
                        <p className="font-display font-bold text-ink mt-1 text-sm">{bh.title}</p>
                        <p className="text-ink-soft mt-0.5">{bh.category} · {bh.language} · {bh.tempo.replace("_", " ")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle standard general forms
  const form = await getForm(id);
  if (!form) notFound();

  // Fetch responses (we don't have a dedicated function for this if not in admin-actions, so we inline it or use supabase)
  const supabase = await createClient();
  const { data } = await supabase.from("form_responses").select("*").eq("form_id", id).order("created_at", { ascending: false });
  const responses = data || [];

  return (
    <div className="space-y-8 max-w-4xl">
      <Reveal>
        <Link href="/portal" className="link-editorial text-[0.85rem]">
          &larr; Back to Portal
        </Link>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl text-ink leading-tight">
          {form.title} (Shared)
        </h1>
        <p className="mt-3 text-[0.95rem] text-ink-soft leading-relaxed">
          {form.description}
        </p>
      </Reveal>

      <div className="border-t border-line/60 pt-6">
        <h2 className="text-xl font-display font-bold text-ink mb-6">Submissions ({responses.length})</h2>
        {responses.length === 0 ? (
          <div className="rounded-lg border border-line bg-sand/10 p-10 text-center text-ink-soft">
            No responses received yet.
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((res) => (
              <div key={res.id} className="card p-5 border-line bg-white-warm space-y-3">
                <div className="flex items-center justify-between border-b border-line pb-2.5">
                  <div>
                    <span className="font-semibold text-ink">{res.user_name}</span>
                    <span className="text-xs text-ink-faint ml-2.5">({res.user_email})</span>
                  </div>
                  <span className="text-xs text-ink-faint">{formatShortDate(res.created_at)}</span>
                </div>
                <div className="space-y-2 mt-3">
                  {Object.entries(res.answers).map(([key, val]) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-ink-faint">{key}</p>
                      <p className="text-sm text-ink">{Array.isArray(val) ? val.join(", ") : String(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
