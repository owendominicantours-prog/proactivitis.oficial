import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { localizedDestinationName } from "@/lib/localizedPlaces";
import { getProDiscoveryGroupTitleStore, resolveProDiscoveryGroupTitle } from "@/lib/prodiscoveryGroupTitles";
import type { Locale } from "@/lib/translations";

export type ProDiscoveryDominicanIdea = {
  slug: string;
  title: string;
  description: string;
  image: string;
  category: string;
  destination: string;
  groupAngle: string;
};

const fallbackImage = "/fototours/fotosimple.jpg";

const groupAngleFor = (category: string | null | undefined, locale: Locale) => {
  const text = (category ?? "").toLowerCase();
  if (text.includes("isla") || text.includes("playa") || text.includes("agua")) {
    return locale === "en"
      ? "Works well for private beach days and celebration groups"
      : locale === "fr"
        ? "Ideal pour journees plage privees et groupes de celebration"
        : "Funciona bien para dias privados de playa y grupos de celebracion";
  }
  if (text.includes("cultura") || text.includes("ciudad")) {
    return locale === "en"
      ? "Good base for guided city routes and incentive groups"
      : locale === "fr"
        ? "Bonne base pour routes guidees et groupes incentive"
        : "Buena base para rutas guiadas y grupos de incentivo";
  }
  if (text.includes("aventura") || text.includes("buggy") || text.includes("atv")) {
    return locale === "en"
      ? "Can be adapted for active groups with private timing"
      : locale === "fr"
        ? "Adaptable aux groupes actifs avec horaires prives"
        : "Se puede adaptar para grupos activos con horarios privados";
  }
  return locale === "en"
    ? "A starting point for a custom Dominican Republic group plan"
    : locale === "fr"
      ? "Un point de depart pour un voyage groupe sur mesure"
      : "Un punto de partida para un viaje grupal a medida en Republica Dominicana";
};

const cleanDescription = (value: string | null | undefined, locale: Locale) => {
  const fallback =
    locale === "en"
      ? "Use this as inspiration for a private group itinerary with guide, transport and timing adapted to your people."
      : locale === "fr"
        ? "Utilisez ceci comme inspiration pour un itineraire prive avec guide, transport et horaires adaptes."
        : "Usa esta idea como inspiracion para un itinerario privado con guia, transporte y tiempos adaptados a tu grupo.";
  return (value ?? fallback).replace(/\s+/g, " ").trim().slice(0, 170);
};

const tourSearchText = (tour: {
  slug: string;
  title: string;
  location: string;
  destination?: { name: string | null; slug: string } | null;
  departureDestination?: { name: string | null; slug: string } | null;
}) =>
  [
    tour.slug,
    tour.title,
    tour.location,
    tour.destination?.name,
    tour.destination?.slug,
    tour.departureDestination?.name,
    tour.departureDestination?.slug
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isSantoDomingoTour = (tour: {
  slug: string;
  title: string;
  location: string;
  destination?: { name: string | null; slug: string } | null;
  departureDestination?: { name: string | null; slug: string } | null;
}) => tourSearchText(tour).includes("santo domingo");

const santoDomingoPriority = (tour: {
  slug: string;
  title: string;
  location: string;
  status?: string;
  destination?: { name: string | null; slug: string } | null;
  departureDestination?: { name: string | null; slug: string } | null;
}) => {
  const text = tourSearchText(tour);
  const hasSantoDomingo = text.includes("santo domingo");
  const hasPuntaCana = text.includes("punta cana") || text.includes("punta-cana");
  const isPublished = tour.status === "published";
  if (hasSantoDomingo && hasPuntaCana && isPublished) return 0;
  if (hasSantoDomingo && hasPuntaCana) return 1;
  if (hasSantoDomingo && isPublished) return 2;
  if (hasSantoDomingo) return 3;
  return 4;
};

export async function getDominicanGroupIdeas(locale: Locale, limit = 6): Promise<ProDiscoveryDominicanIdea[]> {
  const baseWhere: Prisma.TourWhereInput = {
      status: { in: ["published", "seo_only"] },
      slug: { not: HIDDEN_TRANSFER_SLUG },
      OR: [
        { countryId: { in: ["RD", "DO"] } },
        { country: { slug: { in: ["republica-dominicana", "dominican-republic", "dominican-republic-rd"] } } }
      ]
  };
  const select = {
    slug: true,
    title: true,
    shortDescription: true,
    description: true,
    heroImage: true,
    gallery: true,
    category: true,
    location: true,
    status: true,
    destination: { select: { name: true, slug: true } },
    departureDestination: { select: { name: true, slug: true } }
  } satisfies Prisma.TourSelect;

  const [generalTours, santoDomingoTours, titleStore] = await Promise.all([
    prisma.tour.findMany({
      where: baseWhere,
      select,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: Math.max(limit * 8, 48)
    }),
    prisma.tour.findMany({
      where: {
        AND: [
          baseWhere,
          {
            OR: [
              { slug: { contains: "santo-domingo" } },
              { title: { contains: "Santo Domingo" } },
              { location: { contains: "Santo Domingo" } },
              { category: { contains: "Santo Domingo" } },
              { shortDescription: { contains: "Santo Domingo" } },
              { description: { contains: "Santo Domingo" } }
            ]
          }
        ]
      },
      select,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: Math.max(12, Math.ceil(limit / 2))
    }),
    getProDiscoveryGroupTitleStore()
  ]);

  const featuredSantoDomingo = [...santoDomingoTours, ...generalTours.filter(isSantoDomingoTour)].sort(
    (a, b) => santoDomingoPriority(a) - santoDomingoPriority(b)
  )[0];
  const generalWithoutSantoDomingo = generalTours.filter((tour) => !isSantoDomingoTour(tour));
  const tours = featuredSantoDomingo ? [featuredSantoDomingo, ...generalWithoutSantoDomingo] : generalTours;

  const seen = new Set<string>();
  return tours
    .filter((tour) => {
      if (seen.has(tour.slug)) return false;
      seen.add(tour.slug);
      return true;
    })
    .slice(0, limit)
    .map((tour) => {
      const destination = tour.departureDestination ?? tour.destination;
      const destinationLabel = destination ? localizedDestinationName(destination, locale) : tour.location;
      const gallery = tour.gallery
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return {
        slug: tour.slug,
        title: resolveProDiscoveryGroupTitle(
          {
            slug: tour.slug,
            title: tour.title,
            category: tour.category,
            destination: destinationLabel,
            location: tour.location
          },
          locale,
          titleStore,
          "cardTitle"
        ),
        description: cleanDescription(tour.shortDescription ?? tour.description, locale),
        image: tour.heroImage ?? gallery?.[0] ?? fallbackImage,
        category: tour.category ?? "Experiencia privada",
        destination: destinationLabel,
        groupAngle: groupAngleFor(tour.category, locale)
      };
    });
}
