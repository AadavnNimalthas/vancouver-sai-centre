import type { Metadata } from "next";
import { AnalyticsDashboard, type AnalyticsData } from "@/components/admin/AnalyticsDashboard";
import { getAnnouncements, getEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const [events, announcements] = await Promise.all([getEvents(), getAnnouncements()]);

  // Attendance/traffic series come from check-in and analytics tables once
  // Supabase is connected; these demo series show the intended shape.
  const data: AnalyticsData = {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    attendance: [118, 124, 131, 127, 142, 156],
    registrations: [64, 41, 88, 102, 96, 143],
    volunteers: [22, 25, 24, 31, 29, 36],
    traffic: [820, 940, 1105, 1010, 1240, 1490],
    eventPopularity: events
      .filter((e) => e.registrationEnabled || e.volunteerSignupEnabled)
      .map((e) => ({ label: e.title, value: e.registeredCount }))
      .filter((e) => e.value > 0),
    emailEngagement: announcements
      .filter((a) => a.sentAt && a.openRate !== null)
      .map((a) => ({ label: a.title, sent: a.recipients, openRate: a.openRate! })),
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Analytics</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          How the community is gathering, serving, and hearing from us.
        </p>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}
