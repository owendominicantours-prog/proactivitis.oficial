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

export async function updateHotelLandingContentAction(formData: FormData) {
  const hotelSlug = readField(formData, "hotelSlug");
  const locale = readField(formData, "locale") || "es";

  if (!hotelSlug) {
    throw new Error("Selecciona un hotel.");
  }

  const payload: HotelLandingOverrides = {
    seoTitle: readField(formData, "seoTitle"),
    seoDescription: readField(formData, "seoDescription"),
    heroTitle: readField(formData, "heroTitle"),
    heroSubtitle: readField(formData, "heroSubtitle"),
    heroImage: readField(formData, "heroImage"),
    galleryImages: parseGalleryImages(readField(formData, "galleryImages")),
    stars: readField(formData, "stars"),
    locationLabel: readField(formData, "locationLabel"),
    mapUrl: readField(formData, "mapUrl"),
    priceFromUSD: readField(formData, "priceFromUSD"),
    reviewRating: readField(formData, "reviewRating"),
    reviewCount: readField(formData, "reviewCount"),
    quoteCta: readField(formData, "quoteCta"),
    overviewTitle: readField(formData, "overviewTitle"),
    description1: readField(formData, "description1"),
    description2: readField(formData, "description2"),
    description3: readField(formData, "description3"),
    highlights: parseList(readField(formData, "highlights")),
    roomTypes: parseRoomTypes(readField(formData, "roomTypes")),
    amenities: parseList(readField(formData, "amenities")),
    checkInTime: readField(formData, "checkInTime"),
    checkOutTime: readField(formData, "checkOutTime"),
    cancellationPolicy: readField(formData, "cancellationPolicy"),
    groupPolicy: readField(formData, "groupPolicy"),
    bullet1: readField(formData, "bullet1"),
    bullet2: readField(formData, "bullet2"),
    bullet3: readField(formData, "bullet3"),
    bullet4: readField(formData, "bullet4"),
    toursTitle: readField(formData, "toursTitle"),
    transfersTitle: readField(formData, "transfersTitle")
  };

  const existing = await prisma.siteContentSetting.findUnique({ where: { key: "HOTEL_LANDING" } });
  const content = (existing?.content as Record<string, Record<string, HotelLandingOverrides>> | null) ?? {};
  const hotelMap = content[hotelSlug] ?? {};
  hotelMap[locale] = payload;
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
