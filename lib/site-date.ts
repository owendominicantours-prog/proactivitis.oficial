export const SITE_TIME_ZONE = "America/Santo_Domingo";

type DateLike = Date | string | number;

function toDate(value: DateLike) {
  return value instanceof Date ? value : new Date(value);
}

function getParts(date: DateLike, timeZone = SITE_TIME_ZONE) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const mapped = new Map(
    formatter
      .formatToParts(toDate(date))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: mapped.get("year") ?? "1970",
    month: mapped.get("month") ?? "01",
    day: mapped.get("day") ?? "01",
    hour: mapped.get("hour") ?? "00",
    minute: mapped.get("minute") ?? "00"
  };
}

export function getSiteDateKey(date: DateLike = new Date(), timeZone = SITE_TIME_ZONE) {
  const parts = getParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getSiteDateTimeInputValue(date: DateLike = new Date(), timeZone = SITE_TIME_ZONE) {
  const parts = getParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function addDaysToSiteDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(base.getUTCDate()).padStart(2, "0")}`;
}
