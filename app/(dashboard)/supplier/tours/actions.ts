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
import { normalizeTourCategories } from "@/lib/tourTaxonomy";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };
type TourOptionInput = {
  name: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  pricePerPerson?: number;
  basePrice?: number;
  baseCapacity?: number;
  extraPricePerPerson?: number;
  pickupTimes?: string[];
  isDefault?: boolean;
  active?: boolean;
  sortOrder?: number;
};

const COUNTRY_ONLY_DESTINATION_SLUGS = new Set([
  "dominican-republic",
  "dominican-republic-rd",
  "republica-dominicana"
]);

function parseDurationField(value: FormDataEntryValue | null, fallback = "") {
  if (typeof value !== "string") return fallback;
  const rawValue = value.trim();
  if (!rawValue) return fallback;
  try {
    const parsed = JSON.parse(rawValue);
    const amount = String(parsed?.value ?? "").trim();
    const unit = String(parsed?.unit ?? "").trim();
    if (amount && unit) return `${amount} ${unit}`;
  } catch {
    return rawValue;
  }
  return rawValue;
}

function parseTimeSlots(formData: FormData): PersistedTimeSlot[] {
  const rawValue = formData.get("timeSlots");
  return parseTimeSlotsFromJson(typeof rawValue === "string" ? rawValue : null);
}

function parseTimeSlotsFromJson(rawValue?: string | null): PersistedTimeSlot[] {
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slot) =>
      Number.isInteger(slot?.hour) &&
      slot.hour >= 1 &&
      slot.hour <= 12 &&
      ["00", "15", "30", "45"].includes(slot?.minute) &&
      ["AM", "PM"].includes(slot?.period)
    ) as PersistedTimeSlot[];
  } catch {
    return [];
  }
}

function parseJsonStringArray(rawValue: FormDataEntryValue | null) {
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index);
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
      .filter(Boolean)
      .filter((item, index, list) => list.indexOf(item) === index);
  } catch {
    return [];
  }
}

function parseTourOptions(formData: FormData): TourOptionInput[] {
  const rawValue = formData.get("tourOptions");
  if (!rawValue || typeof rawValue !== "string") return [];
  try {
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((option) => ({
        name: typeof option?.name === "string" ? sanitized(option.name, "title") : "",
        type: typeof option?.type === "string" ? option.type.trim() : undefined,
        description: typeof option?.description === "string" ? sanitized(option.description, "description") : undefined,
        imageUrl: typeof option?.imageUrl === "string" ? option.imageUrl.trim() : undefined,
        pricePerPerson:
          typeof option?.pricePerPerson === "number" && option.pricePerPerson >= 0 ? option.pricePerPerson : undefined,
        basePrice: typeof option?.basePrice === "number" && option.basePrice >= 0 ? option.basePrice : undefined,
        baseCapacity:
          typeof option?.baseCapacity === "number" && option.baseCapacity > 0 ? Math.trunc(option.baseCapacity) : undefined,
        extraPricePerPerson:
          typeof option?.extraPricePerPerson === "number" && option.extraPricePerPerson >= 0
            ? option.extraPricePerPerson
            : undefined,
        pickupTimes: Array.isArray(option?.pickupTimes)
          ? option.pickupTimes.filter((item: unknown) => typeof item === "string" && item.trim())
          : undefined,
        isDefault: Boolean(option?.isDefault),
        active: option?.active !== false,
        sortOrder: typeof option?.sortOrder === "number" ? option.sortOrder : undefined
      }))
      .filter((option) => option.name);
  } catch {
    return [];
  }
}

function normalizeJsonInput(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) return undefined;
  return value as Prisma.InputJsonValue;
}

