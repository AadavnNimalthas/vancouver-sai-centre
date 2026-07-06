import { addDays, addMonths, isAfter, isBefore } from "date-fns";
import type { SaiEvent } from "./types";

export interface Occurrence {
  event: SaiEvent;
  startsAt: Date;
  endsAt: Date;
  /** Stable key: eventId + occurrence date */
  key: string;
}

/**
 * Expand events (including weekly / biweekly / monthly recurrences) into
 * concrete occurrences within [rangeStart, rangeEnd].
 */
export function expandOccurrences(
  events: SaiEvent[],
  rangeStart: Date,
  rangeEnd: Date
): Occurrence[] {
  const out: Occurrence[] = [];

  for (const event of events) {
    const start = new Date(event.startsAt);
    const durationMs = new Date(event.endsAt).getTime() - start.getTime();

    if (event.recurrence === "none") {
      if (!isAfter(start, rangeEnd) && !isBefore(new Date(event.endsAt), rangeStart)) {
        out.push(makeOccurrence(event, start, durationMs));
      }
      continue;
    }

    const until = event.recurrenceUntil
      ? new Date(`${event.recurrenceUntil}T23:59:59`)
      : rangeEnd;
    const hardEnd = isBefore(until, rangeEnd) ? until : rangeEnd;

    let cursor = start;
    let guard = 0;
    while (!isAfter(cursor, hardEnd) && guard < 500) {
      if (!isBefore(cursor, rangeStart)) {
        out.push(makeOccurrence(event, cursor, durationMs));
      }
      cursor =
        event.recurrence === "weekly"
          ? addDays(cursor, 7)
          : event.recurrence === "biweekly"
            ? addDays(cursor, 14)
            : addMonths(cursor, 1);
      guard++;
    }
  }

  return out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}

function makeOccurrence(event: SaiEvent, startsAt: Date, durationMs: number): Occurrence {
  return {
    event,
    startsAt,
    endsAt: new Date(startsAt.getTime() + durationMs),
    key: `${event.id}:${startsAt.toISOString().slice(0, 10)}`,
  };
}

/** The next `count` upcoming occurrences from `from`. */
export function upcomingOccurrences(events: SaiEvent[], from: Date, count: number): Occurrence[] {
  const horizon = addMonths(from, 6);
  return expandOccurrences(events, from, horizon).slice(0, count);
}
