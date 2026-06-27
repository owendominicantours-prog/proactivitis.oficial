import { prisma } from "@/lib/prisma";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import { parseAdminItinerary, parseItinerary, type ItineraryStop } from "@/lib/itinerary";

export const NUEVA_GENERACION_BASE_URL = "https://proactivitis.com";
export const NUEVA_GENERACION_PATH = "/nueva-generacion/tours";

export type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

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
    hook: "Una landing creada para decidir rapido con la informacion comercial importante en un solo lugar.",
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

export const buildNuevaGeneracionSchema = ({
  tour,
  facts,
  persona,
  canonical
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  canonical: string;
}) => {
  const supplierName = tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proactivitis";
  const absoluteImages = facts.images.map(toAbsoluteImage);
  const faq = buildNuevaGeneracionFaq(tour.title, facts.area, persona);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${canonical}#product`,
        name: tour.title,
        description: tour.shortDescription ?? persona.promise,
        image: absoluteImages,
        brand: { "@type": "Brand", name: "Proactivitis" },
        category: facts.categories[0] ?? persona.segment,
        offers: {
          "@type": "Offer",
          url: canonical,
          price: tour.price.toFixed(2),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          seller: {
            "@type": "Organization",
            name: supplierName
          }
        },
      },
      {
        "@type": "TouristTrip",
        "@id": `${canonical}#tour`,
        name: tour.title,
        description: persona.promise,
        url: canonical,
        image: absoluteImages[0],
        touristType: persona.segment,
        provider: {
          "@type": "Organization",
          name: supplierName
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
          { "@type": "ListItem", position: 2, name: "Nueva Generacion", item: `${NUEVA_GENERACION_BASE_URL}${NUEVA_GENERACION_PATH}` },
          { "@type": "ListItem", position: 3, name: tour.title, item: canonical }
        ]
      }
    ]
  };
};

export const buildNuevaGeneracionFaq = (
  title: string,
  area: string,
  persona: ReturnType<typeof resolveTourPersona>
) => [
  {
    question: `Por que reservar ${title} en esta landing de Nueva Generacion?`,
    answer: `Esta pagina fue creada solo para ${title}, con una propuesta comercial enfocada en ${persona.segment}, detalles de preparacion, schema avanzado y una reserva directa sin depender de una pagina generica.`
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
