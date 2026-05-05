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

export async function createSupplierPropertyDraftAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) throw new Error("Debes iniciar sesion.");

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId } });
  if (!supplier) throw new Error("No encontramos tu perfil supplier.");

  const propertyName = readField(formData, "propertyName");
  const propertyType = readField(formData, "propertyType") || "hotel";
  const country = readField(formData, "country");
  const city = readField(formData, "city");
  const zone = readField(formData, "zone");
  const address = readField(formData, "address");
  const contactName = readField(formData, "contactName");
  const contactPhone = readField(formData, "contactPhone");
  const contactEmail = readField(formData, "contactEmail");
  const website = readField(formData, "website");
  const description = readField(formData, "description");
  const amenities = parseLines(readField(formData, "amenities"));
  const roomTypes = parseLines(readField(formData, "roomTypes"));
  const policies = readField(formData, "policies");
  const imageLinks = parseLines(readField(formData, "imageLinks"));
  const priceFrom = readNumber(formData, "priceFrom");
  const rooms = readNumber(formData, "rooms");
  const maxGuests = readNumber(formData, "maxGuests");

  if (!propertyName || !country || !city || !contactName || !contactPhone || !description) {
    throw new Error("Completa nombre, pais, ciudad, contacto, telefono y descripcion.");
  }

  const draftKey = `property-${Date.now()}-${randomUUID().slice(0, 8)}`;

  await prisma.tourDraft.create({
    data: {
      supplierId: supplier.id,
      draftKey,
      title: propertyName,
      data: {
        kind: "accommodation",
        status: "review",
        propertyName,
        propertyType,
        country,
        city,
        zone,
        address,
        contactName,
        contactPhone,
        contactEmail,
        website,
        description,
        amenities,
        roomTypes,
        policies,
        imageLinks,
        priceFrom,
        rooms,
        maxGuests,
        submittedAt: new Date().toISOString()
      }
    }
  });

  revalidatePath("/supplier/properties");
  redirect("/supplier/properties?status=sent");
}
