export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    registered: "bg-sand text-ink-soft",
    "checked-in": "bg-gold-soft text-ink",
    waitlisted: "bg-terra/10 text-terra-deep",
    cancelled: "bg-sand text-ink-faint line-through",
  };
  const labels: Record<string, string> = {
    registered: "Registered",
    "checked-in": "Checked in",
    waitlisted: "Waitlisted",
    cancelled: "Cancelled",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold ${styles[status] ?? styles.registered}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
