import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");

type Locale = "es" | "en" | "fr";

const COPY = {
  es: {
    subtitle: "Excursion organizada con asistencia local y confirmacion inmediata",
    short: (title: string, duration: string, location: string) =>
      `${title}. ${duration} con salida desde ${location}, operacion coordinada y soporte local antes y durante la actividad.`,
    p1: (title: string, location: string) =>
      `${title} esta pensada para viajeros que quieren una experiencia clara, bien coordinada y sin improvisaciones en ${location}.`,
    p2: (duration: string, pickup: string) =>
      `La operacion se ejecuta con tiempos definidos (${duration}) y ${pickup}, para que tengas control total de tu agenda de viaje.`,
    p3: (includes: string, requirements: string) =>
      `Incluye ${includes}. Antes de reservar, revisa requisitos clave: ${requirements}.`,
    p4: (policy: string, price: number) =>
      `Reserva desde USD ${Math.round(price)} con politica de servicio transparente: ${policy}.`
  },
  en: {
    subtitle: "Structured excursion with local support and instant confirmation",
    short: (title: string, duration: string, location: string) =>
      `${title}. ${duration} from ${location} with coordinated operations and local support before and during the experience.`,
    p1: (title: string, location: string) =>
      `${title} is designed for travelers who want a reliable, well-organized experience in ${location}.`,
    p2: (duration: string, pickup: string) =>
      `The operation follows a defined timeline (${duration}) and ${pickup}, so your travel schedule stays under control.`,
    p3: (includes: string, requirements: string) =>
      `It includes ${includes}. Before booking, review the key requirements: ${requirements}.`,
    p4: (policy: string, price: number) =>
      `Book from USD ${Math.round(price)} with a transparent service policy: ${policy}.`
  },
  fr: {
    subtitle: "Excursion organisee avec assistance locale et confirmation immediate",
    short: (title: string, duration: string, location: string) =>
      `${title}. ${duration} depuis ${location} avec une operation encadree et une assistance locale avant et pendant l activite.`,
    p1: (title: string, location: string) =>
      `${title} est concue pour les voyageurs qui recherchent une experience fluide, claire et bien organisee a ${location}.`,
    p2: (duration: string, pickup: string) =>
      `Le service suit un planning defini (${duration}) et ${pickup}, pour garder le controle de votre programme de voyage.`,
    p3: (includes: string, requirements: string) =>
      `Le service inclut ${includes}. Avant de reserver, verifiez les conditions principales : ${requirements}.`,
    p4: (policy: string, price: number) =>
      `Reservez a partir de USD ${Math.round(price)} avec une politique de service transparente : ${policy}.`
  }
} as const;

function normalize(value?: string | null): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function extractBaseSlug(adminNote?: string | null): string | null {
  if (!adminNote) return null;
  const match = adminNote.match(/based_on:([^\s]+)/i);
  return match?.[1]?.trim() ?? null;
}

function firstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const cleaned = normalize(value);
    if (cleaned) return cleaned;
  }
  return "";
}

