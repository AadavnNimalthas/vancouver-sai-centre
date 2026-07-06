"use client";

import { HBarChart, LineChart, StatTile } from "./charts";

export interface AnalyticsData {
  members: number;
  membersByRole: { label: string; value: number }[];
  totalRegistrations: number;
  activeRegistrations: number;
  volunteers: number;
  registrationMonths: string[];
  registrationSeries: number[];
  attendanceByEvent: { label: string; value: number }[];
  volunteersByEvent: { label: string; value: number }[];
  formSubmissions: number;
  publishedPosts: number;
  resourceCount: number;
  bookCount: number;
  bhajanCount: number;
}

/**
 * Every number here is computed from real records: profiles,
 * registrations, check-ins, posts, and library items. Nothing is
 * estimated or sampled.
 */
export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const hasRegistrationHistory = data.registrationSeries.some((v) => v > 0);

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Members" value={String(data.members)} />
        <StatTile
          label="Registrations (all time)"
          value={String(data.totalRegistrations)}
          spark={hasRegistrationHistory ? data.registrationSeries : undefined}
        />
        <StatTile label="Volunteers signed up" value={String(data.volunteers)} />
        <StatTile label="Published posts" value={String(data.publishedPosts)} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard
          title="Registrations by month"
          subtitle="Registrations received in the last six months"
        >
          {hasRegistrationHistory ? (
            <>
              <LineChart
                labels={data.registrationMonths}
                series={[{ name: "Registrations", values: data.registrationSeries }]}
              />
              <DataTable
                head={["Month", "Registrations"]}
                rows={data.registrationMonths.map((m, i) => [
                  m,
                  String(data.registrationSeries[i]),
                ])}
              />
            </>
          ) : (
            <EmptyNote text="No registrations yet. This chart fills in as members register for events." />
          )}
        </ChartCard>

        <ChartCard
          title="Event attendance"
          subtitle="Checked-in attendees per event"
        >
          {data.attendanceByEvent.length > 0 ? (
            <>
              <HBarChart items={data.attendanceByEvent} useRamp />
              <DataTable
                head={["Event", "Checked in"]}
                rows={data.attendanceByEvent.map((e) => [e.label, String(e.value)])}
              />
            </>
          ) : (
            <EmptyNote text="No check-ins recorded yet. Check people in from each event's admin page." />
          )}
        </ChartCard>

        <ChartCard
          title="Volunteer participation"
          subtitle="Volunteer signups per event"
        >
          {data.volunteersByEvent.length > 0 ? (
            <>
              <HBarChart items={data.volunteersByEvent} />
              <DataTable
                head={["Event", "Volunteers"]}
                rows={data.volunteersByEvent.map((e) => [e.label, String(e.value)])}
              />
            </>
          ) : (
            <EmptyNote text="No volunteer signups yet." />
          )}
        </ChartCard>

        <ChartCard title="Membership" subtitle="Members by role">
          {data.members > 0 ? (
            <>
              <HBarChart items={data.membersByRole} />
              <DataTable
                head={["Role", "Members"]}
                rows={data.membersByRole.map((r) => [r.label, String(r.value)])}
              />
            </>
          ) : (
            <EmptyNote text="No member accounts yet." />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Form submissions" value={String(data.formSubmissions)} />
        <StatTile label="Resources in library" value={String(data.resourceCount)} />
        <StatTile label="Books catalogued" value={String(data.bookCount)} />
        <StatTile label="Bhajans in book" value={String(data.bhajanCount)} />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6 sm:p-7">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <p className="mt-1 text-[0.825rem] text-ink-soft">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function EmptyNote({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed border-line bg-sand/30 p-8 text-center text-[0.9rem] text-ink-soft">
      {text}
    </p>
  );
}

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <details className="mt-4">
      <summary className="cursor-pointer text-[0.8rem] text-ink-faint transition-colors hover:text-ink-soft">
        View as table
      </summary>
      <div className="scroll-x mt-3">
        <table className="table-warm w-full">
          <thead>
            <tr>
              {head.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j > 0 ? "tabular-nums" : ""}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
