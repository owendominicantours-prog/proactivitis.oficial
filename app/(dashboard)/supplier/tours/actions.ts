"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { ensureCountryByCode, resolveDestination, sanitized, slugify } from "@/lib/supplierTours";
import { translateTourById } from "@/lib/translationWorker";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

function parseTimeSlots(formData: FormData): PersistedTimeSlot[] {
  const rawValue = formData.get("timeSlots");
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    return JSON.parse(rawValue) as PersistedTimeSlot[];
  } catch {
    return [];
  }
}

function parseStringArrayField(formData: FormData, fieldName: string) {
  const rawValue = formData.get(fieldName);
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? sanitized(item, "includes") : ""))
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeJsonInput(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

export async function createTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");
  const supplierId = supplierProfile.id;
  const title = sanitized(formData.get("title"), "title");
  const baseSlug = slugify(title);
  let slug = baseSlug || `tour-${Date.now()}`;
  const slugExists = await prisma.tour.findUnique({ where: { slug } });
  if (slugExists) slug = `${baseSlug}-${Math.floor(Math.random() * 9999)}`;

  const languageValue = buildLanguagesString(formData);
  const categoryValue = buildCategoryString(formData);
  const itineraryValue = buildItineraryDescription(formData);
  const description = sanitized(formData.get("description"), "description") || title;
  const shortDescription = sanitized(formData.get("shortDescription"), "shortDescription");
  const cancellationPolicy = formData.get("cancellation")?.toString() ?? "flexible";
  const confirmationType = formData.get("confirmationType")?.toString() ?? "instant";
  const physicalLevel = formData.get("physicalLevel")?.toString() ?? "";
  const meetingPoint = sanitized(formData.get("meetingPoint"), "meetingPoint");
  const meetingInstructions = sanitized(formData.get("meetingInstructions"), "meetingInstructions");
  const pickup = formData.get("pickup")?.toString() ?? "";
  const requirements = sanitized(formData.get("requirements"), "requirements");
  const terms = sanitized(formData.get("terms"), "terms");
  const minAgeValue = toInteger(formData.get("minAge"));
  const capacityValue = toInteger(formData.get("capacity")) ?? 1;
  const priceValue = toFloat(formData.get("price")) ?? 0;
  const priceChildValue = toFloat(formData.get("priceChild"));
  const priceYouthValue = toFloat(formData.get("priceYouth"));
  const durationValue = formData.get("duration")?.toString() ?? "";
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : null;
  const operatingDaysValue = formData.get("operatingDays")?.toString() ?? "[]";
  const blackoutDatesValue = formData.get("blackoutDates")?.toString() ?? "[]";
  const resolvedDestination = await resolveDestination(
    formData.get("country")?.toString(),
    formData.get("destination")?.toString()
  );
  const departureDestinationId = resolvedDestination?.destinationId ?? undefined;
  const countryCode =
    resolvedDestination?.countryCode ?? (await ensureCountryByCode("RD", "República Dominicana")).code;

  const galleryUrls = formData
    .getAll("galleryUrls")
    .filter((val): val is string =>
      typeof val === "string" && val.trim().length > 0
    );

  const heroImage = formData.get("heroImageUrl")?.toString() || "/fototours/fototour.jpeg";
  const includes = sanitized(formData.get("includes"), "includes");
  const highlightsList = parseStringArrayField(formData, "highlights");
  if (highlightsList.length < 3 || highlightsList.length > 6) {
    throw new Error("Los highlights deben ser entre 3 y 6 elementos.");
  }
  const includesArray = parseStringArrayField(formData, "includesList");
  const notIncludedArray = parseStringArrayField(formData, "notIncludedList");

  const tourId = randomUUID();
  await prisma.tour.create({
    data: {
      id: tourId,
      title,
      slug,
      description,
      shortDescription,
      includes,
      duration: durationValue,
      location: formData.get("location")?.toString() ?? "",
      language: languageValue || "",
      category: categoryValue || "",
      price: priceValue,
      priceChild: priceChildValue,
      priceYouth: priceYouthValue,
      capacity: capacityValue,
      confirmationType,
      physicalLevel,
      minAge: minAgeValue,
      meetingPoint,
      meetingInstructions,
      pickup,
      requirements,
      cancellationPolicy,
      terms,
      timeOptions: timeOptionsValue,
      operatingDays: operatingDaysValue,
      blackoutDates: blackoutDatesValue,
      adminNote: itineraryValue,
      heroImage,
      gallery: galleryUrls.length ? JSON.stringify(galleryUrls) : undefined,
      highlights: highlightsList.length ? highlightsList : undefined,
      includesList: includesArray.length ? includesArray : undefined,
      notIncludedList: notIncludedArray.length ? notIncludedArray : undefined,
      status: "pending",
      supplierId,
      departureDestinationId,
      countryId: countryCode
    }
  });

  void translateTourById(tourId).catch((error) => {
    console.error("translation job failed", error);
  });

  redirect("/supplier/tours?status=sent");
}

