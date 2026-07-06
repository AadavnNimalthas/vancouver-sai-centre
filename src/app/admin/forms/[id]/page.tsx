import type { Metadata } from "next";
import Link from "next/link";
import { FormBuilder } from "@/components/admin/FormBuilder";
import { getForm } from "@/lib/data";

export const metadata: Metadata = { title: "Form builder" };

export default async function AdminFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = id === "new" ? null : await getForm(id);

  return (
    <div>
      <Link href="/admin/forms" className="link-editorial text-[0.85rem]">
        ← All forms
      </Link>
      <h1 className="mb-8 mt-4 font-display text-4xl text-ink">
        {form ? `Editing: ${form.title}` : "New form"}
      </h1>
      <FormBuilder form={form} />
    </div>
  );
}
