"use client";

import { useState } from "react";
import { FormRenderer } from "@/components/FormRenderer";
import { submitRegistration } from "@/lib/actions";
import type { Bhajan, SaiForm } from "@/lib/types";

/**
 * Registration / volunteer signup block on an event page.
 * When both are enabled, the user chooses which way they're joining.
 */
export function RegistrationPanel({
  eventId,
  form,
  registrationEnabled,
  volunteerEnabled,
  full,
  bhajans = [],
}: {
  eventId: string;
  form: SaiForm | null;
  registrationEnabled: boolean;
  volunteerEnabled: boolean;
  full: boolean;
  bhajans?: Bhajan[];
}) {
  const both = registrationEnabled && volunteerEnabled;
  const [kind, setKind] = useState<"attendee" | "volunteer">(
    registrationEnabled ? "attendee" : "volunteer"
  );

  if (!form) {
    return (
      <p className="rounded-lg border border-line bg-sand/60 p-6 text-[0.95rem] text-ink-soft">
        Signup for this event opens soon. Questions?{" "}
        <a href="/contact" className="link-editorial">Contact us</a>.
      </p>
    );
  }

  return (
    <div id="register" className="card p-8 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-3xl text-ink">
          {kind === "attendee" ? "Register to attend" : "Volunteer with us"}
        </h2>
        {both && (
          <div className="flex rounded-full bg-sand p-1" role="group" aria-label="Signup type">
            {(["attendee", "volunteer"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`rounded-full px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                  kind === k ? "bg-white-warm text-ink shadow-soft" : "text-ink-soft"
                }`}
              >
                {k === "attendee" ? "Attend" : "Volunteer"}
              </button>
            ))}
          </div>
        )}
      </div>

      {full && kind === "attendee" && (
        <p className="mt-4 rounded border border-gold-soft bg-sand px-4 py-3 text-[0.9rem] text-ink-soft">
          This event has reached capacity. You can still register. You will be
          placed on the waitlist and emailed if a spot opens.
        </p>
      )}

      <div className="mt-8">
        <FormRenderer
          key={kind}
          form={form}
          bhajans={bhajans}
          submitLabel={
            kind === "volunteer"
              ? "Offer to volunteer"
              : full
                ? "Join the waitlist"
                : "Complete registration"
          }
          onSubmit={(answers) => submitRegistration({ eventId, kind, answers })}
        />
      </div>
    </div>
  );
}
