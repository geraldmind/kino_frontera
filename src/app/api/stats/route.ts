import { NextRequest, NextResponse } from "next/server";
import { airtableList, AirtableConfigError } from "@/lib/airtable";
import { TABLES } from "@/lib/schema";
import { mapDepense, mapVente } from "@/lib/mappers";
import { isWeekendDay, labelFor, rangeFor, toBangkok, Period } from "@/lib/dates";
import { getThbRates } from "@/lib/fx";
import type { Dayjs } from "dayjs";
import type { PeriodStats, StatsResponse } from "@/types";

const PERIODS: Period[] = ["week", "month", "quarter", "year"];

function sumInRange(
  ventes: { dateHeure: string; montant: number }[],
  depenses: { date: string; montant: number }[],
  start: Dayjs,
  end: Dayjs
) {
  const s = start.valueOf();
  const e = end.valueOf();
  let incomeTHB = 0;
  let outcomeTHB = 0;
  for (const v of ventes) {
    const t = toBangkok(v.dateHeure).valueOf();
    if (t >= s && t < e) incomeTHB += v.montant;
  }
  for (const d of depenses) {
    const t = toBangkok(d.date).valueOf();
    if (t >= s && t < e) outcomeTHB += d.montant;
  }
  return { incomeTHB, outcomeTHB };
}

function buildPeriodStats(
  period: Period,
  offset: number,
  ventes: { dateHeure: string; montant: number }[],
  depenses: { date: string; montant: number }[]
): PeriodStats {
  const { start, end } = rangeFor(period, offset);
  const { incomeTHB, outcomeTHB } = sumInRange(ventes, depenses, start, end);
  return {
    label: labelFor(period, start),
    from: start.toISOString(),
    to: end.toISOString(),
    incomeTHB,
    outcomeTHB,
    netTHB: incomeTHB - outcomeTHB,
  };
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export async function GET(req: NextRequest) {
  try {
    const periodParam = (req.nextUrl.searchParams.get("period") || "week") as Period;
    const period = PERIODS.includes(periodParam) ? periodParam : "week";

    const [venteRecords, depenseRecords, fx] = await Promise.all([
      airtableList(TABLES.ventes),
      airtableList(TABLES.depenses),
      getThbRates(),
    ]);
    const ventes = venteRecords.map(mapVente);
    const depenses = depenseRecords.map(mapDepense);

    const current = buildPeriodStats(period, 0, ventes, depenses);
    const previous = buildPeriodStats(period, -1, ventes, depenses);

    const trend: PeriodStats[] = [];
    for (let offset = -7; offset <= 0; offset++) {
      trend.push(buildPeriodStats(period, offset, ventes, depenses));
    }

    const { start: curStart, end: curEnd } = rangeFor(period, 0);
    let weekday = { incomeTHB: 0, outcomeTHB: 0, days: 0 };
    let weekend = { incomeTHB: 0, outcomeTHB: 0, days: 0 };
    for (let d = curStart.clone(); d.valueOf() < curEnd.valueOf(); d = d.add(1, "day")) {
      const dayEnd = d.add(1, "day");
      const sums = sumInRange(ventes, depenses, d, dayEnd);
      if (isWeekendDay(d)) {
        weekend = { incomeTHB: weekend.incomeTHB + sums.incomeTHB, outcomeTHB: weekend.outcomeTHB + sums.outcomeTHB, days: weekend.days + 1 };
      } else {
        weekday = { incomeTHB: weekday.incomeTHB + sums.incomeTHB, outcomeTHB: weekday.outcomeTHB + sums.outcomeTHB, days: weekday.days + 1 };
      }
    }

    const response: StatsResponse = {
      period,
      current,
      previous,
      deltaIncomePct: deltaPct(current.incomeTHB, previous.incomeTHB),
      deltaOutcomePct: deltaPct(current.outcomeTHB, previous.outcomeTHB),
      trend,
      weekdayVsWeekend: { weekday, weekend },
      fx,
    };

    return NextResponse.json(response);
  } catch (e) {
    if (e instanceof AirtableConfigError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