export async function duplicateTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");

  const tourId = formData.get("tourId")?.toString();
  if (!tourId) throw new Error("Tour no encontrado");
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new Error("Tour no existe");
  if (tour.supplierId !== supplierProfile.id) throw new Error("No autorizado");

  const requestedSlug = formData.get("duplicateSlug")?.toString().trim() ?? "";
  const candidateSlugBase = slugify(requestedSlug || tour.title);
  const fallbackSlugBase = `${tour.slug}-${Date.now()}`;
  let newSlug = candidateSlugBase || fallbackSlugBase;
  while (await prisma.tour.findUnique({ where: { slug: newSlug } })) {
    newSlug = `${candidateSlugBase || fallbackSlugBase}-${Math.floor(Math.random() * 9999)}`;
  }

  const duplicateHighlights = normalizeJsonInput(tour.highlights);
  const duplicateIncludesList = normalizeJsonInput(tour.includesList);
  const duplicateNotIncludedList = normalizeJsonInput(tour.notIncludedList);

  const newTour = await prisma.tour.create({
    data: {
      id: randomUUID(),
      title: tour.title,
      slug: newSlug,
      description: tour.description,
      shortDescription: tour.shortDescription,
      includes: tour.includes,
      duration: tour.duration,
      location: tour.location,
      language: tour.language,
      category: tour.category,
      price: tour.price,
      priceChild: tour.priceChild,
      priceYouth: tour.priceYouth,
      capacity: tour.capacity ?? 1,
      confirmationType: tour.confirmationType ?? "instant",
      physicalLevel: tour.physicalLevel,
      minAge: tour.minAge,
      meetingPoint: tour.meetingPoint,
      meetingInstructions: tour.meetingInstructions,
      pickup: tour.pickup,
      requirements: tour.requirements,
      cancellationPolicy: tour.cancellationPolicy,
      terms: tour.terms,
      timeOptions: tour.timeOptions,
      operatingDays: tour.operatingDays,
      blackoutDates: tour.blackoutDates,
      adminNote: tour.adminNote,
      heroImage: tour.heroImage,
      gallery: tour.gallery,
      highlights: duplicateHighlights,
      includesList: duplicateIncludesList,
      notIncludedList: duplicateNotIncludedList,
      status: "draft",
      supplierId: supplierProfile.id,
      departureDestinationId: tour.departureDestinationId,
      countryId: tour.countryId,
      platformSharePercent: tour.platformSharePercent ?? 20,
      productId: randomUUID()
    }
  });

  redirect(`/supplier/tours/${newTour.id}/edit`);
}

