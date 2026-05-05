import Link from "next/link";
import { TransferLocationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";
import type { HotelLandingOverrides } from "@/lib/siteContent";
import StructuredData from "@/components/schema/StructuredData";

type DirectorySearchParams = Record<string, string | string[] | undefined>;
type HotelDirectoryEnrichment = {
  officialUrl?: string;
  coverImage?: string;
  shortDescription?: string;
  seoTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
};

type HotelCardInfo = {
  slug: string;
  name: string;
  heroImage: string | null;
  description: string;
  zoneName: string;
  zoneId: string;
  propertyType: "hotel" | "resort" | "apartment" | "villa";
  propertyTypeLabel: string;
  experienceTags: string[];
  amenities: string[];
  transferPrice: number | null;
  transferHref: string;
  price: number | null;
  rating: number;
  reviews: number;
  stars: number;
  badges: string[];
  roomsLeft: number;
};

const copy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
    zoneLabel: string;
    zoneAll: string;
    sortLabel: string;
    sortRecommended: string;
    sortPriceLow: string;
    sortPriceHigh: string;
    sortRating: string;
    applyFilters: string;
    clearFilters: string;
    resultsLabel: string;
    noResultsTitle: string;
    noResultsBody: string;
    fromLabel: string;
    perNight: string;
    reviewLabel: string;
    quoteCta: string;
    pageLabel: string;
    prevPage: string;
    nextPage: string;
    trustedTitle: string;
    trustedBody: string;
    selectedAreaLabel: string;
    selectedSortLabel: string;
    availableNowLabel: string;
    leftLabel: string;
    starLabel: string;
    smartChoiceLabel: string;
    consultRateLabel: string;
    propertyLabel: string;
    propertyAll: string;
    propertyHotel: string;
    propertyResort: string;
    propertyApartment: string;
    propertyVilla: string;
    experienceLabel: string;
    experienceAll: string;
    experienceFamily: string;
    experienceAdults: string;
    experienceAllInclusive: string;
    experienceBeachfront: string;
    experienceLuxury: string;
    heroEyebrow: string;
    heroPrimary: string;
    heroSecondary: string;
    heroTrust1: string;
    heroTrust2: string;
    heroTrust3: string;
    featuredTitle: string;
    featuredSubtitle: string;
  }
