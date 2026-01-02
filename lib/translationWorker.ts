import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { TourTranslationStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";

type LocaleConfig = { code: string; target: string };

const LOCALES: LocaleConfig[] = [
  { code: "en", target: "en" },
  { code: "fr", target: "fr" }
];

const TRANSLATION_URL = process.env.TRANSLATION_API_URL;

function hashSource(payload: {
  title: string;
  subtitle?: string | null;
  shortDescription?: string | null;
  description: string;
  includes: string[];
  notIncludes: string[];
  itinerary: string[];
  highlights: string[];
  durationUnit: string;
}) {
  const normalized = [
    payload.title,
    payload.subtitle ?? "",
    payload.shortDescription ?? "",
    payload.description,
    payload.includes.join("|"),
    payload.notIncludes.join("|"),
    payload.itinerary.join("|"),
    payload.highlights.join("|")
    // duration unit appended for change detection
    ,
    payload.durationUnit
  ].join("||");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

async function translateText(text: string, target: string) {
  if (!text) return text;

  if (TRANSLATION_URL) {
    const response = await fetch(TRANSLATION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: "es",
        target
      })
    });
    if (!response.ok) {
      throw new Error(`translation failed: ${response.statusText}`);
    }
    const json = await response.json();
    return json.translatedText as string;
  }

  const params = new URLSearchParams({
    client: "gtx",
    sl: "es",
    tl: target,
    dt: "t",
    q: text
  });
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`translation failed: ${response.statusText}`);
  }
  const body = await response.text();
  const json = JSON.parse(body);
  const segments = json[0];
  return segments.map((segment: unknown[]) => segment[0]).join("");
}

function parseJsonArray(value?: string | null | Prisma.JsonValue) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string");
      }
    } catch {
      return [];
    }
  }
  return [];
}

function parseDurationValue(value?: string | null) {
  if (!value) return { value: "4", unit: "Horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value, unit: "Horas" };
  }
}

async function translateEntries(items: string[], target: string) {
  return Promise.all(items.map((item) => translateText(item, target)));
}

async function upsertTranslationEntry(
  tourId: string,
  locale: string,
  hash: string,
  translation: {
    title?: string;
    subtitle?: string;
    shortDescription?: string;
    description?: string;
    includesList?: string[];
    notIncludedList?: string[];
    itineraryStops?: string[];
    highlights?: string[];
    durationUnit?: string;
  }
) {
  await prisma.tourTranslation.upsert({
    where: {
      tourId_locale: {
        tourId,
        locale
      }
    },
    create: {
      tourId,
      locale,
      title: translation.title,
      subtitle: translation.subtitle,
      shortDescription: translation.shortDescription,
      description: translation.description,
      includesList: translation.includesList && translation.includesList.length ? translation.includesList : undefined,
      notIncludedList:
        translation.notIncludedList && translation.notIncludedList.length ? translation.notIncludedList : undefined,
      itineraryStops: translation.itineraryStops && translation.itineraryStops.length ? translation.itineraryStops : undefined,
      highlights: translation.highlights && translation.highlights.length ? translation.highlights : undefined,
      durationUnit: translation.durationUnit,
      status: TourTranslationStatus.TRANSLATED,
      sourceHash: hash,
    },
    update: {
      title: translation.title,
      subtitle: translation.subtitle,
      shortDescription: translation.shortDescription,
      description: translation.description,
      status: TourTranslationStatus.TRANSLATED,
      sourceHash: hash,
      includesList:
        translation.includesList && translation.includesList.length ? translation.includesList : undefined,
      notIncludedList:
        translation.notIncludedList && translation.notIncludedList.length ? translation.notIncludedList : undefined,
      itineraryStops:
        translation.itineraryStops && translation.itineraryStops.length ? translation.itineraryStops : undefined,
      highlights:
        translation.highlights && translation.highlights.length ? translation.highlights : undefined,
      durationUnit: translation.durationUnit
    }
  });
}

export async function translateTourById(tourId: string) {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { translations: true }
  });
  if (!tour) {
    throw new Error("Tour not found");
  }

  const includesListFromDb = parseJsonArray(tour.includesList);
  const includesFromString = tour.includes
    ? tour.includes
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const includes = includesListFromDb.length ? includesListFromDb : includesFromString;

  const notIncludedList = parseJsonArray(tour.notIncludedList);

  const highlights = parseJsonArray(tour.highlights?.toString());

  const adminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const parsedItinerary = adminItinerary.length ? adminItinerary : parseItinerary(tour.adminNote ?? "");
  const itineraryStops = parsedItinerary
    .map((stop) => stop.title ?? stop.description ?? "")
    .filter(Boolean);
  const durationValue = parseDurationValue(tour.duration);

  const sourceHash = hashSource({
    title: tour.title,
    subtitle: tour.subtitle,
    shortDescription: tour.shortDescription,
    description: tour.description,
    includes,
    notIncludes: notIncludedList,
    itinerary: itineraryStops,
    highlights
    ,
    durationUnit: durationValue.unit
  });
  for (const locale of LOCALES) {
    const existing = tour.translations.find((translation) => translation.locale === locale.code);
    if (existing?.sourceHash === sourceHash && existing.status === TourTranslationStatus.TRANSLATED) {
      continue;
    }

    const [
      title,
      subtitle,
      shortDescription,
      description,
      translatedIncludes,
      translatedNotIncludes,
      translatedItinerary,
      translatedHighlights
    ] = await Promise.all([
      translateText(tour.title, locale.target),
      translateText(tour.subtitle ?? "", locale.target),
      translateText(tour.shortDescription ?? "", locale.target),
      translateText(tour.description, locale.target),
      includes.length ? translateEntries(includes, locale.target) : Promise.resolve([]),
      notIncludedList.length ? translateEntries(notIncludedList, locale.target) : Promise.resolve([]),
      itineraryStops.length ? translateEntries(itineraryStops, locale.target) : Promise.resolve([]),
      highlights.length ? translateEntries(highlights, locale.target) : Promise.resolve([])
    ]);
    const translatedDurationUnit = await translateText(durationValue.unit, locale.target);

    await upsertTranslationEntry(tourId, locale.code, sourceHash, {
      title,
      subtitle,
      shortDescription,
      description,
      includesList: translatedIncludes,
      notIncludedList: translatedNotIncludes,
      itineraryStops: translatedItinerary,
      highlights: translatedHighlights,
      durationUnit: translatedDurationUnit
    });
  }

  await prisma.tour.update({
    where: { id: tourId },
    data: { translationHash: sourceHash }
  });
}
