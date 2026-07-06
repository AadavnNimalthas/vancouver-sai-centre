import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getForm, getBhajans } from "@/lib/data";
import { submitFormResponse } from "@/lib/actions";
import { FormRenderer } from "@/components/FormRenderer";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Form Sign-Up · Portal",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalFormPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const form = await getForm(id);
  if (!form || !form.published) notFound();

  // Fetch approved bhajans in case the form has a bhajan-select field
  const bhajans = await getBhajans(true);

  // Inline server action to pass to the client FormRenderer
  async function handleSubmit(answers: Record<string, unknown>) {
    "use server";
    return submitFormResponse({ formId: id, answers });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Reveal>
        <Link href="/portal/bhajans" className="link-editorial text-[0.85rem]">
          &larr; Back to Bhajans
        </Link>
        <h1 className="mt-6 font-display text-3xl sm:text-4xl text-ink leading-tight">
          {form.title}
        </h1>
      </Reveal>

      <div className="border-t border-line/60 pt-6">
        <FormRenderer
          form={form}
          bhajans={bhajans}
          submitLabel="Submit Sign-Up"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
