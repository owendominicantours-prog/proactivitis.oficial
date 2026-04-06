const LOCATION_SEPARATORS = /\s*,\s*/;
const LANGUAGE_SPLIT = /[,/|;]+/;

const LOCATION_EQUIVALENTS = new Map<string, string>([
  ["punta cana", "Punta Cana"],
  ["bavaro", "Bavaro"],
  ["bávaro", "Bavaro"],
  ["cap cana", "Cap Cana"],
  ["bayahibe", "Bayahibe"],
  ["la romana", "La Romana"],
  ["santo domingo", "Santo Domingo"],
  ["puerto plata", "Puerto Plata"],
  ["sosua", "Sosua"],
  ["sosúa", "Sosua"],
  ["republica dominicana", "Republica Dominicana"],
  ["república dominicana", "Republica Dominicana"],
  ["dominican republic", "Republica Dominicana"],
  ["republique dominicaine", "Republica Dominicana"],
  ["rd", "Republica Dominicana"],
  ["do", "Republica Dominicana"]
]);

const COUNTRY_KEYS = new Set([
  "republica dominicana",
  "república dominicana",
  "dominican republic",
  "republique dominicaine",
  "rd",
  "do"
]);

const LANGUAGE_EQUIVALENTS = new Map<string, string>([
  ["es", "Spanish"],
  ["spanish", "Spanish"],
  ["espanol", "Spanish"],
  ["español", "Spanish"],
  ["en", "English"],
  ["english", "English"],
  ["ingles", "English"],
  ["inglés", "English"],
  ["fr", "French"],
  ["french", "French"],
  ["frances", "French"],
  ["francés", "French"],
  ["pt", "Portuguese"],
  ["portuguese", "Portuguese"],
  ["portugues", "Portuguese"],
  ["portugués", "Portuguese"],
  ["de", "German"],
  ["german", "German"],
  ["aleman", "German"],
  ["alemán", "German"],
  ["it", "Italian"],
  ["italian", "Italian"],
  ["italiano", "Italian"]
]);

const KNOWN_LANGUAGE_LABELS = [...new Set(LANGUAGE_EQUIVALENTS.values())];

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function dedupe(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function normalizeLocationPiece(value: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  return LOCATION_EQUIVALENTS.get(cleaned.toLowerCase()) ?? cleaned;
}

export function normalizeTourLocation(location?: string | null) {
  if (!location) return "Punta Cana";

  const parts = dedupe(
    location
      .split(LOCATION_SEPARATORS)
      .map(normalizeLocationPiece)
      .filter(Boolean)
  );

  const countryParts = parts.filter((part) => COUNTRY_KEYS.has(part.toLowerCase()));
  const localParts = parts.filter((part) => !COUNTRY_KEYS.has(part.toLowerCase()));
  return [...localParts, ...countryParts].join(", ");
}

export function getTourPrimaryLocation(location?: string | null) {
  return normalizeTourLocation(location).split(",")[0]?.trim() || "Punta Cana";
}

function normalizeLanguagePiece(value: string) {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  return LANGUAGE_EQUIVALENTS.get(cleaned.toLowerCase()) ?? cleaned;
}

export function normalizeTourLanguages(value?: string | null) {
  if (!value) return [];
  const cleaned = cleanText(value);
  const splitValues = cleaned
    .split(LANGUAGE_SPLIT)
    .map(normalizeLanguagePiece)
    .filter(Boolean);

  if (splitValues.length > 1) {
    return dedupe(splitValues);
  }

  const compact = cleaned.toLowerCase().replace(/\s+/g, "");
  const matched = KNOWN_LANGUAGE_LABELS.filter((label) =>
    compact.includes(label.toLowerCase().replace(/\s+/g, ""))
  );

  if (matched.length > 1) {
    return dedupe(matched);
  }

  return dedupe(splitValues);
}

export function formatTourLanguages(value?: string | null, separator = ", ") {
  return normalizeTourLanguages(value).join(separator);
}
