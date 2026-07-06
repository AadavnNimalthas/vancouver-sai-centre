"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/admin-actions";
import { useRouter } from "next/navigation";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    
    startTransition(async () => {
      const res = await deleteEvent(eventId);
      if (res.ok) {
        router.refresh();
      } else {
        alert(res.message);
      }
    });
  }

  return (
    <button 
      type="button" 
      onClick={handleDelete} 
      disabled={pending}
      className="link-editorial text-terra-deep hover:text-terra text-[0.85rem]"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}
