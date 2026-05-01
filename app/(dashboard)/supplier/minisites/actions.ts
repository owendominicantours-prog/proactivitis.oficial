"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitized, slugify } from "@/lib/supplierTours";

const THEME_IDS = [1, 2, 3, 4, 5];
const BIO_LIMIT = 400;
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "checkout",
  "dashboard",
  "login",
  "supplier",
  "support",
  "transfer",
  "tours"
]);

function clampString(value: unknown, limit: number) {
  return sanitized(value).slice(0, limit);
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

function cleanPublicUrl(value: unknown) {
  const rawValue = clampString(value, 512);
  if (!rawValue) return undefined;
  if (rawValue.startsWith("/") && !rawValue.startsWith("//")) return rawValue;
  try {
    const url = new URL(rawValue);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function cleanPhone(value: unknown) {
  const rawValue = clampString(value, 32);
  const cleaned = rawValue.replace(/[^\d+()\-\s]/g, "").trim();
  return cleaned.length >= 7 ? cleaned : undefined;
}

function cleanEmail(value: unknown) {
  const email = clampString(value, 100).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined;
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
  const logoUrl = cleanPublicUrl(formData.get("logoUrl"));
  const whatsapp = cleanPhone(formData.get("whatsapp"));
  const phone = cleanPhone(formData.get("phone"));
  const email = cleanEmail(formData.get("email"));
  const bio = clampString(formData.get("bio"), BIO_LIMIT) || undefined;
  const themeId = parseThemeId(formData.get("themeId"));
  const slugValue = clampString(formData.get("slug"), 60);
  const isActive = parseBool(formData.get("isActive"));

  const baseSlug = slugify(slugValue || brandName || supplier.company || supplier.User?.name || supplier.id);
  const slug = baseSlug || slugify(supplier.id);
  if (RESERVED_SLUGS.has(slug) || slug.length < 3) {
    throw new Error("Ese identificador no está disponible. Elige otro más específico.");
  }

  const slugOwner = await prisma.supplierMinisite.findUnique({ where: { slug } });
  if (slugOwner && slugOwner.supplierId !== supplier.id) {
    throw new Error("Ese identificador ya está en uso. Elige otro.");
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
