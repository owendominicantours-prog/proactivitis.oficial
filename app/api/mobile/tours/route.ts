import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { parseAdminItinerary, parseItinerary } from "@/lib/itinerary";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const textReplacements: Array<[string, string]> = [
  ["\u00c3\u0192\u00c2\u00a1", "\u00e1"],
  ["\u00c3\u0192\u00c2\u00a9", "\u00e9"],
  ["\u00c3\u0192\u00c2\u00ad", "\u00ed"],
  ["\u00c3\u0192\u00c2\u00b3", "\u00f3"],
  ["\u00c3\u0192\u00c2\u00ba", "\u00fa"],
  ["\u00c3\u0192\u00c2\u00b1", "\u00f1"],
  ["\u00c3\u00a1", "\u00e1"],
  ["\u00c3\u00a9", "\u00e9"],
  ["\u00c3\u00ad", "\u00ed"],
  ["\u00c3\u00b3", "\u00f3"],
  ["\u00c3\u00ba", "\u00fa"],
  ["\u00c3\u00b1", "\u00f1"],
  ["\u00c2\u00bf", "\u00bf"],
  ["\u00c2\u00a1", "\u00a1"],
  ["\u00c2\u00b7", "-"]
];

const sanitizeText = (value?: string | null) => {
  if (!value) return "";
  const decoded = /[ÃÂ]/.test(value) ? Buffer.from(value, "latin1").toString("utf8") : value;
  return textReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), decoded).trim();
};

const formatDuration = (value?: string | null, translatedUnit?: string | null) => {
  const raw = sanitizeText(value);
  if (!raw) return "Duracion variable";

  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    const durationValue = parsed?.value ? String(parsed.value).trim() : "";
    const durationUnit = parsed?.unit ? sanitizeText(parsed.unit).toLowerCase() : "";
    if (!durationValue) return "Duracion variable";
    if (translatedUnit) return `${durationValue} ${sanitizeText(translatedUnit)}`.trim();
    if (durationUnit.includes("min")) return `${durationValue} min`;
    if (durationUnit.includes("dia") || durationUnit.includes("d\u00eda") || durationUnit.includes("day")) {
      return `${durationValue} dias`;
    }
    if (durationUnit.includes("hora") || durationUnit.includes("hour")) {
      return `${durationValue} horas`;
    }
    return `${durationValue} ${durationUnit}`.trim();
  } catch {
    return raw;
  }
};

const parseGallery = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    // Plain string fallback below.
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const parseJsonList = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map(sanitizeText);
};

const parseJsonStringList = (value?: string | null) => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && typeof item === "object") {
            const record = item as Record<string, string | number | null | undefined>;
            if ("hour" in record) {
              return `${record.hour}:${String(record.minute ?? "00").padStart(2, "0")} ${record.period ?? ""}`.trim();
            }
            return String(record.label ?? record.name ?? record.value ?? "");
          }
          return "";
        })
        .filter((item): item is string => item.trim().length > 0)
        .map(sanitizeText);
    }
  } catch {
    // Plain string fallback below.
  }
  return value
    .split(/[;,]/)
    .map((item) => sanitizeText(item))
    .filter(Boolean);
};

const normalizeLanguages = (value?: string | null) =>
  parseJsonStringList(value)
    .flatMap((item) => item.split(/[\/,]/))
    .map((item) => sanitizeText(item))
    .filter(Boolean);

