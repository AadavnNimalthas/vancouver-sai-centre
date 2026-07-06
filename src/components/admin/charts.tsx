"use client";

import { useId, useMemo, useRef, useState } from "react";

/**
 * Hand-rolled SVG charts for the admin dashboard.
 * Specs: 2px lines with round joins, area wash at 10% opacity, markers with a
 * 2px surface ring, hairline solid gridlines, values in text tokens (never the
 * series color), hover crosshair + tooltip.
 */

export const CHART = {
  series1: "#C25F36", // terracotta — primary series
  series2: "#3B72B5", // muted indigo — second series (validated pair)
  grid: "#EDE6DA",
  surface: "#FFFDFA",
  text: "#2B2B2B",
  textSoft: "#666666",
  textMuted: "#9B9186",
  // Sequential terracotta ramp, light → dark (magnitude)
  ramp: ["#F3D5C4", "#EBB394", "#E08D5F", "#C25F36", "#8F4526"],
};

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.5; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

export interface Series {
  name: string;
  values: number[];
  color?: string;
}

export function LineChart({
  labels,
  series,
  height = 240,
  formatValue = (v: number) => v.toLocaleString(),
}: {
  labels: string[];
  series: Series[];
  height?: number;
  formatValue?: (v: number) => string;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const W = 640;
  const H = height;
  const PAD = { top: 16, right: 76, bottom: 28, left: 44 };
  const iw = W - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;

  const max = Math.max(...series.flatMap((s) => s.values));
  const ticks = niceTicks(max);
  const yMax = ticks[ticks.length - 1] || 1;

  const x = (i: number) => PAD.left + (i / Math.max(1, labels.length - 1)) * iw;
  const y = (v: number) => PAD.top + ih - (v / yMax) * ih;

  const colors = series.map((s, i) => s.color ?? (i === 0 ? CHART.series1 : CHART.series2));

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.left) / iw) * (labels.length - 1));
    setHover(Math.max(0, Math.min(labels.length - 1, i)));
  }

  return (
    <div ref={ref} className="relative">
      {series.length > 1 && (
        <div className="mb-3 flex flex-wrap gap-5">
          {series.map((s, i) => (
            <span key={s.name} className="flex items-center gap-2 text-[0.8rem] text-ink-soft">
              <span className="h-0.5 w-5 rounded-full" style={{ background: colors[i] }} aria-hidden="true" />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Line chart: ${series.map((s) => s.name).join(", ")}`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {/* gridlines + y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke={CHART.grid} strokeWidth="1" />
            <text x={PAD.left - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" fill={CHART.textMuted} style={{ fontVariantNumeric: "tabular-nums" }}>
              {t.toLocaleString()}
            </text>
          </g>
        ))}
        {/* x labels (sparse) */}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 8) === 0 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10.5" fill={CHART.textMuted}>
              {l}
            </text>
          ) : null
        )}

        {/* hover crosshair */}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke={CHART.textMuted} strokeWidth="1" opacity="0.5" />
        )}

        {series.map((s, si) => {
          const path = s.values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
          const area = `${path} L ${x(s.values.length - 1)} ${PAD.top + ih} L ${x(0)} ${PAD.top + ih} Z`;
          const last = s.values.length - 1;
          return (
            <g key={s.name}>
              {si === 0 && <path d={area} fill={colors[si]} opacity="0.1" />}
              <path d={path} fill="none" stroke={colors[si]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {/* end marker with surface ring + direct label */}
              <circle cx={x(last)} cy={y(s.values[last])} r="6" fill={CHART.surface} />
              <circle cx={x(last)} cy={y(s.values[last])} r="4" fill={colors[si]} />
              <text x={x(last) + 10} y={y(s.values[last]) + 3.5} fontSize="11" fontWeight="600" fill={CHART.text} style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatValue(s.values[last])}
              </text>
              {/* hover markers */}
              {hover !== null && hover !== last && (
                <>
                  <circle cx={x(hover)} cy={y(s.values[hover])} r="6" fill={CHART.surface} />
                  <circle cx={x(hover)} cy={y(s.values[hover])} r="4" fill={colors[si]} />
                </>
              )}
            </g>
          );
        })}
        <clipPath id={id}>
          <rect x={PAD.left} y={PAD.top} width={iw} height={ih} />
        </clipPath>
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute rounded-md border border-line bg-white-warm px-3 py-2 text-[0.75rem] shadow-soft"
          style={{
            left: `${((x(hover) / W) * 100)}%`,
            top: 0,
            transform: x(hover) > W * 0.6 ? "translateX(calc(-100% - 8px))" : "translateX(8px)",
          }}
        >
          <p className="font-semibold text-ink">{labels[hover]}</p>
          {series.map((s, i) => (
            <p key={s.name} className="mt-0.5 flex items-center gap-1.5 text-ink-soft">
              <span className="size-2 rounded-full" style={{ background: colors[i] }} aria-hidden="true" />
              {s.name}: <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatValue(s.values[hover])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function HBarChart({
  items,
  formatValue = (v: number) => v.toLocaleString(),
  useRamp = false,
}: {
  items: { label: string; value: number }[];
  formatValue?: (v: number) => string;
  useRamp?: boolean;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const sorted = useMemo(() => [...items].sort((a, b) => b.value - a.value), [items]);
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {sorted.map((item, i) => {
        const pct = (item.value / max) * 100;
        const color = useRamp
          ? CHART.ramp[Math.min(CHART.ramp.length - 1, Math.floor((item.value / max) * (CHART.ramp.length - 1) + 0.5))]
          : CHART.series1;
        return (
          <div
            key={item.label}
            className="group"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <div className="mb-1 flex items-baseline justify-between gap-4">
              <span className="truncate text-[0.825rem] text-ink-soft">{item.label}</span>
              <span
                className={`text-[0.8rem] font-semibold text-ink transition-opacity ${hover === i ? "opacity-100" : "opacity-70"}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatValue(item.value)}
              </span>
            </div>
            <div className="h-4 overflow-hidden rounded-r bg-sand/70">
              <div
                className="h-full rounded-r transition-all duration-700"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function StatTile({
  label,
  value,
  delta,
  deltaGood,
  spark,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaGood?: boolean;
  spark?: number[];
}) {
  return (
    <div className="card p-6">
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-[2rem] font-semibold leading-none text-ink">{value}</p>
        {spark && <Sparkline values={spark} />}
      </div>
      {delta && (
        <p className={`mt-2 text-[0.8rem] font-medium ${deltaGood ? "text-[#3D7A46]" : "text-terra-deep"}`}>
          {delta}
        </p>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const W = 84;
  const H = 30;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * (W - 8);
  const y = (v: number) => 4 + (1 - (v - min) / range) * (H - 8);
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
  const last = values.length - 1;
  return (
    <svg width={W} height={H} aria-hidden="true" className="shrink-0">
      <path d={path} fill="none" stroke={CHART.grid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(last)} cy={y(values[last])} r="3.5" fill={CHART.series1} stroke={CHART.surface} strokeWidth="2" />
    </svg>
  );
}
