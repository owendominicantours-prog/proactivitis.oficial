import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const DOMINICAN_REPUBLIC_COUNTRY_SLUGS = [
  "dominican-republic",
  "dominican-republic-rd",
  "republica-dominicana"
];

const FIELD_LIMITS: Partial<
  Record<
    | "title"
    | "shortDescription"
    | "description"
    | "includes"
    | "meetingPoint"
    | "meetingInstructions"
    | "requirements"
    | "terms"
    | "pickupNotes",
    number
  >
> = {
  title: 120,
  shortDescription: 300,
  description: 1200,
  includes: 1000,
  meetingPoint: 200,
  meetingInstructions: 800,
  requirements: 600,
  terms: 600,
  pickupNotes: 400
};

const clampText = (value: string, limit?: number) => {
  if (!limit) return value;
  return value.length <= limit ? value : value.slice(0, limit);
};

export const sanitized = (value: unknown, key?: keyof typeof FIELD_LIMITS) => {
  if (typeof value !== "string") return "";
  return clampText(value.trim(), key ? FIELD_LIMITS[key] : undefined);
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const getCountrySlugAliases = (value?: string | null) => {
  if (!value) return [];
  const slug = slugify(value);
  if (!slug) return [];
  return DOMINICAN_REPUBLIC_COUNTRY_SLUGS.includes(slug) ? DOMINICAN_REPUBLIC_COUNTRY_SLUGS : [slug];
};

export async function ensureCountryByCode(code: string, name?: string) {
  const upperCode = code.toUpperCase();
  return prisma.country.upsert({
    where: { code: upperCode },
    update: { name: name ?? upperCode, code: upperCode },
    create: {
      id: randomUUID(),
      name: name ?? upperCode,
      slug: slugify(name ?? upperCode),
      code: upperCode
    }
  });
}

export async function resolveDestination(countryInput?: string | null, destinationInput?: string | null) {
  if (!destinationInput) return null;

  const destName = destinationInput.trim();
  if (!destName) return null;

  const destSlug = slugify(destName);
  const countryName = countryInput?.trim();
  const countrySlug = countryName ? slugify(countryName) : null;
  const countrySlugAliases = getCountrySlugAliases(countryName);

  const destinationFilter: any = {
    OR: [
      { id: destName },
      { slug: destSlug },
      { name: { equals: destName, mode: "insensitive" } }
    ]
  };
  if (countrySlugAliases.length) {
    destinationFilter.country = { slug: { in: countrySlugAliases } };
  }

  const existingDestination = await prisma.destination.findFirst({
    where: destinationFilter,
    include: {
      country: {
        select: { code: true }
      }
    },
    orderBy: { name: "asc" }
  });

  if (existingDestination) {
    return {
      destinationId: existingDestination.id,
      countryCode: existingDestination.country.code
    };
  }

  let countryId: string | undefined;
  let countryRecord: { code: string } | undefined;
  if (countrySlug) {
    const existingCountry = await prisma.country.findFirst({
      where: {
        OR: [
          { id: countryName },
          { slug: { in: countrySlugAliases.length ? countrySlugAliases : [countrySlug] } },
          { name: { equals: countryName ?? countrySlug, mode: "insensitive" } }
        ]
      },
      select: { id: true, code: true }
    });
    if (existingCountry) {
      countryId = existingCountry.id;
      countryRecord = existingCountry;
    }
  }

  if (countrySlug && !countryId) {
    const code = countrySlug.toUpperCase();
    const country = await prisma.country.upsert({
      where: { slug: countrySlug },
      update: { name: countryName ?? countrySlug, code },
      create: {
        id: randomUUID(),
        name: countryName ?? countrySlug,
        slug: countrySlug,
        code
      }
    });
    countryId = country.id;
    countryRecord = country;
  }

  const destination = await prisma.destination.upsert({
    where: { slug: destSlug },
    update: {
      name: destName,
      ...(countryId ? { countryId } : {})
    },
    create: {
      id: randomUUID(),
      name: destName,
      slug: destSlug,
      countryId:
        countryId ??
        (
          await prisma.country.upsert({
            where: { slug: "global" },
            update: {},
            create: { id: randomUUID(), name: "Global", slug: "global", code: "GL" }
          })
        ).id
    }
  });

  return {
    destinationId: destination.id,
    countryCode: countryRecord?.code
  };
}
