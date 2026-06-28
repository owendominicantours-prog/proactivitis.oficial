import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";
import StructuredData from "@/components/schema/StructuredData";
import { prisma } from "@/lib/prisma";
import { TransferLocationType } from "@prisma/client";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import { formatReviewCountValue, getTourReviewCount } from "@/lib/reviewCounts";
import { Locale, translate } from "@/lib/translations";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };
const BASE_URL = "https://proactivitis.com";

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "4", unit: "Horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value: value ?? "4", unit: "Horas" };
  }
};

const formatDurationLabel = (duration: { value: string; unit: string }, locale: Locale) => {
  const normalized = duration.unit.trim().toLowerCase();
  if (normalized.includes("hora") || normalized.includes("hour")) {
    return `${duration.value} ${translate(locale, "tourPickup.duration.unit.hours")}`;
  }
  if (normalized.includes("dia") || normalized.includes("day") || normalized.includes("jour")) {
    return `${duration.value} ${translate(locale, "tourPickup.duration.unit.days")}`;
  }
  return `${duration.value} ${duration.unit}`;
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string");
  return times.length ? times : null;
};

const tKey = (key: string) => key as Parameters<typeof translate>[1];

const buildItineraryMock = (t: (key: Parameters<typeof translate>[1]) => string): ItineraryStop[] => [
  {
    time: t(tKey("tourPickup.itinerary.mock.1.time")),
    title: t(tKey("tourPickup.itinerary.mock.1.title")),
    description: t(tKey("tourPickup.itinerary.mock.1.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.2.time")),
    title: t(tKey("tourPickup.itinerary.mock.2.title")),
    description: t(tKey("tourPickup.itinerary.mock.2.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.3.time")),
    title: t(tKey("tourPickup.itinerary.mock.3.title")),
    description: t(tKey("tourPickup.itinerary.mock.3.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.4.time")),
    title: t(tKey("tourPickup.itinerary.mock.4.title")),
    description: t(tKey("tourPickup.itinerary.mock.4.body"))
  },
  {
    time: t(tKey("tourPickup.itinerary.mock.5.time")),
    title: t(tKey("tourPickup.itinerary.mock.5.title")),
    description: t(tKey("tourPickup.itinerary.mock.5.body"))
  }
];

const buildAdditionalInfo = (t: (key: Parameters<typeof translate>[1]) => string) => [
  t(tKey("tourPickup.additionalInfo.1")),
  t(tKey("tourPickup.additionalInfo.2")),
  t(tKey("tourPickup.additionalInfo.3")),
  t(tKey("tourPickup.additionalInfo.4")),
  t(tKey("tourPickup.additionalInfo.5"))
];

const buildPackingList = (t: (key: Parameters<typeof translate>[1]) => string) => [
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.1.label")),
    detail: t(tKey("tourPickup.packing.1.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.2.label")),
    detail: t(tKey("tourPickup.packing.2.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.3.label")),
    detail: t(tKey("tourPickup.packing.3.detail"))
  },
  {
    icon: "OK",
    label: t(tKey("tourPickup.packing.4.label")),
    detail: t(tKey("tourPickup.packing.4.detail"))
  }
];

const buildReviewBreakdown = (t: (key: Parameters<typeof translate>[1]) => string) => [
  { label: t(tKey("tourPickup.reviews.breakdown.5")), percent: 90 },
  { label: t(tKey("tourPickup.reviews.breakdown.4")), percent: 8 },
  { label: t(tKey("tourPickup.reviews.breakdown.3")), percent: 1 },
  { label: t(tKey("tourPickup.reviews.breakdown.2")), percent: 1 },
  { label: t(tKey("tourPickup.reviews.breakdown.1")), percent: 0 }
];

const buildReviewHighlights = (t: (key: Parameters<typeof translate>[1]) => string) => [
  {
    name: "Gabriela R.",
    date: t(tKey("tourPickup.reviews.highlights.1.date")),
    quote: t(tKey("tourPickup.reviews.highlights.1.quote")),
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    name: "James T.",
    date: t(tKey("tourPickup.reviews.highlights.2.date")),
    quote: t(tKey("tourPickup.reviews.highlights.2.quote")),
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598"
  },
  {
    name: "Anna L.",
    date: t(tKey("tourPickup.reviews.highlights.3.date")),
    quote: t(tKey("tourPickup.reviews.highlights.3.quote")),
    avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39"
  }
];

const buildReviewTags = (t: (key: Parameters<typeof translate>[1]) => string) => [
  t(tKey("tourPickup.reviews.tags.1")),
  t(tKey("tourPickup.reviews.tags.2")),
  t(tKey("tourPickup.reviews.tags.3"))
];

type TourIntent = {
  label: string;
  fit: string;
  packing: string;
  timing: string;
};

