"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitBhajanSignup } from "@/lib/actions";
import { BhajanSelector } from "./BhajanSelector";
import type { Bhajan, BhajanSignUpForm, BhajanSubmission, Profile } from "@/lib/types";
import { Reveal } from "@/components/Reveal";

interface BhajanSignupFormContainerProps {
  form: BhajanSignUpForm;
  submission: BhajanSubmission | null;
  allBhajans: Bhajan[];
  myBhajans: {
    favorites: Bhajan[];
    recentlyUsed: Bhajan[];
    submitted: Bhajan[];
  };
  user: Profile;
}

export function BhajanSignupFormContainer({
  form,
  submission,
  allBhajans,
  myBhajans,
  user,
}: BhajanSignupFormContainerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize selected bhajan slots
  const initialSlots = Array(form.bhajansRequired).fill(null);
  if (submission && submission.bhajans) {
    submission.bhajans.forEach((b, i) => {
      if (i < initialSlots.length) {
        initialSlots[i] = b;
      }
    });
  }
  const [slots, setSlots] = useState<(Bhajan | null)[]>(initialSlots);

  function handleSelectSlot(index: number, bhajan: Bhajan | null) {
    setSlots((prev) => {
      const copy = [...prev];
      copy[index] = bhajan;
      return copy;
    });
  }

  function handleSubmit() {
    const filledBhajans = slots.filter(Boolean) as Bhajan[];
    if (filledBhajans.length < form.bhajansRequired) {
      setError(`Please select all ${form.bhajansRequired} required bhajans.`);
      return;
    }
    setError("");

    // Check for duplicates
    const ids = filledBhajans.map((b) => b.id);
    const hasDuplicates = new Set(ids).size !== ids.length;
    if (hasDuplicates) {
      setError("Please select unique bhajans. You cannot sign up to sing the same bhajan twice.");
      return;
    }

    startTransition(async () => {
      const res = await submitBhajanSignup({
        formId: form.id,
        bhajanIds: ids,
      });

      if (res.ok) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.message);
      }
    });
  }

  if (success) {
    return (
      <Reveal className="card p-8 sm:p-10 border-line bg-white-warm text-center max-w-xl mx-auto space-y-5 shadow-soft">
        <div className="size-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-200">
          <svg className="size-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="font-display text-3xl text-ink font-bold">Sign-Up Successful</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          Sai Ram, {user.fullName.split(" ")[0]}. Your devotional offerings have been registered for **{form.title}**. The devotional coordinator has received your sign-up.
        </p>
        <div className="pt-3">
          <button
            onClick={() => router.push("/portal/bhajans")}
            className="btn btn-primary text-xs font-semibold"
          >
            &larr; Back to Portal
          </button>
        </div>
      </Reveal>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-ink">Devotional Offering Selection</h2>
        <p className="text-xs text-ink-soft leading-relaxed">
          Hello **{user.fullName}** ({user.email}). No need to re-enter your membership details; they are automatically attached to this submission. Simply search the library and fill the required slots below.
        </p>
      </div>

      <div className="space-y-5">
        {slots.map((selectedBhajan, index) => (
          <Reveal key={index} delay={index * 0.08}>
            <BhajanSelector
              slotName={`Bhajan #${index + 1}`}
              selectedBhajanId={selectedBhajan ? selectedBhajan.id : null}
              onSelect={(bh) => handleSelectSlot(index, bh)}
              allBhajans={allBhajans}
              myBhajans={myBhajans}
              allowedCategories={form.allowedCategories}
              allowedTempos={form.allowedTempos}
              allowedBeats={form.allowedBeats}
            />
          </Reveal>
        ))}
      </div>

      {error && <p className="text-sm text-terra font-medium">{error}</p>}

      <div className="flex gap-4 pt-4 border-t border-line">
        <button
          onClick={() => router.push("/portal/bhajans")}
          className="btn btn-ghost !px-5 !py-2 text-sm border border-line"
          disabled={pending}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn btn-primary !px-6 !py-2 text-sm font-semibold"
          disabled={pending}
        >
          {pending ? "Submitting Sign-Up..." : submission ? "Save Changes" : "Submit Sign-Up"}
        </button>
      </div>
    </div>
  );
}