function buildLongDescription(
  locale: Locale,
  title: string,
  location: string,
  duration: string,
  pickup: string,
  includes: string,
  requirements: string,
  policy: string,
  price: number
): string {
  const c = COPY[locale];
  return [c.p1(title, location), c.p2(duration, pickup), c.p3(includes, requirements), c.p4(policy, price)].join("\n\n");
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
      duration: true,
      location: true,
      includes: true,
      pickup: true,
      requirements: true,
      cancellationPolicy: true,
      price: true,
      adminNote: true
    }
  });

  const baseSlugs = Array.from(new Set(seoTours.map((tour) => extractBaseSlug(tour.adminNote)).filter(Boolean))) as string[];
  const baseTours = await prisma.tour.findMany({
    where: { slug: { in: baseSlugs } },
    select: {
      id: true,
      slug: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      duration: true,
      location: true,
      includes: true,
      pickup: true,
      requirements: true,
      cancellationPolicy: true
    }
  });
  const baseBySlug = new Map(baseTours.map((tour) => [tour.slug, tour]));

  const translations = await prisma.tourTranslation.findMany({
    where: {
      OR: [{ tourId: { in: seoTours.map((tour) => tour.id) } }, { tourId: { in: baseTours.map((tour) => tour.id) } }]
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

  const byTourLocale = new Map<string, (typeof translations)[number]>();
  const seoTranslations = new Map<string, (typeof translations)[number][]>();
  for (const row of translations) {
    byTourLocale.set(`${row.tourId}:${row.locale}`, row);
    const list = seoTranslations.get(row.tourId) ?? [];
    if (seoTours.some((tour) => tour.id === row.tourId)) {
      list.push(row);
      seoTranslations.set(row.tourId, list);
    }
  }

  let updatedTours = 0;
  let updatedTranslations = 0;

  for (const seoTour of seoTours) {
    const baseSlug = extractBaseSlug(seoTour.adminNote);
    const baseTour = baseSlug ? baseBySlug.get(baseSlug) : null;

    const locale: Locale = "es";
    const location = firstNonEmpty(baseTour?.location, seoTour.location, "Punta Cana");
    const duration = firstNonEmpty(baseTour?.duration, seoTour.duration, "Duracion variable");
    const pickup = firstNonEmpty(baseTour?.pickup, seoTour.pickup, "recogida en hotel segun disponibilidad");
    const includes = firstNonEmpty(baseTour?.includes, seoTour.includes, "asistencia operativa");
    const requirements = firstNonEmpty(baseTour?.requirements, seoTour.requirements, "documento de viaje y datos de reserva");
    const policy = firstNonEmpty(
      baseTour?.cancellationPolicy,
      seoTour.cancellationPolicy,
      "confirmacion sujeta a disponibilidad y condiciones operativas"
    );

    const newSubtitle = firstNonEmpty(baseTour?.subtitle, seoTour.subtitle, COPY[locale].subtitle);
    const newShort = COPY[locale].short(seoTour.title, duration, location);
    const newLong = buildLongDescription(
      locale,
      seoTour.title,
      location,
      duration,
      pickup,
      includes,
      requirements,
      policy,
      seoTour.price
    );

    if (
      normalize(seoTour.subtitle) !== normalize(newSubtitle) ||
      normalize(seoTour.shortDescription) !== normalize(newShort) ||
      normalize(seoTour.description) !== normalize(newLong)
    ) {
      updatedTours += 1;
      if (!DRY_RUN) {
        await prisma.tour.update({
          where: { id: seoTour.id },
          data: {
            subtitle: newSubtitle,
            shortDescription: newShort,
            description: newLong
          }
        });
      }
    }

    const currentTrRows = seoTranslations.get(seoTour.id) ?? [];
    for (const tr of currentTrRows) {
      const trLocale = (tr.locale === "en" || tr.locale === "fr" ? tr.locale : "es") as Locale;
      const baseTr = baseTour ? byTourLocale.get(`${baseTour.id}:${tr.locale}`) : null;

      const trSubtitle = firstNonEmpty(baseTr?.subtitle, COPY[trLocale].subtitle);
      const trShort = COPY[trLocale].short(seoTour.title, duration, location);
      const trLong = buildLongDescription(
        trLocale,
        seoTour.title,
        location,
        duration,
        pickup,
        includes,
        requirements,
        policy,
        seoTour.price
      );

      if (
        normalize(tr.subtitle) !== normalize(trSubtitle) ||
        normalize(tr.shortDescription) !== normalize(trShort) ||
        normalize(tr.description) !== normalize(trLong)
      ) {
        updatedTranslations += 1;
        if (!DRY_RUN) {
          await prisma.tourTranslation.update({
            where: { id: tr.id },
            data: {
              subtitle: trSubtitle,
              shortDescription: trShort,
              description: trLong
            }
          });
        }
      }
    }
  }

  console.log(`[rewrite_seo_only] ${DRY_RUN ? "dry-run" : "applied"} | tours:${updatedTours} | translations:${updatedTranslations}`);
}

main()
  .catch((error) => {
    console.error("[rewrite_seo_only] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
