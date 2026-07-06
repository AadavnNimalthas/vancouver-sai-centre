import type { Metadata } from "next";
import { InterestPicker } from "@/components/portal/InterestPicker";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Notification preferences" };

export default async function NotificationsPage() {
  const user = (await getCurrentUser())!;

  return (
    <div>
      <h1 className="font-display text-4xl text-ink">Notifications</h1>
      <p className="mt-3 max-w-lg text-ink-soft">
        Choose what you would like to hear about. Announcements are only sent
        to people who follow the topic.
      </p>
      <div className="mt-10">
        <InterestPicker initial={user.interests} />
      </div>
    </div>
  );
}
