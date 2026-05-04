import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Locale = "es" | "en" | "fr";

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    groundingMetadata?: {
      groundingChunks?: Array<{
        web?: {
          uri?: string;
          title?: string;
        };
      }>;
    };
  }>;
};

export type GeminiGlobalTourFactoryConfig = {
  enabled: boolean;
  batchSize: number;
  dailyLimit: number;
  cursor: number;
  markupPerPerson: number;
  minLeadHours: number;
  lastRunAt?: string | null;
  lastResult?: {
    generated: number;
    drafted: number;
    errors: string[];
  } | null;
};

type GlobalTourSeed = {
  id: string;
  activity: string;
  destination: string;
  countryCode: string;
  countryName: string;
  category: string;
  zoneHint: string;
};

type GeminiGlobalTourPayload = {
  title: string;
  subtitle?: string;
  slug?: string;
  country: {
    code: string;
    name: string;
    slug: string;
  };
  destination: {
    name: string;
    slug: string;
  };
  microZone?: {
    name: string;
    slug: string;
  };
  category: string;
  priceUsd: number;
  priceChildUsd?: number | null;
  priceYouthUsd?: number | null;
  duration: {
    value: string;
    unit: string;
  };
  capacity?: number | null;
  languages: string[];
  pickup?: string | null;
  meetingPoint?: string | null;
  meetingInstructions?: string | null;
  shortDescription: string;
  description: string;
  highlights: string[];
  includesList: string[];
  notIncludedList: string[];
  itineraryStops: Array<{
    time: string;
    title: string;
    description?: string;
  }>;
  operatingDays: string[];
  timeOptions: Array<{
    hour: number;
    minute: string;
    period: "AM" | "PM";
  }>;
  cancellationPolicy: string;
  requirements?: string | null;
  terms?: string | null;
  seoKeywords: string[];
  translations: Record<
    Exclude<Locale, "es">,
    {
      title: string;
      subtitle?: string;
      shortDescription: string;
      description: string;
      highlights: string[];
      includesList: string[];
      notIncludedList: string[];
      itineraryStops: string[];
      durationUnit?: string;
    }
  >;
};