const parseItineraryStops = (value?: string | null) =>
  parseAdminItinerary(value ?? "").length ? parseAdminItinerary(value ?? "") : parseItinerary(value ?? "");

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 24), 1), 50);
  const localeParam = sanitizeText(url.searchParams.get("locale")).toLowerCase();
  const locale = localeParam === "en" || localeParam === "fr" ? localeParam : "es";

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    take: limit,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      productId: true,
      slug: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      price: true,
      priceChild: true,
      priceYouth: true,
      duration: true,
      category: true,
      location: true,
      language: true,
      timeOptions: true,
      operatingDays: true,
      pickup: true,
      meetingPoint: true,
      meetingInstructions: true,
      requirements: true,
      cancellationPolicy: true,
      terms: true,
      physicalLevel: true,
      minAge: true,
      accessibility: true,
      confirmationType: true,
      capacity: true,
      includes: true,
      includesList: true,
      notIncludedList: true,
      highlights: true,
      adminNote: true,
      heroImage: true,
      gallery: true,
      OfferTours: {
        where: { Offer: { active: true } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          Offer: {
            select: {
              id: true,
              title: true,
              description: true,
              discountType: true,
              discountValue: true
            }
          }
        }
      },
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          type: true,
          description: true,
          pricePerPerson: true,
          basePrice: true,
          baseCapacity: true,
          extraPricePerPerson: true,
          imageUrl: true,
          isDefault: true
        }
      },
      translations: {
        where: { locale },
        take: 1,
        select: {
          title: true,
          subtitle: true,
          shortDescription: true,
          description: true,
          includesList: true,
          notIncludedList: true,
          itineraryStops: true,
          highlights: true,
          durationUnit: true
        }
      }
    }
  });

  const response = NextResponse.json({
    tours: tours.map((tour) => {
      const translation = locale === "es" ? null : tour.translations[0];
      const gallery = parseGallery(tour.gallery).map(toAbsoluteUrl);
      const image = toAbsoluteUrl(tour.heroImage ?? gallery[0]);
      const translatedIncludes = parseJsonList(translation?.includesList);
      const translatedNotIncluded = parseJsonList(translation?.notIncludedList);
      const translatedHighlights = parseJsonList(translation?.highlights);
      const translatedItinerary = parseJsonList(translation?.itineraryStops);
      const includesList = translatedIncludes.length ? translatedIncludes : parseJsonList(tour.includesList);
      const notIncludedList = translatedNotIncluded.length ? translatedNotIncluded : parseJsonList(tour.notIncludedList);
      const itineraryStops = parseItineraryStops(tour.adminNote);
      const activeOffer =
        tour.OfferTours.map((entry) => entry.Offer)
          .filter(Boolean)
          .sort((a, b) => {
            const aSavings = a.discountType === "PERCENT" ? tour.price * (a.discountValue / 100) : a.discountValue;
            const bSavings = b.discountType === "PERCENT" ? tour.price * (b.discountValue / 100) : b.discountValue;
            return bSavings - aSavings;
          })[0] ?? null;
      return {
        id: tour.id,
        productId: tour.productId,
        slug: tour.slug,
        title: sanitizeText(translation?.title ?? tour.title),
        subtitle: sanitizeText(translation?.subtitle ?? tour.subtitle),
        description: sanitizeText(translation?.shortDescription ?? tour.shortDescription ?? tour.description),
        fullDescription: sanitizeText(translation?.description ?? tour.description),
        price: tour.price,
        priceChild: tour.priceChild,
        priceYouth: tour.priceYouth,
        activeOffer: activeOffer
          ? {
              id: activeOffer.id,
              title: sanitizeText(activeOffer.title),
              description: sanitizeText(activeOffer.description),
              discountType: activeOffer.discountType,
              discountValue: activeOffer.discountValue
            }
          : null,
        duration: formatDuration(tour.duration, translation?.durationUnit),
        category: sanitizeText(tour.category ?? "Tours"),
        location: sanitizeText(tour.location),
        languages: normalizeLanguages(tour.language),
        timeOptions: parseJsonStringList(tour.timeOptions),
        operatingDays: parseJsonStringList(tour.operatingDays),
        pickup: sanitizeText(tour.pickup),
        meetingPoint: sanitizeText(tour.meetingPoint),
        meetingInstructions: sanitizeText(tour.meetingInstructions),
        requirements: sanitizeText(tour.requirements),
        cancellationPolicy: sanitizeText(tour.cancellationPolicy),
        terms: sanitizeText(tour.terms),
        physicalLevel: sanitizeText(tour.physicalLevel),
        minAge: tour.minAge,
        accessibility: sanitizeText(tour.accessibility),
        confirmationType: sanitizeText(tour.confirmationType),
        capacity: tour.capacity,
        includes: includesList.length ? includesList : tour.includes ? [sanitizeText(tour.includes)] : [],
        notIncluded: notIncludedList,
        highlights: translatedHighlights.length ? translatedHighlights : parseJsonList(tour.highlights),
        image,
        gallery: gallery.length ? gallery : [image],
        itinerary: itineraryStops.map((stop, index) => ({
          time: sanitizeText(stop.time),
          title: sanitizeText(translatedItinerary[index] ?? stop.title),
          description: translatedItinerary[index] ? "" : sanitizeText(stop.description)
        })),
        checkoutUrl: `${PROACTIVITIS_URL}/checkout`,
        options: tour.options.map((option) => ({
          id: option.id,
          name: sanitizeText(option.name),
          type: sanitizeText(option.type),
          description: sanitizeText(option.description),
          pricePerPerson: option.pricePerPerson,
          basePrice: option.basePrice,
          baseCapacity: option.baseCapacity,
          extraPricePerPerson: option.extraPricePerPerson,
          imageUrl: toAbsoluteUrl(option.imageUrl),
          isDefault: option.isDefault
        }))
      };
    })
  });

  response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=120");
  return withCors(response);
}
