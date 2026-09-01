"use client";

import { useState } from "react";
import type { ActivityPoint } from "@/features/analytics/admin-service";

/**
 * Validated categorical hues (dataviz skill's default reference palette,
 * light mode) — the app's own brand colors (marigold/navy/terracotta) FAIL
 * chart-series validation (adjacent-pair CVD separation, chroma floor) when
 * run through the skill's validator, so this chart deliberately draws from
 * a palette built and checked for that job instead, applied in fixed order
 * only for these four series. Everything else in the admin UI (badges,
 * buttons, StatusPill) keeps the app's own brand palette — this is scoped
 * to chart marks specifically.
 */
const SERIES = [
  { key: "views", label: "Content views", color: "#2a78d6" },
  { key: "searches", label: "Searches", color: "#eb6834" },
  { key: "saves", label: "Saves", color: "#1baf7a" },
  { key: "trips", label: "Trips created", color: "#eda100" },
] as const;

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 12, right: 12, bottom: 28, left: 36 };

/** "Activity over time" — one multi-series chart standing in for the spec's four separate ones (views/searches/saves/trips over time), since four small multiples answering the same "how is the platform trending" question is more wall-of-charts than insight (spec §44/§45). */
export function ActivityLineChart({ data }: { data: ActivityPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) return <p className="text-caption text-ink-muted">No activity in this range yet.</p>;

  const plotW = WIDTH - PADDING.left - PADDING.right;
  const plotH = HEIGHT - PADDING.top - PADDING.bottom;

  const maxValue = Math.max(1, ...data.flatMap((d) => SERIES.map((s) => d[s.key])));
  const niceMax = Math.ceil(maxValue / 4) * 4 || 4;

  const x = (i: number) => PADDING.left + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotW);
  const y = (v: number) => PADDING.top + plotH - (v / niceMax) * plotH;

  const linePath = (key: (typeof SERIES)[number]["key"]) => data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d[key])}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((t) => niceMax * t);
  const labelStep = Math.max(1, Math.ceil(data.length / 6));

  function handleMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const i = Math.round(((relX - PADDING.left) / plotW) * (data.length - 1));
    setHoverIndex(Math.min(data.length - 1, Math.max(0, i)));
  }

  const hovered = hoverIndex != null ? data[hoverIndex] : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-3">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-caption text-ink-muted">
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
            {s.label}
          </span>
        ))}
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Platform activity over time" className="w-full" onMouseMove={handleMove} onMouseLeave={() => setHoverIndex(null)}>
        {gridLines.map((v) => (
          <g key={v}>
            <line x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y(v)} y2={y(v)} stroke="var(--color-border)" strokeWidth={1} />
            <text x={PADDING.left - 6} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="var(--color-ink-muted)">
              {v}
            </text>
          </g>
        ))}

        {data.map((d, i) =>
          i % labelStep === 0 ? (
            <text key={d.date} x={x(i)} y={HEIGHT - 8} textAnchor="middle" fontSize={10} fill="var(--color-ink-muted)">
              {new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </text>
          ) : null
        )}

        {SERIES.map((s) => (
          <path key={s.key} d={linePath(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {hoverIndex != null && (
          <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={PADDING.top} y2={HEIGHT - PADDING.bottom} stroke="var(--color-ink-muted)" strokeWidth={1} strokeDasharray="2,2" />
        )}
      </svg>

      {hovered && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 rounded-md border border-border bg-paper-raised px-3 py-2 text-caption">
          <span className="font-medium text-ink">{new Date(hovered.date).toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}</span>
          {SERIES.map((s) => (
            <span key={s.key} className="text-ink-muted">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} aria-hidden="true" /> {s.label}: {hovered[s.key]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
