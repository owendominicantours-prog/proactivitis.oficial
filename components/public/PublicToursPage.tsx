import Link from "next/link";
import { logPrismaError, prisma } from "@/lib/prisma";
import {
  buildTourFilter,
  canonicalizeCountrySlug,
  getCountrySlugAliases,
  TourSearchParams
} from "@/lib/filterBuilder";
import { TourFilters } from "@/components/public/TourFilters";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { getTourReviewSummaryForTours } from "@/lib/tourReviews";
import type { DurationOption } from "@/components/public/TourFilters";
import type { Prisma } from "@prisma/client";
import { Locale, translate, type TranslationKey } from "@/lib/translations";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { ensureLeadingCapital } from "@/lib/text-format";
import { getActiveOfferPriceMapForTours } from "@/lib/offerPricing";
import { localizedCountryName, localizedDestinationName, localizedLocationText } from "@/lib/localizedPlaces";

const parseDurationMeta = (value?: string | null) => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      const { value: durationValue, unit } = parsed;
      if (typeof durationValue === "string" && durationValue.trim() && typeof unit === "string" && unit.trim()) {
        return { value: durationValue.trim(), unit: unit.trim() };
      }
    }
  } catch {
    // fall back to plain string
  }
  return null;
};

type CanonicalDurationUnit = "minute" | "hour" | "day" | "week" | "month";

const DURATION_UNIT_SYNONYMS = new Map<string, CanonicalDurationUnit>([
  ["min", "minute"],
  ["mins", "minute"],
  ["minute", "minute"],
  ["minutes", "minute"],
  ["minuto", "minute"],
  ["minutos", "minute"],
  ["heure", "hour"],
  ["heures", "hour"],
  ["hour", "hour"],
  ["hours", "hour"],
  ["hora", "hour"],
  ["horas", "hour"],
  ["jour", "day"],
  ["jours", "day"],
  ["day", "day"],
  ["days", "day"],
  ["dia", "day"],
  ["d\u00eda", "day"],
  ["dias", "day"],
  ["d\u00edas", "day"],
  ["week", "week"],
  ["weeks", "week"],
  ["semana", "week"],
  ["semanas", "week"],
  ["month", "month"],
  ["months", "month"],
  ["mes", "month"],
  ["meses", "month"]
]);

const DURATION_UNIT_LABELS: Record<Locale, Record<CanonicalDurationUnit, string>> = {
  es: {
    minute: "minutos",
    hour: "horas",
    day: "d\u00edas",
    week: "semanas",
    month: "meses"
  },
  en: {
    minute: "minutes",
    hour: "hours",
    day: "days",
    week: "weeks",
    month: "months"
  },
  fr: {
    minute: "minutes",
    hour: "heures",
    day: "jours",
    week: "semaines",
    month: "mois"
  }
};

const normalizeDurationUnit = (unit: string, locale: Locale) => {
  const key = DURATION_UNIT_SYNONYMS.get(unit.trim().toLowerCase());
  if (!key) return unit.trim();
  return DURATION_UNIT_LABELS[locale][key] ?? unit.trim();
};

const formatDurationLabel = (
  value: string | null | undefined,
  locale: Locale,
  t: (key: TranslationKey) => string
) => {
  const meta = parseDurationMeta(value);
  if (meta) {
    const unit = normalizeDurationUnit(meta.unit, locale);
    return `${meta.value} ${unit}`;
  }
  if (value && value.trim()) {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*(\D+)$/);
    if (match) {
      const unit = normalizeDurationUnit(match[2], locale);
      return `${match[1]} ${unit}`;
    }
    return normalizeDurationUnit(trimmed, locale);
  }
  return t("tour.card.duration.placeholder");
};

const buildDurationOptions = (
  values: (string | null)[],
  locale: Locale,
  t: (key: TranslationKey) => string
): DurationOption[] => {
  const map = new Map<string, string>();
  for (const value of values) {
    if (!value) continue;
    if (!map.has(value)) {
      map.set(value, formatDurationLabel(value, locale, t));
    }
  }
  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
};

const ensureDepartureDestinationIs = (where: Prisma.TourWhereInput) => {
  if (!where.departureDestination) {
    where.departureDestination = {};
  }
  if (!("is" in where.departureDestination)) {
    (where.departureDestination as Prisma.DestinationRelationFilter).is = {};
  }
  return (where.departureDestination as Prisma.DestinationRelationFilter).is as Prisma.DestinationWhereInput;
};

type Props = {
  searchParams?: Promise<TourSearchParams>;
  locale: Locale;
};

type CountryOption = Prisma.CountryGetPayload<{
  select: { name: true; slug: true };
}>;

