"use server";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";
import { resolveDestination, sanitized, slugify } from "@/lib/supplierTours";

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

type ImportRecord = Record<string, unknown>;

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

  let body: { records?: ImportRecord[] };
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "El archivo no se pudo leer." }, { status: 400 });
  }

  const records = Array.isArray(body?.records) ? body.records : [];
  if (!records.length) {
    return NextResponse.json({ error: "No se encontraron filas para importar." }, { status: 400 });
  }

  const createdTours: string[] = [];

  for (const row of records) {
    const rawTitle = sanitized(row.title ?? row.name, "title");
    if (!rawTitle) {
      continue;
    }
    const baseSlug = slugify(rawTitle);
    let slug = baseSlug || `tour-${Date.now()}`;
    if (await prisma.tour.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${Math.floor(Math.random() * 9000 + 1000)}`;
    }

    const destinationId = await resolveDestination(
      typeof row.country === "string" ? row.country : undefined,
      typeof row.destination === "string" ? row.destination : undefined
    );

    const priceValue = numericValue(row.price) ?? 0;
    const priceChildValue = numericValue(row.priceChild);
    const priceYouthValue = numericValue(row.priceYouth);
    const capacityValue = integerValue(row.capacity) ?? 1;

    const includes = sanitized(row.includes, "includes");
    const description = sanitized(row.description ?? row.shortDescription ?? rawTitle, "description");
    const shortDescription = sanitized(row.shortDescription ?? row.description ?? rawTitle, "shortDescription");

    const heroImage = typeof row.heroImageUrl === "string" && row.heroImageUrl.trim() ? row.heroImageUrl.trim() : "/fototours/fototour.jpeg";
    const galleryValues =
      typeof row.galleryUrls === "string"
        ? row.galleryUrls
            .split(/[,;|]/)
            .map((item) => item.trim())
            .filter((item): item is string => item.length > 0)
        : Array.isArray(row.galleryUrls)
        ? row.galleryUrls.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [];

    await prisma.tour.create({
      data: {
        id: randomUUID(),
        title: rawTitle,
        slug,
        description,
        shortDescription,
        includes,
        duration: typeof row.duration === "string" ? row.duration : "",
        location: typeof row.location === "string" ? row.location : "",
        language: typeof row.language === "string" ? row.language : "",
        category: typeof row.category === "string" ? row.category : "",
        price: priceValue,
        priceChild: priceChildValue,
        priceYouth: priceYouthValue,
        capacity: capacityValue,
        confirmationType: typeof row.confirmationType === "string" ? row.confirmationType : "instant",
        physicalLevel: typeof row.physicalLevel === "string" ? row.physicalLevel : "",
        minAge: integerValue(row.minAge),
        meetingPoint: typeof row.meetingPoint === "string" ? row.meetingPoint : "",
        meetingInstructions: typeof row.meetingInstructions === "string" ? row.meetingInstructions : "",
        pickup: typeof row.pickup === "string" ? row.pickup : "",
        requirements: typeof row.requirements === "string" ? row.requirements : "",
        cancellationPolicy: typeof row.cancellationPolicy === "string" ? row.cancellationPolicy : "flexible",
        terms: typeof row.terms === "string" ? row.terms : "",
        adminNote: typeof row.itinerary === "string" ? row.itinerary : "",
        heroImage,
        gallery: galleryValues.length ? JSON.stringify(galleryValues) : undefined,
        status: "draft",
        supplierId: supplierProfile.id,
        departureDestinationId: destinationId ?? undefined
      }
    });

    createdTours.push(rawTitle);
  }

  if (!createdTours.length) {
    return NextResponse.json({ error: "Ningún tour válido pudo crearse." }, { status: 400 });
  }

  return NextResponse.json({
    message: `${createdTours.length} tours importados.`,
    redirectUrl: "/supplier/tours?status=draft"
  });
}