const normalizeIntentText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const resolveTourIntent = (haystack: string, locale: Locale): TourIntent => {
  const normalized = normalizeIntentText(haystack);
  const isWater = /saona|catamaran|boat|barco|isla|snorkel|playa|beach|parasail|mar|ocean/.test(normalized);
  const isAdventure = /buggy|atv|zip|horse|caballo|safari|aventura|adventure|off-road|offroad/.test(normalized);
  const isCulture = /santo domingo|historia|cultura|cultural|city|ciudad|museo/.test(normalized);
  const isNature = /samana|ballena|whale|cascada|waterfall|montana|nature|natural|rio/.test(normalized);

  if (locale === "en") {
    if (isWater) {
      return {
        label: "Beach and water day",
        fit: "best for travelers who want ocean time, photos, music or a relaxed Caribbean route",
        packing: "bring swimwear, sunscreen, dry clothes and a small waterproof bag",
        timing: "hotel pickup is important because marina and beach departures run on fixed windows"
      };
    }
    if (isAdventure) {
      return {
        label: "Adventure route",
        fit: "best for guests who want action, local stops and a more active day outside the resort",
        packing: "wear closed shoes and clothes that can get dirty",
        timing: "being ready at the lobby avoids losing the first trail or safety briefing"
      };
    }
    if (isCulture) {
      return {
        label: "Cultural route",
        fit: "best for travelers who want history, local context and a guided city experience",
        packing: "bring comfortable shoes, light clothing and an ID copy",
        timing: "early pickup helps protect the route time and the guided stops"
      };
    }
    if (isNature) {
      return {
        label: "Nature route",
        fit: "best for travelers who want landscapes, wildlife or a full day outside Punta Cana",
        packing: "bring comfortable shoes, sun protection and a light change of clothes",
        timing: "pickup timing matters because long-distance routes depend on road and boat connections"
      };
    }
    return {
      label: "Guided experience",
      fit: "best for travelers who want a confirmed tour with local support and clear logistics",
      packing: "bring comfortable clothes, sunscreen and your booking confirmation",
      timing: "hotel pickup keeps the experience organized from the first step"
    };
  }

  if (locale === "fr") {
    if (isWater) {
      return {
        label: "Journee plage et mer",
        fit: "ideal pour profiter de la mer, des photos, de la musique ou d'une route caribeenne detendue",
        packing: "prevoyez maillot, protection solaire, vetements secs et petit sac impermeable",
        timing: "la prise en charge est importante car les departs plage ou marina suivent des horaires fixes"
      };
    }
    if (isAdventure) {
      return {
        label: "Route aventure",
        fit: "ideal pour une journee active avec action, arrets locaux et sortie hors resort",
        packing: "portez chaussures fermees et vetements qui peuvent se salir",
        timing: "etre pret au lobby evite de manquer le briefing ou le premier troncon"
      };
    }
    if (isCulture) {
      return {
        label: "Route culturelle",
        fit: "ideal pour decouvrir histoire, contexte local et visite guidee",
        packing: "prevoyez chaussures confortables, vetements legers et copie de piece d'identite",
        timing: "un depart tot protege le temps de visite et les arrets guides"
      };
    }
    if (isNature) {
      return {
        label: "Route nature",
        fit: "ideal pour paysages, faune ou journee complete hors Punta Cana",
        packing: "prevoyez chaussures confortables, protection solaire et vetement de rechange leger",
        timing: "l'heure de pickup compte car les longues routes dependent des connexions route et bateau"
      };
    }
    return {
      label: "Experience guidee",
      fit: "ideal pour reserver une activite confirmee avec support local et logistique claire",
      packing: "prevoyez vetements confortables, protection solaire et confirmation de reservation",
      timing: "la prise en charge hotel rend l'experience plus simple des le depart"
    };
  }

  if (isWater) {
    return {
      label: "Dia de playa y mar",
      fit: "ideal para viajeros que buscan mar, fotos, musica o una ruta caribena relajada",
      packing: "lleva traje de bano, protector solar, ropa seca y una funda pequena impermeable",
      timing: "la recogida importa porque las salidas de playa o marina trabajan con ventanas fijas"
    };
  }
  if (isAdventure) {
    return {
      label: "Ruta de aventura",
      fit: "ideal para quienes quieren accion, paradas locales y un dia activo fuera del resort",
      packing: "usa zapatos cerrados y ropa que pueda ensuciarse",
      timing: "estar listo en lobby evita perder el briefing de seguridad o la primera parte de la ruta"
    };
  }
  if (isCulture) {
    return {
      label: "Ruta cultural",
      fit: "ideal para conocer historia, contexto local y puntos guiados con mas calma",
      packing: "lleva zapatos comodos, ropa ligera y copia de identificacion",
      timing: "la salida temprano ayuda a proteger el tiempo real de visita"
    };
  }
  if (isNature) {
    return {
      label: "Ruta de naturaleza",
      fit: "ideal para paisajes, vida silvestre o una excursion de dia completo fuera de Punta Cana",
      packing: "lleva zapatos comodos, proteccion solar y cambio de ropa ligero",
      timing: "la hora de recogida importa porque las rutas largas dependen de carretera y conexiones"
    };
  }
  return {
    label: "Experiencia guiada",
    fit: "ideal para reservar un tour confirmado con soporte local y logistica clara",
    packing: "lleva ropa comoda, protector solar y la confirmacion de reserva",
    timing: "la recogida en hotel ordena la experiencia desde el primer paso"
  };
};