> = {
  es: {
    title: "Alojamiento en Punta Cana",
    subtitle:
      "Explora hoteles todo incluido y resorts premium. Filtra por zona, compara opciones y solicita cotizacion en minutos.",
    cta: "Ver hotel",
    searchPlaceholder: "Buscar hotel o zona",
    zoneLabel: "Zona",
    zoneAll: "Todas las zonas",
    sortLabel: "Orden",
    sortRecommended: "Recomendados",
    sortPriceLow: "Precio mas bajo",
    sortPriceHigh: "Precio mas alto",
    sortRating: "Mejor valorados",
    applyFilters: "Aplicar",
    clearFilters: "Limpiar",
    resultsLabel: "resultados",
    noResultsTitle: "No encontramos hoteles con esos filtros",
    noResultsBody: "Prueba otra zona o limpia los filtros para ver todos los hoteles.",
    fromLabel: "Desde",
    perNight: "por noche",
    reviewLabel: "resenas verificadas",
    quoteCta: "Solicitar cotizacion",
    pageLabel: "Pagina",
    prevPage: "Anterior",
    nextPage: "Siguiente",
    trustedTitle: "Reserva con asistencia real",
    trustedBody: "Confirmacion rapida, soporte 24/7 y ayuda para combinar hotel + traslado + tours.",
    selectedAreaLabel: "Zona seleccionada",
    selectedSortLabel: "Orden actual",
    availableNowLabel: "Disponible hoy",
    leftLabel: "habitaciones restantes",
    starLabel: "estrellas",
    smartChoiceLabel: "Eleccion inteligente",
    consultRateLabel: "Consultar tarifa",
    propertyLabel: "Tipo",
    propertyAll: "Todos los alojamientos",
    propertyHotel: "Hoteles",
    propertyResort: "Resorts",
    propertyApartment: "Apartamentos",
    propertyVilla: "Casas vacacionales",
    experienceLabel: "Experiencia",
    experienceAll: "Todas las experiencias",
    experienceFamily: "Familiar",
    experienceAdults: "Solo adultos",
    experienceAllInclusive: "Todo incluido",
    experienceBeachfront: "Frente a la playa",
    experienceLuxury: "Lujo",
    heroEyebrow: "Hoteles, resorts y estancias verificadas",
    heroPrimary: "Cotizar alojamiento",
    heroSecondary: "Explorar por zona",
    heroTrust1: "Tarifas consultadas con asistencia humana",
    heroTrust2: "Traslado y tours conectados a tu estadia",
    heroTrust3: "Hoteles, apartamentos y villas en un mismo flujo",
    featuredTitle: "Alojamientos destacados",
    featuredSubtitle: "Opciones con mejor balance entre zona, experiencia y facilidad para reservar."
  },
  en: {
    title: "Accommodation in Punta Cana",
    subtitle:
      "Explore all-inclusive resorts and premium stays. Filter by area, compare options, and request a quote in minutes.",
    cta: "View hotel",
    searchPlaceholder: "Search hotel or area",
    zoneLabel: "Area",
    zoneAll: "All areas",
    sortLabel: "Sort",
    sortRecommended: "Recommended",
    sortPriceLow: "Price lowest",
    sortPriceHigh: "Price highest",
    sortRating: "Top rated",
    applyFilters: "Apply",
    clearFilters: "Clear",
    resultsLabel: "results",
    noResultsTitle: "No hotels match your filters",
    noResultsBody: "Try a different area or clear filters to view all hotels.",
    fromLabel: "From",
    perNight: "per night",
    reviewLabel: "verified reviews",
    quoteCta: "Request quote",
    pageLabel: "Page",
    prevPage: "Previous",
    nextPage: "Next",
    trustedTitle: "Book with real local support",
    trustedBody: "Fast confirmation, 24/7 support, and help to bundle hotel + transfers + tours.",
    selectedAreaLabel: "Selected area",
    selectedSortLabel: "Current sort",
    availableNowLabel: "Available now",
    leftLabel: "rooms left",
    starLabel: "stars",
    smartChoiceLabel: "Smart choice",
    consultRateLabel: "Check rate",
    propertyLabel: "Type",
    propertyAll: "All stays",
    propertyHotel: "Hotels",
    propertyResort: "Resorts",
    propertyApartment: "Apartments",
    propertyVilla: "Vacation homes",
    experienceLabel: "Experience",
    experienceAll: "All experiences",
    experienceFamily: "Family",
    experienceAdults: "Adults only",
    experienceAllInclusive: "All-inclusive",
    experienceBeachfront: "Beachfront",
    experienceLuxury: "Luxury",
    heroEyebrow: "Hotels, resorts and verified stays",
    heroPrimary: "Request a stay quote",
    heroSecondary: "Explore by area",
    heroTrust1: "Rates checked with human support",
    heroTrust2: "Transfers and tours connected to your stay",
    heroTrust3: "Hotels, apartments and villas in one flow",
    featuredTitle: "Featured stays",
    featuredSubtitle: "Options with strong balance between area, experience and booking convenience."
  },
  fr: {
    title: "Hebergement a Punta Cana",
    subtitle:
      "Explorez des resorts tout inclus et des hebergements premium. Filtrez par zone, comparez et demandez un devis rapidement.",
    cta: "Voir hotel",
    searchPlaceholder: "Rechercher hotel ou zone",
    zoneLabel: "Zone",
    zoneAll: "Toutes les zones",
    sortLabel: "Tri",
    sortRecommended: "Recommandes",
    sortPriceLow: "Prix le plus bas",
    sortPriceHigh: "Prix le plus eleve",
    sortRating: "Mieux notes",
    applyFilters: "Appliquer",
    clearFilters: "Effacer",
    resultsLabel: "resultats",
    noResultsTitle: "Aucun hotel ne correspond a vos filtres",
    noResultsBody: "Essayez une autre zone ou effacez les filtres pour tout voir.",
    fromLabel: "A partir de",
    perNight: "par nuit",
    reviewLabel: "avis verifies",
    quoteCta: "Demander un devis",
    pageLabel: "Page",
    prevPage: "Precedent",
    nextPage: "Suivant",
    trustedTitle: "Reservation avec assistance reelle",
    trustedBody: "Confirmation rapide, support 24/7 et aide pour combiner hotel + transferts + tours.",
    selectedAreaLabel: "Zone selectionnee",
    selectedSortLabel: "Tri actuel",
    availableNowLabel: "Disponible maintenant",
    leftLabel: "chambres restantes",
    starLabel: "etoiles",
    smartChoiceLabel: "Choix intelligent",
    consultRateLabel: "Demander tarif",
    propertyLabel: "Type",
    propertyAll: "Tous les hebergements",
    propertyHotel: "Hotels",
    propertyResort: "Resorts",
    propertyApartment: "Appartements",
    propertyVilla: "Maisons de vacances",
    experienceLabel: "Experience",
    experienceAll: "Toutes experiences",
    experienceFamily: "Famille",
    experienceAdults: "Adultes seulement",
    experienceAllInclusive: "Tout compris",
    experienceBeachfront: "Front de mer",
    experienceLuxury: "Luxe",
    heroEyebrow: "Hotels, resorts et sejours verifies",
    heroPrimary: "Demander un devis",
    heroSecondary: "Explorer par zone",
    heroTrust1: "Tarifs verifies avec support humain",
    heroTrust2: "Transferts et excursions connectes au sejour",
    heroTrust3: "Hotels, appartements et villas dans un seul flux",
    featuredTitle: "Hebergements recommandes",
    featuredSubtitle: "Options avec bon equilibre entre zone, experience et facilite de reservation."
  }
};