function validateCommercialTourFields(input: {
  title: string;
  categoryValue: string;
  languageValue: string;
  destinationValue: string;
  price: number;
  priceChild?: number;
  priceYouth?: number;
  capacity: number;
  durationValue: string;
  description: string;
  heroImage: string;
  galleryUrls: string[];
  highlightsList: string[];
  includesArray: string[];
  notIncludedArray: string[];
  operatingDays: string[];
  timeSlots: PersistedTimeSlot[];
  pickup: string;
  meetingPoint: string;
}) {
  if (input.title.length < 8) {
    throw new Error("El titulo debe tener al menos 8 caracteres.");
  }
  if (!input.categoryValue) {
    throw new Error("Selecciona al menos una categoria valida para el tour.");
  }
  if (!input.languageValue) {
    throw new Error("Selecciona al menos un idioma disponible para el tour.");
  }
  const destinationSlug = slugify(input.destinationValue);
  if (!destinationSlug || COUNTRY_ONLY_DESTINATION_SLUGS.has(destinationSlug)) {
    throw new Error("Selecciona una zona o ciudad concreta, no solo Republica Dominicana. Ejemplo: Punta Cana, Bavaro, Samana.");
  }
  if (input.description.length < 250) {
    throw new Error("La descripcion debe tener al menos 250 caracteres.");
  }
  if (!Number.isFinite(input.price) || input.price <= 0) {
    throw new Error("El precio adulto debe ser mayor que cero.");
  }
  if (!Number.isFinite(input.capacity) || input.capacity < 1 || input.capacity > 999) {
    throw new Error("La capacidad debe estar entre 1 y 999 personas.");
  }
  for (const [label, value] of [
    ["precio de nino", input.priceChild],
    ["precio de joven", input.priceYouth]
  ] as const) {
    if (value === undefined) continue;
    if (!Number.isFinite(value) || value < 0) throw new Error(`El ${label} no puede ser negativo.`);
    if (value > input.price) throw new Error(`El ${label} no debe ser mayor que el precio adulto.`);
  }
  if (!input.durationValue.trim()) {
    throw new Error("Define la duracion del tour.");
  }
  if (!input.operatingDays.length || !input.timeSlots.length) {
    throw new Error("Define dias de operacion y al menos un horario.");
  }
  if (!input.heroImage || input.heroImage === "/fototours/fototour.jpeg") {
    throw new Error("Sube una foto principal real del tour.");
  }
  if (input.galleryUrls.length < 3) {
    throw new Error("Sube al menos 3 fotos adicionales para la galeria.");
  }
  if (input.highlightsList.length < 3 || input.highlightsList.length > 6) {
    throw new Error("Los highlights deben ser entre 3 y 6 elementos.");
  }
  if (input.includesArray.length < 2 || input.notIncludedArray.length < 1) {
    throw new Error("Agrega al menos 2 elementos incluidos y 1 no incluido.");
  }
  if (!input.pickup.trim() && !input.meetingPoint.trim()) {
    throw new Error("Define pickup o punto de encuentro.");
  }
}

