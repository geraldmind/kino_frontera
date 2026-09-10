import Money from "@/components/Money";
import type { FxRates } from "@/types";

export default function KpiCard({
  label,
  thb,
  fx,
  tone,
  deltaPct,
}: {
  label: string;
  thb: number;
  fx: FxRates;
  tone: "income" | "outcome";
  deltaPct: number | null;
}) {
  const bg = tone === "income" ? "bg-incomebg" : "bg-outcomebg";
  return (
    <div className={`rounded-lg border border-line ${bg} p-4`}>
      <p className="mb-2 font-mono text-xs uppercase tracking-wide text-inksoft">{label}</p>
      <Money thb={thb} fx={fx} size="lg" tone={tone} />
      {deltaPct !== null && (
        <p
          className={`mt-1.5 text-xs ${
            (tone === "income" ? deltaPct >= 0 : deltaPct <= 0) ? "text-income" : "text-outcome"
          }`}
        >
          {deltaPct >= 0 ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(0)}% vs période précédente
        </p>
      )}
    </div>
  );
}