const buildTourPickupUniqueness = ({
  locale,
  title,
  hotel,
  pickupArea,
  tourArea,
  duration,
  startTime,
  category,
  language,
  capacity,
  physicalLevel,
  includePreview,
  intent
}: {
  locale: Locale;
  title: string;
  hotel: string;
  pickupArea: string;
  tourArea: string;
  duration: string;
  startTime: string;
  category: string;
  language: string;
  capacity: string;
  physicalLevel: string;
  includePreview: string;
  intent: TourIntent;
}) => {
  if (locale === "en") {
    return {
      heading: `${title} from ${hotel}: pickup plan and local details`,
      intro: `This page is built for the exact combination of ${title} and pickup from ${hotel}. The route is treated as a ${intent.label.toLowerCase()} in ${tourArea}, with pickup context for ${pickupArea}, estimated duration of ${duration}, and the first available departure around ${startTime}.`,
      support: `For this pickup point, the most important details are lobby timing, clear passenger count and the right preparation before leaving the hotel. This option is ${intent.fit}.`,
      cards: [
        { title: "Pickup context", body: `Pickup is planned from ${hotel}, in the ${pickupArea} area, so the confirmation focuses on lobby access and meeting-point clarity.` },
        { title: "Tour profile", body: `${category} experience in ${tourArea}. Languages: ${language}. Physical level: ${physicalLevel}. Capacity reference: ${capacity}.` },
        { title: "Before leaving", body: `${intent.packing}. Included reference: ${includePreview}.` }
      ],
      faq: [
        {
          question: `How does pickup from ${hotel} work for ${title}?`,
          answer: `After booking, the pickup point is confirmed for ${hotel}. The team checks the lobby or approved meeting point and keeps the tour linked to this hotel landing.`
        },
        {
          question: `Is ${title} a good option from ${pickupArea}?`,
          answer: `Yes. This page is filtered for the ${pickupArea} pickup context and the tour area ${tourArea}, so the logistics are more specific than a generic tour page.`
        },
        {
          question: `What should I prepare before ${startTime}?`,
          answer: `Be ready before the confirmed pickup window, keep your phone available, and ${intent.packing}.`
        },
        {
          question: `Why book this tour from ${hotel} instead of a generic page?`,
          answer: `This page keeps the tour, hotel, pickup area, duration, language and booking widget connected in one place, which reduces manual coordination.`
        }
      ]
    };
  }

  if (locale === "fr") {
    return {
      heading: `${title} depuis ${hotel} : pickup et details locaux`,
      intro: `Cette page est construite pour la combinaison exacte entre ${title} et la prise en charge a ${hotel}. La route est traitee comme ${intent.label.toLowerCase()} a ${tourArea}, avec contexte pickup pour ${pickupArea}, duree estimee de ${duration} et premier depart vers ${startTime}.`,
      support: `Pour ce point de pickup, les details importants sont l'heure lobby, le nombre de passagers et la bonne preparation avant de quitter l'hotel. Cette option est ${intent.fit}.`,
      cards: [
        { title: "Contexte pickup", body: `La prise en charge est prevue depuis ${hotel}, dans la zone ${pickupArea}, avec confirmation du lobby ou point autorise.` },
        { title: "Profil du tour", body: `Experience ${category} a ${tourArea}. Langues : ${language}. Niveau physique : ${physicalLevel}. Capacite reference : ${capacity}.` },
        { title: "Avant depart", body: `${intent.packing}. Inclusion principale : ${includePreview}.` }
      ],
      faq: [
        {
          question: `Comment fonctionne le pickup depuis ${hotel} pour ${title} ?`,
          answer: `Apres reservation, le point exact est confirme pour ${hotel}. L'equipe verifie le lobby ou point approuve et garde le tour lie a cette page hotel.`
        },
        {
          question: `${title} convient-il depuis ${pickupArea} ?`,
          answer: `Oui. Cette page est filtree pour le contexte pickup ${pickupArea} et la zone du tour ${tourArea}, avec logistique plus precise qu'une page generique.`
        },
        {
          question: `Que preparer avant ${startTime} ?`,
          answer: `Soyez pret avant la fenetre confirmee, gardez votre telephone disponible et ${intent.packing}.`
        },
        {
          question: `Pourquoi reserver depuis ${hotel} ici ?`,
          answer: `Cette page relie le tour, l'hotel, la zone pickup, la duree, la langue et le module de reservation au meme endroit.`
        }
      ]
    };
  }

  return {
    heading: `${title} desde ${hotel}: plan de recogida y detalles locales`,
    intro: `Esta pagina esta creada para la combinacion exacta de ${title} con recogida en ${hotel}. La ruta se trata como ${intent.label.toLowerCase()} en ${tourArea}, con contexto de salida desde ${pickupArea}, duracion estimada de ${duration} y primera salida alrededor de ${startTime}.`,
    support: `Para este punto de recogida, lo importante es confirmar lobby, cantidad de pasajeros y preparacion antes de salir del hotel. Esta opcion es ${intent.fit}.`,
    cards: [
      { title: "Contexto de recogida", body: `La salida se organiza desde ${hotel}, dentro de la zona ${pickupArea}, con foco en lobby o punto autorizado.` },
      { title: "Perfil del tour", body: `Experiencia ${category} en ${tourArea}. Idioma: ${language}. Nivel fisico: ${physicalLevel}. Capacidad de referencia: ${capacity}.` },
      { title: "Antes de salir", body: `${intent.packing}. Referencia incluida: ${includePreview}.` }
    ],
    faq: [
      {
        question: `Como funciona la recogida en ${hotel} para ${title}?`,
        answer: `Despues de reservar, se confirma el punto exacto para ${hotel}. El equipo valida lobby o punto autorizado y mantiene este tour conectado a esta landing del hotel.`
      },
      {
        question: `${title} conviene si estoy en ${pickupArea}?`,
        answer: `Si. Esta pagina usa el contexto de recogida de ${pickupArea} y la zona del tour ${tourArea}, por eso es mas especifica que una ficha generica.`
      },
      {
        question: `Que debo preparar antes de ${startTime}?`,
        answer: `Debes estar listo antes de la ventana confirmada, mantener el telefono disponible y ${intent.packing}.`
      },
      {
        question: `Por que reservar desde ${hotel} y no desde una pagina generica?`,
        answer: `Aqui quedan conectados el tour, hotel, zona de recogida, duracion, idioma y widget de reserva en una sola pagina.`
      }
    ]
  };
};

