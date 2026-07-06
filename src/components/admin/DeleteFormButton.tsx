"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteForm } from "@/lib/admin-actions";

export function DeleteFormButton({ formId, formTitle }: { formId: string; formTitle: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    // the button sits inside the card's edit link — don't navigate
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${formTitle}"? Responses already collected are kept, but members can no longer open it.`)) return;
    setBusy(true);
    const res = await deleteForm(formId);
    setBusy(false);
    if (res.ok) router.refresh();
    else alert(res.message);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="rounded border border-line px-2.5 py-1 text-[0.75rem] font-medium text-ink-faint transition-colors hover:border-terra hover:text-terra-deep disabled:opacity-50"
      aria-label={`Delete form: ${formTitle}`}
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