const CONFIG_KEY = "GEMINI_GLOBAL_TOUR_FACTORY_CONFIG";
const FACTORY_MARKER = "GLOBAL_MANUAL_TOUR_FACTORY";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = (model: string, apiKey: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const DEFAULT_CONFIG: GeminiGlobalTourFactoryConfig = {
  enabled: true,
  batchSize: 2,
  dailyLimit: 192,
  cursor: 0,
  markupPerPerson: 30,
  minLeadHours: 24,
  lastRunAt: null,
  lastResult: null
};

const FALLBACK_IMAGE = "/fototours/fotosimple.jpg";

const HOT_GLOBAL_TOUR_SEEDS: GlobalTourSeed[] = [
  { id: "rome-vatican", activity: "Vatican Museums and Sistine Chapel guided tour", destination: "Rome", countryCode: "IT", countryName: "Italy", category: "Cultura", zoneHint: "Vatican City and historic Rome" },
  { id: "rome-colosseum", activity: "Colosseum Roman Forum and Palatine Hill tour", destination: "Rome", countryCode: "IT", countryName: "Italy", category: "Cultura", zoneHint: "Ancient Rome" },
  { id: "paris-eiffel", activity: "Eiffel Tower summit or second floor experience", destination: "Paris", countryCode: "FR", countryName: "France", category: "Atracciones", zoneHint: "Eiffel Tower and Champ de Mars" },
  { id: "paris-louvre", activity: "Louvre Museum highlights tour", destination: "Paris", countryCode: "FR", countryName: "France", category: "Museos", zoneHint: "Louvre and central Paris" },
  { id: "paris-versailles", activity: "Versailles Palace and gardens day trip", destination: "Paris", countryCode: "FR", countryName: "France", category: "Cultura", zoneHint: "Versailles" },
  { id: "barcelona-sagrada", activity: "Sagrada Familia guided visit", destination: "Barcelona", countryCode: "ES", countryName: "Spain", category: "Cultura", zoneHint: "Eixample" },
  { id: "barcelona-park-guell", activity: "Park Guell and Gaudi highlights tour", destination: "Barcelona", countryCode: "ES", countryName: "Spain", category: "Cultura", zoneHint: "Gracia and Gaudi route" },
  { id: "madrid-prado", activity: "Prado Museum guided tour", destination: "Madrid", countryCode: "ES", countryName: "Spain", category: "Museos", zoneHint: "Paseo del Prado" },
  { id: "amsterdam-canal", activity: "Amsterdam canal cruise", destination: "Amsterdam", countryCode: "NL", countryName: "Netherlands", category: "Mar / agua", zoneHint: "Canal Ring" },
  { id: "london-harry-potter", activity: "Warner Bros Studio Harry Potter tour from London", destination: "London", countryCode: "GB", countryName: "United Kingdom", category: "Atracciones", zoneHint: "Leavesden and London" },
  { id: "london-stonehenge", activity: "Stonehenge Windsor and Bath day trip", destination: "London", countryCode: "GB", countryName: "United Kingdom", category: "Cultura", zoneHint: "South West England" },
  { id: "new-york-statue", activity: "Statue of Liberty and Ellis Island tour", destination: "New York", countryCode: "US", countryName: "United States", category: "Ciudades / cultura", zoneHint: "Lower Manhattan" },
  { id: "new-york-empire", activity: "Empire State Building observation deck", destination: "New York", countryCode: "US", countryName: "United States", category: "Atracciones", zoneHint: "Midtown Manhattan" },
  { id: "las-vegas-grand-canyon", activity: "Grand Canyon Hoover Dam and Skywalk day trip", destination: "Las Vegas", countryCode: "US", countryName: "United States", category: "Naturaleza y eco", zoneHint: "Grand Canyon West" },
  { id: "arizona-antelope", activity: "Antelope Canyon and Horseshoe Bend tour", destination: "Page", countryCode: "US", countryName: "United States", category: "Naturaleza y eco", zoneHint: "Northern Arizona" },
  { id: "orlando-theme-parks", activity: "Orlando theme park ticket and transfer options", destination: "Orlando", countryCode: "US", countryName: "United States", category: "Atracciones", zoneHint: "Lake Buena Vista and International Drive" },
  { id: "miami-everglades", activity: "Everglades airboat tour from Miami", destination: "Miami", countryCode: "US", countryName: "United States", category: "Naturaleza y eco", zoneHint: "Everglades National Park" },
  { id: "cancun-chichen", activity: "Chichen Itza cenote and Valladolid day trip", destination: "Cancun", countryCode: "MX", countryName: "Mexico", category: "Cultura", zoneHint: "Yucatan" },
  { id: "tulum-ruins", activity: "Tulum ruins and cenote tour", destination: "Tulum", countryCode: "MX", countryName: "Mexico", category: "Cultura", zoneHint: "Riviera Maya" },
  { id: "mexico-teotihuacan", activity: "Teotihuacan pyramids and basilica tour", destination: "Mexico City", countryCode: "MX", countryName: "Mexico", category: "Cultura", zoneHint: "Teotihuacan" },
  { id: "rio-christ", activity: "Christ the Redeemer Sugarloaf and Rio city tour", destination: "Rio de Janeiro", countryCode: "BR", countryName: "Brazil", category: "Ciudades / cultura", zoneHint: "Corcovado and Sugarloaf" },
  { id: "buenos-aires-tango", activity: "Buenos Aires tango dinner show", destination: "Buenos Aires", countryCode: "AR", countryName: "Argentina", category: "Nocturnos", zoneHint: "San Telmo and Palermo" },
  { id: "cartagena-islands", activity: "Rosario Islands boat day trip", destination: "Cartagena", countryCode: "CO", countryName: "Colombia", category: "Islas / playa", zoneHint: "Rosario Islands" },
  { id: "medellin-guatape", activity: "Guatape and El Penol day trip", destination: "Medellin", countryCode: "CO", countryName: "Colombia", category: "Naturaleza y eco", zoneHint: "Guatape" },
  { id: "cusco-machu-picchu", activity: "Machu Picchu full day tour from Cusco", destination: "Cusco", countryCode: "PE", countryName: "Peru", category: "Cultura", zoneHint: "Sacred Valley and Machu Picchu" },
  { id: "dubai-desert-safari", activity: "Dubai desert safari with dinner and live show", destination: "Dubai", countryCode: "AE", countryName: "United Arab Emirates", category: "Aventura", zoneHint: "Dubai desert conservation area" },
  { id: "abu-dhabi-grand-mosque", activity: "Abu Dhabi Grand Mosque and city tour from Dubai", destination: "Dubai", countryCode: "AE", countryName: "United Arab Emirates", category: "Cultura", zoneHint: "Abu Dhabi" },
  { id: "marrakech-agafay", activity: "Agafay desert dinner and camel ride", destination: "Marrakech", countryCode: "MA", countryName: "Morocco", category: "Aventura", zoneHint: "Agafay Desert" },
  { id: "cairo-pyramids", activity: "Giza Pyramids Sphinx and Egyptian Museum tour", destination: "Cairo", countryCode: "EG", countryName: "Egypt", category: "Cultura", zoneHint: "Giza and Cairo" },
  { id: "cape-town-table", activity: "Table Mountain Cape Point and penguins tour", destination: "Cape Town", countryCode: "ZA", countryName: "South Africa", category: "Naturaleza y eco", zoneHint: "Cape Peninsula" },
  { id: "santorini-cruise", activity: "Santorini caldera cruise with sunset", destination: "Santorini", countryCode: "GR", countryName: "Greece", category: "Mar / agua", zoneHint: "Caldera and Oia" },
  { id: "athens-acropolis", activity: "Acropolis and Parthenon guided tour", destination: "Athens", countryCode: "GR", countryName: "Greece", category: "Cultura", zoneHint: "Acropolis" },
  { id: "istanbul-bosphorus", activity: "Bosphorus dinner cruise", destination: "Istanbul", countryCode: "TR", countryName: "Turkey", category: "Mar / agua", zoneHint: "Bosphorus Strait" },
  { id: "cappadocia-balloon", activity: "Cappadocia hot air balloon flight", destination: "Cappadocia", countryCode: "TR", countryName: "Turkey", category: "Lujo / VIP", zoneHint: "Goreme" },
  { id: "bali-ubud", activity: "Ubud monkey forest rice terrace and waterfall tour", destination: "Bali", countryCode: "ID", countryName: "Indonesia", category: "Naturaleza y eco", zoneHint: "Ubud" },
  { id: "bangkok-floating", activity: "Damnoen Saduak floating market and railway market", destination: "Bangkok", countryCode: "TH", countryName: "Thailand", category: "Cultura", zoneHint: "Ratchaburi and Samut Songkhram" },
  { id: "phuket-phi-phi", activity: "Phi Phi Islands speedboat tour", destination: "Phuket", countryCode: "TH", countryName: "Thailand", category: "Islas / playa", zoneHint: "Phi Phi Islands" },
  { id: "tokyo-fuji", activity: "Mount Fuji and Lake Kawaguchi day trip", destination: "Tokyo", countryCode: "JP", countryName: "Japan", category: "Naturaleza y eco", zoneHint: "Mount Fuji area" },
  { id: "kyoto-temples", activity: "Kyoto temples bamboo forest and shrine tour", destination: "Kyoto", countryCode: "JP", countryName: "Japan", category: "Cultura", zoneHint: "Arashiyama and Higashiyama" },
  { id: "seoul-dmz", activity: "DMZ tour from Seoul", destination: "Seoul", countryCode: "KR", countryName: "South Korea", category: "Cultura", zoneHint: "Korean DMZ" },
  { id: "sydney-blue-mountains", activity: "Blue Mountains and wildlife day tour", destination: "Sydney", countryCode: "AU", countryName: "Australia", category: "Naturaleza y eco", zoneHint: "Blue Mountains" },
  { id: "queenstown-milford", activity: "Milford Sound coach cruise and scenic tour", destination: "Queenstown", countryCode: "NZ", countryName: "New Zealand", category: "Naturaleza y eco", zoneHint: "Fiordland" },
  { id: "reykjavik-northern-lights", activity: "Northern Lights tour from Reykjavik", destination: "Reykjavik", countryCode: "IS", countryName: "Iceland", category: "Naturaleza y eco", zoneHint: "Southwest Iceland" },
  { id: "lisbon-sintra", activity: "Sintra Pena Palace and Cascais day trip", destination: "Lisbon", countryCode: "PT", countryName: "Portugal", category: "Cultura", zoneHint: "Sintra and Cascais" },
  { id: "porto-wine", activity: "Douro Valley wine tour from Porto", destination: "Porto", countryCode: "PT", countryName: "Portugal", category: "Experiencias / productos", zoneHint: "Douro Valley" },
  { id: "prague-castle", activity: "Prague Castle and Old Town guided tour", destination: "Prague", countryCode: "CZ", countryName: "Czech Republic", category: "Cultura", zoneHint: "Prague Castle and Old Town" },
  { id: "budapest-cruise", activity: "Budapest Danube evening cruise", destination: "Budapest", countryCode: "HU", countryName: "Hungary", category: "Mar / agua", zoneHint: "Danube River" },
  { id: "vienna-concert", activity: "Vienna classical concert experience", destination: "Vienna", countryCode: "AT", countryName: "Austria", category: "Nocturnos", zoneHint: "Historic Vienna" }
];

const GLOBAL_ANGLES = [
  "best selling first-time visitor page",
  "family-friendly booking page",
  "premium comfort and smoother logistics page",
  "clear price and what is included page",
  "last-minute traveler with 24 hour lead time page",
  "private or small-group upgrade page"
];

const toJson = (value: unknown) => value as Prisma.InputJsonValue;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const cleanGeneratedText = (value: string) =>
  value
    .replace(/\{\s*"value"\s*:\s*"([^"]+)"\s*,\s*"unit"\s*:\s*"([^"]+)"\s*\}/g, "$1 $2")
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\/\s*(p|div|li|h[1-6]|b|strong)\s*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();

const safeString = (value: unknown, fallback = "") =>
  typeof value === "string" ? cleanGeneratedText(value) : fallback;

const safeArray = (value: unknown, fallback: string[] = [], limit = 12) =>
  (Array.isArray(value) ? value.map((item) => safeString(item)).filter(Boolean) : fallback).slice(0, limit);

const safeNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number * 100) / 100));
};