type TourHotelLandingParams = {
  params: Promise<{ slug: string; locationSlug: string }>;
  searchParams?: Promise<{ bookingCode?: string; hotelSlug?: string }>;
};

const buildTourPickupUrl = (slug: string, locationSlug: string, locale: Locale) =>
  locale === "es"
    ? `${BASE_URL}/tours/${slug}/recogida/${locationSlug}`
    : `${BASE_URL}/${locale}/tours/${slug}/recogida/${locationSlug}`;

type PickupTarget = {
  slug: string;
  name: string;
  countryId: string;
  destinationId?: string | null;
  destinationName?: string | null;
  destinationSlug?: string | null;
  microZoneId?: string | null;
  microZoneName?: string | null;
  microZoneSlug?: string | null;
};

const resolvePickupTarget = async (slug: string): Promise<PickupTarget | null> => {
  const location = await prisma.location.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryId: true,
      destinationId: true,
      destination: { select: { name: true, slug: true } },
      microZoneId: true,
      microZone: { select: { name: true, slug: true } }
    }
  });

  if (location) {
    return {
      slug: location.slug,
      name: location.name,
      countryId: location.countryId,
      destinationId: location.destinationId,
      destinationName: location.destination?.name ?? null,
      destinationSlug: location.destination?.slug ?? null,
      microZoneId: location.microZoneId,
      microZoneName: location.microZone?.name ?? null,
      microZoneSlug: location.microZone?.slug ?? null
    };
  }

  const transferLocation = await prisma.transferLocation.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      countryCode: true,
      type: true
    }
  });

  if (!transferLocation) return null;

  if (
    transferLocation.type !== TransferLocationType.HOTEL &&
    transferLocation.type !== TransferLocationType.PLACE
  ) {
    return null;
  }

  const mappedLocation = await prisma.location.findFirst({
    where: {
      OR: [{ slug: transferLocation.slug }, { name: transferLocation.name }]
    },
    select: {
      destinationId: true,
      destination: { select: { name: true, slug: true } },
      microZoneId: true,
      microZone: { select: { name: true, slug: true } }
    }
  });

  return {
    slug: transferLocation.slug,
    name: transferLocation.name,
    countryId: transferLocation.countryCode,
    destinationId: mappedLocation?.destinationId ?? null,
    destinationName: mappedLocation?.destination?.name ?? null,
    destinationSlug: mappedLocation?.destination?.slug ?? null,
    microZoneId: mappedLocation?.microZoneId ?? null,
    microZoneName: mappedLocation?.microZone?.name ?? null,
    microZoneSlug: mappedLocation?.microZone?.slug ?? null
  };
};