type DestinationOption = Prisma.DestinationGetPayload<{
  select: {
    name: true;
    slug: true;
    country: { select: { slug: true; name: true } };
  };
}>;

type TourLanguageRow = Prisma.TourGetPayload<{
  select: { language: true };
}>;

type TourDurationRow = Prisma.TourGetPayload<{
  select: { duration: true };
}>;

const PUBLIC_TOUR_OPTION_WHERE: Prisma.TourWhereInput = {
  status: "published",
  slug: { not: "transfer-privado-proactivitis" }
};

const normalizeCountryOption = (country: CountryOption, locale: Locale): CountryOption => {
  const slug = canonicalizeCountrySlug(country.slug);
  return { ...country, name: localizedCountryName({ ...country, slug }, locale), slug };
};

const normalizeDestinationOption = (destination: DestinationOption, locale: Locale): DestinationOption => {
  const countrySlug = canonicalizeCountrySlug(destination.country.slug);
  return {
    ...destination,
    name: localizedDestinationName(destination, locale),
    country: {
      name: localizedCountryName({ ...destination.country, slug: countrySlug }, locale),
      slug: countrySlug
    }
  };
};

const dedupeBySlug = <T extends { slug: string }>(items: T[]) => {
  const bySlug = new Map<string, T>();
  for (const item of items) {
    if (!bySlug.has(item.slug)) bySlug.set(item.slug, item);
  }
  return Array.from(bySlug.values());
};

