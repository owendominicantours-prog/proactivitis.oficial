import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");

const BLOCKED_PATTERNS = [
  /\bseo\b/i,
  /keyword objetivo/i,
  /intencion de busqueda/i,
  /estrategia/i,
  /conversion/i,
  /esta variante/i,
  /source:viator_like/i,
  /based_on:/i
];

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function sanitizeCopy(raw?: string | null): string {
  const base = normalizeWhitespace(raw ?? "");
  if (!base) return "";

  const cleaned = base
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !BLOCKED_PATTERNS.some((pattern) => pattern.test(sentence)))
    .join(" ");

  return normalizeWhitespace(cleaned);
}

function fallbackShortFromDescription(description: string): string {
  if (!description) return "";
  if (description.length <= 180) return description;
  return `${description.slice(0, 177).trimEnd()}...`;
}

function getBaseSlug(adminNote?: string | null): string | null {
  if (!adminNote) return null;
  const match = adminNote.match(/based_on:([^\s]+)/i);
  return match?.[1]?.trim() ?? null;
}

async function main() {
  const seoTours = await prisma.tour.findMany({
    where: { status: "seo_only" },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      adminNote: true
    }
  });

  const baseSlugs = Array.from(
    new Set(
      seoTours
        .map((tour) => getBaseSlug(tour.adminNote))
        .filter((slug): slug is string => Boolean(slug))
    )
  );

  const baseTours = await prisma.tour.findMany({
    where: { slug: { in: baseSlugs } },
    select: {
      id: true,
      slug: true,
      subtitle: true,
      shortDescription: true,
      description: true
    }
  });
  const baseBySlug = new Map(baseTours.map((tour) => [tour.slug, tour]));

  const allTranslations = await prisma.tourTranslation.findMany({
    where: {
      OR: [{ tourId: { in: seoTours.map((t) => t.id) } }, { tourId: { in: baseTours.map((t) => t.id) } }]
    },
    select: {
      id: true,
      tourId: true,
      locale: true,
      subtitle: true,
      shortDescription: true,
      description: true
    }
  });

  const seoTranslationsByTour = new Map<string, typeof allTranslations>();
  const baseTranslationsByTourLocale = new Map<string, (typeof allTranslations)[number]>();

  for (const row of allTranslations) {
    if (seoTours.some((t) => t.id === row.tourId)) {
      const list = seoTranslationsByTour.get(row.tourId) ?? [];
      list.push(row);
      seoTranslationsByTour.set(row.tourId, list);
    }
    baseTranslationsByTourLocale.set(`${row.tourId}:${row.locale}`, row);
  }

  let touchedTours = 0;
  let touchedTranslations = 0;

  for (const seoTour of seoTours) {
    const baseSlug = getBaseSlug(seoTour.adminNote);
    const baseTour = baseSlug ? baseBySlug.get(baseSlug) : null;

    const baseLong = sanitizeCopy(baseTour?.description);
    const baseShort = sanitizeCopy(baseTour?.shortDescription);
    const baseSubtitle = sanitizeCopy(baseTour?.subtitle);

    const ownLong = sanitizeCopy(seoTour.description);
    const ownShort = sanitizeCopy(seoTour.shortDescription);
    const ownSubtitle = sanitizeCopy(seoTour.subtitle);

    const nextDescription = baseLong || ownLong;
    const nextShortDescription = baseShort || ownShort || fallbackShortFromDescription(nextDescription);
    const nextSubtitle = baseSubtitle || ownSubtitle || null;

    const tourNeedsUpdate =
      normalizeWhitespace(seoTour.description) !== nextDescription ||
      normalizeWhitespace(seoTour.shortDescription ?? "") !== nextShortDescription ||
      normalizeWhitespace(seoTour.subtitle ?? "") !== (nextSubtitle ?? "");

    if (tourNeedsUpdate) {
      touchedTours += 1;
      if (!DRY_RUN) {
        await prisma.tour.update({
          where: { id: seoTour.id },
          data: {
            description: nextDescription,
            shortDescription: nextShortDescription,
            subtitle: nextSubtitle
          }
        });
      }
    }

    const seoTranslations = seoTranslationsByTour.get(seoTour.id) ?? [];
    for (const translation of seoTranslations) {
      const baseTranslation = baseTour
        ? baseTranslationsByTourLocale.get(`${baseTour.id}:${translation.locale}`)
        : null;

      const trLong = sanitizeCopy(baseTranslation?.description) || sanitizeCopy(translation.description) || nextDescription;
      const trShort =
        sanitizeCopy(baseTranslation?.shortDescription) ||
        sanitizeCopy(translation.shortDescription) ||
        fallbackShortFromDescription(trLong);
      const trSubtitle =
        sanitizeCopy(baseTranslation?.subtitle) || sanitizeCopy(translation.subtitle) || nextSubtitle || null;

      const translationNeedsUpdate =
        normalizeWhitespace(translation.description ?? "") !== trLong ||
        normalizeWhitespace(translation.shortDescription ?? "") !== trShort ||
        normalizeWhitespace(translation.subtitle ?? "") !== (trSubtitle ?? "");

      if (translationNeedsUpdate) {
        touchedTranslations += 1;
        if (!DRY_RUN) {
          await prisma.tourTranslation.update({
            where: { id: translation.id },
            data: {
              description: trLong,
              shortDescription: trShort,
              subtitle: trSubtitle
            }
          });
        }
      }
    }
  }

  console.log(
    `[seo_only_descriptions] ${DRY_RUN ? "dry-run" : "applied"} | tours: ${touchedTours} | translations: ${touchedTranslations}`
  );
}

main()
  .catch((error) => {
    console.error("[seo_only_descriptions] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

