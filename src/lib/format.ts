import { format, isSameDay } from "date-fns";

export function formatEventDate(startsAt: Date | string, endsAt?: Date | string): string {
  const start = new Date(startsAt);
  if (!endsAt) return format(start, "EEEE, MMMM d, yyyy");
  const end = new Date(endsAt);
  if (isSameDay(start, end)) return format(start, "EEEE, MMMM d, yyyy");
  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

export function formatEventTime(startsAt: Date | string, endsAt?: Date | string): string {
  const start = new Date(startsAt);
  const startStr = format(start, "h:mm a");
  if (!endsAt) return startStr;
  const end = new Date(endsAt);
  if (!isSameDay(start, end)) return `${startStr} onward`;
  return `${startStr} – ${format(end, "h:mm a")}`;
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatMonthDay(date: Date | string): { month: string; day: string; weekday: string } {
  const d = new Date(date);
  return { month: format(d, "MMM"), day: format(d, "d"), weekday: format(d, "EEE") };
}