const dedupeDestinations = (items: DestinationOption[]) => {
  const byKey = new Map<string, DestinationOption>();
  for (const item of items) {
    const key = `${item.country.slug}:${item.slug}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return Array.from(byKey.values());
};

const PUNTA_CANA_LINKS = [
  { slug: "tour-en-buggy-en-punta-cana", labelKey: "puntaCana.links.item.1" },
  { slug: "excursion-en-buggy-y-atv-en-punta-cana", labelKey: "puntaCana.links.item.2" },
  { slug: "tour-isla-saona-desde-bayhibe-la-romana", labelKey: "puntaCana.links.item.3" },
  { slug: "tour-y-entrada-para-de-isla-saona-desde-punta-cana", labelKey: "puntaCana.links.item.4" },
  { slug: "sunset-catamaran-snorkel", labelKey: "puntaCana.links.item.5" },
  { slug: "parasailing-punta-cana", labelKey: "puntaCana.links.item.6" },
  { slug: "cayo-levantado-luxury-beach-day", labelKey: "puntaCana.links.item.7" },
  { slug: "excursion-de-un-dia-a-santo-domingo-desde-punta-cana", labelKey: "puntaCana.links.item.8" },
  { slug: "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana", labelKey: "puntaCana.links.item.9" },
  { slug: "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana", labelKey: "puntaCana.links.item.10" }
] as const;

const buildScopedToursCopy = ({
  locale,
  countryName,
  destinationName
}: {
  locale: Locale;
  countryName?: string | null;
  destinationName?: string | null;
}) => {
  const placeName = destinationName || countryName;
  if (!placeName) {
    return null;
  }

  if (locale === "en") {
    return {
      tagline: countryName ? "Tours by destination" : "Tours & Activities",
      title: destinationName ? `Tours and activities in ${destinationName}` : `${countryName} tours and activities`,
      description: destinationName
        ? `Compare curated experiences in ${destinationName} with clear prices, verified operators, and support before you book.`
        : `Explore tours across ${countryName} with clear pricing, practical details, and Proactivitis support from planning to confirmation.`,
      seoTitle: destinationName ? `Book verified tours in ${destinationName}` : `Verified tours and excursions in ${countryName}`,
      seoBody1: `Compare real activities in ${placeName} with prices, duration, languages, pickup details, and booking conditions in one place.`,
      seoBody2: "Each experience is reviewed so travelers can understand what is included, where it starts, and what happens after booking.",
      seoBody3: `Use filters to find adventure, culture, food, private options, family-friendly plans, or short activities in ${placeName}.`,
      seoBody4: "Proactivitis keeps the booking flow clear: visible prices, useful logistics, and support if plans change.",
      seoBody5: `This page is focused on ${placeName}, so results and destination suggestions stay aligned with the trip you are planning.`,
      listItem2: `${placeName} activities with clear pricing`,
      longformTitle: `Plan tours in ${placeName} with less friction`,
      longformBody1: `Travelers looking at ${placeName} need more than a catalog. They need to know which tour fits their schedule, who operates it, what is included, and how the reservation is confirmed.`,
      longformBody2: "That is why Proactivitis keeps every product structured with price, duration, pickup, meeting point, cancellation policy, and support details.",
      longformBody3: `You can compare options, save time, and choose experiences in ${placeName} without jumping between unrelated destinations.`,
      guideTitle: `How to choose an experience in ${placeName}`,
      guideBody1: "Start with the time you have available, then compare duration, pickup, and physical level before choosing the lowest price.",
      guideBody2: "For families or groups, check language, capacity, and whether the activity is private or shared.",
      guideBody3: `For a better trip in ${placeName}, combine one signature attraction with one relaxed local experience.`,
      destinationsHeading: destinationName ? `More zones near ${countryName}` : `Popular zones in ${countryName}`,
      destinationsFooter: `These destinations are connected to active Proactivitis tour pages for ${countryName}. Choose a zone to narrow your results.`
    };
  }

  if (locale === "fr") {
    return {
      tagline: countryName ? "Tours par destination" : "Tours & activites",
      title: destinationName ? `Tours et activites a ${destinationName}` : `Tours et activites en ${countryName}`,
      description: destinationName
        ? `Comparez des experiences selectionnees a ${destinationName} avec prix clairs, operateurs verifies et support avant reservation.`
        : `Explorez des tours en ${countryName} avec prix clairs, details pratiques et support Proactivitis jusqu'a la confirmation.`,
      seoTitle: destinationName ? `Reserver des tours verifies a ${destinationName}` : `Tours et excursions verifies en ${countryName}`,
      seoBody1: `Comparez des activites reelles a ${placeName} avec prix, duree, langues, prise en charge et conditions de reservation.`,
      seoBody2: "Chaque experience est organisee pour comprendre ce qui est inclus, ou elle commence et ce qui se passe apres la reservation.",
      seoBody3: `Utilisez les filtres pour trouver aventure, culture, gastronomie, options privees, plans famille ou activites courtes a ${placeName}.`,
      seoBody4: "Proactivitis garde un parcours clair: prix visibles, logistique utile et support si votre plan change.",
      seoBody5: `Cette page est centree sur ${placeName}; les resultats et suggestions restent donc alignes avec votre voyage.`,
      listItem2: `Activites a ${placeName} avec prix clairs`,
      longformTitle: `Planifier des tours a ${placeName} sans friction`,
      longformBody1: `Les voyageurs qui recherchent ${placeName} ont besoin de plus qu'un catalogue: horaire, operateur, inclusions et confirmation doivent etre clairs.`,
      longformBody2: "Proactivitis structure chaque produit avec prix, duree, prise en charge, point de rencontre, politique d'annulation et support.",
      longformBody3: `Vous pouvez comparer et choisir des experiences a ${placeName} sans passer par des destinations qui ne concernent pas votre voyage.`,
      guideTitle: `Comment choisir une experience a ${placeName}`,
      guideBody1: "Commencez par le temps disponible, puis comparez duree, prise en charge et niveau d'effort.",
      guideBody2: "Pour familles ou groupes, verifiez langue, capacite et si l'activite est privee ou partagee.",
      guideBody3: `Pour un meilleur voyage a ${placeName}, combinez une attraction principale avec une experience locale plus calme.`,
      destinationsHeading: destinationName ? `Autres zones en ${countryName}` : `Zones populaires en ${countryName}`,
      destinationsFooter: `Ces destinations sont reliees aux pages de tours actives de Proactivitis en ${countryName}.`
    };
  }

  return {
    tagline: countryName ? "Tours por destino" : "Tours y Actividades",
    title: destinationName ? `Tours y actividades en ${destinationName}` : `Tours y actividades en ${countryName}`,
    description: destinationName
      ? `Compara experiencias seleccionadas en ${destinationName} con precios claros, operadores verificados y soporte antes de reservar.`
      : `Explora tours en ${countryName} con precios claros, detalles utiles y soporte Proactivitis desde la planificacion hasta la confirmacion.`,
    seoTitle: destinationName ? `Reserva tours verificados en ${destinationName}` : `Tours y excursiones verificadas en ${countryName}`,
    seoBody1: `Compara actividades reales en ${placeName} con precio, duracion, idiomas, recogida y condiciones de reserva en un solo lugar.`,
    seoBody2: "Cada experiencia esta organizada para que entiendas que incluye, donde inicia y que pasa despues de reservar.",
    seoBody3: `Usa los filtros para encontrar aventura, cultura, gastronomia, opciones privadas, planes familiares o actividades cortas en ${placeName}.`,
    seoBody4: "Proactivitis mantiene el proceso claro: precios visibles, logistica util y soporte si tus planes cambian.",
    seoBody5: `Esta pagina esta enfocada en ${placeName}, por eso los resultados y sugerencias se mantienen alineados con tu viaje.`,
    listItem2: `Actividades en ${placeName} con precios claros`,
    longformTitle: `Planifica tours en ${placeName} sin perder tiempo`,
    longformBody1: `Cuando un viajero busca ${placeName}, necesita mas que una lista de tours. Necesita saber cual encaja con su horario, quien lo opera, que incluye y como se confirma la reserva.`,
    longformBody2: "Por eso Proactivitis organiza cada producto con precio, duracion, recogida, punto de encuentro, politica de cancelacion y soporte.",
    longformBody3: `Asi puedes comparar opciones y elegir experiencias en ${placeName} sin mezclar resultados de destinos que no forman parte de tu viaje.`,
    guideTitle: `Como elegir una experiencia en ${placeName}`,
    guideBody1: "Empieza por el tiempo disponible, luego compara duracion, recogida y nivel fisico antes de elegir solo por precio.",
    guideBody2: "Para familias o grupos, revisa idioma, capacidad y si la actividad es privada o compartida.",
    guideBody3: `Para un viaje mas completo en ${placeName}, combina una atraccion principal con una experiencia local relajada.`,
    destinationsHeading: destinationName ? `Mas zonas en ${countryName}` : `Zonas populares en ${countryName}`,
    destinationsFooter: `Estos destinos estan conectados a paginas activas de tours de Proactivitis en ${countryName}. Elige una zona para ajustar tus resultados.`
  };
};

