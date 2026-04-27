import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";

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
  return textReplacements.reduce((text, [from, to]) => text.replaceAll(from, to), value).trim();
};

const formatDuration = (value?: string | null) => {
  const raw = sanitizeText(value);
  if (!raw) return "Duracion variable";

  try {
    const parsed = JSON.parse(raw) as { value?: string | number; unit?: string };
    const durationValue = parsed?.value ? String(parsed.value).trim() : "";
    const durationUnit = parsed?.unit ? sanitizeText(parsed.unit).toLowerCase() : "";
    if (!durationValue) return "Duracion variable";
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

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 24), 1), 50);

  const tours = await prisma.tour.findMany({
    where: { status: "published" },
    take: limit,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      price: true,
      duration: true,
      category: true,
      location: true,
      pickup: true,
      cancellationPolicy: true,
      includes: true,
      includesList: true,
      highlights: true,
      heroImage: true,
      gallery: true,
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
      }
    }
  });

  const response = NextResponse.json({
    tours: tours.map((tour) => {
      const gallery = parseGallery(tour.gallery).map(toAbsoluteUrl);
      const image = toAbsoluteUrl(tour.heroImage ?? gallery[0]);
      const includesList = parseJsonList(tour.includesList);
      return {
        id: tour.id,
        slug: tour.slug,
        title: sanitizeText(tour.title),
        subtitle: sanitizeText(tour.subtitle),
        description: sanitizeText(tour.shortDescription ?? tour.description),
        fullDescription: sanitizeText(tour.description),
        price: tour.price,
        duration: formatDuration(tour.duration),
        category: sanitizeText(tour.category ?? "Tours"),
        location: sanitizeText(tour.location),
        pickup: sanitizeText(tour.pickup),
        cancellationPolicy: sanitizeText(tour.cancellationPolicy),
        includes: includesList.length ? includesList : tour.includes ? [sanitizeText(tour.includes)] : [],
        highlights: parseJsonList(tour.highlights),
        image,
        gallery: gallery.length ? gallery : [image],
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

  response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  return withCors(response);
}
