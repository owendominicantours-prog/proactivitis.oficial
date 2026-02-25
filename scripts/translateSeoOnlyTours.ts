import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { TourTranslationStatus, type Prisma } from "@prisma/client";
import { parseAdminItinerary, parseItinerary } from "../lib/itinerary";
import { translateEntries, translateText } from "../lib/translationService";

type LocaleConfig = { code: "en" | "fr"; target: "en" | "fr" };
const LOCALES: LocaleConfig[] = [
  { code: "en", target: "en" },
  { code: "fr", target: "fr" }
];

function parseJsonArray(value?: string | null | Prisma.JsonValue) {
  if (!value) return [] as string[];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === "string");
    } catch {
      return [];
    }
  }
  return [] as string[];
}

function parseDurationValue(value?: string | null) {
  if (!value) return { value: "4", unit: "Horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value, unit: "Horas" };
  }
}

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
    payload.highlights.join("|"),
    payload.durationUnit
  ].join("||");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

async function translateTourById(tourId: string) {
  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    include: { translations: true }
  });
  if (!tour) return false;

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
  const itineraryStops = parsedItinerary.map((stop) => stop.title ?? stop.description ?? "").filter(Boolean);
  const durationValue = parseDurationValue(tour.duration);

  const sourceHash = hashSource({
    title: tour.title,
    subtitle: tour.subtitle,
    shortDescription: tour.shortDescription,
    description: tour.description,
    includes,
    notIncludes: notIncludedList,
    itinerary: itineraryStops,
    highlights,
    durationUnit: durationValue.unit
  });

  for (const locale of LOCALES) {
    const existing = tour.translations.find((translation) => translation.locale === locale.code);
    if (existing?.sourceHash === sourceHash && existing.status === TourTranslationStatus.TRANSLATED) continue;

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

    await prisma.tourTranslation.upsert({
      where: {
        tourId_locale: {
          tourId,
          locale: locale.code
        }
      },
      create: {
        tourId,
        locale: locale.code,
        title,
        subtitle,
        shortDescription,
        description,
        includesList: translatedIncludes.length ? translatedIncludes : undefined,
        notIncludedList: translatedNotIncludes.length ? translatedNotIncludes : undefined,
        itineraryStops: translatedItinerary.length ? translatedItinerary : undefined,
        highlights: translatedHighlights.length ? translatedHighlights : undefined,
        durationUnit: translatedDurationUnit,
        status: TourTranslationStatus.TRANSLATED,
        sourceHash
      },
      update: {
        title,
        subtitle,
        shortDescription,
        description,
        includesList: translatedIncludes.length ? translatedIncludes : undefined,
        notIncludedList: translatedNotIncludes.length ? translatedNotIncludes : undefined,
        itineraryStops: translatedItinerary.length ? translatedItinerary : undefined,
        highlights: translatedHighlights.length ? translatedHighlights : undefined,
        durationUnit: translatedDurationUnit,
        status: TourTranslationStatus.TRANSLATED,
        sourceHash
      }
    });
  }

  await prisma.tour.update({
    where: { id: tourId },
    data: { translationHash: sourceHash }
  });
  return true;
}

async function main() {
  const tours = await prisma.tour.findMany({
    where: { status: "seo_only" },
    select: { id: true, slug: true }
  });
  console.log(`seo_only to translate: ${tours.length}`);

  let done = 0;
  for (const tour of tours) {
    try {
      await translateTourById(tour.id);
      done += 1;
    } catch (error) {
      console.error("translation failed", tour.slug, error);
    }
  }
  console.log(`translated: ${done}/${tours.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

