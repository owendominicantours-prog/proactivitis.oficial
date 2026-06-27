import { prisma } from "@/lib/prisma";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { parseAdminItinerary, parseItinerary, type ItineraryStop } from "@/lib/itinerary";

export const NUEVA_GENERACION_BASE_URL = "https://proactivitis.com";
export const NUEVA_GENERACION_PATH = "/experiencias/tours";
export const NUEVA_GENERACION_INTENT_PATH = "/experiencias/tema";

export type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

export type NuevaGeneracionIntent = {
  slug: string;
  label: string;
  titlePrefix: string;
  keyword: string;
  audience: string;
  angle: string;
  proof: string;
  cta: string;
};

export const NUEVA_GENERACION_INTENTS: NuevaGeneracionIntent[] = [
  {
    slug: "con-recogida-en-hotel",
    label: "Recogida en hotel",
    titlePrefix: "Tour con recogida en hotel",
    keyword: "tour con recogida en hotel",
    audience: "viajeros que quieren evitar taxis, puntos confusos y coordinacion manual",
    angle: "enfatiza salida organizada, soporte por WhatsApp y confirmacion clara antes del pago",
    proof: "La decision se centra en el punto de encuentro, horario y datos del pasajero.",
    cta: "Reservar con recogida"
  },
  {
    slug: "para-familias",
    label: "Familias",
    titlePrefix: "Tour para familias",
    keyword: "excursion familiar",
    audience: "familias que necesitan claridad, ritmo manejable y seguridad antes de reservar",
    angle: "presenta el tour como una opcion facil de coordinar para adultos, jovenes y ninos",
    proof: "La pagina destaca duracion, preparacion, inclusiones y soporte durante el viaje.",
    cta: "Reservar para mi familia"
  },
  {
    slug: "para-parejas",
    label: "Parejas",
    titlePrefix: "Tour para parejas",
    keyword: "excursion para parejas",
    audience: "parejas que buscan fotos, experiencia memorable y reserva simple",
    angle: "convierte el tour en un plan romantico o especial sin friccion logistica",
    proof: "Se destacan momentos para fotos, comodidad y valor de experiencia.",
    cta: "Reservar para dos"
  },
  {
    slug: "privado-vip",
    label: "Privado VIP",
    titlePrefix: "Tour privado o VIP",
    keyword: "tour privado vip",
    audience: "clientes que prefieren privacidad, flexibilidad y trato mas personalizado",
    angle: "posiciona el tour como opcion premium con coordinacion clara y atencion humana",
    proof: "Se refuerza soporte, horario, proveedor y detalles de operacion antes de pagar.",
    cta: "Solicitar experiencia VIP"
  },
  {
    slug: "ultimo-minuto",
    label: "Ultimo minuto",
    titlePrefix: "Tour de ultimo minuto",
    keyword: "tour hoy o manana",
    audience: "viajeros que ya estan en destino y necesitan reservar rapido",
    angle: "enfatiza decision rapida, cupos, disponibilidad y confirmacion directa",
    proof: "La pagina reduce dudas con precio, horario, inclusiones y reserva inmediata.",
    cta: "Ver cupo disponible"
  },
  {
    slug: "mejor-precio",
    label: "Mejor precio",
    titlePrefix: "Tour con precio claro",
    keyword: "mejor precio excursion",
    audience: "compradores que comparan valor, inclusiones y transparencia",
    angle: "presenta el precio como una decision completa, no solo un numero bajo",
    proof: "Se muestran inclusiones, duracion, fotos y condiciones antes de reservar.",
    cta: "Reservar precio claro"
  },
  {
    slug: "top-rated",
    label: "Top rated",
    titlePrefix: "Tour recomendado",
    keyword: "tour recomendado",
    audience: "viajeros que quieren elegir rapido una opcion confiable",
    angle: "organiza la informacion para que el cliente entienda por que este tour merece prioridad",
    proof: "La experiencia combina fotos reales, itinerario, proveedor, preguntas frecuentes y reserva directa.",
    cta: "Elegir este tour"
  },
  {
    slug: "comparativa-excursiones",
    label: "Comparativa",
    titlePrefix: "Comparativa de excursion",
    keyword: "comparar excursiones",
    audience: "personas que comparan opciones antes de pagar",
    angle: "ayuda a comparar alternativas relacionadas antes de elegir una experiencia",
    proof: "Incluye tours relacionados, diferencias, datos operativos y ruta de reserva directa.",
    cta: "Comparar y reservar"
  }
];

