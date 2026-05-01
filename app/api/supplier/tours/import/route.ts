import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCountryByCode, resolveDestination, sanitized, slugify } from "@/lib/supplierTours";
import { normalizeTourCategories } from "@/lib/tourTaxonomy";

const MAX_IMPORT_RECORDS = 25;
const COUNTRY_ONLY_DESTINATION_SLUGS = new Set([
  "dominican-republic",
  "dominican-republic-rd",
  "republica-dominicana"
]);

type ImportRecord = Record<string, unknown>;

const numericValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }
  if (typeof value !== "string") return undefined;
  const parsed = Number(value.replace(",", "."));
  return Number.isNaN(parsed) ? undefined : parsed;
};

const integerValue = (value: unknown) => {
  const parsed = numericValue(value);
  if (parsed === undefined) return undefined;
  return Math.trunc(parsed);
};

const sanitizeMediaUrl = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
};

const parseGallery = (value: unknown) => {
  const list =
    typeof value === "string"
      ? value.split(/[,;|]/)
      : Array.isArray(value)
        ? value
        : [];
  return list
    .map(sanitizeMediaUrl)
    .filter((item): item is string => Boolean(item))
    .filter((item, index, items) => items.indexOf(item) === index)
    .slice(0, 20);
};

const parseDuration = (value: unknown) => {
  if (typeof value !== "string") return "";
  const rawValue = value.trim();
  if (!rawValue) return "";
  try {
    const parsed = JSON.parse(rawValue);
    const amount = String(parsed?.value ?? "").trim();
    const unit = String(parsed?.unit ?? "").trim();
    if (amount && unit) return `${amount} ${unit}`;
  } catch {
    return sanitized(rawValue, "shortDescription");
  }
  return sanitized(rawValue, "shortDescription");
};

const findRecords = (value: unknown): ImportRecord[] => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is ImportRecord => typeof entry === "object" && entry !== null);
  }
  if (typeof value === "object" && value !== null) {
    const candidates: ImportRecord[] = [];
    const pushArray = (input: unknown) => {
      if (!Array.isArray(input)) return;
      input.forEach((entry) => {
        if (typeof entry === "object" && entry !== null) {
          candidates.push(entry as ImportRecord);
        }
      });
    };
    if ("records" in value) pushArray((value as { records?: unknown }).records);
    if ("data" in value) pushArray((value as { data?: unknown }).data);
    if ("tour_data" in value && typeof (value as { tour_data?: unknown }).tour_data === "object") {
      candidates.push((value as { tour_data?: unknown }).tour_data as ImportRecord);
    }
    if ("tour" in value && typeof (value as { tour?: unknown }).tour === "object") {
      candidates.push((value as { tour?: unknown }).tour as ImportRecord);
    }
    return candidates.length ? candidates : [value as ImportRecord];
  }
  return [];
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Debes iniciar sesión primero." }, { status: 401 });
  }

  const supplierProfile = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplierProfile) {
    return NextResponse.json({ error: "No tienes un perfil de proveedor activo." }, { status: 403 });
  }
  if (!supplierProfile.productsEnabled) {
    return NextResponse.json({ error: "Tu cuenta aun no tiene productos activados." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El archivo no se pudo leer." }, { status: 400 });
  }

  const records = findRecords(body);
  if (!records.length) {
    return NextResponse.json({ error: "No se encontraron filas para importar." }, { status: 400 });
  }
  if (records.length > MAX_IMPORT_RECORDS) {
    return NextResponse.json(
      { error: `Importa máximo ${MAX_IMPORT_RECORDS} tours por lote para evitar errores.` },
      { status: 413 }
    );
  }

  const createdTours: string[] = [];
  const skippedTours: string[] = [];

  for (const row of records) {
    const rawTitle = sanitized(row.title ?? row.name, "title");
    if (!rawTitle) continue;

    const baseSlug = slugify(rawTitle);
    let slug = baseSlug || `tour-${Date.now()}`;
    const supplierDuplicate = await prisma.tour.findFirst({
      where: {
        supplierId: supplierProfile.id,
        OR: [{ title: { equals: rawTitle, mode: "insensitive" } }, { slug }]
      },
      select: { id: true }
    });
    if (supplierDuplicate) {
      skippedTours.push(rawTitle);
      continue;
    }
    if (await prisma.tour.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const destinationInput = typeof row.destination === "string" ? row.destination : undefined;
    const canResolveDestination =
      destinationInput && !COUNTRY_ONLY_DESTINATION_SLUGS.has(slugify(destinationInput));
    const resolvedDestination = await resolveDestination(
      typeof row.country === "string" ? row.country : undefined,
      canResolveDestination ? destinationInput : undefined
    );
    const countryCode =
      resolvedDestination?.countryCode ?? (await ensureCountryByCode("RD", "República Dominicana")).code;

    const priceValue = Math.max(0, numericValue(row.price) ?? 0);
    const priceChildValue = numericValue(row.priceChild);
    const priceYouthValue = numericValue(row.priceYouth);
    const capacityValue = Math.min(999, Math.max(1, integerValue(row.capacity) ?? 1));
    const galleryValues = parseGallery(row.galleryUrls);
    const categoryValue = normalizeTourCategories(
      typeof row.category === "string" ? row.category.split(",") : []
    ).join(", ");

    await prisma.tour.create({
      data: {
        id: randomUUID(),
        title: rawTitle,
        slug,
        description: sanitized(row.description ?? row.shortDescription ?? rawTitle, "description"),
        shortDescription: sanitized(row.shortDescription ?? row.description ?? rawTitle, "shortDescription"),
        includes: sanitized(row.includes, "includes"),
        duration: parseDuration(row.duration),
        location: sanitized(row.location ?? destinationInput ?? "", "shortDescription"),
        language: sanitized(row.language, "shortDescription"),
        category: categoryValue,
        price: priceValue,
        priceChild: priceChildValue,
        priceYouth: priceYouthValue,
        capacity: capacityValue,
        confirmationType: typeof row.confirmationType === "string" ? row.confirmationType : "instant",
        physicalLevel: typeof row.physicalLevel === "string" ? row.physicalLevel : "",
        minAge: integerValue(row.minAge),
        meetingPoint: sanitized(row.meetingPoint, "meetingPoint"),
        meetingInstructions: sanitized(row.meetingInstructions, "meetingInstructions"),
        pickup: sanitized(row.pickup, "pickupNotes"),
        requirements: sanitized(row.requirements, "requirements"),
        cancellationPolicy: typeof row.cancellationPolicy === "string" ? row.cancellationPolicy : "flexible",
        terms: sanitized(row.terms, "terms"),
        adminNote: sanitized(row.itinerary, "description"),
        heroImage: sanitizeMediaUrl(row.heroImageUrl) || "/fototours/fototour.jpeg",
        gallery: galleryValues.length ? JSON.stringify(galleryValues) : undefined,
        status: "draft",
        supplierId: supplierProfile.id,
        departureDestinationId: resolvedDestination?.destinationId ?? undefined,
        countryId: countryCode
      }
    });

    createdTours.push(rawTitle);
  }

  if (!createdTours.length) {
    return NextResponse.json({ error: "Ningún tour válido pudo crearse.", skippedTours }, { status: 400 });
  }

  return NextResponse.json({
    message: `${createdTours.length} tours importados.`,
    skippedTours,
    redirectUrl: "/supplier/tours?status=draft"
  });
}
