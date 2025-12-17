import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export type CreateAgencyProLinkInput = {
  agencyUserId: string;
  tourId: string;
  price: number;
  note?: string | null;
};

export async function createAgencyProLinkRecord(input: CreateAgencyProLinkInput) {
  const tour = await prisma.tour.findUnique({
    where: { id: input.tourId },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true
    }
  });
  if (!tour) {
    throw new Error("Tour no encontrado.");
  }
  if (input.price < tour.price) {
    throw new Error("El precio AgencyPro debe ser igual o mayor al precio base.");
  }
  const markup = input.price - tour.price;
  const slug = `${slugify(tour.title)}-${input.agencyUserId.slice(0, 6)}-${randomUUID().split("-")[0]}`;
  const link = await prisma.agencyProLink.create({
    data: {
      slug,
      tourId: tour.id,
      agencyUserId: input.agencyUserId,
      price: input.price,
      basePrice: tour.price,
      markup,
      note: input.note?.trim() ?? null
    }
  });
  return {
    slug: link.slug,
    url: `${APP_BASE_URL}/agency-pro/${link.slug}`
  };
}

export async function findAgencyProLinkBySlug(slug: string) {
  return prisma.agencyProLink.findUnique({
    where: { slug },
    include: {
      Tour: {
        include: {
          SupplierProfile: true
        }
      },
      AgencyUser: {
        include: {
          AgencyProfile: true
        }
      }
    }
  });
}