export async function buildTourPickupMetadata(
  slug: string,
  locationSlug: string,
  locale: Locale
): Promise<Metadata> {
  const [tour, pickupTarget] = await Promise.all([
    prisma.tour.findUnique({
      where: { slug },
      select: {
        title: true,
        shortDescription: true,
        translations: {
          where: { locale },
          select: { title: true, shortDescription: true, description: true }
        }
      }
    }),
    resolvePickupTarget(locationSlug)
  ]);

  if (!tour || !pickupTarget) {
    return {
      title: translate(locale, "tourPickup.meta.fallbackTitle"),
      description: translate(locale, "tourPickup.meta.fallbackDescription")
    };
  }

  const translation = tour.translations?.[0];
  const resolvedTitle = translation?.title ?? tour.title;
  const resolvedDescription =
    translation?.shortDescription ?? translation?.description ?? tour.shortDescription;
  const title = translate(locale, "tourPickup.meta.title", {
    tour: resolvedTitle,
    hotel: pickupTarget.name
  });
  const description =
    resolvedDescription ??
    translate(locale, "tourPickup.meta.description", {
      tour: resolvedTitle,
      hotel: pickupTarget.name
    });

  return {
    title,
    description,
    alternates: {
      canonical: buildTourPickupUrl(slug, pickupTarget.slug, locale),
      languages: {
        es: `/tours/${slug}/recogida/${pickupTarget.slug}`,
        en: `/en/tours/${slug}/recogida/${pickupTarget.slug}`,
        fr: `/fr/tours/${slug}/recogida/${pickupTarget.slug}`
      }
    }
  };
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const { slug, locationSlug } = await params;
  return buildTourPickupMetadata(slug, locationSlug, "es");
}