type TourWithDeparture = Prisma.TourGetPayload<{
  include: {
    departureDestination: {
      include: { country: true };
    };
    country: true;
    destination: true;
    microZone: true;
    translations: {
      select: {
        locale: true;
        title: true;
        shortDescription: true;
        description: true;
      };
    };
  };
}>;

export default async function PublicToursPage({ searchParams, locale }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const params = resolvedSearchParams ?? {};
  const sort = (params.sort ?? "popular").trim();
  const puntaCanaHubHref = locale === "es" ? "/punta-cana/tours" : `/${locale}/punta-cana/tours`;
  const transfersHubHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const hotelsHubHref = locale === "es" ? "/hoteles" : `/${locale}/hotels`;
  const proDiscoveryToursHref =
    locale === "es" ? "/prodiscovery?dest=Republica%20Dominicana" : `/${locale}/prodiscovery?dest=Dominican%20Republic`;
  const premiumTransferHref =
    locale === "es"
      ? "/punta-cana/premium-transfer-services"
      : `/${locale}/punta-cana/premium-transfer-services`;
  const tourHref = (slug: string) => (locale === "es" ? `/tours/${slug}` : `/${locale}/tours/${slug}`);
  const sosuaPartyBoatHref = tourHref("party-boat-sosua");

  let countries: CountryOption[] = [];
  try {
    countries = await prisma.country.findMany({
      where: {
        OR: [
          { tours: { some: PUBLIC_TOUR_OPTION_WHERE } },
          { destinations: { some: { departureTours: { some: PUBLIC_TOUR_OPTION_WHERE } } } }
        ]
      },
      select: { name: true, slug: true }
    });
  } catch (error) {
    logPrismaError("loading countries", error);
  }
  countries = dedupeBySlug(countries.map((country) => normalizeCountryOption(country, locale))).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  let destinations: DestinationOption[] = [];
  try {
    destinations = await prisma.destination.findMany({
      where: {
        departureTours: {
          some: PUBLIC_TOUR_OPTION_WHERE
        }
      },
      select: {
        name: true,
        slug: true,
        country: { select: { slug: true, name: true } }
      }
    });
  } catch (error) {
    logPrismaError("loading destinations", error);
  }
  destinations = dedupeDestinations(destinations.map((destination) => normalizeDestinationOption(destination, locale))).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  let languagesRaw: TourLanguageRow[] = [];
  try {
    languagesRaw = await prisma.tour.findMany({
      where: PUBLIC_TOUR_OPTION_WHERE,
      select: { language: true }
    });
  } catch (error) {
    logPrismaError("loading languages", error);
  }

  let durationsRaw: TourDurationRow[] = [];
  try {
    durationsRaw = await prisma.tour.findMany({
      where: PUBLIC_TOUR_OPTION_WHERE,
      select: { duration: true }
    });
  } catch (error) {
    logPrismaError("loading durations", error);
  }

  const uniqueLanguages = Array.from(new Set(languagesRaw.map((entry) => entry.language).filter(Boolean)));
  const t = (key: TranslationKey, replacements?: Parameters<typeof translate>[2]) =>
    translate(locale, key, replacements);
  const durationOptions = buildDurationOptions(durationsRaw.map((entry) => entry.duration), locale, t);
  const durationLabelLookup = new Map(durationOptions.map((option) => [option.value, option.label]));

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | null)?.id ?? null;
  const preference = userId
    ? await prisma.customerPreference.findUnique({
        where: { userId },
        select: {
          preferredCountries: true,
          preferredDestinations: true,
          preferredProductTypes: true,
          completedAt: true,
          discountEligible: true,
          discountRedeemedAt: true
        }
      })
    : null;
  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const preferredTypes = (preference?.preferredProductTypes as string[] | undefined) ?? [];
  const applyPreferences =
    preference?.completedAt &&
    !params.country &&
    !params.destination &&
    (preferredTypes.length === 0 || preferredTypes.includes("tours") || preferredTypes.includes("combos"));
  const discountPercent =
    preference?.discountEligible && !preference?.discountRedeemedAt ? 10 : 0;

  const where = {
    ...buildTourFilter(params),
    slug: { not: "transfer-privado-proactivitis" }
  } as Prisma.TourWhereInput;

  if (applyPreferences && (preferredCountries.length || preferredDestinations.length)) {
    const destinationIs = ensureDepartureDestinationIs(where);
    const preferredCountrySlugs = Array.from(new Set(preferredCountries.flatMap((slug) => getCountrySlugAliases(slug))));
    if (preferredCountrySlugs.length) {
      destinationIs.country = { slug: { in: preferredCountrySlugs } };
    }
    if (preferredDestinations.length) {
      destinationIs.slug = { in: preferredDestinations };
    }
  }

  let tours: TourWithDeparture[] = [];
  try {
    tours = await prisma.tour.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        departureDestination: {
          include: { country: true }
        },
        country: true,
        destination: true,
        microZone: true,
        translations: {
          where: { locale },
          select: {
            locale: true,
            title: true,
            shortDescription: true,
            description: true
          }
        }
      },
      take: 24
    });
  } catch (error) {
    logPrismaError("loading tours", error);
    console.error("Tour query failed", { where, error });
  }

  const activeCountrySlug = params.country ? canonicalizeCountrySlug(params.country) : null;
  const activeDestinationOption = params.destination
    ? destinations.find((destination) => destination.slug === params.destination)
    : null;
  const activeCountryOption = activeCountrySlug
    ? countries.find((country) => country.slug === activeCountrySlug)
    : activeDestinationOption
      ? countries.find((country) => country.slug === activeDestinationOption.country.slug)
      : null;
  const scopedCountryName =
    activeDestinationOption?.country.name ??
    activeCountryOption?.name ??
    (params.country ? localizedCountryName({ slug: params.country }, locale) : null);
  const scopedDestinationName =
    activeDestinationOption?.name ??
    (params.destination ? localizedDestinationName({ slug: params.destination }, locale) : null);
  const scopedCopy = buildScopedToursCopy({
    locale,
    countryName: scopedCountryName,
    destinationName: activeDestinationOption ? scopedDestinationName : null
  });
  const destinationCards = (
    activeDestinationOption
      ? destinations.filter((destination) => destination.country.slug === activeDestinationOption.country.slug)
      : activeCountrySlug
        ? destinations.filter((destination) => destination.country.slug === activeCountrySlug)
        : destinations
  ).slice(0, 6);
  const showPuntaCanaLinks =
    !scopedCopy || activeCountrySlug === "dominican-republic" || activeDestinationOption?.country.slug === "dominican-republic";
  const activeCountryValue = params.country
    ? activeCountryOption?.name ?? localizedCountryName({ slug: params.country }, locale)
    : null;
  const activeDestinationValue = params.destination
    ? scopedDestinationName
    : null;
  const activeFilters = [
    activeCountryValue && t("tours.filter.active.country", { value: activeCountryValue }),
    activeDestinationValue && t("tours.filter.active.destination", { value: activeDestinationValue }),
    params.language && t("tours.filter.active.language", { value: params.language }),
    params.duration &&
      t("tours.filter.active.duration", {
        value: durationLabelLookup.get(params.duration) ?? params.duration
      }),
    params.minPrice && t("tours.filter.active.minPrice", { value: params.minPrice }),
    params.maxPrice && t("tours.filter.active.maxPrice", { value: params.maxPrice })
  ].filter(Boolean);

  const featureKeys: TranslationKey[] = [
    "tours.features.instant",
    "tours.features.flexible",
    "tours.features.support"
  ];

  const pluralSuffix = tours.length === 1 ? "" : "s";
  const resultsLabel = t("tours.results.count", { count: tours.length, plural: pluralSuffix });
  const reviewSummary = await getTourReviewSummaryForTours(tours.map((tour) => tour.id));
  const offerPriceMap = await getActiveOfferPriceMapForTours(
    tours.map((tour) => ({ id: tour.id, price: tour.price }))
  );
  const toursSorted = tours
    .map((tour, index) => ({ tour, index }))
    .sort((a, b) => {
      if (sort === "price-low") return a.tour.price - b.tour.price || a.index - b.index;
      if (sort === "price-high") return b.tour.price - a.tour.price || a.index - b.index;
      if (sort === "newest") return b.index - a.index;
      const countA = reviewSummary[a.tour.id]?.count ?? 0;
      const countB = reviewSummary[b.tour.id]?.count ?? 0;
      if (countA !== countB) return countB - countA;
      return a.index - b.index;
    })
    .map(({ tour }) => tour);
  const toursHubPath = locale === "es" ? "/tours" : `/${locale}/tours`;
  const toursHubUrl = `${PROACTIVITIS_URL}${toursHubPath}`;
  const listItemSchema = toursSorted.slice(0, 24).map((tour, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${PROACTIVITIS_URL}${locale === "es" ? "" : `/${locale}`}/tours/${tour.slug}`,
    name: ensureLeadingCapital(tour.translations?.[0]?.title ?? tour.title)
  }));
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: scopedCopy?.title ?? t("tours.header.title"),
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: listItemSchema.length,
    itemListElement: listItemSchema
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : locale === "en" ? "Home" : "Accueil",
        item: `${PROACTIVITIS_URL}${locale === "es" ? "/" : `/${locale}`}`
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "fr" ? "Excursions" : "Tours",
        item: toursHubUrl
      }
    ]
  };

  return (
    <div className="travel-surface pb-16">
      <StructuredData data={itemListSchema} />
      <StructuredData data={breadcrumbSchema} />
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
              {scopedCopy?.tagline ?? t("tours.header.tagline")}
            </p>
            <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
              {scopedCopy?.title ?? t("tours.header.title")}
            </h1>
            <p className="text-base text-slate-600">{scopedCopy?.description ?? t("tours.header.description")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={showPuntaCanaLinks ? puntaCanaHubHref : toursHubPath}
                className="rounded-full bg-brand px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm shadow-brand/30"
              >
                {showPuntaCanaLinks
                  ? t("tours.puntaCanaHub.cta")
                  : locale === "es"
                    ? "Ver todos los tours"
                    : locale === "fr"
                      ? "Voir tous les tours"
                      : "See all tours"}
              </Link>
              <Link
                href={transfersHubHref}
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
              >
                {locale === "es" ? "Traslados" : locale === "en" ? "Transfers" : "Transferts"}
              </Link>
              <Link
                href={hotelsHubHref}
                className="rounded-full border border-slate-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
              >
                {locale === "es" ? "Hoteles" : "Hotels"}
              </Link>
              {showPuntaCanaLinks ? (
                <Link
                  href={premiumTransferHref}
                  className="rounded-full border border-amber-300 bg-amber-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 transition hover:bg-amber-100"
                >
                  {locale === "es" ? "Transfer VIP" : locale === "en" ? "VIP Transfer" : "Transfert VIP"}
                </Link>
              ) : null}
              <Link
                href={proDiscoveryToursHref}
                className="rounded-full border border-sky-300 bg-sky-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-800 transition hover:bg-sky-100"
              >
                {locale === "es" ? "Comparar en ProDiscovery" : locale === "fr" ? "Comparer dans ProDiscovery" : "Compare on ProDiscovery"}
              </Link>
            </div>
            <TrustBadges locale={locale} compact className="pt-2" />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6">
            <TourFilters
              countries={countries}
              destinations={destinations.map((dest) => ({
                name: dest.name,
                slug: dest.slug,
                countrySlug: dest.country.slug
              }))}
              languages={uniqueLanguages}
              durations={durationOptions}
              mobileFriendly
              categories={["Aventura", "Cultura", "Gastronomía", "Privados", "Acuáticos"]}
            />
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">{t("tours.filter.intro")}</p>
              <ul className="space-y-1">
                <li>{t("tours.filter.item.category")}</li>
                <li>{t("tours.filter.item.destination")}</li>
                <li>{t("tours.filter.item.duration")}</li>
                <li>{t("tours.filter.item.group")}</li>
              </ul>
            </div>
          </aside>
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 text-sm font-medium text-slate-700 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
                {featureKeys.map((key) => (
                  <span key={key} className="flex items-center gap-2">
                    <span className="text-emerald-500">✅</span>
                    {t(key)}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
                    {locale === "es" ? "Resultados disponibles" : locale === "fr" ? "Resultats disponibles" : "Available results"}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">{resultsLabel}</p>
                  {activeFilters.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeFilters.map((label) => (
                        <span key={label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {locale === "es"
                        ? "Usa los filtros para comparar destinos, precios, idiomas y duraciones."
                        : locale === "fr"
                          ? "Utilisez les filtres pour comparer destinations, prix, langues et durees."
                          : "Use filters to compare destinations, pricing, languages, and durations."}
                    </p>
                  )}
                </div>

                <form className="flex flex-wrap items-center gap-3" method="get">
                  {params.country ? <input type="hidden" name="country" value={params.country} /> : null}
                  {params.destination ? <input type="hidden" name="destination" value={params.destination} /> : null}
                  {params.language ? <input type="hidden" name="language" value={params.language} /> : null}
                  {params.duration ? <input type="hidden" name="duration" value={params.duration} /> : null}
                  {params.minPrice ? <input type="hidden" name="minPrice" value={params.minPrice} /> : null}
                  {params.maxPrice ? <input type="hidden" name="maxPrice" value={params.maxPrice} /> : null}
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {locale === "es" ? "Orden" : locale === "fr" ? "Tri" : "Sort"}
                  </label>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                  >
                    <option value="popular">{locale === "es" ? "Más reservados" : locale === "fr" ? "Plus reserves" : "Most booked"}</option>
                    <option value="price-low">{locale === "es" ? "Precio más bajo" : locale === "fr" ? "Prix le plus bas" : "Lowest price"}</option>
                    <option value="price-high">{locale === "es" ? "Precio más alto" : locale === "fr" ? "Prix le plus eleve" : "Highest price"}</option>
                    <option value="newest">{locale === "es" ? "Más nuevos" : locale === "fr" ? "Plus recents" : "Newest"}</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    {locale === "es" ? "Aplicar" : locale === "fr" ? "Appliquer" : "Apply"}
                  </button>
                </form>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {toursSorted.map((tour) => {
                const translation = tour.translations?.[0];
                const localizedTitle = ensureLeadingCapital(translation?.title ?? tour.title);
                const tourPath = locale === "es" ? `/tours/${tour.slug}` : `/${locale}/tours/${tour.slug}`;
                const verifiedText = t("tour.card.verifiedLabel");
                const fromLabel = t("tour.card.fromLabel");
                const languagesLabel = t("tour.card.language.label");
                const languageFallback = t("tour.card.language.fallback");
                const languageValue = tour.language?.trim() ? tour.language : languageFallback;
                const reviewCount = reviewSummary[tour.id]?.count ?? 0;
                const reviewAverage = reviewSummary[tour.id]?.average ?? 0;
                const reviewsLabel = t("tour.hero.reviewsCount", { count: reviewCount });
                const preferencePrice = discountPercent > 0 ? tour.price * (1 - discountPercent / 100) : tour.price;
                const offer = offerPriceMap.get(tour.id);
                const effectivePrice =
                  typeof offer?.finalPrice === "number" ? Math.min(preferencePrice, offer.finalPrice) : preferencePrice;
                const hasDiscount = effectivePrice < tour.price;
                const discountLabel = offer
                  ? offer.discountType === "PERCENT"
                    ? `-${Math.round(offer.discountValue)}% oferta`
                    : `-${Math.round(offer.discountValue)} USD oferta`
                  : discountPercent > 0
                    ? `-${discountPercent}%`
                    : null;

                return (
                  <Link
                    key={tour.slug}
                    href={tourPath}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative h-44 w-full overflow-hidden rounded-t-2xl bg-slate-200">
                      <DynamicImage
                        src={tour.heroImage ?? "/fototours/fototour.jpeg"}
                        alt={localizedTitle}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 px-4 py-4">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                        <span>
                          {tour.departureDestination
                            ? localizedDestinationName(tour.departureDestination, locale)
                            : localizedLocationText(tour.location, locale)}
                        </span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-600">
                          {verifiedText}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-2">{localizedTitle}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {fromLabel}{" "}
                          <span className={`text-base font-black ${hasDiscount ? "text-emerald-600" : "text-indigo-600"}`}>
                            ${effectivePrice.toFixed(0)}
                          </span>
                          {hasDiscount && (
                            <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                              {discountLabel}
                            </span>
                          )}
                        </span>
                        {hasDiscount ? (
                          <span className="text-xs text-slate-400 line-through">${tour.price.toFixed(0)} USD</span>
                        ) : null}
                        <span className="text-xs text-slate-500">{formatDurationLabel(tour.duration, locale, t)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {languagesLabel}: {languageValue}
                        </span>
                        {reviewCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                            <span aria-hidden>★</span>
                            {reviewAverage.toFixed(1)}
                            <span className="text-slate-400">{reviewsLabel}</span>
                          </span>
                        ) : (
                          <span>{reviewsLabel}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {tours.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                {t("tours.no-results")}
              </div>
            )}

            <details className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow-sm">
              <summary className="cursor-pointer list-none text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                {locale === "es" ? "Guía y enlaces de búsqueda" : locale === "fr" ? "Guide et liens de recherche" : "Search guide and destination links"}
              </summary>
              <div className="mt-5 space-y-5">
                {showPuntaCanaLinks ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                      {t("puntaCana.links.subtitle")}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">{t("puntaCana.links.title")}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {PUNTA_CANA_LINKS.map((item) => (
                        <Link
                          key={item.slug}
                          href={tourHref(item.slug)}
                          className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white"
                        >
                          {t(item.labelKey)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                    {t("tours.seo.label")}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{scopedCopy?.seoTitle ?? t("tours.seo.title")}</h2>
                  <div className="mt-3 space-y-3">
                    <p>{scopedCopy?.seoBody1 ?? t("tours.seo.body1")}</p>
                    <p>{scopedCopy?.seoBody2 ?? t("tours.seo.body2")}</p>
                    <p>{scopedCopy?.seoBody3 ?? t("tours.seo.body3")}</p>
                    <p>{scopedCopy?.seoBody4 ?? t("tours.seo.body4")}</p>
                    <p>{scopedCopy?.seoBody5 ?? t("tours.seo.body5")}</p>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                      {t("tours.seo.list.label")}
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>{t("tours.seo.list.item1")}</li>
                      <li>{scopedCopy?.listItem2 ?? t("tours.seo.list.item2")}</li>
                      <li>{t("tours.seo.list.item3")}</li>
                      <li>{t("tours.seo.list.item4")}</li>
                    </ul>
                  </div>
                  {showPuntaCanaLinks ? (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700">
                      {locale === "es"
                        ? "Recomendado en costa norte"
                        : locale === "en"
                          ? "North coast top pick"
                          : "Choix top cote nord"}
                    </p>
                    <Link
                      href={sosuaPartyBoatHref}
                      className="mt-2 inline-block text-sm font-semibold text-emerald-800 underline underline-offset-2"
                    >
                      {locale === "es"
                        ? "Sosua Party Boat: precios, open bar y opcion privada"
                        : locale === "en"
                          ? "Sosua Party Boat: prices, open bar, and private option"
                          : "Sosua Party Boat : prix, open bar et option privee"}
                    </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </details>
          </section>
        </div>
      </main>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("tours.longform.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {scopedCopy?.longformTitle ?? t("tours.longform.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{scopedCopy?.longformBody1 ?? t("tours.longform.body1")}</p>
            <p>{scopedCopy?.longformBody2 ?? t("tours.longform.body2")}</p>
            <p>{scopedCopy?.longformBody3 ?? t("tours.longform.body3")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("tours.longform2.eyebrow")}
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {scopedCopy?.guideTitle ?? t("tours.longform2.title")}
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-600">
            <p>{scopedCopy?.guideBody1 ?? t("tours.longform2.body1")}</p>
            <p>{scopedCopy?.guideBody2 ?? t("tours.longform2.body2")}</p>
            <p>{scopedCopy?.guideBody3 ?? t("tours.longform2.body3")}</p>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              {t("tours.destinations.label")}
            </p>
            <h2 className="text-3xl font-semibold text-slate-900">
              {scopedCopy?.destinationsHeading ?? t("tours.destinations.heading")}
            </h2>
          </div>
          <Link
            href={locale === "es" ? "/destinations" : `/${locale}/destinations`}
            className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900"
          >
            {t("tours.destinations.cta")}
          </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinationCards.map((dest) => (
              <Link
                key={dest.slug}
                href={`${locale === "es" ? "" : `/${locale}`}/destinations/${dest.country.slug}/${dest.slug}`}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-sky-500 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {locale === "es" ? "Desde" : locale === "fr" ? "Depuis" : "From"} {dest.country.name}
                </div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{dest.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {locale === "es"
                    ? "Explora tours y experiencias conectadas con esta zona."
                    : locale === "fr"
                      ? "Explorez les excursions et experiences liees a cette zone."
                      : "Explore tours and experiences connected to this area."}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-sky-600">
                  {locale === "es" ? "Ver tours" : locale === "fr" ? "Voir les excursions" : "See tours"}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-500">{scopedCopy?.destinationsFooter ?? t("tours.destinations.footer")}</p>
        </div>
      </section>
    </div>
  );
}

