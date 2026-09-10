"use client";

import { useEffect, useState } from "react";
import type { Period, StatsResponse } from "@/types";
import ConfigBanner from "@/components/ConfigBanner";
import KpiCard from "@/components/KpiCard";
import Money from "@/components/Money";
import PeriodTrendChart from "@/components/PeriodTrendChart";
import WeekdayWeekendChart from "@/components/WeekdayWeekendChart";

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Semaine" },
  { key: "month", label: "Mois" },
  { key: "quarter", label: "Trimestre" },
  { key: "year", label: "Année" },
];

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("week");
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/stats?period=${period}`)
      .then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json() }))
      .then(({ status, data }) => {
        if (status === 503) {
          setConfigError(data.error);
        } else {
          setStats(data);
        }
        setLoading(false);
      });
  }, [period]);

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-lg border border-line bg-surface p-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex-1 rounded-md px-4 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
              period === p.key ? "bg-accent text-white" : "text-inksoft hover:bg-surface2"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {configError && <ConfigBanner message={configError} />}
      {loading && !configError && <p className="text-inksoft">Chargement…</p>}

      {stats && (
        <>
          <p className="font-mono text-xs uppercase tracking-wide text-inksoft">
            Période en cours : {stats.current.label}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KpiCard label="Income" thb={stats.current.incomeTHB} fx={stats.fx} tone="income" deltaPct={stats.deltaIncomePct} />
            <KpiCard label="Outcome" thb={stats.current.outcomeTHB} fx={stats.fx} tone="outcome" deltaPct={stats.deltaOutcomePct} />
            <div className="rounded-lg border border-line bg-surface2 p-4">
              <p className="mb-2 font-mono text-xs uppercase tracking-wide text-inksoft">Solde net</p>
              <Money thb={stats.current.netTHB} fx={stats.fx} size="lg" tone={stats.current.netTHB >= 0 ? "income" : "outcome"} />
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="mb-3 font-mono text-xs uppercase tracking-wide text-inksoft">
              Vs période précédente ({stats.previous.label})
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat label="Income préc." thb={stats.previous.incomeTHB} fx={stats.fx} />
              <MiniStat label="Outcome préc." thb={stats.previous.outcomeTHB} fx={stats.fx} />
              <MiniStat label="Income actuel" thb={stats.current.incomeTHB} fx={stats.fx} />
              <MiniStat label="Outcome actuel" thb={stats.current.outcomeTHB} fx={stats.fx} />
            </div>
          </div>

          <PeriodTrendChart trend={stats.trend} />
          <WeekdayWeekendChart data={stats.weekdayVsWeekend} />

          <p className="text-right font-mono text-[11px] text-inksoft">
            Taux de change {stats.fx.asOf} · 1 ฿ = {stats.fx.USD.toFixed(4)} $ · {stats.fx.EUR.toFixed(4)} €
          </p>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, thb, fx }: { label: string; thb: number; fx: StatsResponse["fx"] }) {
  return (
    <div>
      <p className="mb-1 text-xs text-inksoft">{label}</p>
      <Money thb={thb} fx={fx} />
    </div>
  );
}
