import type { FxRates } from "@/types";

// Taux de secours si l'API est injoignable — approximatifs, à ne pas
// prendre pour une valeur exacte (signalé côté UI via "asOf").
const FALLBACK: FxRates = { USD: 0.0285, EUR: 0.0265, asOf: "estimation hors-ligne" };

export async function getThbRates(): Promise<FxRates> {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=THB&symbols=USD,EUR",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return FALLBACK;
    const data = await res.json();
    if (!data?.rates?.USD || !data?.rates?.EUR) return FALLBACK;
    return { USD: data.rates.USD, EUR: data.rates.EUR, asOf: data.date };
  } catch {
    return FALLBACK;
  }
}