export const getNuevaGeneracionIntent = (slug: string) =>
  NUEVA_GENERACION_INTENTS.find((intent) => intent.slug === slug) ?? null;

export type NuevaGeneracionTour = Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>;
export type NuevaGeneracionTourListItem = Awaited<ReturnType<typeof getNuevaGeneracionTours>>[number];

export const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
};

export const parseDuration = (value?: string | null) => {
  if (!value) return "4 horas";
  const trimmed = value.trim();
  if (!trimmed.startsWith("{")) return trimmed;
  try {
    const parsed = JSON.parse(trimmed) as { value?: string; unit?: string };
    return [parsed.value, parsed.unit].filter(Boolean).join(" ") || "4 horas";
  } catch {
    return trimmed;
  }
};

export const formatTimeSlot = (slot?: PersistedTimeSlot | null) => {
  if (!slot) return "09:00 AM";
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

export const normalizePickupTimes = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const times = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return times.length ? times : null;
};

export const parseOperatingDays = (value?: string | null) => {
  if (!value) return undefined;
  const parsed = parseJsonArray<string>(value);
  if (parsed.length) return parsed;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const toAbsoluteImage = (image?: string | null) => {
  if (!image) return `${NUEVA_GENERACION_BASE_URL}/fototours/fotosimple.jpg`;
  if (image.startsWith("http")) return image;
  return `${NUEVA_GENERACION_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

export const getNuevaGeneracionTours = async () =>
  prisma.tour.findMany({
    where: {
      status: "published",
      slug: { not: HIDDEN_TRANSFER_SLUG }
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      duration: true,
      shortDescription: true,
      description: true,
      heroImage: true,
      gallery: true,
      category: true,
      location: true,
      language: true,
      featured: true,
      createdAt: true,
      destination: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } },
      microZone: { select: { name: true, slug: true } }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 28
  });

export const getNuevaGeneracionTourBySlug = async (slug: string) =>
  prisma.tour.findFirst({
    where: {
      status: "published",
      AND: [{ slug }, { slug: { not: HIDDEN_TRANSFER_SLUG } }]
    },
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
      microZone: true
    }
  });

export const getNuevaGeneracionRelatedTours = async (
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>,
  take = 6
) =>
  prisma.tour.findMany({
    where: {
      status: "published",
      slug: { notIn: [HIDDEN_TRANSFER_SLUG, tour.slug] },
      OR: [
        ...(tour.destinationId ? [{ destinationId: tour.destinationId }] : []),
        ...(tour.departureDestinationId ? [{ departureDestinationId: tour.departureDestinationId }] : []),
        ...(tour.microZoneId ? [{ microZoneId: tour.microZoneId }] : []),
        { countryId: tour.countryId }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      duration: true,
      shortDescription: true,
      heroImage: true,
      gallery: true,
      category: true,
      location: true,
      destination: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } },
      microZone: { select: { name: true, slug: true } }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take
  });

const normalizeIntentText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const resolveTourPersona = (tour: {
  title: string;
  description?: string | null;
  shortDescription?: string | null;
  category?: string | null;
  location?: string | null;
}) => {
  const normalized = normalizeIntentText(
    [tour.title, tour.description, tour.shortDescription, tour.category, tour.location].filter(Boolean).join(" ")
  );
  if (/saona|catamaran|boat|barco|isla|snorkel|playa|beach|parasail|mar|ocean/.test(normalized)) {
    return {
      segment: "playa, mar y fotos",
      promise: "un dia de agua con logistica clara, tiempo para fotos y soporte antes de salir",
      hook: "Reserva el tour sin improvisar transporte, horarios ni punto de encuentro.",
      packing: "Traje de bano, ropa seca, protector solar y funda impermeable.",
      urgency: "Las salidas de playa y marina se cierran por cupos y ventanas de transporte."
    };
  }
  if (/buggy|atv|zip|horse|caballo|safari|aventura|adventure|off-road|offroad/.test(normalized)) {
    return {
      segment: "aventura y ruta activa",
      promise: "una experiencia con accion, paradas locales y coordinacion previa para evitar retrasos",
      hook: "Compra con salida organizada y detalles claros antes de llegar al punto de actividad.",
      packing: "Zapatos cerrados, ropa que pueda ensuciarse, lentes y protector solar.",
      urgency: "Los grupos de aventura dependen de briefing y horarios de ruta."
    };
  }
  if (/santo domingo|historia|cultura|cultural|city|ciudad|museo/.test(normalized)) {
    return {
      segment: "historia y cultura",
      promise: "una ruta guiada con tiempos protegidos para conocer puntos importantes sin correr",
      hook: "Ideal si quieres contexto local, transporte organizado y una visita con estructura.",
      packing: "Ropa ligera, zapatos comodos, identificacion y botella de agua.",
      urgency: "Las rutas culturales funcionan mejor con salida temprana y cupos confirmados."
    };
  }
  if (/samana|ballena|whale|cascada|waterfall|montana|nature|natural|rio/.test(normalized)) {
    return {
      segment: "naturaleza y dia completo",
      promise: "una salida larga con conexiones coordinadas y soporte durante el recorrido",
      hook: "Evita perder tiempo coordinando carretera, embarque o puntos de encuentro por separado.",
      packing: "Zapatos comodos, cambio ligero, protector solar y efectivo para extras.",
      urgency: "Las excursiones largas dependen de clima, carretera y cupos de embarque."
    };
  }
  return {
    segment: "experiencia guiada",
    promise: "un tour con precio claro, confirmacion y apoyo humano para reservar sin friccion",
    hook: "Una experiencia organizada para decidir rapido con la informacion importante en un solo lugar.",
    packing: "Ropa comoda, protector solar, telefono cargado y confirmacion de reserva.",
    urgency: "Los mejores horarios suelen agotarse primero en temporada alta."
  };
};

export const buildTourFacts = (tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>) => {
  const gallery = parseJsonArray<string>(tour.gallery);
  const heroImage = tour.heroImage ?? gallery[0] ?? "/fototours/fotosimple.jpg";
  const images = [heroImage, ...gallery.filter((image) => image && image !== heroImage)].slice(0, 8);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const firstTime = formatTimeSlot(timeSlots[0]);
  const duration = parseDuration(tour.duration);
  const itinerary = parseAdminItinerary(tour.adminNote ?? "");
  const parsedItinerary = itinerary.length ? itinerary : parseItinerary(tour.adminNote ?? "");
  const includes = tour.includes
    ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
    : ["Tour confirmado", "Asistencia local", "Soporte durante la reserva"];
  const categories = (tour.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = (tour.language ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const area = tour.departureDestination?.name ?? tour.destination?.name ?? tour.microZone?.name ?? tour.location;

  return {
    heroImage,
    images,
    timeSlots,
    firstTime,
    duration,
    itinerary: parsedItinerary.length ? parsedItinerary : buildDefaultItinerary(tour.title, area),
    includes,
    categories,
    languages,
    area: area ?? "Punta Cana"
  };
};

const buildDefaultItinerary = (title: string, area?: string | null): ItineraryStop[] => [
  {
    time: "Inicio",
    title: `Confirmacion de ${title}`,
    description: "Revisamos datos de reserva, pasajeros, horario y punto operativo antes de la salida."
  },
  {
    time: area ?? "Ruta",
    title: "Experiencia principal",
    description: `Disfruta la actividad con ruta organizada, soporte local y detalles pensados para reducir incertidumbre.`
  },
  {
    time: "Cierre",
    title: "Regreso y seguimiento",
    description: "Finaliza la experiencia con asistencia para cualquier ajuste posterior a la actividad."
  }
];

const PROACTIVITIS_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Punta Cana, La Altagracia",
  addressLocality: "Punta Cana",
  addressRegion: "La Altagracia",
  postalCode: "23000",
  addressCountry: "DO"
};

const PROACTIVITIS_PROVIDER = {
  "@type": "TravelAgency",
  "@id": `${NUEVA_GENERACION_BASE_URL}#organization`,
  name: "Proactivitis",
  url: NUEVA_GENERACION_BASE_URL,
  priceRange: "$$",
  address: PROACTIVITIS_ADDRESS,
  areaServed: {
    "@type": "AdministrativeArea",
    name: "Republica Dominicana"
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "info@proactivitis.com",
    telephone: "+1 (829) 475-6298",
    availableLanguage: ["es", "en"]
  }
};

const SERVICE_SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  doesNotShip: true,
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "DO"
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "d"
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "d"
    }
  }
};

