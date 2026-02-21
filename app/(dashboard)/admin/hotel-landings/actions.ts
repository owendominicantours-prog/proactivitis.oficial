"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { HotelLandingOverrides } from "@/lib/siteContent";

const readField = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

const parseGalleryImages = (raw: string): string[] =>
  raw
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const parseList = (raw: string): string[] =>
  raw
    .split(/\r?\n|,/g)
    .map((item) => item.trim())
    .filter(Boolean);

const parseRoomTypes = (raw: string): Array<{ name: string; priceFrom?: string; image?: string }> =>
  raw
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, priceFrom, image] = line.split("|").map((item) => item.trim());
      return {
        name: name || "Room",
        priceFrom: priceFrom || undefined,
        image: image || undefined
      };
    });

const keepString = (next: string, previous?: string) => (next ? next : previous);

const keepList = <T>(raw: string, parser: (value: string) => T[], previous?: T[]) =>
  raw.trim() ? parser(raw) : previous;

const SUPPORTED_LOCALES = ["es", "en", "fr"] as const;

export async function updateHotelLandingContentAction(formData: FormData) {
  const hotelSlug = readField(formData, "hotelSlug");
  const locale = readField(formData, "locale") || "es";

  if (!hotelSlug) {
    throw new Error("Selecciona un hotel.");
  }

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "HOTEL_LANDING" } });
  const content = (existing?.content as Record<string, Record<string, HotelLandingOverrides>> | null) ?? {};
  const hotelMap = content[hotelSlug] ?? {};
  const current = hotelMap[locale] ?? {};

  const rawGallery = readField(formData, "galleryImages");
  const incomingHeroImage = readField(formData, "heroImage");
  const incomingGalleryImages = rawGallery.trim() ? parseGalleryImages(rawGallery) : null;
  const rawHighlights = readField(formData, "highlights");
  const rawRoomTypes = readField(formData, "roomTypes");
  const rawAmenities = readField(formData, "amenities");

  const payload: HotelLandingOverrides = {
    seoTitle: keepString(readField(formData, "seoTitle"), current.seoTitle),
    seoDescription: keepString(readField(formData, "seoDescription"), current.seoDescription),
    heroTitle: keepString(readField(formData, "heroTitle"), current.heroTitle),
    heroSubtitle: keepString(readField(formData, "heroSubtitle"), current.heroSubtitle),
    heroImage: keepString(readField(formData, "heroImage"), current.heroImage),
    galleryImages: keepList(rawGallery, parseGalleryImages, current.galleryImages),
    stars: keepString(readField(formData, "stars"), current.stars),
    locationLabel: keepString(readField(formData, "locationLabel"), current.locationLabel),
    mapUrl: keepString(readField(formData, "mapUrl"), current.mapUrl),
    priceFromUSD: keepString(readField(formData, "priceFromUSD"), current.priceFromUSD),
    reviewRating: keepString(readField(formData, "reviewRating"), current.reviewRating),
    reviewCount: keepString(readField(formData, "reviewCount"), current.reviewCount),
    quoteCta: keepString(readField(formData, "quoteCta"), current.quoteCta),
    overviewTitle: keepString(readField(formData, "overviewTitle"), current.overviewTitle),
    description1: keepString(readField(formData, "description1"), current.description1),
    description2: keepString(readField(formData, "description2"), current.description2),
    description3: keepString(readField(formData, "description3"), current.description3),
    highlights: keepList(rawHighlights, parseList, current.highlights),
    roomTypes: keepList(rawRoomTypes, parseRoomTypes, current.roomTypes),
    amenities: keepList(rawAmenities, parseList, current.amenities),
    checkInTime: keepString(readField(formData, "checkInTime"), current.checkInTime),
    checkOutTime: keepString(readField(formData, "checkOutTime"), current.checkOutTime),
    cancellationPolicy: keepString(readField(formData, "cancellationPolicy"), current.cancellationPolicy),
    groupPolicy: keepString(readField(formData, "groupPolicy"), current.groupPolicy),
    bullet1: keepString(readField(formData, "bullet1"), current.bullet1),
    bullet2: keepString(readField(formData, "bullet2"), current.bullet2),
    bullet3: keepString(readField(formData, "bullet3"), current.bullet3),
    bullet4: keepString(readField(formData, "bullet4"), current.bullet4),
    toursTitle: keepString(readField(formData, "toursTitle"), current.toursTitle),
    transfersTitle: keepString(readField(formData, "transfersTitle"), current.transfersTitle)
  };

  hotelMap[locale] = payload;

  // Imagenes compartidas entre idiomas: una subida aplica a todas las versiones del hotel.
  if (incomingHeroImage || (incomingGalleryImages && incomingGalleryImages.length > 0)) {
    const localesToUpdate = Array.from(new Set([...SUPPORTED_LOCALES, ...Object.keys(hotelMap)]));
    for (const localeKey of localesToUpdate) {
      const localeEntry = hotelMap[localeKey] ?? {};
      hotelMap[localeKey] = {
        ...localeEntry,
        ...(incomingHeroImage ? { heroImage: incomingHeroImage } : {}),
        ...(incomingGalleryImages && incomingGalleryImages.length > 0 ? { galleryImages: incomingGalleryImages } : {})
      };
    }
  }

  content[hotelSlug] = hotelMap;

  await prisma.siteContentSetting.upsert({
    where: { key: "HOTEL_LANDING" },
    update: { content },
    create: { key: "HOTEL_LANDING", content }
  });

  revalidatePath(`/things-to-do/${hotelSlug}`);
  revalidatePath(`/en/things-to-do/${hotelSlug}`);
  revalidatePath(`/fr/things-to-do/${hotelSlug}`);
  revalidatePath(`/hoteles/${hotelSlug}`);
  revalidatePath(`/en/hotels/${hotelSlug}`);
  revalidatePath(`/fr/hotels/${hotelSlug}`);
  revalidatePath("/admin/resorts");
  revalidatePath("/admin/hoteles");
  revalidatePath("/admin/hotel-landings");
}
