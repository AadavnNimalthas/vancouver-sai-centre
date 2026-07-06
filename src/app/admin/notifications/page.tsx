import type { Metadata } from "next";
import { NotificationComposer } from "@/components/admin/NotificationComposer";
import { getAnnouncements, getProfiles } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { INTEREST_TOPICS } from "@/lib/types";

export const metadata: Metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const [announcements, profiles] = await Promise.all([
    getAnnouncements(),
    getProfiles(),
  ]);

  const followerCounts: Record<string, number> = {};
  for (const topic of INTEREST_TOPICS) {
    followerCounts[topic.value] = profiles.filter((p) =>
      p.interests.includes(topic.value)
    ).length;
  }

  const topicLabel = (v: string) =>
    INTEREST_TOPICS.find((t) => t.value === v)?.label ?? v;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-ink">Notifications</h1>
        <p className="mt-2 max-w-lg text-ink-soft">
          Announcements are emailed only to members who follow the chosen
          topics.
        </p>
      </div>

      <NotificationComposer followerCounts={followerCounts} />

      <section className="mt-12">
        <h2 className="eyebrow eyebrow-rule mb-4">Sent announcements</h2>
        <div className="card scroll-x">
          <table className="table-warm w-full min-w-[640px]">
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Topics</th>
                <th>Sent</th>
                <th>Recipients</th>
                <th>Open rate</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium text-ink">{a.title}</td>
                  <td className="text-ink-soft">
                    {a.topics.map(topicLabel).join(", ")}
                  </td>
                  <td className="text-ink-soft">
                    {a.sentAt ? formatShortDate(a.sentAt) : "Draft"}
                  </td>
                  <td className="tabular-nums text-ink-soft">{a.recipients}</td>
                  <td className="tabular-nums text-ink-soft">
                    {a.openRate !== null ? `${Math.round(a.openRate * 100)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