const parseJsonFromText = (text: string) => {
  const direct = text.trim();
  const fenced = direct.match(/```json\s*([\s\S]+?)```/i)?.[1] ?? direct.match(/```\s*([\s\S]+?)```/i)?.[1];
  const payload = (fenced ?? direct).trim();
  try {
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    const start = payload.indexOf("{");
    const end = payload.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(payload.slice(start, end + 1)) as Record<string, unknown>;
    }
    throw new Error("Gemini no devolvio JSON valido para crear el tour.");
  }
};

const extractText = (data: GeminiApiResponse) =>
  data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim() ?? "";

const buildPrompt = (seed: GlobalTourSeed, angle: string, config: GeminiGlobalTourFactoryConfig) => `
You are Proactivitis Global Tour Factory, a senior travel product manager, SEO strategist, and tour operations planner.
Use Google Search grounding to understand current traveler intent and common inclusions for this tour type.

Create one draft tour product for Proactivitis.
Return strict JSON only. Do not wrap in markdown.

Seed:
${JSON.stringify(seed, null, 2)}

Commercial angle:
${angle}

Business rules:
- Proactivitis does not yet have a contracted local supplier for this global product.
- The product must be a DRAFT for internal review.
- Do not claim instant confirmation, exclusive operation, verified supplier, fake reviews, fake discounts, fake inventory, or guaranteed availability.
- Use a soft commercial promise: fast manual confirmation by the Proactivitis team.
- Customer booking rule: minimum ${config.minLeadHours} hours before activity date.
- Set a sellable public price in USD using current market expectations plus at least ${config.markupPerPerson} USD margin per adult.
- Pick realistic child/youth prices only when common for this activity.
- Content must be polished, commercial, and safe to publish after human review.
- Classify country, destination, micro zone/area, category, languages, schedule, pickup/meeting point, inclusions, exclusions, itinerary, requirements, cancellation policy.
- Add SEO keywords, but never put hidden or spammy text in the customer copy.
- Spanish is the base product language. Also provide English and French translations.
- Use plain text only. No HTML tags.

Return this exact JSON shape:
{
  "title": "Spanish product title",
  "subtitle": "short commercial subtitle",
  "slug": "lowercase-seo-slug",
  "country": { "code": "ISO-2", "name": "Country name", "slug": "country-slug" },
  "destination": { "name": "Destination city/area", "slug": "destination-slug" },
  "microZone": { "name": "Specific area", "slug": "area-slug" },
  "category": "category name",
  "priceUsd": 120,
  "priceChildUsd": 90,
  "priceYouthUsd": 105,
  "duration": { "value": "4", "unit": "hours" },
  "capacity": 15,
  "languages": ["English", "Spanish", "French"],
  "pickup": "pickup summary or null",
  "meetingPoint": "meeting point summary or null",
  "meetingInstructions": "clear meeting instruction",
  "shortDescription": "under 220 chars",
  "description": "strong commercial description, 2 short paragraphs max",
  "highlights": ["3-6 sales bullets"],
  "includesList": ["included item"],
  "notIncludedList": ["not included item"],
  "itineraryStops": [
    { "time": "09:00", "title": "Stop name", "description": "what happens" }
  ],
  "operatingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  "timeOptions": [{ "hour": 9, "minute": "00", "period": "AM" }],
  "cancellationPolicy": "clear policy",
  "requirements": "requirements",
  "terms": "minimum lead time and manual confirmation note",
  "seoKeywords": ["keyword"],
  "translations": {
    "en": {
      "title": "English title",
      "subtitle": "English subtitle",
      "shortDescription": "English short description",
      "description": "English description",
      "highlights": ["English bullet"],
      "includesList": ["English included item"],
      "notIncludedList": ["English not included item"],
      "itineraryStops": ["English stop title"],
      "durationUnit": "hours"
    },
    "fr": {
      "title": "French title",
      "subtitle": "French subtitle",
      "shortDescription": "French short description",
      "description": "French description",
      "highlights": ["French bullet"],
      "includesList": ["French included item"],
      "notIncludedList": ["French not included item"],
      "itineraryStops": ["French stop title"],
      "durationUnit": "heures"
    }
  }
}
`.trim();

