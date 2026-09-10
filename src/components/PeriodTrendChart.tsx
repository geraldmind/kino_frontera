"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PeriodStats } from "@/types";
import { formatTHB } from "@/lib/format";

export default function PeriodTrendChart({ trend }: { trend: PeriodStats[] }) {
  const data = trend.map((t) => ({
    label: t.label,
    Ventes: t.incomeTHB,
    Dépenses: t.outcomeTHB,
  }));

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p className="mb-3 font-mono text-xs uppercase tracking-wide text-inksoft">Évolution — 8 dernières périodes</p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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
          <Bar dataKey="Ventes" fill="var(--income)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Dépenses" fill="var(--outcome)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
