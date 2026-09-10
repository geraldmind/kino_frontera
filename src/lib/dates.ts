import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isoWeek from "dayjs/plugin/isoWeek";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import "dayjs/locale/fr";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);
dayjs.locale("fr");

export const TZ = "Asia/Bangkok";
export type Period = "week" | "month" | "quarter" | "year";

export function nowBangkok(): Dayjs {
  return dayjs().tz(TZ);
}

export function toBangkok(iso: string): Dayjs {
  return dayjs(iso).tz(TZ);
}

/** Bornes [start, end) d'une période, en heure de Bangkok. offset=-1 = période précédente. */
export function rangeFor(period: Period, offset = 0): { start: Dayjs; end: Dayjs } {
  const base = nowBangkok();
  switch (period) {
    case "week": {
      const start = base.startOf("isoWeek").add(offset, "week");
      return { start, end: start.add(1, "week") };
    }
    case "month": {
      const start = base.startOf("month").add(offset, "month");
      return { start, end: start.add(1, "month") };
    }
    case "quarter": {
      const start = base.startOf("quarter").add(offset, "quarter");
      return { start, end: start.add(1, "quarter") };
    }
    case "year": {
      const start = base.startOf("year").add(offset, "year");
      return { start, end: start.add(1, "year") };
    }
  }
}

export function labelFor(period: Period, start: Dayjs): string {
  switch (period) {
    case "week":
      return `Sem. ${start.isoWeek()} · ${start.format("D MMM")} – ${start
        .add(6, "day")
        .format("D MMM")}`;
    case "month":
      return capitalize(start.format("MMMM YYYY"));
    case "quarter":
      return `T${start.quarter()} ${start.year()}`;
    case "year":
      return String(start.year());
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isWeekendDay(d: Dayjs): boolean {
  const iso = d.isoWeekday(); // 1=lundi ... 7=dimanche
  return iso === 6 || iso === 7;
}