const normalizeTimeOptions = (value: unknown) => {
  if (!Array.isArray(value)) return [{ hour: 9, minute: "00", period: "AM" as const }];
  return value
    .filter(isObject)
    .map((item) => ({
      hour: safeNumber(item.hour, 9, 1, 12),
      minute: String(safeNumber(item.minute, 0, 0, 59)).padStart(2, "0"),
      period: safeString(item.period).toUpperCase() === "PM" ? ("PM" as const) : ("AM" as const)
    }))
    .slice(0, 6);
};

const normalizeItinerary = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [
      { time: "09:00", title: "Inicio de la experiencia", description: "Encuentro con el operador local asignado." },
      { time: "Ruta", title: "Actividad principal", description: "Desarrollo del tour segun disponibilidad confirmada." }
    ];
  }
  return value
    .filter(isObject)
    .map((item) => ({
      time: safeString(item.time, "Ruta"),
      title: safeString(item.title, "Parada principal"),
      description: safeString(item.description)
    }))
    .filter((item) => item.title)
    .slice(0, 8);
};

const normalizePayload = (raw: Record<string, unknown>, seed: GlobalTourSeed): GeminiGlobalTourPayload => {
  const countryRaw = isObject(raw.country) ? raw.country : {};
  const destinationRaw = isObject(raw.destination) ? raw.destination : {};
  const microZoneRaw = isObject(raw.microZone) ? raw.microZone : {};
  const durationRaw = isObject(raw.duration) ? raw.duration : {};
  const translationsRaw = isObject(raw.translations) ? raw.translations : {};
  const enRaw = isObject(translationsRaw.en) ? translationsRaw.en : {};
  const frRaw = isObject(translationsRaw.fr) ? translationsRaw.fr : {};
  const title = safeString(raw.title, `${seed.activity} en ${seed.destination}`);
  const category = safeString(raw.category, seed.category);

  return {
    title,
    subtitle: safeString(raw.subtitle, `Experiencia seleccionada en ${seed.destination}`),
    slug: safeString(raw.slug, slugify(`${seed.destination}-${seed.activity}`)),
    country: {
      code: safeString(countryRaw.code, seed.countryCode).toUpperCase().slice(0, 2),
      name: safeString(countryRaw.name, seed.countryName),
      slug: slugify(safeString(countryRaw.slug, seed.countryName))
    },
    destination: {
      name: safeString(destinationRaw.name, seed.destination),
      slug: slugify(safeString(destinationRaw.slug, seed.destination))
    },
    microZone: {
      name: safeString(microZoneRaw.name, seed.zoneHint),
      slug: slugify(safeString(microZoneRaw.slug, `${seed.destination}-${seed.zoneHint}`))
    },
    category,
    priceUsd: safeNumber(raw.priceUsd, 120, 25, 5000),
    priceChildUsd: raw.priceChildUsd === null ? null : safeNumber(raw.priceChildUsd, 0, 0, 5000) || null,
    priceYouthUsd: raw.priceYouthUsd === null ? null : safeNumber(raw.priceYouthUsd, 0, 0, 5000) || null,
    duration: {
      value: safeString(durationRaw.value, "4"),
      unit: safeString(durationRaw.unit, "hours")
    },
    capacity: safeNumber(raw.capacity, 15, 1, 500),
    languages: safeArray(raw.languages, ["English", "Spanish"], 8),
    pickup: safeString(raw.pickup),
    meetingPoint: safeString(raw.meetingPoint),
    meetingInstructions: safeString(raw.meetingInstructions),
    shortDescription: safeString(raw.shortDescription, `Reserva ${title} con confirmacion rapida del equipo Proactivitis.`).slice(0, 260),
    description: safeString(raw.description, `${title} con coordinacion manual de Proactivitis y detalles claros antes del viaje.`),
    highlights: safeArray(raw.highlights, ["Confirmacion rapida por el equipo Proactivitis", "Detalles claros antes de pagar", "Soporte humano para coordinar la experiencia"], 8),
    includesList: safeArray(raw.includesList, ["Coordinacion de reserva", "Soporte Proactivitis", "Confirmacion operativa"], 12),
    notIncludedList: safeArray(raw.notIncludedList, ["Gastos personales", "Propinas", "Servicios no indicados como incluidos"], 12),
    itineraryStops: normalizeItinerary(raw.itineraryStops),
    operatingDays: safeArray(raw.operatingDays, ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], 7),
    timeOptions: normalizeTimeOptions(raw.timeOptions),
    cancellationPolicy: safeString(raw.cancellationPolicy, "Cancelacion flexible segun condiciones del operador confirmado."),
    requirements: safeString(raw.requirements),
    terms: safeString(raw.terms, `Reserva con al menos ${DEFAULT_CONFIG.minLeadHours} horas de anticipacion. Confirmacion final por el equipo Proactivitis.`),
    seoKeywords: safeArray(raw.seoKeywords, [seed.activity, seed.destination, `${seed.activity} ${seed.destination}`], 20),
    translations: {
      en: {
        title: safeString(enRaw.title, title),
        subtitle: safeString(enRaw.subtitle, safeString(raw.subtitle)),
        shortDescription: safeString(enRaw.shortDescription, safeString(raw.shortDescription)),
        description: safeString(enRaw.description, safeString(raw.description)),
        highlights: safeArray(enRaw.highlights, safeArray(raw.highlights), 8),
        includesList: safeArray(enRaw.includesList, safeArray(raw.includesList), 12),
        notIncludedList: safeArray(enRaw.notIncludedList, safeArray(raw.notIncludedList), 12),
        itineraryStops: safeArray(enRaw.itineraryStops, normalizeItinerary(raw.itineraryStops).map((stop) => stop.title), 8),
        durationUnit: safeString(enRaw.durationUnit, "hours")
      },
      fr: {
        title: safeString(frRaw.title, title),
        subtitle: safeString(frRaw.subtitle, safeString(raw.subtitle)),
        shortDescription: safeString(frRaw.shortDescription, safeString(raw.shortDescription)),
        description: safeString(frRaw.description, safeString(raw.description)),
        highlights: safeArray(frRaw.highlights, safeArray(raw.highlights), 8),
        includesList: safeArray(frRaw.includesList, safeArray(raw.includesList), 12),
        notIncludedList: safeArray(frRaw.notIncludedList, safeArray(raw.notIncludedList), 12),
        itineraryStops: safeArray(frRaw.itineraryStops, normalizeItinerary(raw.itineraryStops).map((stop) => stop.title), 8),
        durationUnit: safeString(frRaw.durationUnit, "heures")
      }
    }
  };
};

