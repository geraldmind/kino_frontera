import type { FxRates } from "@/types";

export function formatTHB(n: number): string {
  return `฿${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  )}`;
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatEUR(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function convert(amountTHB: number, fx: FxRates) {
  return {
    thb: amountTHB,
    usd: amountTHB * fx.USD,
    eur: amountTHB * fx.EUR,
  };
}
