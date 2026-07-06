import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getBhajanSignUpForm, getBhajans, getMyBhajans, getBhajanSubmissionsForUser } from "@/lib/data";
import { BhajanSignupFormContainer } from "@/components/portal/BhajanSignupFormContainer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Bhajan Sign-Up · Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BhajanSignupPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const form = await getBhajanSignUpForm(id);
  if (!form) notFound();

  // Fetch approved bhajans, user submissions, myBhajans
  const [allBhajans, myBhajans, submissions] = await Promise.all([
    getBhajans(true), // approved only
    getMyBhajans(user.id),
    getBhajanSubmissionsForUser(user.id),
  ]);

  const submission = submissions.find((s) => s.formId === form.id) ?? null;

  return (
    <div className="space-y-8">
      <Reveal>
        <Link href="/portal/bhajans" className="link-editorial text-[0.85rem]">
          &larr; Back to Bhajans
        </Link>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl text-ink leading-tight">
          {form.title}
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] text-ink-soft leading-relaxed">
          {form.description}
        </p>
      </Reveal>

      <div className="border-t border-line/60 pt-6">
        <BhajanSignupFormContainer
          form={form}
          submission={submission}
          allBhajans={allBhajans}
          myBhajans={myBhajans}
          user={user}
        />
      </div>
    </div>
  );
}
