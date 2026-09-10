"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatTHB } from "@/lib/format";
import type { StatsResponse } from "@/types";

export default function WeekdayWeekendChart({ data }: { data: StatsResponse["weekdayVsWeekend"] }) {
  const perDay = [
    {
      label: "Semaine (lun-ven)",
      "Ventes / jour": data.weekday.days ? Math.round(data.weekday.incomeTHB / data.weekday.days) : 0,
      "Dépenses / jour": data.weekday.days ? Math.round(data.weekday.outcomeTHB / data.weekday.days) : 0,
    },
    {
      label: "Week-end (sam-dim)",
      "Ventes / jour": data.weekend.days ? Math.round(data.weekend.incomeTHB / data.weekend.days) : 0,
      "Dépenses / jour": data.weekend.days ? Math.round(data.weekend.outcomeTHB / data.weekend.days) : 0,
    },
  ];

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-1 font-mono text-xs uppercase tracking-wide text-inksoft">Semaine vs week-end</p>
      <p className="mb-3 text-xs text-inksoft">
        Moyenne par jour sur la période sélectionnée ({data.weekday.days} jours de semaine, {data.weekend.days} jours de week-end).
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={perDay} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--ink-soft)" }} tickLine={false} axisLine={{ stroke: "var(--line)" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "var(--ink-soft)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatTHB(v)}
            width={70}
          />
          <Tooltip
            formatter={(value: number) => formatTHB(value)}
            contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Ventes / jour" fill="var(--income)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Dépenses / jour" fill="var(--outcome)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
