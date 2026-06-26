import type { Prisma } from "@prisma/client";

import { getMerchantConfigStatus, getMerchantProductSummaries, type MerchantProductSummary } from "@/lib/merchantCenter";
import { prisma } from "@/lib/prisma";

const TOUR_POI_SETTING_KEY = "TOUR_GOOGLE_POI_MAP";

export type TourPoiRecord = {
  tourId: string;
  googlePlaceId: string;
  placeName: string;
  latitude: number | null;
  longitude: number | null;
  notes: string;
  updatedAt: string;
};

export type TourPoiMap = Record<string, TourPoiRecord>;

export type TourPoiAdminRow = MerchantProductSummary & {
  poi: TourPoiRecord | null;
  poiReady: boolean;
};

export type TourPoiInput = {
  tourId: unknown;
  googlePlaceId: unknown;
  placeName: unknown;
  latitude?: unknown;
  longitude?: unknown;
  notes?: unknown;
};

const cleanString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const siteUrl = () =>
  (
    cleanString(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanString(process.env.NEXTAUTH_URL) ||
    "https://proactivitis.com"
  ).replace(/\/+$/, "");

const brandName = () =>
  cleanString(process.env.GOOGLE_MERCHANT_BRAND) || cleanString(process.env.NEXT_PUBLIC_BRAND_NAME) || "Proactivitis";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseCoordinate = (value: unknown, min: number, max: number) => {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value.trim()) : Number.NaN;
  if (!Number.isFinite(numeric) || numeric < min || numeric > max) return null;
  return Number(numeric.toFixed(6));
};

const parsePoiRecord = (tourId: string, value: unknown): TourPoiRecord | null => {
  if (!isRecord(value)) return null;

  const googlePlaceId = cleanString(value.googlePlaceId);
  if (!googlePlaceId) return null;

  return {
    tourId,
    googlePlaceId,
    placeName: cleanString(value.placeName) || googlePlaceId,
    latitude: parseCoordinate(value.latitude, -90, 90),
    longitude: parseCoordinate(value.longitude, -180, 180),
    notes: cleanString(value.notes),
    updatedAt: cleanString(value.updatedAt) || new Date(0).toISOString()
  };
};

const parsePoiMap = (content: Prisma.JsonValue | null): TourPoiMap => {
  const source = isRecord(content) && isRecord(content.items) ? content.items : content;
  if (!isRecord(source)) return {};

  return Object.entries(source).reduce<TourPoiMap>((map, [tourId, value]) => {
    const record = parsePoiRecord(tourId, value);
    if (record) map[tourId] = record;
    return map;
  }, {});
};

const buildSettingContent = (map: TourPoiMap): Prisma.InputJsonObject => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  items: map as unknown as Prisma.InputJsonObject
});

export async function getTourPoiMap() {
  const setting = await prisma.siteContentSetting.findUnique({
    where: { key: TOUR_POI_SETTING_KEY },
    select: { content: true }
  });

  return parsePoiMap(setting?.content ?? null);
}

export async function upsertTourPoi(input: TourPoiInput) {
  const tourId = cleanString(input.tourId);
  const googlePlaceId = cleanString(input.googlePlaceId);

  if (!tourId) {
    throw new Error("Falta el ID del tour.");
  }

  const map = await getTourPoiMap();

  if (!googlePlaceId) {
    delete map[tourId];
  } else {
    map[tourId] = {
      tourId,
      googlePlaceId,
      placeName: cleanString(input.placeName) || googlePlaceId,
      latitude: parseCoordinate(input.latitude, -90, 90),
      longitude: parseCoordinate(input.longitude, -180, 180),
      notes: cleanString(input.notes),
      updatedAt: new Date().toISOString()
    };
  }

  await prisma.siteContentSetting.upsert({
    where: { key: TOUR_POI_SETTING_KEY },
    create: {
      key: TOUR_POI_SETTING_KEY,
      content: buildSettingContent(map)
    },
    update: {
      content: buildSettingContent(map)
    }
  });

  return map[tourId] ?? null;
}

export async function getTourPoiAdminRows(): Promise<TourPoiAdminRow[]> {
  const [products, poiMap] = await Promise.all([getMerchantProductSummaries({ limit: 200 }), getTourPoiMap()]);

  return products.map((product) => {
    const poi = poiMap[product.id] ?? null;
    return {
      ...product,
      poi,
      poiReady: Boolean(poi?.googlePlaceId)
    };
  });
}

export async function getTourJsonFeed() {
  const [products, poiMap] = await Promise.all([getMerchantProductSummaries({ limit: 200 }), getTourPoiMap()]);
  const config = getMerchantConfigStatus();
  const eligibleProducts = products.filter((product) => product.eligible);
  const missingPoiCount = eligibleProducts.filter((product) => !poiMap[product.id]?.googlePlaceId).length;
  const items = eligibleProducts
    .filter((product) => poiMap[product.id]?.googlePlaceId)
    .map((product) => {
      const poi = poiMap[product.id] as TourPoiRecord;
      const attributes = product.input.productAttributes;

      return {
        id: product.offerId,
        tourId: product.id,
        title: product.title,
        description: product.description,
        category: product.category,
        supplier: product.supplier,
        price: {
          amount: Number(product.price.toFixed(2)),
          currency: product.currencyCode
        },
        availability: attributes.availability === "IN_STOCK" ? "in_stock" : "out_of_stock",
        url: product.link,
        checkoutUrl: product.link,
        imageUrl: product.imageLink,
        poi: {
          googlePlaceId: poi.googlePlaceId,
          name: poi.placeName,
          latitude: poi.latitude,
          longitude: poi.longitude
        }
      };
    });

  return {
    provider: {
      name: brandName(),
      url: siteUrl()
    },
    generatedAt: new Date().toISOString(),
    contentLanguage: config.contentLanguage,
    feedLabel: config.feedLabel,
    currency: config.currencyCode,
    itemCount: items.length,
    missingPoiCount,
    items
  };
}
