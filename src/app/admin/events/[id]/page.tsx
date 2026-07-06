import type { Metadata } from "next";
import Link from "next/link";
import { EventEditor } from "@/components/admin/EventEditor";
import { RegistrationsTable } from "@/components/admin/RegistrationsTable";
import { getAllEvents, getForms, getRegistrationsForEvent } from "@/lib/data";

export const metadata: Metadata = { title: "Edit event" };

export default async function AdminEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";
  const [events, forms] = await Promise.all([getAllEvents(), getForms()]);
  const event = isNew ? null : (events.find((e) => e.id === id) ?? null);
  const registrations = event ? await getRegistrationsForEvent(event.id) : [];

  return (
    <div>
      <Link href="/admin/events" className="link-editorial text-[0.85rem]">
        ← All events
      </Link>
      <h1 className="mt-4 font-display text-4xl text-ink">
        {isNew ? "New event" : event?.title ?? "Event not found"}
      </h1>

      <div className="card mt-8 p-7 sm:p-8">
        <EventEditor event={event} forms={forms} />
      </div>

      {event && (
        <section className="mt-12">
          <h2 className="eyebrow eyebrow-rule mb-6">Signups & attendance</h2>
          <RegistrationsTable registrations={registrations} />
        </section>
      )}
    </div>
  );
}
