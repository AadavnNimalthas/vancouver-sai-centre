import type { Metadata } from "next";
import { format, subMonths } from "date-fns";
import { AnalyticsDashboard, type AnalyticsData } from "@/components/admin/AnalyticsDashboard";
import {
  getAllEvents,
  getAllPosts,
  getAllRegistrations,
  getBhajans,
  getBooks,
  getProfiles,
  getResources,
} from "@/lib/data";
import { ROLE_LABELS } from "@/lib/types";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [events, registrations, profiles, posts, resources, books, bhajans] =
    await Promise.all([
      getAllEvents(),
      getAllRegistrations(),
      getProfiles(),
      getAllPosts(),
      getResources(),
      getBooks(),
      getBhajans(),
    ]);

  const now = new Date();
  const months = [...Array(6)].map((_, i) => subMonths(now, 5 - i));
  const registrationMonths = months.map((m) => format(m, "MMM"));
  const registrationSeries = months.map(
    (m) =>
      registrations.filter((r) => format(new Date(r.createdAt), "yyyy-MM") === format(m, "yyyy-MM"))
        .length
  );

  const attendanceByEvent = events
    .map((e) => ({
      label: e.title,
      value: registrations.filter(
        (r) => r.eventId === e.id && r.status === "checked-in"
      ).length,
    }))
    .filter((e) => e.value > 0);

  const volunteersByEvent = events
    .map((e) => ({
      label: e.title,
      value: registrations.filter(
        (r) => r.eventId === e.id && r.kind === "volunteer" && r.status !== "cancelled"
      ).length,
    }))
    .filter((e) => e.value > 0);

  const membersByRole = Object.entries(
    profiles.reduce<Record<string, number>>((acc, p) => {
      const label = ROLE_LABELS[p.role] ?? p.role;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([label, value]) => ({ label, value }));

  const active = registrations.filter((r) => r.status !== "cancelled");

  const data: AnalyticsData = {
    members: profiles.length,
    membersByRole,
    totalRegistrations: active.length,
    activeRegistrations: active.filter(
      (r) => r.eventStartsAt && new Date(r.eventStartsAt) >= now
    ).length,
    volunteers: new Set(
      active.filter((r) => r.kind === "volunteer").map((r) => r.userId || r.userEmail)
    ).size,
    registrationMonths,
    registrationSeries,
    attendanceByEvent,
    volunteersByEvent,
    formSubmissions: active.length,
    publishedPosts: posts.filter((p) => p.published).length,
    resourceCount: resources.length,
    bookCount: books.length,
    bhajanCount: bhajans.length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Analytics</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Computed from real records only: accounts, registrations,
          check-ins, posts, and the library.
        </p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
