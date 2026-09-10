export interface RefItem {
  id: string;
  nom: string;
}

export interface Produit {
  id: string;
  nom: string;
  prixParDefaut: number | null;
  categorieIds: string[];
  structureIds: string[];
}

export interface Vente {
  id: string;
  dateHeure: string;
  produitIds: string[];
  montant: number;
  moyenPaiementIds: string[];
  vendeurIds: string[];
  note: string;
  categorieLookup: string[];
  structureLookup: string[];
}

export interface Depense {
  id: string;
  date: string;
  montant: number;
  categorie: string | null;
  description: string;
  enregistreParIds: string[];
  moyenPaiementIds: string[];
  structureIds: string[];
  justificatif: { url: string; filename: string }[];
}

export interface FxRates {
  USD: number;
  EUR: number;
  asOf: string;
}

export type Period = "week" | "month" | "quarter" | "year";

export interface PeriodStats {
  label: string;
  from: string;
  to: string;
  incomeTHB: number;
  outcomeTHB: number;
  netTHB: number;
}

export interface StatsResponse {
  period: Period;
  current: PeriodStats;
  previous: PeriodStats;
  deltaIncomePct: number | null;
  deltaOutcomePct: number | null;
  trend: PeriodStats[];
  weekdayVsWeekend: {
    weekday: { incomeTHB: number; outcomeTHB: number; days: number };
    weekend: { incomeTHB: number; outcomeTHB: number; days: number };
  };
  fx: FxRates;
}
