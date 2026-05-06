import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type KeywordPlannerIntent =
  | "transfer"
  | "rent_car"
  | "tour"
  | "taxi"
  | "island"
  | "buggy_atv"
  | "catamaran"
  | "competitor"
  | "informational"
  | "other";

export type KeywordPlannerPriority = "high" | "medium" | "low";

export type KeywordPlannerStatus =
  | "new"
  | "pending"
  | "in_process"
  | "draft_created"
  | "published"
  | "duplicate"
  | "ignored";

export type KeywordPlannerConnectedType = "tour" | "transfer" | "rent_car" | "content" | "review";

export type KeywordPlannerRecord = {
  keyword: string;
  normalizedKeyword: string;
  currency?: string;
  avgMonthlySearches: number;
  threeMonthChange?: string;
  yearChange?: string;
  competition?: string;
  competitionIndex?: number | null;
  topBidLow?: number | null;
  topBidHigh?: number | null;
  inAccount?: boolean;
  inPlan?: boolean;
  intent: KeywordPlannerIntent;
  priority: KeywordPlannerPriority;
  status: KeywordPlannerStatus;
  connectedType: KeywordPlannerConnectedType;
  suggestedAction: string;
  sourceBatches: string[];
  firstImportedAt: string;
  lastImportedAt: string;
  updatedAt: string;
};

export type KeywordPlannerBatch = {
  id: string;
  fileName: string;
  importedAt: string;
  rows: number;
  created: number;
  updated: number;
  duplicates: number;
  errors: string[];
};

export type KeywordPlannerStore = {
  version: 1;
  keywords: KeywordPlannerRecord[];
  batches: KeywordPlannerBatch[];
  updatedAt: string;
};

export type KeywordPlannerImportResult = KeywordPlannerBatch & {
  totalKeywords: number;
  pending: number;
  highPriority: number;
};

const STORE_KEY = "KEYWORD_PLANNER_STORE";