const getHotelHref = (slug: string, locale: Locale) => {
  if (locale === "es") return `/hoteles/${slug}`;
  return `/${locale}/hotels/${slug}`;
};

const getDirectoryHref = (locale: Locale) => {
  if (locale === "es") return "/hoteles";
  return `/${locale}/hotels`;
};

const firstParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getReviewScore = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Number((4.2 + (sum % 8) / 10).toFixed(1));
};

const getReviewCount = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 80 + (sum % 230);
};

const getStars = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4 + (sum % 2);
};

const getRoomsLeft = (name: string) => {
  const sum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 2 + (sum % 7);
};

const getPropertyType = (name: string): HotelCardInfo["propertyType"] => {
  const text = name.toLowerCase();
  if (text.includes("villa") || text.includes("residence") || text.includes("casa")) return "villa";
  if (text.includes("apartment") || text.includes("apartamento") || text.includes("condo")) return "apartment";
  if (text.includes("resort") || text.includes("riu") || text.includes("bahia") || text.includes("dreams")) return "resort";
  return "hotel";
};

const getPropertyTypeLabel = (type: HotelCardInfo["propertyType"], locale: Locale) => {
  const labels: Record<Locale, Record<HotelCardInfo["propertyType"], string>> = {
    es: { hotel: "Hotel", resort: "Resort", apartment: "Apartamento", villa: "Casa vacacional" },
    en: { hotel: "Hotel", resort: "Resort", apartment: "Apartment", villa: "Vacation home" },
    fr: { hotel: "Hotel", resort: "Resort", apartment: "Appartement", villa: "Maison de vacances" }
  };
  return labels[locale][type];
};

const getExperienceTags = (input: string) => {
  const text = input.toLowerCase();
  const tags = new Set<string>();
  if (/(family|familia|kids|ninos|children|club infantil|teen)/.test(text)) tags.add("family");
  if (/(adults only|solo adultos|adultes|ambar|breathless|secrets)/.test(text)) tags.add("adults");
  if (/(all inclusive|todo incluido|tout inclus|resort|riu|bahia|majestic|dreams)/.test(text)) tags.add("all-inclusive");
  if (/(beach|playa|front|ocean|mar|costa|beachfront)/.test(text)) tags.add("beachfront");
  if (/(luxury|lujo|luxe|vip|premium|palace|majestic|finest|excellence|sanctuary)/.test(text)) tags.add("luxury");
  if (!tags.size) tags.add("family");
  return Array.from(tags);
};

const getExperienceLabel = (tag: string, locale: Locale) => {
  const labels: Record<Locale, Record<string, string>> = {
    es: {
      family: "Familiar",
      adults: "Solo adultos",
      "all-inclusive": "Todo incluido",
      beachfront: "Frente a playa",
      luxury: "Lujo"
    },
    en: {
      family: "Family",
      adults: "Adults only",
      "all-inclusive": "All-inclusive",
      beachfront: "Beachfront",
      luxury: "Luxury"
    },
    fr: {
      family: "Famille",
      adults: "Adultes",
      "all-inclusive": "Tout compris",
      beachfront: "Front de mer",
      luxury: "Luxe"
    }
  };
  return labels[locale][tag] ?? tag;
};

const safeText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
};

const parseUsdPrice = (value: unknown) => {
  const text = safeText(value);
  if (!text) return null;
  const normalized = text.replace(/[^0-9.]/g, "");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.round(parsed);
};

const cleanText = (value: unknown) => safeText(value).replace(/\s+/g, " ").trim();

const shortenText = (value: unknown, max = 160) => {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  if (cleaned.length <= max) return cleaned;
  const trimmed = cleaned.slice(0, max);
  const lastSpace = trimmed.lastIndexOf(" ");
  const end = lastSpace > 70 ? lastSpace : max;
  return `${trimmed.slice(0, end)}...`;
};

const firstSentence = (value: unknown) => {
  const cleaned = cleanText(value);
  if (!cleaned) return "";
  const match = cleaned.match(/^[^.!?]+[.!?]?/);
  return match?.[0] ?? cleaned;
};

