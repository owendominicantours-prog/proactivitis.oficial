"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const readField = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const readNumber = (formData: FormData, key: string) => {
  const value = Number(readField(formData, key));
  return Number.isFinite(value) && value >= 0 ? value : null;
};

const parseLines = (value: string) =>
  value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);

const allowedPropertyTypes = new Set(["hotel", "apartment", "villa"]);

const calculateReadinessScore = (input: {
  propertyName: string;
  propertyType: string;
  city: string;
  country: string;
  zone: string;
  address: string;
  mapUrl: string;
  description: string;
  amenities: string[];
  roomTypes: string[];
  policies: string;
  imageLinks: string[];
  priceFrom: number | null;
  contactName: string;
  contactPhone: string;
}) => {
  const checks = [
    Boolean(input.propertyName),
    allowedPropertyTypes.has(input.propertyType),
    Boolean(input.city && input.country),
    Boolean(input.zone || input.address || input.mapUrl),
    Boolean(input.description && input.description.length >= 80),
    input.amenities.length >= 3,
    input.roomTypes.length >= 1,
    Boolean(input.policies),
    input.imageLinks.length >= 3,
    input.priceFrom != null && input.priceFrom > 0,
    Boolean(input.contactName && input.contactPhone)
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const buildReviewFlags = (input: {
  mapUrl: string;
  policies: string;
  imageLinks: string[];
  priceFrom: number | null;
  description: string;
}) => {
  const flags: string[] = [];
  if (!input.mapUrl) flags.push("Falta mapa o coordenadas");
  if (!input.policies) flags.push("Faltan politicas");
  if (input.imageLinks.length < 3) flags.push("Subir mas fotos");
  if (input.priceFrom == null) flags.push("Confirmar tarifa base");
  if (input.description.length < 80) flags.push("Descripcion corta");
  return flags;
};

export async function createSupplierPropertyDraftAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesion.");

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplier) throw new Error("No encontramos tu perfil supplier.");

  const propertyName = readField(formData, "propertyName");
  const rawPropertyType = readField(formData, "propertyType") || "hotel";
  const propertyType = allowedPropertyTypes.has(rawPropertyType) ? rawPropertyType : "hotel";
  const legalName = readField(formData, "legalName");
  const country = readField(formData, "country");
  const city = readField(formData, "city");
  const zone = readField(formData, "zone");
  const address = readField(formData, "address");
  const mapUrl = readField(formData, "mapUrl");
  const contactName = readField(formData, "contactName");
  const contactPhone = readField(formData, "contactPhone");
  const contactEmail = readField(formData, "contactEmail");
  const website = readField(formData, "website");
  const description = readField(formData, "description");
  const amenities = parseLines(readField(formData, "amenities"));
  const roomTypes = parseLines(readField(formData, "roomTypes"));
  const bestFor = parseLines(readField(formData, "bestFor"));
  const languages = parseLines(readField(formData, "languages"));
  const policies = readField(formData, "policies");
  const availabilityNotes = readField(formData, "availabilityNotes");
  const internalNotes = readField(formData, "internalNotes");
  const imageLinks = parseLines(readField(formData, "imageLinks"));
  const priceFrom = readNumber(formData, "priceFrom");
  const rooms = readNumber(formData, "rooms");
  const maxGuests = readNumber(formData, "maxGuests");
  const checkIn = readField(formData, "checkIn");
  const checkOut = readField(formData, "checkOut");
  const paymentModel = readField(formData, "paymentModel") || "quote";

  if (!propertyName || !country || !city || !contactName || !contactPhone || !description) {
    throw new Error("Completa nombre, pais, ciudad, contacto, telefono y descripcion.");
  }

  const draftKey = `property-${Date.now()}-${randomUUID().slice(0, 8)}`;
  const readinessScore = calculateReadinessScore({
    propertyName,
    propertyType,
    city,
    country,
    zone,
    address,
    mapUrl,
    description,
    amenities,
    roomTypes,
    policies,
    imageLinks,
    priceFrom,
    contactName,
    contactPhone
  });
  const reviewFlags = buildReviewFlags({ mapUrl, policies, imageLinks, priceFrom, description });

  await prisma.tourDraft.create({
    data: {
      supplierId: supplier.id,
      draftKey,
      title: propertyName,
      data: {
        kind: "accommodation",
        status: "review",
        submissionVersion: 2,
        propertyName,
        propertyType,
        legalName,
        country,
        city,
        zone,
        address,
        mapUrl,
        contactName,
        contactPhone,
        contactEmail,
        website,
        description,
        amenities,
        roomTypes,
        bestFor,
        languages,
        policies,
        availabilityNotes,
        internalNotes,
        imageLinks,
        priceFrom,
        rooms,
        maxGuests,
        checkIn,
        checkOut,
        paymentModel,
        readinessScore,
        reviewFlags,
        nextReviewStep:
          readinessScore >= 85
            ? "Lista para revisar fotos, SEO y publicacion."
            : "Completar datos faltantes antes de convertir en ficha publica.",
        submittedAt: new Date().toISOString()
      }
    }
  });

  revalidatePath("/supplier/properties");
  redirect("/supplier/properties?status=sent");
}
