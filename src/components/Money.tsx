import { formatEUR, formatTHB, formatUSD } from "@/lib/format";
import type { FxRates } from "@/types";

export default function Money({
  thb,
  fx,
  size = "md",
  tone,
}: {
  thb: number;
  fx: FxRates;
  size?: "md" | "lg";
  tone?: "income" | "outcome";
}) {
  const toneClass = tone === "income" ? "text-income" : tone === "outcome" ? "text-outcome" : "text-ink";
  return (
    <div>
      <div className={`tabular-nums font-display font-semibold ${toneClass} ${size === "lg" ? "text-3xl" : "text-lg"}`}>
        {formatTHB(thb)}
      </div>
      <div className="tabular-nums font-mono text-xs text-inksoft">
        {formatUSD(thb * fx.USD)} · {formatEUR(thb * fx.EUR)}
      </div>
    </div>
  );
}