async function assertNoSupplierDuplicateTour({
  supplierId,
  title,
  slug,
  excludeTourId
}: {
  supplierId: string;
  title: string;
  slug: string;
  excludeTourId?: string;
}) {
  const duplicate = await prisma.tour.findFirst({
    where: {
      supplierId,
      ...(excludeTourId ? { id: { not: excludeTourId } } : {}),
      OR: [
        { slug },
        { title: { equals: title, mode: "insensitive" } }
      ]
    },
    select: { id: true, title: true }
  });
  if (duplicate) {
    throw new Error("Ya tienes un tour con ese nombre. Edita el existente o usa un titulo mas especifico.");
  }
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
  await assertNoSupplierDuplicateTour({ supplierId, title, slug });
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
  const durationValue = parseDurationField(formData.get("duration"));
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : null;
  const operatingDays = parseJsonStringArray(formData.get("operatingDays"));
  const operatingDaysValue = JSON.stringify(operatingDays);
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
  const includesArray = parseStringArrayField(formData, "includesList");
  const notIncludedArray = parseStringArrayField(formData, "notIncludedList");
  const tourOptions = parseTourOptions(formData);
  validateCommercialTourFields({
    title,
    categoryValue,
    languageValue,
    destinationValue: formData.get("destination")?.toString() ?? "",
    price: priceValue,
    priceChild: priceChildValue,
    priceYouth: priceYouthValue,
    capacity: capacityValue,
    durationValue,
    description,
    heroImage,
    galleryUrls,
    highlightsList,
    includesArray,
    notIncludedArray,
    operatingDays,
    timeSlots,
    pickup,
    meetingPoint
  });

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

  if (tourOptions.length) {
    const hasDefault = tourOptions.some((option) => option.isDefault);
    await prisma.tourOption.createMany({
      data: tourOptions.map((option, index) => ({
        tourId,
        name: option.name,
        type: option.type,
        description: option.description,
        imageUrl: option.imageUrl,
        pricePerPerson: option.pricePerPerson,
        basePrice: option.basePrice,
        baseCapacity: option.baseCapacity,
        extraPricePerPerson: option.extraPricePerPerson,
        pickupTimes: option.pickupTimes?.length ? option.pickupTimes : undefined,
        isDefault: option.isDefault || (!hasDefault && index === 0),
        active: option.active !== false,
        sortOrder: option.sortOrder ?? index
      }))
    });
  }

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
  const duplicateOptions = await prisma.tourOption.findMany({ where: { tourId: tour.id } });

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

  if (duplicateOptions.length) {
    await prisma.tourOption.createMany({
      data: duplicateOptions.map((option) => ({
        tourId: newTour.id,
        name: option.name,
        type: option.type ?? undefined,
        description: option.description ?? undefined,
        imageUrl: option.imageUrl ?? undefined,
        pricePerPerson: option.pricePerPerson ?? undefined,
        basePrice: option.basePrice ?? undefined,
        baseCapacity: option.baseCapacity ?? undefined,
        extraPricePerPerson: option.extraPricePerPerson ?? undefined,
        pickupTimes: option.pickupTimes ?? undefined,
        isDefault: option.isDefault,
        active: option.active,
        sortOrder: option.sortOrder
      }))
    });
  }

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

  const title = sanitized(formData.get("title"), "title") || tour.title;
  await assertNoSupplierDuplicateTour({
    supplierId,
    title,
    slug: slugify(title),
    excludeTourId: tourId
  });
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
  const durationValue = parseDurationField(formData.get("duration"), tour.duration ?? "");
  const timeSlots = parseTimeSlots(formData);
  const timeOptionsValue = timeSlots.length ? JSON.stringify(timeSlots) : tour.timeOptions;
  const operatingDays = parseJsonStringArray(formData.get("operatingDays"));
  const storedOperatingDays = parseJsonStringArray(tour.operatingDays ?? "[]");
  const operatingDaysValue = operatingDays.length
    ? JSON.stringify(operatingDays)
    : tour.operatingDays ?? "[]";
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
  const tourOptions = parseTourOptions(formData);
  const galleryUrlsForValidation = galleryUrls.length
    ? galleryUrls
    : parseJsonStringArray(tour.gallery ?? "[]");
  const includesForValidation = includesArray.length
    ? includesArray
    : Array.isArray(tour.includesList)
      ? tour.includesList.filter((item): item is string => typeof item === "string")
      : [];
  const notIncludedForValidation = notIncludedArray.length
    ? notIncludedArray
    : Array.isArray(tour.notIncludedList)
      ? tour.notIncludedList.filter((item): item is string => typeof item === "string")
      : [];
  const highlightsToStore =
    highlightsList.length || !Array.isArray(tour.highlights)
      ? highlightsList
      : tour.highlights;
  validateCommercialTourFields({
    title,
    categoryValue: categoryValue || buildCategoryStringFromText(tour.category),
    languageValue: languageValue || tour.language || "",
    destinationValue: formData.get("destination")?.toString() || tour.location || "",
    price: priceValue,
    priceChild: priceChildValue,
    priceYouth: priceYouthValue,
    capacity: capacityValue,
    durationValue,
    description,
    heroImage: heroImage ?? "",
    galleryUrls: galleryUrlsForValidation,
    highlightsList: highlightsToStore.filter((item): item is string => typeof item === "string"),
    includesArray: includesForValidation,
    notIncludedArray: notIncludedForValidation,
    operatingDays: operatingDays.length ? operatingDays : storedOperatingDays,
    timeSlots: timeSlots.length ? timeSlots : parseTimeSlotsFromJson(tour.timeOptions),
    pickup,
    meetingPoint
  });

  await prisma.tour.update({
    where: { id: tourId },
    data: {
      title,
      description,
      shortDescription,
      includes,
      duration: durationValue,
      location: formData.get("location")?.toString() ?? tour.location,
      language: languageValue || tour.language,
      category: categoryValue || buildCategoryStringFromText(tour.category) || tour.category,
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

  await prisma.tourOption.deleteMany({ where: { tourId } });
  if (tourOptions.length) {
    const hasDefault = tourOptions.some((option) => option.isDefault);
    await prisma.tourOption.createMany({
      data: tourOptions.map((option, index) => ({
        tourId,
        name: option.name,
        type: option.type,
        description: option.description,
        imageUrl: option.imageUrl,
        pricePerPerson: option.pricePerPerson,
        basePrice: option.basePrice,
        baseCapacity: option.baseCapacity,
        extraPricePerPerson: option.extraPricePerPerson,
        pickupTimes: option.pickupTimes?.length ? option.pickupTimes : undefined,
        isDefault: option.isDefault || (!hasDefault && index === 0),
        active: option.active !== false,
        sortOrder: option.sortOrder ?? index
      }))
    });
  }

  void translateTourById(tourId).catch((error) => {
    console.error("translation job failed on update", error);
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
  const categories = normalizeTourCategories(
    formData
      .getAll("categories")
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  );
  if (categories.length) return categories.join(", ");
  const fallback = formData.get("category");
  const fallbackCategory = normalizeTourCategories(typeof fallback === "string" ? [fallback] : []);
  if (fallbackCategory.length) return fallbackCategory.join(", ");
  return "";
}

function buildCategoryStringFromText(value?: string | null) {
  if (!value) return "";
  return normalizeTourCategories(value.split(",")).join(", ");
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
