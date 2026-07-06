"use client";

import { HBarChart, LineChart, StatTile } from "./charts";

export interface AnalyticsData {
  months: string[];
  attendance: number[];
  registrations: number[];
  volunteers: number[];
  traffic: number[];
  eventPopularity: { label: string; value: number }[];
  emailEngagement: { label: string; sent: number; openRate: number }[];
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const lastAttendance = data.attendance[data.attendance.length - 1];
  const prevAttendance = data.attendance[data.attendance.length - 2];
  const attendanceDelta = Math.round(((lastAttendance - prevAttendance) / prevAttendance) * 100);
  const totalRegs = data.registrations.reduce((a, b) => a + b, 0);
  const avgOpen = Math.round(
    (data.emailEngagement.reduce((a, e) => a + e.openRate, 0) / data.emailEngagement.length) * 100
  );

  return (
    <div className="space-y-10">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Sunday attendance"
          value={String(lastAttendance)}
          delta={`${attendanceDelta >= 0 ? "+" : ""}${attendanceDelta}% vs last month`}
          deltaGood={attendanceDelta >= 0}
          spark={data.attendance}
        />
        <StatTile label="Registrations (6 mo)" value={totalRegs.toLocaleString()} spark={data.registrations} />
        <StatTile
          label="Active volunteers"
          value={String(data.volunteers[data.volunteers.length - 1])}
          spark={data.volunteers}
        />
        <StatTile label="Avg email open rate" value={`${avgOpen}%`} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <ChartCard
          title="Attendance & volunteers"
          subtitle="Average Sunday attendance and active volunteers, by month"
        >
          <LineChart
            labels={data.months}
            series={[
              { name: "Attendance", values: data.attendance },
              { name: "Volunteers", values: data.volunteers },
            ]}
          />
          <DataTable
            head={["Month", "Attendance", "Volunteers"]}
            rows={data.months.map((m, i) => [m, String(data.attendance[i]), String(data.volunteers[i])])}
          />
        </ChartCard>

        <ChartCard title="Event registrations" subtitle="Registrations received per month">
          <LineChart labels={data.months} series={[{ name: "Registrations", values: data.registrations }]} />
          <DataTable
            head={["Month", "Registrations"]}
            rows={data.months.map((m, i) => [m, String(data.registrations[i])])}
          />
        </ChartCard>

        <ChartCard title="Event popularity" subtitle="Registrations per event, this season">
          <HBarChart items={data.eventPopularity} useRamp />
          <DataTable
            head={["Event", "Registrations"]}
            rows={data.eventPopularity.map((e) => [e.label, String(e.value)])}
          />
        </ChartCard>

        <ChartCard title="Email engagement" subtitle="Open rate per announcement">
          <HBarChart
            items={data.emailEngagement.map((e) => ({
              label: e.label,
              value: Math.round(e.openRate * 100),
            }))}
            formatValue={(v) => `${v}%`}
          />
          <DataTable
            head={["Announcement", "Recipients", "Open rate"]}
            rows={data.emailEngagement.map((e) => [
              e.label,
              String(e.sent),
              `${Math.round(e.openRate * 100)}%`,
            ])}
          />
        </ChartCard>
      </div>

      <ChartCard title="Website traffic" subtitle="Weekly unique visitors">
        <LineChart
          labels={data.months}
          series={[{ name: "Visitors", values: data.traffic }]}
          height={200}
        />
        <DataTable
          head={["Month", "Visitors"]}
          rows={data.months.map((m, i) => [m, data.traffic[i].toLocaleString()])}
        />
      </ChartCard>
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