export async function TourHotelLanding({
  params,
  searchParams,
  locale
}: TourHotelLandingParams & { locale: Locale }) {
  const { slug, locationSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};
  if (resolvedSearch.hotelSlug && !resolvedSearch.bookingCode) {
    permanentRedirect(
      locale === "es"
        ? `/tours/${slug}/recogida/${locationSlug}`
        : `/${locale}/tours/${slug}/recogida/${locationSlug}`
    );
  }
  const t = (key: Parameters<typeof translate>[1], replacements?: Record<string, string>) =>
    translate(locale, key, replacements);

  let tour = null;
  let pickupTarget: PickupTarget | null = null;
  try {
    [tour, pickupTarget] = await Promise.all([
      prisma.tour.findUnique({
        where: { slug },
        include: {
          SupplierProfile: {
            include: { User: { select: { name: true } } }
          },
          options: {
            where: { active: true },
            orderBy: { sortOrder: "asc" }
          },
          country: true,
          destination: true,
          departureDestination: true,
          microZone: true,
          translations: {
            where: { locale },
            select: {
              title: true,
              shortDescription: true,
              description: true,
              includesList: true,
              notIncludedList: true,
              itineraryStops: true,
              highlights: true
            }
          }
        }
      }),
      resolvePickupTarget(locationSlug)
    ]);
  } catch (error) {
        console.error("Error loading tour or location for landing page", {
          slug,
          locationSlug,
          error
        });
    throw error;
  }

  if (!tour) {
    console.error("Tour no encontrado para el slug", { slug, locationSlug });
    notFound();
  }

  if (!pickupTarget) {
    console.error("Location/pickup target no encontrado para el slug", { locationSlug, slug });
    notFound();
  }

  const translation = tour.translations?.[0];
  const localizedTitle = translation?.title ?? tour.title;
  const localizedShortDescription = translation?.shortDescription ?? tour.shortDescription ?? "";
  const localizedDescription = translation?.description ?? tour.description ?? "";
  const normalizeArray = (value?: unknown) =>
    Array.isArray(value) ? value.map((entry) => String(entry).trim()).filter(Boolean) : [];
  const translatedIncludes = normalizeArray(translation?.includesList);
  const translatedNotIncluded = normalizeArray(translation?.notIncludedList);
  const translatedHighlights = normalizeArray(translation?.highlights);
  const translatedItinerary = Array.isArray(translation?.itineraryStops)
    ? (translation?.itineraryStops as ItineraryStop[])
    : [];

  const rawGallery = parseJsonArray<string>(tour.gallery);
  const includesList =
    locale !== "es" && translatedIncludes.length
      ? translatedIncludes
      : tour.includes
        ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
        : [
            t("tourPickup.includes.defaults.1"),
            t("tourPickup.includes.defaults.2"),
            t("tourPickup.includes.defaults.3")
          ];
  const excludesList =
    locale !== "es" && translatedNotIncluded.length
      ? translatedNotIncluded
      : [
          t("tourPickup.excludes.defaults.1"),
          t("tourPickup.excludes.defaults.2"),
          t("tourPickup.excludes.defaults.3")
        ];
  const categories = (tour.category ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const languages = (tour.language ?? "").split(",").map((part) => part.trim()).filter(Boolean);
  const timeSlotsRaw = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const defaultSlot: PersistedTimeSlot = { hour: 9, minute: "00", period: "AM" };
  const timeSlots: PersistedTimeSlot[] = timeSlotsRaw.length ? timeSlotsRaw : [defaultSlot];
  const durationValue = parseDuration(tour.duration);
  const durationLabel = formatDurationLabel(durationValue, locale);
  const displayTime = timeSlots.length ? formatTimeSlot(timeSlots[0]) : "09:00 AM";
  const priceLabel = `$${tour.price.toFixed(0)} USD`;
  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const visualTimeline =
    locale !== "es" && translatedItinerary.length
      ? translatedItinerary
      : itinerarySource.length
        ? itinerarySource
        : buildItineraryMock(t);
  const heroImage = tour.heroImage ?? rawGallery[0] ?? "/fototours/fotosimple.jpg";
  const gallery = [heroImage, ...rawGallery.filter((img) => img && img !== heroImage)];
  const normalizedOptions = tour.options?.map((option) => ({
    ...option,
    pickupTimes: normalizePickupTimes(option.pickupTimes)
  }));
  const shortTeaser =
    localizedShortDescription && localizedShortDescription.length > 220
      ? `${localizedShortDescription.slice(0, 220).trim()}…`
      : localizedShortDescription || t("tourPickup.hero.fallback");
  const reviewBreakdown = buildReviewBreakdown(t);
  const reviewHighlights = buildReviewHighlights(t);
  const reviewTags = buildReviewTags(t);
  const packingList = buildPackingList(t);

  const detailReviewCount = getTourReviewCount(tour.slug, "detail");
  const detailReviewLabel = formatReviewCountValue(detailReviewCount);
  const categoryLabel = categories[0] ?? tour.category ?? t("tourPickup.details.defaults.categories");
  const languageLabel = languages.length ? languages.join(", ") : t("tourPickup.details.defaults.languages");
  const physicalLabel = tour.physicalLevel ?? t("tourPickup.details.defaults.physical");
  const capacityLabel = t("tourPickup.details.defaults.capacity", { count: String(tour.capacity ?? 15) });
  const pickupArea =
    pickupTarget.microZoneName ?? pickupTarget.destinationName ?? tour.microZone?.name ?? tour.destination?.name ?? pickupTarget.name;
  const tourArea =
    tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location ?? pickupArea;
  const includePreview = includesList.slice(0, 2).join(", ") || t("tourPickup.includes.defaults.1");
  const tourIntent = resolveTourIntent(
    [
      localizedTitle,
      localizedDescription,
      localizedShortDescription,
      tour.category,
      tour.location,
      tour.destination?.name,
      tour.departureDestination?.name,
      tour.microZone?.name,
      includesList.join(" ")
    ]
      .filter(Boolean)
      .join(" "),
    locale
  );
  const uniquePickupContent = buildTourPickupUniqueness({
    locale,
    title: localizedTitle,
    hotel: pickupTarget.name,
    pickupArea,
    tourArea,
    duration: durationLabel,
    startTime: displayTime,
    category: categoryLabel,
    language: languageLabel,
    capacity: capacityLabel,
    physicalLevel: physicalLabel,
    includePreview,
    intent: tourIntent
  });
  const pageUrl = buildTourPickupUrl(tour.slug, pickupTarget.slug, locale);
  const heroImageAbsolute = heroImage.startsWith("http") ? heroImage : `${BASE_URL}${heroImage.startsWith("/") ? heroImage : `/${heroImage}`}`;
  const tourPickupSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${pageUrl}#product`,
        name: `${localizedTitle} - ${pickupTarget.name}`,
        description: uniquePickupContent.intro,
        image: heroImageAbsolute,
        brand: {
          "@type": "Brand",
          name: "Proactivitis"
        },
        category: categoryLabel,
        offers: {
          "@type": "Offer",
          url: pageUrl,
          price: tour.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock"
        }
      },
      {
        "@type": "TouristTrip",
        "@id": `${pageUrl}#tour`,
        name: localizedTitle,
        description: uniquePickupContent.support,
        url: pageUrl,
        touristType: categoryLabel,
        itinerary: visualTimeline.slice(0, 6).map((stop, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stop.title,
          description: stop.description,
          startTime: stop.time
        })),
        provider: {
          "@type": "Organization",
          name: tour.SupplierProfile?.company ?? "Proactivitis"
        },
        location: {
          "@type": "Place",
          name: tourArea
        },
        departureTime: displayTime,
        departureStation: {
          "@type": "Place",
          name: pickupTarget.name,
          address: pickupArea
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#pickup-faq`,
        mainEntity: uniquePickupContent.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Tours" : locale === "fr" ? "Tours" : "Tours",
            item: `${BASE_URL}${locale === "es" ? "/tours" : `/${locale}/tours`}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: localizedTitle,
            item: `${BASE_URL}${locale === "es" ? "" : `/${locale}`}/tours/${tour.slug}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: pickupTarget.name,
            item: pageUrl
          }
        ]
      }
    ]
  };

  const quickInfo = [
    {
      label: t("tourPickup.quickInfo.duration.label"),
      value: durationLabel,
      detail: t("tourPickup.quickInfo.duration.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.departure.label"),
      value: displayTime,
      detail: t("tourPickup.quickInfo.departure.detail", { hotel: pickupTarget.name }),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M12 4a8 8 0 100 16 8 8 0 000-16Zm0 9V7" />
          <path d="M12 12h4" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.languages.label"),
      value: languages.length ? languages.join(", ") : t("tourPickup.quickInfo.languages.fallback"),
      detail: languages.length
        ? t("tourPickup.quickInfo.languages.detail", { count: String(languages.length) })
        : t("tourPickup.quickInfo.languages.fallback"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <path d="M4 6h16M4 12h16M4 18h16" />
          <path d="M8 4c0 2.21-1.343 4-3 4M18 4c0 2.21 1.343 4 3 4" />
        </svg>
      )
    },
    {
      label: t("tourPickup.quickInfo.capacity.label"),
      value: t("tourPickup.quickInfo.capacity.value", { count: String(tour.capacity ?? 15) }),
      detail: t("tourPickup.quickInfo.capacity.detail"),
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1}>
          <circle cx="8" cy="8" r="3" />
          <circle cx="16" cy="8" r="3" />
          <path d="M2 21c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6" />
        </svg>
      )
    }
  ];

  const bookingCode = resolvedSearch.bookingCode;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-24 overflow-x-hidden">
      <StructuredData data={tourPickupSchema} />
      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 pt-8 sm:pt-10">
        <div className="grid gap-4 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.06)] lg:grid-cols-2">
          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-16 text-center lg:text-left">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              {t("tourPickup.hero.badge", { hotel: pickupTarget.name })}
            </div>
            <h1 className="mb-6 text-3xl font-black leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {localizedTitle}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">{shortTeaser}</p>
            <div className="flex items-center gap-8 border-t border-slate-100 pt-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("tourPickup.hero.fromLabel")}</p>
                <p className="text-4xl font-black text-indigo-600">{priceLabel}</p>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t("tourPickup.hero.ratingLabel")}</p>
                <p className="text-xl font-black">4.9</p>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#booking"
                className="rounded-2xl bg-indigo-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-100 transition-transform hover:scale-105 active:scale-95"
              >
                {t("tourPickup.hero.cta.primary")}
              </a>
              <a
                href="#gallery"
                className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
              >
                {t("tourPickup.hero.cta.secondary")}
              </a>
            </div>
          </div>
          <div
            className="h-[320px] sm:h-[350px] lg:h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroImage})`
            }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-10">
        <div className="grid gap-4 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2 lg:grid-cols-4">
          {quickInfo.map((item) => (
            <div key={item.label} className="space-y-2 rounded-[18px] border border-slate-100 bg-slate-50/60 p-4 text-sm">
              <div className="text-slate-500">{item.icon}</div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900">{item.value}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-4 py-8">
        <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.immediate")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.flexible")}
            </span>
            <span className="flex items-center gap-2">
              <span className="text-emerald-500">OK</span> {t("tourPickup.ribbon.support")}
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto mt-12 grid max-w-[1240px] gap-10 px-4 sm:px-6 lg:px-4 lg:grid-cols-[1fr,400px]">
        <div className="space-y-10">
          <section id="gallery" className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <TourGalleryViewer
              images={gallery.map((img, index) => ({
                url: img,
                label: `${localizedTitle} ${index + 1}`
              }))}
            />
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.summary.eyebrow")}</p>
                <h2 className="text-[20px] font-semibold text-slate-900">{t("tourPickup.summary.title")}</h2>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("tourPickup.summary.badge", { hotel: pickupTarget.name })}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{localizedDescription || shortTeaser}</p>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{tourIntent.label}</p>
                <h2 className="mt-2 text-[22px] font-semibold text-slate-900">{uniquePickupContent.heading}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{uniquePickupContent.intro}</p>
              </div>
              <div className="rounded-[18px] border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
                {pickupArea}
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{uniquePickupContent.support}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {uniquePickupContent.cards.map((card) => (
                <article key={card.title} className="rounded-[18px] border border-slate-100 bg-slate-50/70 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{t("tourPickup.details.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.details.title")}</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.details.badge")}</span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { title: t("tourPickup.details.labels.categories"), value: categories.join(", ") || t("tourPickup.details.defaults.categories") },
                { title: t("tourPickup.details.labels.languages"), value: languages.join(", ") || t("tourPickup.details.defaults.languages") },
                {
                  title: t("tourPickup.details.labels.capacity"),
                  value: t("tourPickup.details.defaults.capacity", { count: String(tour.capacity ?? 15) })
                },
                {
                  title: t("tourPickup.details.labels.physical"),
                  value: tour.physicalLevel ?? t("tourPickup.details.defaults.physical")
                }
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[16px] border border-[#F1F5F9] bg-white/40 px-4 py-3"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.includes.title")}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {includesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.excludes.title")}</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  {excludesList.map((entry) => (
                    <li key={entry} className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      {entry}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.itinerary.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.itinerary.title")}</h3>
              </div>
              <span className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.itinerary.badge")}</span>
            </div>
            <div className="relative mt-4 pl-0 lg:pl-10">
              <div className="absolute left-4 top-0 bottom-0 w-px border-l-2 border-dashed border-slate-200" />
              <div className="space-y-5">
                {visualTimeline.map((stop, index) => (
                  <div key={`${stop.title}-${index}`} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="h-3 w-3 rounded-full bg-indigo-600" />
                      {index !== visualTimeline.length - 1 && <span className="mt-2 h-6 w-px bg-slate-200" />}
                    </div>
                    <div className="flex-1 rounded-[16px] border border-[#F1F5F9] bg-white/70 px-4 py-3">
                      <p className="text-[0.65rem] uppercase tracking-[0.35em] text-slate-500">{stop.time}</p>
                      <p className="mt-1 text-[16px] font-semibold text-slate-900">{stop.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{stop.description ?? t("tourPickup.itinerary.fallback")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.reviews.eyebrow")}</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.reviews.title")}</h3>
              </div>
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("tourPickup.reviews.summary", { count: detailReviewLabel })}</div>
            </div>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr,1fr]">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-semibold text-slate-900">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.reviews.outOf")}</p>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  {reviewBreakdown.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="w-24 text-xs text-slate-500">{item.label}</span>
                      <div className="relative flex-1 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-2 rounded-full bg-emerald-500"
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="ml-2 text-xs font-semibold text-slate-500">{item.percent}%</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                  {reviewTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {reviewHighlights.map((review) => (
                  <div key={review.name} className="rounded-[16px] border border-[#F1F5F9] bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{review.name}</p>
                        <p className="text-xs text-slate-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{review.quote}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qué llevar</p>
                <h3 className="text-[16px] font-semibold text-slate-900">{t("tourPickup.packing.title")}</h3>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{t("tourPickup.packing.badge")}</span>
            </div>
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {packingList.map((item) => (
                <div
                  key={item.label}
                  className="flex min-w-[140px] flex-col items-center gap-2 rounded-[16px] border border-[#F1F5F9] bg-white/0 px-3 py-4 text-center"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pickup FAQ</p>
                <h3 className="text-[16px] font-semibold text-slate-900">
                  {locale === "es"
                    ? "Preguntas especificas de esta recogida"
                    : locale === "fr"
                      ? "Questions specifiques a ce pickup"
                      : "Pickup-specific questions"}
                </h3>
              </div>
              <span className="text-xs uppercase tracking-[0.35em] text-slate-400">{pickupTarget.name}</span>
            </div>
            <div className="mt-4 grid gap-3">
              {uniquePickupContent.faq.map((item) => (
                <details key={item.question} className="rounded-[18px] border border-slate-100 bg-slate-50/60 p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.question}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6 lg:w-[400px] w-full lg:sticky lg:top-16">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-xl" id="booking">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t("tourPickup.booking.eyebrow")}</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{t("tourPickup.booking.title")}</h3>
            <p className="text-sm text-slate-600">
              {t("tourPickup.booking.body", { hotel: pickupTarget.name })}
            </p>
            <TourBookingWidget
              tourId={tour.id}
              basePrice={tour.price}
              timeSlots={timeSlots}
              options={normalizedOptions ?? []}
              supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
              platformSharePercent={tour.platformSharePercent ?? 20}
              tourTitle={localizedTitle}
              tourImage={heroImage}
              hotelSlug={pickupTarget.slug}
              bookingCode={bookingCode ?? undefined}
              originHotelName={pickupTarget.name}
            />
            <div className="mt-6 rounded-[16px] border border-[#F1F5F9] bg-slate-50/60 p-4 text-sm text-slate-600 text-center">
              <p className="font-semibold text-slate-900">
                {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? t("tourPickup.booking.supplierFallback")}
              </p>
              <p>{t("tourPickup.booking.supplierNote")}</p>
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-emerald-50/80 p-5 text-sm text-emerald-900 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">{t("tourPickup.urgency.eyebrow")}</p>
            <p className="text-xl font-semibold">{t("tourPickup.urgency.title")}</p>
            <p className="text-xs text-emerald-700">{t("tourPickup.urgency.body", { hotel: pickupTarget.name })}</p>
          </div>
        </aside>
      </main>

      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}

export default async function TourHotelLandingRoute(props: TourHotelLandingParams) {
  return TourHotelLanding({ ...props, locale: "es" });
}