const coverStyleFromSlug = (slug: string) => {
  const hash = slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const x = 30 + (hash % 40);
  const y = 30 + ((hash * 7) % 40);
  const hue = hash % 360;
  return {
    objectPosition: `${x}% ${y}%`,
    overlay: `linear-gradient(120deg, hsla(${hue}, 70%, 45%, 0.26), hsla(${(hue + 80) % 360}, 70%, 30%, 0.18))`
  };
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return "https://proactivitis.com/transfer/mini van.png";
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `https://proactivitis.com${normalized}`;
};

const buildBadges = (zoneName: string, rating: number, reviews: number, locale: Locale) => {
  const dictionary: Record<Locale, { top: string; cancel: string; transfer: string; area: string }> = {
    es: {
      top: "Top vendido",
      cancel: "Cancelacion flexible",
      transfer: "Traslado disponible",
      area: `Zona ${zoneName}`
    },
    en: {
      top: "Top seller",
      cancel: "Flexible cancellation",
      transfer: "Transfer available",
      area: `${zoneName} area`
    },
    fr: {
      top: "Meilleure vente",
      cancel: "Annulation flexible",
      transfer: "Transfert disponible",
      area: `Zone ${zoneName}`
    }
  };

  const base = [dictionary[locale].transfer, dictionary[locale].cancel, dictionary[locale].area];
  if (rating >= 4.8 || reviews > 250) {
    return [dictionary[locale].top, ...base].slice(0, 3);
  }
  return base;
};

type TransferPriceRow = {
  price: number;
  route: { zoneAId: string; zoneBId: string };
  vehicle: { maxPax: number; active: boolean };
};

type TransferOverrideRow = {
  price: number;
  originLocationId: string | null;
  destinationLocationId: string | null;
  vehicle: { maxPax: number; active: boolean };
};

const getRouteKey = (a: string, b: string) => [a, b].sort().join("::");

const buildTransferPriceMap = (
  airportZoneId: string | null,
  routePrices: TransferPriceRow[],
  overrides: TransferOverrideRow[]
) => {
  const zonePriceMap = new Map<string, number>();
  const hotelPriceMap = new Map<string, number>();

  if (airportZoneId) {
    routePrices
      .filter((row) => row.vehicle.active && row.vehicle.maxPax >= 2)
      .forEach((row) => {
        const otherZone =
          row.route.zoneAId === airportZoneId
            ? row.route.zoneBId
            : row.route.zoneBId === airportZoneId
              ? row.route.zoneAId
              : null;
        if (!otherZone) return;
        const key = getRouteKey(airportZoneId, otherZone);
        const current = zonePriceMap.get(key);
        if (current == null || row.price < current) zonePriceMap.set(key, Math.round(row.price));
      });
  }

  overrides
    .filter((row) => row.vehicle.active && row.vehicle.maxPax >= 2)
    .forEach((row) => {
      const locationId = row.destinationLocationId ?? row.originLocationId;
      if (!locationId) return;
      const current = hotelPriceMap.get(locationId);
      if (current == null || row.price < current) hotelPriceMap.set(locationId, Math.round(row.price));
    });

  return { zonePriceMap, hotelPriceMap };
};