const callGemini = async (seed: GlobalTourSeed, angle: string, config: GeminiGlobalTourFactoryConfig) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Falta GEMINI_API_KEY en el entorno.");

  const response = await fetch(GEMINI_API_URL(DEFAULT_MODEL, apiKey), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: buildPrompt(seed, angle, config) }]
        }
      ],
      tools: [{ google_search: {} }],
      generationConfig: {
        temperature: 0.35
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GeminiApiResponse;
  const text = extractText(data);
  if (!text) throw new Error("Gemini no devolvio texto util.");
  return normalizePayload(parseJsonFromText(text), seed);
};

export async function getGeminiGlobalTourFactoryConfig(): Promise<GeminiGlobalTourFactoryConfig> {
  const record = await prisma.siteContentSetting.findUnique({ where: { key: CONFIG_KEY } });
  if (!record?.content || !isObject(record.content)) return DEFAULT_CONFIG;
  return {
    ...DEFAULT_CONFIG,
    ...(record.content as Partial<GeminiGlobalTourFactoryConfig>)
  };
}

export async function saveGeminiGlobalTourFactoryConfig(config: Partial<GeminiGlobalTourFactoryConfig>) {
  const current = await getGeminiGlobalTourFactoryConfig();
  const next = { ...current, ...config };
  await prisma.siteContentSetting.upsert({
    where: { key: CONFIG_KEY },
    update: { content: toJson(next) },
    create: { key: CONFIG_KEY, content: toJson(next) }
  });
  return next;
}