const DEFAULT_STORE: KeywordPlannerStore = {
  version: 1,
  keywords: [],
  batches: [],
  updatedAt: new Date(0).toISOString()
};

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const normalizeKeywordPlannerKeyword = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeHeader = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const getNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[$,%\s]/g, "").replace(/,/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNullableNumber = (value: unknown) => {
  const parsed = getNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["y", "yes", "si", "sí", "true", "1"].includes(value.trim().toLowerCase());
};

const parseDelimitedLine = (line: string, delimiter: string) => {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
};

const findHeaderLineIndex = (lines: string[]) =>
  lines.findIndex((line) => {
    if (/^\uFEFF?Keyword[\t,]/i.test(line) || /^\uFEFF?Palabra clave[\t,]/i.test(line)) return true;
    const normalized = normalizeHeader(line);
    return normalized.startsWith("keyword currency") || normalized.startsWith("palabra clave moneda");
  });

const getByHeader = (row: Record<string, string>, aliases: string[]) => {
  for (const alias of aliases) {
    const value = row[normalizeHeader(alias)];
    if (value !== undefined) return value;
  }
  return "";
};

export const classifyKeywordPlannerIntent = (keyword: string): KeywordPlannerIntent => {
  const normalized = normalizeKeywordPlannerKeyword(keyword);
  if (/(viator|getyourguide|expedia|nexus|otium|caribe|civitatis|tripadvisor)/.test(normalized)) {
    return "competitor";
  }
  if (
    /(rent a car|rent car|rental car|car rental|renta car|renta de carro|rentar carro|alquiler de carro|alquiler de coches|alquiler de autos|alquilar carro|alquilar coche|vehiculo de alquiler|vehicle rental|suv rental|luxury car rental|convertible rental)/.test(
      normalized
    )
  ) {
    return "rent_car";
  }
  if (/(transfer|transport|transportation|airport|aeropuerto|shuttle|taxi|cab|limo|pickup|pick up)/.test(normalized)) {
    return normalized.includes("taxi") ? "taxi" : "transfer";
  }
  if (/(catamaran|party boat|boat party|boat|snorkel|snorkeling|cruise|sunset)/.test(normalized)) {
    return "catamaran";
  }
  if (/(buggy|buggies|atv|quad|4x4|off road|offroad|macao)/.test(normalized)) {
    return "buggy_atv";
  }
  if (/(saona|catalina|bayahibe|isla|island|playa|beach|cayo)/.test(normalized)) {
    return "island";
  }
  if (/(tour|excursion|activity|activities|things to do|que hacer|experiencia|ticket|entrada)/.test(normalized)) {
    return "tour";
  }
  if (/(best|mejor|where|donde|how|como|what|que|price|precio|cost|cuanto|review|reviews|resena)/.test(normalized)) {
    return "informational";
  }
  return "other";
};

const getConnectedType = (intent: KeywordPlannerIntent): KeywordPlannerConnectedType => {
  if (intent === "transfer" || intent === "taxi") return "transfer";
  if (intent === "rent_car") return "rent_car";
  if (intent === "competitor") return "review";
  if (intent === "informational" || intent === "other") return "content";
  return "tour";
};

const getPriority = (avgMonthlySearches: number, topBidHigh: number | null, yearChange?: string): KeywordPlannerPriority => {
  const highGrowth = typeof yearChange === "string" && /\+?\s*(900|500|200)%/.test(yearChange);
  if (avgMonthlySearches >= 5000 || (topBidHigh ?? 0) >= 3.5 || highGrowth) return "high";
  if (avgMonthlySearches >= 500 || (topBidHigh ?? 0) >= 1.5) return "medium";
  return "low";
};

const getSuggestedAction = (intent: KeywordPlannerIntent, keyword: string) => {
  const normalized = normalizeKeywordPlannerKeyword(keyword);
  if (intent === "transfer" || intent === "taxi") {
    return normalized.includes("airport") || normalized.includes("aeropuerto")
      ? "Crear landing transaccional de ruta PUJ + hoteles y conectar formulario de traslado."
      : "Crear landing de traslado privado con buscador y precios por zona.";
  }
  if (intent === "rent_car") {
    return "Crear landing de rent car con vehiculo real, precio por dia, zona de recogida y formulario de reserva.";
  }
  if (intent === "catamaran") return "Crear landing de catamaran con galeria, precio desde y disponibilidad.";
  if (intent === "buggy_atv") return "Crear landing de buggy/ATV con urgencia, recogida y reseñas.";
  if (intent === "island") return "Crear landing de isla/playa con itinerario, fotos y oferta principal.";
  if (intent === "competitor") return "Crear contenido comparativo o alternativa Proactivitis sin usar marca en exceso.";
  if (intent === "informational") return "Crear pagina guia que empuje a tours o transfer relacionados.";
  return "Revisar manualmente y decidir si conviene tour, transfer o contenido.";
};

const toRecord = (row: Record<string, string>, batchId: string, importedAt: string): KeywordPlannerRecord | null => {
  const keyword = getByHeader(row, ["Keyword", "Palabra clave"]);
  if (!keyword.trim()) return null;

  const avgMonthlySearches = getNumber(
    getByHeader(row, ["Avg. monthly searches", "Promedio de busquedas mensuales", "Promedio de búsquedas mensuales"]),
    0
  );
  const topBidHigh = getNullableNumber(
    getByHeader(row, [
      "Top of page bid (high range)",
      "Puja por la parte superior de la pagina (intervalo alto)",
      "Puja por la parte superior de la página (intervalo alto)"
    ])
  );
  const intent = classifyKeywordPlannerIntent(keyword);
  const yearChange = getByHeader(row, ["YoY change", "Cambio interanual"]);

  return {
    keyword: keyword.trim(),
    normalizedKeyword: normalizeKeywordPlannerKeyword(keyword),
    currency: getByHeader(row, ["Currency", "Moneda"]) || undefined,
    avgMonthlySearches,
    threeMonthChange:
      getByHeader(row, ["Three month change", "Cambio de tres meses", "Cambio en los ultimos tres meses"]) || undefined,
    yearChange: yearChange || undefined,
    competition: getByHeader(row, ["Competition", "Competencia"]) || undefined,
    competitionIndex: getNullableNumber(getByHeader(row, ["Competition (indexed value)", "Valor de competencia indexado"])),
    topBidLow: getNullableNumber(
      getByHeader(row, [
        "Top of page bid (low range)",
        "Puja por la parte superior de la pagina (intervalo bajo)",
        "Puja por la parte superior de la página (intervalo bajo)"
      ])
    ),
    topBidHigh,
    inAccount: parseBoolean(getByHeader(row, ["In account", "En la cuenta"])),
    inPlan: parseBoolean(getByHeader(row, ["In plan", "En el plan"])),
    intent,
    priority: getPriority(avgMonthlySearches, topBidHigh, yearChange),
    status: "pending",
    connectedType: getConnectedType(intent),
    suggestedAction: getSuggestedAction(intent, keyword),
    sourceBatches: [batchId],
    firstImportedAt: importedAt,
    lastImportedAt: importedAt,
    updatedAt: importedAt
  };
};

export const parseKeywordPlannerCsv = (text: string) => {
  const normalizedText = text.includes("\u0000") ? text.replace(/\u0000/g, "") : text;
  const lines = normalizedText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
  const headerIndex = findHeaderLineIndex(lines);
  if (headerIndex < 0) {
    return { rows: [] as Record<string, string>[], errors: ["No se encontro la fila de encabezados de Keyword Planner."] };
  }

  const tableLines = lines.slice(headerIndex);
  const delimiter = tableLines[0].includes("\t") ? "\t" : ",";
  const headers = parseDelimitedLine(tableLines[0], delimiter).map(normalizeHeader);
  const rows: Record<string, string>[] = [];
  const errors: string[] = [];

  tableLines.slice(1).forEach((line, index) => {
    const cells = parseDelimitedLine(line, delimiter);
    if (cells.length < 2) return;
    const row: Record<string, string> = {};
    headers.forEach((header, cellIndex) => {
      row[header] = cells[cellIndex] ?? "";
    });
    if (!getByHeader(row, ["Keyword", "Palabra clave"])) {
      errors.push(`Fila ${index + headerIndex + 2}: sin keyword.`);
      return;
    }
    rows.push(row);
  });

  return { rows, errors };
};

export async function getKeywordPlannerStore(): Promise<KeywordPlannerStore> {
  const setting = await prisma.siteContentSetting.findUnique({
    where: { key: STORE_KEY },
    select: { content: true }
  });

  if (!isObject(setting?.content)) return DEFAULT_STORE;
  const content = setting.content;
  return {
    version: 1,
    keywords: Array.isArray(content.keywords) ? (content.keywords as KeywordPlannerRecord[]) : [],
    batches: Array.isArray(content.batches) ? (content.batches as KeywordPlannerBatch[]) : [],
    updatedAt: getString(content.updatedAt, DEFAULT_STORE.updatedAt)
  };
}

async function saveKeywordPlannerStore(store: KeywordPlannerStore) {
  await prisma.siteContentSetting.upsert({
    where: { key: STORE_KEY },
    create: { key: STORE_KEY, content: toJson(store) },
    update: { content: toJson(store) }
  });
}

export async function importKeywordPlannerCsv({
  fileName,
  text
}: {
  fileName: string;
  text: string;
}): Promise<KeywordPlannerImportResult> {
  const importedAt = new Date().toISOString();
  const batchId = `kp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const parsed = parseKeywordPlannerCsv(text);
  const store = await getKeywordPlannerStore();
  const keywordMap = new Map(store.keywords.map((keyword) => [keyword.normalizedKeyword, keyword]));

  let created = 0;
  let updated = 0;
  let duplicates = 0;
  const errors = [...parsed.errors];

  parsed.rows.forEach((row) => {
    const incoming = toRecord(row, batchId, importedAt);
    if (!incoming) return;
    const existing = keywordMap.get(incoming.normalizedKeyword);
    if (!existing) {
      keywordMap.set(incoming.normalizedKeyword, incoming);
      created += 1;
      return;
    }

    duplicates += 1;
    updated += 1;
    keywordMap.set(incoming.normalizedKeyword, {
      ...existing,
      keyword: incoming.keyword,
      currency: incoming.currency ?? existing.currency,
      avgMonthlySearches: incoming.avgMonthlySearches,
      threeMonthChange: incoming.threeMonthChange,
      yearChange: incoming.yearChange,
      competition: incoming.competition,
      competitionIndex: incoming.competitionIndex,
      topBidLow: incoming.topBidLow,
      topBidHigh: incoming.topBidHigh,
      inAccount: incoming.inAccount,
      inPlan: incoming.inPlan,
      intent: incoming.intent,
      priority: incoming.priority,
      connectedType: incoming.connectedType,
      suggestedAction: incoming.suggestedAction,
      sourceBatches: Array.from(new Set([...existing.sourceBatches, batchId])),
      lastImportedAt: importedAt,
      updatedAt: importedAt
    });
  });

  const keywords = Array.from(keywordMap.values()).sort((a, b) => {
    const priorityWeight = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.avgMonthlySearches - a.avgMonthlySearches;
  });

  const batch: KeywordPlannerBatch = {
    id: batchId,
    fileName,
    importedAt,
    rows: parsed.rows.length,
    created,
    updated,
    duplicates,
    errors
  };

  await saveKeywordPlannerStore({
    version: 1,
    keywords,
    batches: [batch, ...store.batches].slice(0, 50),
    updatedAt: importedAt
  });

  return {
    ...batch,
    totalKeywords: keywords.length,
    pending: keywords.filter((keyword) => keyword.status === "pending" || keyword.status === "new").length,
    highPriority: keywords.filter((keyword) => keyword.priority === "high").length
  };
}

export async function listKeywordPlannerOpportunities({
  limit = 100,
  status,
  priority,
  intent
}: {
  limit?: number;
  status?: KeywordPlannerStatus;
  priority?: KeywordPlannerPriority;
  intent?: KeywordPlannerIntent;
} = {}) {
  const store = await getKeywordPlannerStore();
  return store.keywords
    .filter((keyword) => (status ? keyword.status === status : true))
    .filter((keyword) => (priority ? keyword.priority === priority : true))
    .filter((keyword) => (intent ? keyword.intent === intent : true))
    .slice(0, limit);
}

export async function updateKeywordPlannerStatus(normalizedKeyword: string, status: KeywordPlannerStatus) {
  const store = await getKeywordPlannerStore();
  const updatedAt = new Date().toISOString();
  const keywords = store.keywords.map((keyword) =>
    keyword.normalizedKeyword === normalizedKeyword ? { ...keyword, status, updatedAt } : keyword
  );
  await saveKeywordPlannerStore({ ...store, keywords, updatedAt });
}

export async function getKeywordPlannerSummary() {
  const store = await getKeywordPlannerStore();
  return {
    total: store.keywords.length,
    pending: store.keywords.filter((keyword) => keyword.status === "pending" || keyword.status === "new").length,
    highPriority: store.keywords.filter((keyword) => keyword.priority === "high").length,
    transfer: store.keywords.filter((keyword) => keyword.connectedType === "transfer").length,
    rentCar: store.keywords.filter((keyword) => keyword.connectedType === "rent_car").length,
    tour: store.keywords.filter((keyword) => keyword.connectedType === "tour").length,
    content: store.keywords.filter((keyword) => keyword.connectedType === "content").length,
    review: store.keywords.filter((keyword) => keyword.connectedType === "review").length,
    lastBatch: store.batches[0] ?? null,
    updatedAt: store.updatedAt
  };
}
