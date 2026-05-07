import { NextRequest, NextResponse } from "next/server";
import {
  getRentCarOptionPath,
  getRentCarOptions,
  getRentCarSpecBadges,
  type RentCarLocale
} from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
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
  if (!value) return `${PROACTIVITIS_URL}/transfer/sedan.png`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const normalizeLocale = (value?: string | null): RentCarLocale => {
  const locale = value?.toLowerCase();
  return locale === "es" || locale === "fr" ? locale : "en";
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("locale"));
  const settings = await getRentCarFleetSettings();
  const options = getRentCarOptions(undefined, settings);
  const locationMap = new Map<
    string,
    {
      id: string;
      code: string;
      name: string;
      regionId: string;
      airportLabel: string;
      priceFrom: number;
      image: string;
      featuredModel: string;
      vehicleCount: number;
      href: string;
    }
  >();

  for (const option of options) {
    const current = locationMap.get(option.locationId);
    if (!current || option.price < current.priceFrom) {
      locationMap.set(option.locationId, {
        id: option.locationId,
        code: option.airportLabel || option.locationId.toUpperCase().slice(0, 4),
        name: option.locationName,
        regionId: option.regionId,
        airportLabel: option.airportLabel,
        priceFrom: option.price,
        image: toAbsoluteUrl(option.image),
        featuredModel: option.model,
        vehicleCount: options.filter((item) => item.locationId === option.locationId).length,
        href: getRentCarOptionPath(option.locationId, option.categorySlug, locale)
      });
    }
  }

  const response = NextResponse.json({
    locations: Array.from(locationMap.values()).sort((a, b) => {
      if (a.id === "puj-cap-cana") return -1;
      if (b.id === "puj-cap-cana") return 1;
      return a.name.localeCompare(b.name);
    }),
    vehicles: options.map((option) => ({
      id: `${option.locationId}-${option.categorySlug}`,
      locationId: option.locationId,
      regionId: option.regionId,
      locationName: option.locationName,
      airportLabel: option.airportLabel,
      categorySlug: option.categorySlug,
      categoryLabel: option.categoryLabel,
      model: option.model,
      displayName: option.displayName,
      tag: option.tag,
      price: option.price,
      currency: option.currency,
      seats: option.seats,
      luggage: option.luggage,
      doors: option.doors,
      transmission: option.transmission,
      fuelType: option.fuelType,
      bags: option.bags,
      largeBags: option.largeBags,
      image: toAbsoluteUrl(option.image),
      badges: getRentCarSpecBadges(option, locale).slice(0, 6),
      href: getRentCarOptionPath(option.locationId, option.categorySlug, locale),
      highProfile: option.highProfile
    }))
  });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
  return withCors(response);
}