export async function getGeminiGlobalToursGeneratedTodayCount(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return prisma.tour.count({
    where: {
      adminNote: { contains: FACTORY_MARKER },
      createdAt: { gte: start, lt: end }
    }
  });
}

export async function listRecentGeminiGlobalTourDrafts(limit = 12) {
  return prisma.tour.findMany({
    where: { adminNote: { contains: FACTORY_MARKER } },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      price: true,
      location: true,
      category: true,
      createdAt: true,
      country: { select: { name: true, code: true } },
      destination: { select: { name: true } },
      microZone: { select: { name: true } }
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}

const uniqueSlug = async (base: string, entity: "tour" | "country" | "destination" | "microZone") => {
  const cleanBase = slugify(base) || `${entity}-${Date.now()}`;
  let slug = cleanBase;
  let suffix = 2;
  const exists = async (candidate: string) => {
    if (entity === "tour") return Boolean(await prisma.tour.findUnique({ where: { slug: candidate } }));
    if (entity === "country") return Boolean(await prisma.country.findUnique({ where: { slug: candidate } }));
    if (entity === "destination") return Boolean(await prisma.destination.findUnique({ where: { slug: candidate } }));
    return Boolean(await prisma.microZone.findUnique({ where: { slug: candidate } }));
  };
  while (await exists(slug)) {
    slug = `${cleanBase}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const ensureCountry = async (payload: GeminiGlobalTourPayload) => {
  const code = payload.country.code || "US";
  const existing = await prisma.country.findUnique({ where: { code } });
  if (existing) return existing;
  return prisma.country.create({
    data: {
      id: code,
      code,
      name: payload.country.name || code,
      slug: await uniqueSlug(payload.country.slug || payload.country.name || code, "country"),
      shortDescription: `Destino global agregado por Proactivitis para experiencias seleccionadas en ${payload.country.name || code}.`
    }
  });
};

const ensureDestination = async (payload: GeminiGlobalTourPayload, countryId: string) => {
  const requestedSlug = payload.destination.slug || payload.destination.name;
  const existing = await prisma.destination.findFirst({
    where: {
      slug: requestedSlug,
      countryId
    }
  });
  if (existing) return existing;
  const slugOwner = await prisma.destination.findUnique({ where: { slug: requestedSlug } });
  const slug = slugOwner ? await uniqueSlug(`${requestedSlug}-${payload.country.code.toLowerCase()}`, "destination") : requestedSlug;
  return prisma.destination.create({
    data: {
      name: payload.destination.name,
      slug: slugify(slug),
      shortDescription: `Tours y experiencias seleccionadas por Proactivitis en ${payload.destination.name}.`,
      countryId
    }
  });
};

const ensureMicroZone = async (payload: GeminiGlobalTourPayload, destinationId: string, countryCode: string) => {
  const microZone = payload.microZone;
  if (!microZone?.name) return null;
  const requestedSlug = microZone.slug || microZone.name;
  const existing = await prisma.microZone.findFirst({
    where: {
      slug: requestedSlug,
      destinationId
    }
  });
  if (existing) return existing;
  const slugOwner = await prisma.microZone.findUnique({ where: { slug: requestedSlug } });
  const slug = slugOwner ? await uniqueSlug(`${requestedSlug}-${payload.destination.slug}`, "microZone") : requestedSlug;
  return prisma.microZone.create({
    data: {
      name: microZone.name,
      slug: slugify(slug),
      destinationId,
      countryCode
    }
  });
};

const ensureProactivitisSupplier = async () => {
  const existing = await prisma.supplierProfile.findFirst({
    where: { company: { contains: "Proactivitis", mode: "insensitive" } }
  });
  if (existing) return existing;

  const adminUser =
    (await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } })) ??
    (await prisma.user.create({
      data: {
        email: "global-products@proactivitis.com",
        name: "Proactivitis Global Products",
        role: "ADMIN",
        accountStatus: "APPROVED"
      }
    }));

  return prisma.supplierProfile.upsert({
    where: { userId: adminUser.id },
    update: {
      company: "Original Proactivitis",
      approved: true,
      productsEnabled: true
    },
    create: {
      id: randomUUID(),
      userId: adminUser.id,
      company: "Original Proactivitis",
      approved: true,
      productsEnabled: true
    }
  });
};

const buildAdminNote = (payload: GeminiGlobalTourPayload, config: GeminiGlobalTourFactoryConfig) => {
  const itinerary = payload.itineraryStops
    .map((stop) => `${stop.time} - ${stop.title}: ${stop.description ?? ""}`.trim())
    .join("\n");
  const keywords = payload.seoKeywords.slice(0, 10).join(", ");
  return [
    FACTORY_MARKER,
    `Confirmacion manual minima: ${config.minLeadHours} horas antes de la actividad.`,
    `Margen objetivo: +${config.markupPerPerson} USD por adulto.`,
    `Clasificacion: ${payload.country.name} > ${payload.destination.name} > ${payload.microZone?.name ?? "zona principal"} > ${payload.category}.`,
    `SEO: ${keywords}`,
    "",
    itinerary
  ]
    .filter(Boolean)
    .join("\n");
};

const createTourFromPayload = async (payload: GeminiGlobalTourPayload, config: GeminiGlobalTourFactoryConfig) => {
  const supplier = await ensureProactivitisSupplier();
  const country = await ensureCountry(payload);
  const destination = await ensureDestination(payload, country.id);
  const microZone = await ensureMicroZone(payload, destination.id, country.code);
  const slug = await uniqueSlug(payload.slug || payload.title, "tour");
  const id = randomUUID();

  const tour = await prisma.tour.create({
    data: {
      id,
      title: payload.title,
      slug,
      subtitle: payload.subtitle,
      description: payload.description,
      shortDescription: payload.shortDescription,
      includes: payload.includesList.join("; "),
      duration: JSON.stringify(payload.duration),
      location: [payload.destination.name, payload.country.name].filter(Boolean).join(", "),
      language: payload.languages.join(", "),
      category: payload.category,
      price: payload.priceUsd,
      priceChild: payload.priceChildUsd ?? null,
      priceYouth: payload.priceYouthUsd ?? null,
      capacity: payload.capacity ?? 15,
      confirmationType: `Confirmacion manual ${config.minLeadHours}h`,
      physicalLevel: null,
      minAge: null,
      meetingPoint: payload.meetingPoint,
      meetingInstructions: payload.meetingInstructions,
      pickup: payload.pickup,
      requirements: payload.requirements,
      cancellationPolicy: payload.cancellationPolicy,
      terms: payload.terms,
      timeOptions: JSON.stringify(payload.timeOptions),
      operatingDays: JSON.stringify(payload.operatingDays),
      adminNote: buildAdminNote(payload, config),
      heroImage: FALLBACK_IMAGE,
      gallery: JSON.stringify([FALLBACK_IMAGE]),
      highlights: payload.highlights,
      includesList: payload.includesList,
      notIncludedList: payload.notIncludedList,
      status: "draft",
      supplierId: supplier.id,
      countryId: country.code,
      destinationId: destination.id,
      departureDestinationId: destination.id,
      microZoneId: microZone?.id ?? null,
      platformSharePercent: 20
    }
  });

  await prisma.tourOption.create({
    data: {
      tourId: tour.id,
      name: "Reserva estandar",
      type: "standard",
      description: `Confirmacion manual por el equipo Proactivitis con minimo ${config.minLeadHours} horas.`,
      pricePerPerson: payload.priceUsd,
      pickupTimes: payload.timeOptions.map((slot) => `${slot.hour}:${slot.minute} ${slot.period}`),
      isDefault: true,
      active: true,
      sortOrder: 0
    }
  });

  await prisma.tourTranslation.createMany({
    data: (["en", "fr"] as const).map((locale) => {
      const translation = payload.translations[locale];
      return {
        tourId: tour.id,
        locale,
        title: translation.title,
        subtitle: translation.subtitle,
        shortDescription: translation.shortDescription,
        description: translation.description,
        includesList: translation.includesList,
        notIncludedList: translation.notIncludedList,
        itineraryStops: translation.itineraryStops,
        highlights: translation.highlights,
        durationUnit: translation.durationUnit,
        status: "TRANSLATED" as const
      };
    })
  });

  return tour;
};

const candidateForCursor = (cursor: number) => {
  const seed = HOT_GLOBAL_TOUR_SEEDS[cursor % HOT_GLOBAL_TOUR_SEEDS.length];
  const angle = GLOBAL_ANGLES[Math.floor(cursor / HOT_GLOBAL_TOUR_SEEDS.length) % GLOBAL_ANGLES.length];
  return { seed, angle };
};

export async function runGeminiGlobalTourFactoryBatch({ manualLimit }: { manualLimit?: number } = {}) {
  const config = await getGeminiGlobalTourFactoryConfig();
  if (!config.enabled && !manualLimit) {
    return { generated: 0, drafted: 0, errors: ["Global Tour Factory esta pausado."] };
  }

  const generatedToday = await getGeminiGlobalToursGeneratedTodayCount();
  const remainingToday = Math.max(0, config.dailyLimit - generatedToday);
  const limit = Math.max(0, Math.min(manualLimit ?? config.batchSize, config.batchSize, remainingToday, 5));
  const result = {
    generated: 0,
    drafted: 0,
    errors: [] as string[]
  };

  const persistProgress = async (cursorOffset = result.generated) => {
    await saveGeminiGlobalTourFactoryConfig({
      cursor: config.cursor + cursorOffset,
      lastRunAt: new Date().toISOString(),
      lastResult: result
    });
  };

  await persistProgress(0);

  if (limit <= 0) {
    result.errors.push("Limite diario alcanzado.");
    await persistProgress(0);
    return result;
  }

  for (let index = 0; index < limit; index += 1) {
    const cursor = config.cursor + index;
    const { seed, angle } = candidateForCursor(cursor);
    try {
      const payload = await callGemini(seed, angle, config);
      await createTourFromPayload(payload, config);
      result.generated += 1;
      result.drafted += 1;
      await persistProgress(index + 1);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "unknown_error";
      result.errors.push(`${seed.id}:${detail}`);
      await persistProgress(index + 1);
      if (
        detail.includes("RESOURCE_EXHAUSTED") ||
        detail.includes("Quota exceeded") ||
        detail.includes("exceeded your current quota")
      ) {
        break;
      }
    }
  }

  await persistProgress();
  return result;
}