export async function updateTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const userId = sessionUser?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");
  const supplierId = supplierProfile.id;
  const tourId = formData.get("tourId")?.toString();
  if (!tourId) throw new Error("Tour no encontrado");

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new Error("Tour no existe");
  if (tour.supplierId !== supplierId && supplierId) throw new Error("No autorizado");

  const languageValue = buildLanguagesString(formData);
  const categoryValue = buildCategoryString(formData);
  const itineraryValue = buildItineraryDescription(formData);
  const description = sanitized(formData.get("description"), "description") || tour.title;
  const shortDescription = sanitized(formData.get("shortDescription"), "shortDescription") || tour.shortDescription || "";
  const cancellationPolicy = formData.get("cancellation")?.toString() ?? tour.cancellationPolicy ?? "flexible";
  const confirmationType = formData.get("confirmationType")?.toString() ?? tour.confirmationType ?? "instant";
  const physicalLevel = formData.get("physicalLevel")?.toString() ?? tour.physicalLevel ?? "";
  const meetingPoint =
    sanitized(formData.get("meetingPoint"), "meetingPoint") || tour.meetingPoint || "";
  const meetingInstructions =
    sanitized(formData.get("meetingInstructions"), "meetingInstructions") || tour.meetingInstructions || "";
  const pickup = formData.get("pickup")?.toString() ?? tour.pickup ?? "";
  const requirements = sanitized(formData.get("requirements"), "requirements") || tour.requirements || "";
  const terms = sanitized(formData.get("terms"), "terms") || tour.terms || "";
  const minAgeValue = toInteger(formData.get("minAge")) ?? tour.minAge ?? undefined;
  const capacityValue = toInteger(formData.get("capacity")) ?? tour.capacity ?? 1;
  const priceValue = toFloat(formData.get("price")) ?? tour.price;
  const priceChildValue = toFloat(formData.get("priceChild")) ?? tour.priceChild ?? undefined;
  const priceYouthValue = toFloat(formData.get("priceYouth")) ?? tour.priceYouth ?? undefined;
  const durationValue = formData.get("duration")?.toString() ?? tour.duration;
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : tour.timeOptions;
  const operatingDaysValue = formData.get("operatingDays")?.toString() ?? tour.operatingDays ?? "[]";
  const blackoutDatesValue = formData.get("blackoutDates")?.toString() ?? tour.blackoutDates ?? "[]";
  const resolvedDestination = await resolveDestination(
    formData.get("country")?.toString(),
    formData.get("destination")?.toString()
  );
  const departureDestinationId = resolvedDestination?.destinationId ?? undefined;
  const countryCode =
    resolvedDestination?.countryCode ?? (await ensureCountryByCode("RD", "República Dominicana")).code;

  const galleryUrls = formData
    .getAll("galleryUrls")
    .filter((val): val is string =>
      typeof val === "string" && val.trim().length > 0
    );
  const heroImage = formData.get("heroImageUrl")?.toString() || tour.heroImage;
  const includes = sanitized(formData.get("includes"), "includes") || tour.includes;
  const highlightsList = parseStringArrayField(formData, "highlights");
  const includesArray = parseStringArrayField(formData, "includesList");
  const notIncludedArray = parseStringArrayField(formData, "notIncludedList");
  const highlightsToStore =
    highlightsList.length || !Array.isArray(tour.highlights)
      ? highlightsList
      : tour.highlights;
  if (highlightsToStore.length && (highlightsToStore.length < 3 || highlightsToStore.length > 6)) {
    throw new Error("Los highlights deben ser entre 3 y 6 elementos.");
  }

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      title: formData.get("title")?.toString() ?? tour.title,
      description,
      shortDescription,
      includes,
      duration: durationValue,
      location: formData.get("location")?.toString() ?? tour.location,
      language: languageValue || tour.language,
      category: categoryValue || tour.category,
      price: priceValue,
      priceChild: priceChildValue,
      priceYouth: priceYouthValue,
      capacity: capacityValue,
      confirmationType,
      physicalLevel,
      minAge: minAgeValue,
      meetingPoint,
      meetingInstructions,
      pickup,
      requirements,
      cancellationPolicy,
      terms,
      timeOptions: timeOptionsValue,
      operatingDays: operatingDaysValue,
      blackoutDates: blackoutDatesValue,
      adminNote: itineraryValue,
      heroImage,
      gallery: galleryUrls.length ? JSON.stringify(galleryUrls) : tour.gallery,
      highlights: highlightsToStore.length ? highlightsToStore : undefined,
      includesList: includesArray.length ? includesArray : normalizeJsonInput(tour.includesList),
      notIncludedList: notIncludedArray.length ? notIncludedArray : normalizeJsonInput(tour.notIncludedList),
      departureDestinationId: departureDestinationId ?? tour.departureDestinationId,
      countryId: countryCode
    }
  });

  redirect("/supplier/tours?status=updated");
}

export async function deleteSupplierTourAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Debes iniciar sesión primero.");
  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) throw new Error("No tienes un perfil de supplier activo.");

  const tourId = formData.get("tourId")?.toString();
  if (!tourId) throw new Error("Tour no encontrado");

  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new Error("Tour no existe");
  if (tour.supplierId !== supplierProfile.id) throw new Error("No autorizado");
  if (tour.status === "published") throw new Error("No puedes eliminar tours aprobados");

  await prisma.tour.delete({ where: { id: tourId } });
  revalidatePath("/supplier/tours");
}

function buildLanguagesString(formData: FormData) {
  const languages = formData
    .getAll("languages")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (languages.length) return languages.join(", ");
  const fallback = formData.get("language");
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "";
}

function buildItineraryDescription(formData: FormData) {
  const stops = formData
    .getAll("itineraryStops")
    .map((value) => {
      try {
        return JSON.parse(value as string);
      } catch {
        return null;
      }
    })
    .filter((stop): stop is { place: string; duration: string; note: string } =>
      Boolean(stop && stop.place && stop.duration)
    );
  if (!stops.length) return "";
  return stops
    .map(
      (stop, index) =>
      `${index + 1}. ${stop.duration} · ${stop.place}${stop.note ? ` – ${stop.note}` : ""}`
    )
    .join("\n");
}

function buildCategoryString(formData: FormData) {
  const categories = formData
    .getAll("categories")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (categories.length) return categories.join(", ");
  const fallback = formData.get("category");
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim();
  }
  return "";
}

function toInteger(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return Math.trunc(parsed);
}

function toFloat(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}