const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  url: `${NUEVA_GENERACION_BASE_URL}/legal/refund-policy`,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 1,
  applicableCountry: "DO",
  returnFees: "https://schema.org/FreeReturn"
};

const getPriceValidUntil = () => {
  const future = new Date();
  future.setMonth(future.getMonth() + 6);
  return future.toISOString().split("T")[0];
};

export const buildNuevaGeneracionSchema = ({
  tour,
  facts,
  persona,
  canonical,
  intent,
  relatedTours = []
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  canonical: string;
  intent?: NuevaGeneracionIntent | null;
  relatedTours?: Awaited<ReturnType<typeof getNuevaGeneracionRelatedTours>>;
}) => {
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";
  const absoluteImages = facts.images.map(toAbsoluteImage);
  const faq = buildNuevaGeneracionFaq(tour.title, facts.area, persona, intent);
  const pageName = intent ? `${intent.titlePrefix}: ${tour.title}` : tour.title;
  const pageDescription = intent
    ? `${tour.title} para ${intent.audience}. ${intent.angle}.`
    : tour.shortDescription ?? persona.promise;
  const priceValidUntil = getPriceValidUntil();

  return {
    "@context": "https://schema.org",
    "@graph": [
      PROACTIVITIS_PROVIDER,
      {
        "@type": "WebSite",
        "@id": `${NUEVA_GENERACION_BASE_URL}#website`,
        name: "Proactivitis",
        url: NUEVA_GENERACION_BASE_URL
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        name: pageName,
        url: canonical,
        description: pageDescription,
        inLanguage: "es",
        isPartOf: { "@id": `${NUEVA_GENERACION_BASE_URL}#website` },
        mainEntity: [{ "@id": `${canonical}#product` }, { "@id": `${canonical}#tour` }],
        breadcrumb: { "@id": `${canonical}#breadcrumb` }
      },
      {
        "@type": "Product",
        "@id": `${canonical}#product`,
        name: pageName,
        description: pageDescription,
        image: absoluteImages,
        brand: { "@type": "Brand", name: "Proactivitis" },
        category: facts.categories[0] ?? persona.segment,
        additionalProperty: [
          { "@type": "PropertyValue", name: "Duracion", value: facts.duration },
          { "@type": "PropertyValue", name: "Zona", value: facts.area },
          { "@type": "PropertyValue", name: "Primera salida", value: facts.firstTime },
          { "@type": "PropertyValue", name: "Tipo de viajero", value: persona.segment }
        ],
        offers: {
          "@type": "Offer",
          url: canonical,
          price: tour.price.toFixed(2),
          priceCurrency: "USD",
          priceValidUntil,
          availability: "https://schema.org/InStock",
          seller: PROACTIVITIS_PROVIDER,
          shippingDetails: SERVICE_SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
          acceptedPaymentMethod: ["https://schema.org/CreditCard", "https://schema.org/ByBankTransferInAdvance"]
        }
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonical}#tour`,
        name: pageName,
        description: pageDescription,
        url: canonical,
        image: absoluteImages[0],
        touristType: persona.segment,
        provider: {
          "@type": "Organization",
          name: supplierName
        },
        offers: {
          "@type": "Offer",
          url: canonical,
          price: tour.price.toFixed(2),
          priceCurrency: "USD",
          priceValidUntil,
          availability: "https://schema.org/InStock",
          seller: PROACTIVITIS_PROVIDER,
          shippingDetails: SERVICE_SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY
        },
        itinerary: facts.itinerary.slice(0, 8).map((stop, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stop.title,
          description: stop.description,
          startTime: stop.time
        })),
        location: {
          "@type": "Place",
          name: facts.area
        }
      },
      {
        "@type": "OfferCatalog",
        "@id": `${canonical}#related-offers`,
        name: intent ? `Tours relacionados para ${intent.label}` : `Tours relacionados con ${tour.title}`,
        itemListElement: relatedTours.map((related, index) => ({
          "@type": "Offer",
          position: index + 1,
          name: related.title,
          url: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${related.slug}`,
          price: related.price.toFixed(2),
          priceCurrency: "USD",
          priceValidUntil,
          availability: "https://schema.org/InStock",
          seller: PROACTIVITIS_PROVIDER,
          shippingDetails: SERVICE_SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
          itemOffered: {
            "@type": "TouristTrip",
            name: related.title,
            image: toAbsoluteImage(related.heroImage ?? parseJsonArray<string>(related.gallery)[0] ?? null),
            touristType: related.category ?? "Tour"
          }
        }))
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#related-tours`,
        name: "Tours alternativos dentro de Proactivitis",
        itemListElement: relatedTours.map((related, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: related.title,
          url: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}/${related.slug}`
        }))
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      },
      {
        "@type": "ImageGallery",
        "@id": `${canonical}#gallery`,
        name: `${tour.title} fotos`,
        image: absoluteImages.map((image, index) => ({
          "@type": "ImageObject",
          position: index + 1,
          url: image,
          caption: `${tour.title} - imagen ${index + 1}`
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Tours", item: `${NUEVA_GENERACION_BASE_URL}/tours` },
          { "@type": "ListItem", position: 2, name: "Experiencias", item: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}` },
          { "@type": "ListItem", position: 3, name: tour.title, item: canonical }
        ]
      }
    ]
  };
};

export const buildNuevaGeneracionFaq = (
  title: string,
  area: string,
  persona: ReturnType<typeof resolveTourPersona>,
  intent?: NuevaGeneracionIntent | null
) => [
  {
    question: intent
      ? `Por que reservar ${title} como ${intent.keyword}?`
      : `Por que reservar ${title} con Proactivitis?`,
    answer: intent
      ? `${title} encaja con viajeros que buscan ${intent.keyword}: ${intent.audience}. ${intent.angle}.`
      : `${title} reune precio, horario, fotos, preparacion, soporte local y reserva directa en una sola experiencia.`
  },
  {
    question: `Que hace diferente a ${title} frente a otros tours en ${area}?`,
    answer: `${persona.promise}. La pagina destaca lo que importa antes de reservar: precio, horario, fotos, inclusiones, preparacion y soporte local.`
  },
  {
    question: `Que debo llevar para ${title}?`,
    answer: persona.packing
  },
  {
    question: `Conviene reservar con anticipacion?`,
    answer: persona.urgency
  }
];

export const buildIntentLandingCopy = ({
  tour,
  facts,
  persona,
  intent
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  intent: NuevaGeneracionIntent;
}) => ({
  title: `${intent.titlePrefix}: ${tour.title}`,
  eyebrow: `${intent.label} | ${facts.area}`,
  description: `${tour.title} para ${intent.audience}. ${intent.angle} ${persona.promise}.`,
  decision: [
    {
      title: "Para quien es",
      body: `Pensado para ${intent.audience}.`
    },
    {
      title: "Antes de reservar",
      body: intent.proof
    },
    {
      title: "Consejo de reserva",
      body: `${persona.hook} ${persona.urgency}`
    }
  ],
  cta: intent.cta
});
