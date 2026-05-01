"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitized } from "@/lib/supplierTours";

const OFFER_PATH = "/supplier/offers";

function parsePositiveNumber(input: FormDataEntryValue | null): number {
  const value = Number(String(input ?? "").trim());
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function cleanOfferText(value: FormDataEntryValue | null, limit: number) {
  return sanitized(value).slice(0, limit);
}

export async function createSupplierOfferAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!supplier) throw new Error("Perfil de supplier no encontrado.");

  const title = cleanOfferText(formData.get("title"), 90) || "Oferta especial";
  const description = cleanOfferText(formData.get("description"), 280);
  const discountTypeRaw = String(formData.get("discountType") ?? "PERCENT").toUpperCase();
  const discountType = discountTypeRaw === "AMOUNT" ? "AMOUNT" : "PERCENT";
  const discountValue = parsePositiveNumber(formData.get("discountValue"));
  const selectedTourIds = Array.from(
    new Set(
      formData
        .getAll("tourIds")
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );

  if (selectedTourIds.length === 0) {
    throw new Error("Selecciona al menos un tour para la oferta.");
  }
  if (discountValue <= 0) {
    throw new Error("La oferta debe tener un valor mayor que 0.");
  }

  if (discountType === "PERCENT" && discountValue > 95) {
    throw new Error("El porcentaje máximo permitido es 95%.");
  }

  const supplierTours = await prisma.tour.findMany({
    where: {
      id: { in: selectedTourIds },
      supplierId: supplier.id,
      status: "published"
    },
    select: { id: true, price: true }
  });
  const allowedTourIds = new Set(supplierTours.map((tour) => tour.id));
  const validTourIds = selectedTourIds.filter((tourId) => allowedTourIds.has(tourId));

  if (validTourIds.length === 0) {
    throw new Error("Selecciona tours publicados que pertenezcan a tu cuenta.");
  }

  if (discountType === "AMOUNT") {
    const lowestPrice = Math.min(...supplierTours.map((tour) => tour.price));
    if (Number.isFinite(lowestPrice) && discountValue >= lowestPrice) {
      throw new Error("El descuento fijo no puede igualar o superar el precio del tour.");
    }
  }

  const primaryTourId = validTourIds[0];

  await prisma.offer.create({
    data: {
      supplierId: supplier.id,
      tourId: primaryTourId,
      title,
      description,
      discountType,
      discountValue,
      OfferTours: {
        createMany: {
          data: validTourIds.map((tourId) => ({ tourId })),
          skipDuplicates: true
        }
      }
    }
  });

  revalidatePath(OFFER_PATH);
}

export async function toggleSupplierOfferActiveAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) throw new Error("Debes iniciar sesión.");

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    select: { id: true }
  });
  if (!supplier) throw new Error("Perfil de supplier no encontrado.");

  const offerId = String(formData.get("offerId") ?? "").trim();
  if (!offerId) throw new Error("Oferta invalida.");

  const offer = await prisma.offer.findFirst({
    where: { id: offerId, supplierId: supplier.id },
    select: { id: true, active: true }
  });
  if (!offer) throw new Error("Oferta no encontrada.");

  await prisma.offer.update({
    where: { id: offer.id },
    data: { active: !offer.active }
  });

  revalidatePath(OFFER_PATH);
}

