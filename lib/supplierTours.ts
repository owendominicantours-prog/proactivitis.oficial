import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

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

  let countryId: string | undefined;
  let countryRecord: { code: string } | undefined;
  if (countrySlug) {
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
