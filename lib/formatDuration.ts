const UNIT_LABELS: Record<string, string> = {
  minuto: "minutos",
  minutos: "minutos",
  minute: "minutes",
  minutes: "minutes",
  hora: "horas",
  horas: "horas",
  hour: "hours",
  hours: "hours",
  dia: "días",
  dias: "días",
  día: "días",
  días: "días",
  day: "days",
  days: "days"
};

export function formatDurationDisplay(value?: string | null, fallback = "Duración variable") {
  if (!value) return fallback;

  const raw = String(value).trim();
  if (!raw) return fallback;

  if (raw.startsWith("{") && raw.includes("\"value\"")) {
    try {
      const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
      const durationValue = parsed?.value;
      const durationUnit = parsed?.unit ? normalizeUnit(parsed.unit) : "";

      if (durationValue && durationUnit) {
        return `${durationValue} ${durationUnit}`.trim();
      }
      if (durationValue) {
        return String(durationValue);
      }
    } catch {
      return sanitizeDurationText(raw);
    }
  }

  return sanitizeDurationText(raw);
}

function normalizeUnit(value: string) {
  const normalized = sanitizeDurationText(value).toLowerCase();
  return UNIT_LABELS[normalized] ?? value.trim();
}

function sanitizeDurationText(value: string) {
  return value
    .replaceAll("DuraciÃ³n", "Duración")
    .replaceAll("duraciÃ³n", "duración")
    .replaceAll("dÃ­a", "día")
    .replaceAll("dÃ­as", "días")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ã¡", "á")
    .trim();
}