export default async function HotelsDirectoryPage({
  locale,
  searchParams
}: {
  locale: Locale;
  searchParams?: Promise<DirectorySearchParams>;
}) {
  const [hotels, hotelLandingSetting, enrichmentSetting] = await Promise.all([
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { id: true, slug: true, name: true, heroImage: true, description: true, zoneId: true, zone: { select: { name: true } } },
      orderBy: { name: "asc" }
    }),
    prisma.siteContentSetting.findUnique({ where: { key: "HOTEL_LANDING" }, select: { content: true } }),
    prisma.siteContentSetting.findUnique({
      where: { key: "HOTEL_DIRECTORY_ENRICHMENT" },
      select: { content: true }
    })
  ]);

  const hotelLandingContent =
    (hotelLandingSetting?.content as Record<string, Partial<Record<Locale, HotelLandingOverrides>>> | null) ?? {};
  const enrichmentContent =
    (enrichmentSetting?.content as Record<string, HotelDirectoryEnrichment | undefined> | null) ?? {};

  const t = copy[locale];
  const toursHref = locale === "es" ? "/tours" : `/${locale}/tours`;
  const transfersHref = locale === "es" ? "/traslado" : `/${locale}/traslado`;
  const premiumTransferHref =
    locale === "es"
      ? "/punta-cana/premium-transfer-services"
      : `/${locale}/punta-cana/premium-transfer-services`;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = (firstParamValue(resolvedSearchParams?.q) ?? "").trim();
  const zone = (firstParamValue(resolvedSearchParams?.zone) ?? "").trim();
  const propertyType = (firstParamValue(resolvedSearchParams?.type) ?? "").trim();
  const experience = (firstParamValue(resolvedSearchParams?.experience) ?? "").trim();
  const sort = (firstParamValue(resolvedSearchParams?.sort) ?? "recommended").trim();
  const pageRaw = Number(firstParamValue(resolvedSearchParams?.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const zones = Array.from(new Set(hotels.map((hotel) => hotel.zone?.name).filter(Boolean))).sort();
  const hotelIds = hotels.map((hotel) => hotel.id);
  const hotelZoneIds = Array.from(new Set(hotels.map((hotel) => hotel.zoneId).filter(Boolean)));
  const primaryAirport = await prisma.transferLocation.findFirst({
    where: { type: TransferLocationType.AIRPORT, active: true, slug: "puj-airport" },
    select: { zoneId: true }
  });
  const [routePriceRows, overrideRows] = primaryAirport
    ? await Promise.all([
        prisma.transferRoutePrice.findMany({
          where: {
            route: {
              active: true,
              OR: [
                { zoneAId: primaryAirport.zoneId, zoneBId: { in: hotelZoneIds } },
                { zoneBId: primaryAirport.zoneId, zoneAId: { in: hotelZoneIds } }
              ]
            },
            vehicle: { active: true }
          },
          select: {
            price: true,
            route: { select: { zoneAId: true, zoneBId: true } },
            vehicle: { select: { maxPax: true, active: true } }
          }
        }),
        prisma.transferRoutePriceOverride.findMany({
          where: {
            OR: [{ destinationLocationId: { in: hotelIds } }, { originLocationId: { in: hotelIds } }],
            vehicle: { active: true }
          },
          select: {
            price: true,
            originLocationId: true,
            destinationLocationId: true,
            vehicle: { select: { maxPax: true, active: true } }
          }
        })
      ])
    : [[], []];
  const { zonePriceMap, hotelPriceMap } = buildTransferPriceMap(primaryAirport?.zoneId ?? null, routePriceRows, overrideRows);

  const hotelCards: HotelCardInfo[] = hotels.map((hotel) => {
    const zoneName = hotel.zone?.name ?? "Punta Cana";
    const localizedLanding = hotelLandingContent[hotel.slug]?.[locale];
    const fallbackLanding =
      hotelLandingContent[hotel.slug]?.es ??
      hotelLandingContent[hotel.slug]?.en ??
      hotelLandingContent[hotel.slug]?.fr;
    const price = parseUsdPrice(localizedLanding?.priceFromUSD) ?? parseUsdPrice(fallbackLanding?.priceFromUSD);
    const rating = getReviewScore(hotel.name);
    const reviews = getReviewCount(hotel.name);
    const detectedType = getPropertyType(hotel.name);
    const localizedDescription = firstSentence(localizedLanding?.description1);
    const enrichment = enrichmentContent[hotel.slug];
    const resolvedHeroImage =
      cleanText(localizedLanding?.heroImage) ||
      cleanText(fallbackLanding?.heroImage) ||
      cleanText(enrichment?.coverImage) ||
      cleanText(hotel.heroImage);
    const descriptionSource =
      enrichment?.shortDescription ||
      localizedDescription ||
      hotel.description ||
      `${hotel.name} in ${zoneName} with all-inclusive options and direct quote support.`;
    const amenities = (localizedLanding?.amenities ?? fallbackLanding?.amenities ?? []).filter(Boolean);
    const experienceTags = getExperienceTags(
      [hotel.name, zoneName, descriptionSource, amenities.join(" ")].filter(Boolean).join(" ")
    );
    const routePriceKey = primaryAirport ? getRouteKey(primaryAirport.zoneId, hotel.zoneId) : "";
    const transferPrice = hotelPriceMap.get(hotel.id) ?? zonePriceMap.get(routePriceKey) ?? null;
    return {
      slug: hotel.slug,
      name: hotel.name,
      heroImage: resolvedHeroImage || null,
      description: shortenText(descriptionSource, 140),
      zoneName,
      zoneId: hotel.zoneId,
      propertyType: detectedType,
      propertyTypeLabel: getPropertyTypeLabel(detectedType, locale),
      experienceTags,
      amenities,
      transferPrice,
      transferHref: `${transfersHref}?origin=PUJ&to=${hotel.slug}`,
      price,
      rating,
      reviews,
      stars: getStars(hotel.name),
      badges: buildBadges(zoneName, rating, reviews, locale),
      roomsLeft: getRoomsLeft(hotel.name)
    };
  });

  const filteredHotels = hotelCards.filter((hotel) => {
    const matchesQuery =
      q.length === 0 ||
      hotel.name.toLowerCase().includes(q.toLowerCase()) ||
      hotel.zoneName.toLowerCase().includes(q.toLowerCase());
    const matchesZone = zone.length === 0 || hotel.zoneName === zone;
    const matchesType = propertyType.length === 0 || hotel.propertyType === propertyType;
    const matchesExperience = experience.length === 0 || hotel.experienceTags.includes(experience);
    return matchesQuery && matchesZone && matchesType && matchesExperience;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    const safePriceA = a.price ?? Number.POSITIVE_INFINITY;
    const safePriceB = b.price ?? Number.POSITIVE_INFINITY;
    if (sort === "price-asc") return safePriceA - safePriceB;
    if (sort === "price-desc") return safePriceB - safePriceA;
    if (sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    const pricePenaltyA = a.price ? a.price / 80 : 2.6;
    const pricePenaltyB = b.price ? b.price / 80 : 2.6;
    const aScore = a.rating * 10 + a.reviews / 25 - pricePenaltyA;
    const bScore = b.rating * 10 + b.reviews / 25 - pricePenaltyB;
    return bScore - aScore;
  });

  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(sortedHotels.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const hotelsPage = sortedHotels.slice(startIndex, startIndex + pageSize);

  const listingBaseHref = getDirectoryHref(locale);
  const featuredHotels = [...hotelCards]
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 3);
  const propertyOptions = [
    { value: "", label: t.propertyAll },
    { value: "hotel", label: t.propertyHotel },
    { value: "resort", label: t.propertyResort },
    { value: "apartment", label: t.propertyApartment },
    { value: "villa", label: t.propertyVilla }
  ];
  const experienceOptions = [
    { value: "", label: t.experienceAll },
    { value: "family", label: t.experienceFamily },
    { value: "adults", label: t.experienceAdults },
    { value: "all-inclusive", label: t.experienceAllInclusive },
    { value: "beachfront", label: t.experienceBeachfront },
    { value: "luxury", label: t.experienceLuxury }
  ];
  const listSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.title,
    itemListElement: hotelsPage.map((hotel, index) => ({
      "@type": "ListItem",
      position: startIndex + index + 1,
      url: `https://proactivitis.com${getHotelHref(hotel.slug, locale)}`,
      item: {
        "@type": "Hotel",
        name: hotel.name,
        description: hotel.description,
        image: toAbsoluteUrl(hotel.heroImage || ""),
        priceRange: hotel.price ? `From $${hotel.price} USD` : "Quote required",
        address: {
          "@type": "PostalAddress",
          addressLocality: hotel.zoneName,
          addressCountry: "DO"
        },
        starRating: {
          "@type": "Rating",
          ratingValue: hotel.stars,
          bestRating: 5
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: hotel.rating,
          reviewCount: hotel.reviews
        },
        amenityFeature: [
          ...hotel.amenities,
          ...hotel.experienceTags.map((tag) => getExperienceLabel(tag, locale))
        ].slice(0, 10).map((name) => ({
          "@type": "LocationFeatureSpecification",
          name,
          value: true
        })),
        makesOffer: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: hotel.price ?? undefined,
          availability: "https://schema.org/InStock",
          url: `https://proactivitis.com${getHotelHref(hotel.slug, locale)}`
        }
      }
    }))
  };
  const getPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (zone) params.set("zone", zone);
    if (propertyType) params.set("type", propertyType);
    if (experience) params.set("experience", experience);
    if (sort && sort !== "recommended") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${listingBaseHref}?${query}` : listingBaseHref;
  };

  return (
    <div className="travel-surface mx-auto w-full max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <StructuredData data={listSchema} />
      <header className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
        <div className="grid min-h-[430px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">{t.heroEyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 sm:text-5xl">
                {t.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{t.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#hotel-search"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.heroPrimary}
                </a>
                <a
                  href="#hotel-zones"
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
                >
                  {t.heroSecondary}
                </a>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[t.heroTrust1, t.heroTrust2, t.heroTrust3].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold leading-5 text-slate-900">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[340px] bg-slate-100">
            <div className="absolute inset-0 grid grid-cols-2 gap-2 p-3">
              {featuredHotels.map((hotel, index) => (
                <Link
                  key={hotel.slug}
                  href={getHotelHref(hotel.slug, locale)}
                  className={`group relative overflow-hidden rounded-[1.6rem] bg-slate-200 ${
                    index === 0 ? "col-span-2 row-span-2" : ""
                  }`}
                >
                  {hotel.heroImage ? (
                    <img
                      src={hotel.heroImage}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      style={{ objectPosition: coverStyleFromSlug(hotel.slug).objectPosition }}
                    />
                  ) : (
                    <div className="h-full w-full" style={{ background: coverStyleFromSlug(hotel.slug).overlay }} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 text-white">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/75">
                      {hotel.propertyTypeLabel} · {hotel.zoneName}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm font-semibold sm:text-base">{hotel.name}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="absolute right-6 top-6 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur">
              <p className="text-3xl font-semibold text-slate-950">{hotels.length}+</p>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Stays</p>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          {locale === "es" ? "Reserva completa" : locale === "fr" ? "Reservation complete" : "Complete booking"}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">
          {locale === "es"
            ? "Combina hotel + traslado + tours en un solo flujo"
            : locale === "fr"
              ? "Combinez hotel + transfert + excursions dans un seul flux"
              : "Bundle hotel + transfer + tours in one flow"}
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={transfersHref}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
          >
            {locale === "es" ? "Ver traslados" : locale === "fr" ? "Voir transferts" : "View transfers"}
          </Link>
          <Link
            href={toursHref}
            className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-400"
          >
            {locale === "es" ? "Ver tours" : locale === "fr" ? "Voir excursions" : "View tours"}
          </Link>
          <Link
            href={premiumTransferHref}
            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800 transition hover:bg-amber-100"
          >
            {locale === "es" ? "Transfer VIP" : locale === "fr" ? "Transfert VIP" : "VIP transfer"}
          </Link>
          <Link
            href="/hospitality-partners"
            className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 transition hover:bg-emerald-100"
          >
            {locale === "es" ? "Publicar alojamiento" : locale === "fr" ? "Publier hebergement" : "List your stay"}
          </Link>
        </div>
      </section>

      <section id="hotel-search" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <form
          action={listingBaseHref}
          method="get"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_160px_160px_170px_160px_170px]"
        >
          <label className="block">
            <span className="sr-only">{t.searchPlaceholder}</span>
            <input
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <label className="block">
            <span className="sr-only">{t.zoneLabel}</span>
            <select
              name="zone"
              defaultValue={zone}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="">{t.zoneAll}</option>
              {zones.map((zoneName) => (
                <option key={zoneName} value={zoneName}>
                  {zoneName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t.propertyLabel}</span>
            <select
              name="type"
              defaultValue={propertyType}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              {propertyOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t.experienceLabel}</span>
            <select
              name="experience"
              defaultValue={experience}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              {experienceOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">{t.sortLabel}</span>
            <select
              name="sort"
              defaultValue={sort}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="recommended">{t.sortRecommended}</option>
              <option value="price-asc">{t.sortPriceLow}</option>
              <option value="price-desc">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {t.applyFilters}
            </button>
            <Link
              href={listingBaseHref}
              className="rounded-xl border border-slate-300 px-3 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
            >
              {t.clearFilters}
            </Link>
          </div>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">{sortedHotels.length}</span> {t.resultsLabel}
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t.trustedTitle}
          </span>
        </div>
        <div id="hotel-zones" className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {propertyOptions.map((option) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (zone) params.set("zone", zone);
            if (option.value) params.set("type", option.value);
            if (experience) params.set("experience", experience);
            if (sort && sort !== "recommended") params.set("sort", sort);
            const href = params.toString() ? `${listingBaseHref}?${params.toString()}` : listingBaseHref;
            const active = propertyType === option.value;
            return (
              <Link
                key={option.value || "all"}
                href={href}
                className={
                  active
                    ? "shrink-0 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white"
                    : "shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {experienceOptions.map((option) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (zone) params.set("zone", zone);
            if (propertyType) params.set("type", propertyType);
            if (option.value) params.set("experience", option.value);
            if (sort && sort !== "recommended") params.set("sort", sort);
            const href = params.toString() ? `${listingBaseHref}?${params.toString()}` : listingBaseHref;
            const active = experience === option.value;
            return (
              <Link
                key={option.value || "all-experiences"}
                href={href}
                className={
                  active
                    ? "shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                    : "shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">{t.trustedTitle}</p>
            <p className="mt-2">{t.trustedBody}</p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-900">{t.selectedAreaLabel}</p>
            <p className="mt-1 text-slate-600">{zone || t.zoneAll}</p>
            <p className="mt-4 font-semibold text-slate-900">{t.selectedSortLabel}</p>
            <p className="mt-1 text-slate-600">
              {sort === "price-asc"
                ? t.sortPriceLow
                : sort === "price-desc"
                  ? t.sortPriceHigh
                  : sort === "rating"
                    ? t.sortRating
                    : t.sortRecommended}
            </p>
            <p className="mt-4 font-semibold text-slate-900">{t.propertyLabel}</p>
            <p className="mt-1 text-slate-600">
              {propertyOptions.find((option) => option.value === propertyType)?.label ?? t.propertyAll}
            </p>
            <p className="mt-4 font-semibold text-slate-900">{t.experienceLabel}</p>
            <p className="mt-1 text-slate-600">
              {experienceOptions.find((option) => option.value === experience)?.label ?? t.experienceAll}
            </p>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
            <p className="font-semibold text-slate-900">
              {locale === "es" ? "Mapa de zonas" : locale === "fr" ? "Carte des zones" : "Area map"}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {locale === "es"
                ? "Filtra por ubicacion y combina alojamiento con traslado y tours cercanos."
                : locale === "fr"
                  ? "Filtrez par zone et combinez hebergement, transfert et excursions proches."
                  : "Filter by location and bundle stays with nearby transfers and tours."}
            </p>
            <div className="mt-3 grid gap-2">
              {zones.slice(0, 8).map((zoneName) => {
                const count = hotelCards.filter((hotel) => hotel.zoneName === zoneName).length;
                const params = new URLSearchParams();
                params.set("zone", zoneName);
                const href = `${listingBaseHref}?${params.toString()}`;
                return (
                  <Link
                    key={zoneName}
                    href={href}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    <span>{zoneName}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-slate-500">{count}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="space-y-4">
          {hotelsPage.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-slate-900">{t.noResultsTitle}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.noResultsBody}</p>
            </section>
          ) : (
            <section className="space-y-4">
              {hotelsPage.map((hotel) => (
                <article
                  key={hotel.slug}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-56 w-full shrink-0 bg-slate-100 md:h-auto md:w-80">
                      {hotel.heroImage ? (
                        <img
                          src={hotel.heroImage}
                          alt={hotel.name}
                          className="h-full w-full object-cover"
                          style={{ objectPosition: coverStyleFromSlug(hotel.slug).objectPosition }}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{ background: coverStyleFromSlug(hotel.slug).overlay }}
                        >
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Punta Cana
                          </span>
                        </div>
                      )}
                      <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
                        {hotel.zoneName}
                      </div>
                      <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: coverStyleFromSlug(hotel.slug).overlay }}
                      />
                    </div>

                    <div className="flex w-full flex-col justify-between gap-4 p-5">
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                        <div>
                          <h2 className="text-xl font-semibold leading-tight text-slate-900">{hotel.name}</h2>
                          <p className="mt-1 text-xs text-slate-600">
                            {hotel.propertyTypeLabel} · {hotel.zoneName}
                          </p>
                          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="font-semibold text-amber-600">{"★".repeat(5)}</span>
                            <span>{hotel.rating.toFixed(1)} / 5</span>
                            <span>·</span>
                            <span>{hotel.reviews} {t.reviewLabel}</span>
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{hotel.description}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {hotel.experienceTags.slice(0, 3).map((tag) => (
                              <span
                                key={`${hotel.slug}-${tag}`}
                                className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800"
                              >
                                {getExperienceLabel(tag, locale)}
                              </span>
                            ))}
                            {hotel.badges.map((badge) => (
                              <span
                                key={`${hotel.slug}-${badge}`}
                                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                            {t.availableNowLabel}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-emerald-700">
                            {hotel.roomsLeft} {t.leftLabel}
                          </p>
                          <p className="mt-3 text-sm text-slate-500">
                            {hotel.price ? (
                              <>
                                {t.fromLabel}{" "}
                                <span className="text-2xl font-bold leading-none text-slate-900">${hotel.price}</span>{" "}
                                {t.perNight}
                              </>
                            ) : (
                              <span className="text-base font-semibold text-slate-900">{t.consultRateLabel}</span>
                            )}
                          </p>
                          <Link
                            href={getHotelHref(hotel.slug, locale)}
                            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            {t.quoteCta}
                          </Link>
                          {hotel.transferPrice ? (
                            <Link
                              href={hotel.transferHref}
                              className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                            >
                              {locale === "es"
                                ? `Añadir traslado desde PUJ desde $${hotel.transferPrice}`
                                : locale === "fr"
                                  ? `Ajouter transfert PUJ des $${hotel.transferPrice}`
                                  : `Add PUJ transfer from $${hotel.transferPrice}`}
                            </Link>
                          ) : null}
                          <p className="mt-2 text-center text-[11px] font-semibold text-slate-500">
                            {t.smartChoiceLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>

      {totalPages > 1 ? (
        <nav className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              {t.pageLabel} {currentPage}/{totalPages}
            </span>
            <div className="flex gap-2">
              {currentPage > 1 ? (
                <Link
                  href={getPageHref(currentPage - 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  {t.prevPage}
                </Link>
              ) : null}
              {currentPage < totalPages ? (
                <Link
                  href={getPageHref(currentPage + 1)}
                  className="rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  {t.nextPage}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, index) => {
              const target = index + 1;
              const isCurrent = target === currentPage;
              return (
                <Link
                  key={target}
                  href={getPageHref(target)}
                  className={
                    isCurrent
                      ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                  }
                >
                  {target}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
