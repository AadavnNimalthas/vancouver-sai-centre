"use client";

import { useState, useTransition } from "react";
import { shareForm, revokeFormShare } from "@/lib/admin-actions";
import type { FormShareWithUser } from "@/lib/types";

interface ShareFormModalProps {
  formId: string;
  isBhajanForm: boolean;
  isOpen: boolean;
  onClose: () => void;
  shares: FormShareWithUser[];
}

export function ShareFormModal({ formId, isBhajanForm, isOpen, onClose, shares }: ShareFormModalProps) {
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  if (!isOpen) return null;

  function handleShare(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    startTransition(async () => {
      const res = await shareForm(formId, email, isBhajanForm);
      if (res.ok) {
        setEmail("");
        alert(res.message);
        // Refresh handled by server action revalidating path, but since we rely on client state in console, we might just reload or pass a callback.
        // Easiest is to reload for now.
        window.location.reload();
      } else {
        alert(res.message);
      }
    });
  }

  function handleRevoke(shareId: string) {
    if (!confirm("Revoke access for this user?")) return;
    startTransition(async () => {
      const res = await revokeFormShare(shareId);
      if (res.ok) {
        window.location.reload();
      } else {
        alert(res.message);
      }
    });
  }

  const link = `${window.location.origin}/portal/forms/shared/${formId}?type=${isBhajanForm ? "bhajan" : "general"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white-warm p-6 shadow-xl">
        <h3 className="font-display text-xl text-ink font-bold">Share Sign-Up Sheet</h3>
        <p className="text-sm text-ink-soft mt-2">
          Grant specific users access to view this sign-up sheet and its submissions.
        </p>

        <form onSubmit={handleShare} className="mt-6 flex gap-3">
          <input
            type="email"
            required
            placeholder="User's email address..."
            className="field flex-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
            {pending ? "Sharing..." : "Share"}
          </button>
        </form>

        <div className="mt-6">
          <h4 className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-3">People with access</h4>
          {shares.length === 0 ? (
            <p className="text-sm text-ink-soft">No one has been granted access yet.</p>
          ) : (
            <ul className="space-y-3">
              {shares.map(share => (
                <li key={share.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-ink text-sm">{share.userName}</p>
                    <p className="text-xs text-ink-soft">{share.userEmail}</p>
                  </div>
                  <button
                    onClick={() => handleRevoke(share.id)}
                    className="text-xs text-terra-deep hover:text-terra font-semibold underline underline-offset-4"
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 border-t border-line/60 pt-6">
          <label className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-2 block">Link to Share</label>
          <div className="flex items-center gap-2">
            <input type="text" readOnly value={link} className="field flex-1 text-xs" />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(link);
                alert("Copied to clipboard!");
              }}
              className="btn bg-sand border-line text-ink text-xs py-1.5"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="text-sm text-ink-soft hover:text-ink font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
