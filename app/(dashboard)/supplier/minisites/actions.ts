"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/supplierTours";

const THEME_IDS = [1, 2, 3, 4, 5];
const BIO_LIMIT = 400;

function clampString(value: unknown, limit: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, limit);
}

function parseThemeId(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? "");
  if (!Number.isFinite(parsed)) return THEME_IDS[0];
  if (parsed < Math.min(...THEME_IDS)) return Math.min(...THEME_IDS);
  if (parsed > Math.max(...THEME_IDS)) return Math.max(...THEME_IDS);
  return Math.trunc(parsed);
}

function parseBool(value: FormDataEntryValue | null) {
  if (value === null) return false;
  if (typeof value === "string") {
    return value === "true" || value === "on";
  }
  return Boolean(value);
}

export async function upsertSupplierMinisiteAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("Debes iniciar sesión para gestionar tu mini sitio.");
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId },
    include: { minisite: true, User: true }
  });

  if (!supplier) {
    throw new Error("Tu cuenta no está vinculada a un perfil de proveedor.");
  }

  if (!supplier.productsEnabled) {
    throw new Error("Contacta al equipo de operaciones para activar productos.");
  }

  const approvedTours = await prisma.tour.count({
    where: { supplierId: supplier.id, status: "published" }
  });

  if (approvedTours === 0) {
    throw new Error("Necesitas al menos un tour publicado para generar un minisite.");
  }

  const brandName = clampString(formData.get("brandName"), 60) || supplier.company || "Proveedor Proactivitis";
  const logoUrl = clampString(formData.get("logoUrl"), 512) || undefined;
  const whatsapp = clampString(formData.get("whatsapp"), 32) || undefined;
  const phone = clampString(formData.get("phone"), 32) || undefined;
  const email = clampString(formData.get("email"), 100) || undefined;
  const bio = clampString(formData.get("bio"), BIO_LIMIT) || undefined;
  const themeId = parseThemeId(formData.get("themeId"));
  const slugValue = clampString(formData.get("slug"), 60);
  const isActive = parseBool(formData.get("isActive"));

  const baseSlug = slugify(slugValue || brandName || supplier.company || supplier.User?.name || supplier.id);
  const slug = baseSlug || slugify(supplier.id);

  const slugOwner = await prisma.supplierMinisite.findUnique({ where: { slug } });
  if (slugOwner && slugOwner.supplierId !== supplier.id) {
    throw new Error("Ese slug ya está en uso. Elige otro identificador.");
  }

  const data = {
    slug,
    brandName,
    logoUrl,
    whatsapp,
    phone,
    email,
    bio,
    themeId,
    isActive
  };

  if (supplier.minisite) {
    await prisma.supplierMinisite.update({
      where: { id: supplier.minisite.id },
      data
    });
  } else {
    await prisma.supplierMinisite.create({
      data: {
        id: randomUUID(),
        supplierId: supplier.id,
        ...data
      }
    });
  }

  revalidatePath("/supplier/minisites");
  revalidatePath(`/s/${slug}`);
  if (supplier.minisite?.slug && supplier.minisite.slug !== slug) {
    revalidatePath(`/s/${supplier.minisite.slug}`);
  }
}
