import { prisma } from "@/lib/prisma";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";
import {
  parseAdminItinerary,
  parseItinerary,
  type ItineraryStop,
} from "@/lib/itinerary";

export const NUEVA_GENERACION_BASE_URL = "https://proactivitis.com";
export const NUEVA_GENERACION_HUB_PATH = "/excursiones-punta-cana";
export const NUEVA_GENERACION_PATH = "/excursiones-punta-cana/tour";
export const NUEVA_GENERACION_INTENT_PATH = "/excursiones-punta-cana";

export type NuevaGeneracionLocale = "es" | "en" | "fr";

export const NUEVA_GENERACION_LOCALES: NuevaGeneracionLocale[] = [
  "es",
  "en",
  "fr",
];

const NUEVA_GENERACION_LOCALE_PATHS: Record<
  NuevaGeneracionLocale,
  { hub: string; tour: string; intent: string }
> = {
  es: {
    hub: "/excursiones-punta-cana",
    tour: "/excursiones-punta-cana/tour",
    intent: "/excursiones-punta-cana",
  },
  en: {
    hub: "/en/punta-cana-excursions",
    tour: "/en/punta-cana-excursions/tour",
    intent: "/en/punta-cana-excursions",
  },
  fr: {
    hub: "/fr/excursions-punta-cana",
    tour: "/fr/excursions-punta-cana/tour",
    intent: "/fr/excursions-punta-cana",
  },
};

export const getNuevaGeneracionHubPath = (
  locale: NuevaGeneracionLocale = "es",
) => NUEVA_GENERACION_LOCALE_PATHS[locale].hub;

export const buildNuevaGeneracionTourPath = (
  slug: string,
  locale: NuevaGeneracionLocale = "es",
) => `${NUEVA_GENERACION_LOCALE_PATHS[locale].tour}/${slug}`;
export const buildNuevaGeneracionIntentPath = (
  intentSlug: string,
  locale: NuevaGeneracionLocale = "es",
) => `${NUEVA_GENERACION_LOCALE_PATHS[locale].intent}/${intentSlug}`;
export const buildNuevaGeneracionIntentTourPath = (
  slug: string,
  intentSlug: string,
  locale: NuevaGeneracionLocale = "es",
) => `${NUEVA_GENERACION_LOCALE_PATHS[locale].intent}/${intentSlug}/${slug}`;

export type PersistedTimeSlot = {
  hour: number;
  minute: string;
  period: "AM" | "PM";
};

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
    audience:
      "viajeros que quieren evitar taxis, puntos confusos y coordinacion manual",
    angle:
      "enfatiza salida organizada, soporte por WhatsApp y confirmacion clara antes del pago",
    proof:
      "La decision se centra en el punto de encuentro, horario y datos del pasajero.",
    cta: "Reservar con recogida",
  },
  {
    slug: "para-familias",
    label: "Familias",
    titlePrefix: "Tour para familias",
    keyword: "excursion familiar",
    audience:
      "familias que necesitan claridad, ritmo manejable y seguridad antes de reservar",
    angle:
      "presenta el tour como una opcion facil de coordinar para adultos, jovenes y ninos",
    proof:
      "La pagina destaca duracion, preparacion, inclusiones y soporte durante el viaje.",
    cta: "Reservar para mi familia",
  },
  {
    slug: "para-parejas",
    label: "Parejas",
    titlePrefix: "Tour para parejas",
    keyword: "excursion para parejas",
    audience:
      "parejas que buscan fotos, experiencia memorable y reserva simple",
    angle:
      "convierte el tour en un plan romantico o especial sin friccion logistica",
    proof: "Se destacan momentos para fotos, comodidad y valor de experiencia.",
    cta: "Reservar para dos",
  },
  {
    slug: "privado-vip",
    label: "Privado VIP",
    titlePrefix: "Tour privado o VIP",
    keyword: "tour privado vip",
    audience:
      "clientes que prefieren privacidad, flexibilidad y trato mas personalizado",
    angle:
      "posiciona el tour como opcion premium con coordinacion clara y atencion humana",
    proof:
      "Se refuerza soporte, horario, proveedor y detalles de operacion antes de pagar.",
    cta: "Solicitar experiencia VIP",
  },
  {
    slug: "ultimo-minuto",
    label: "Ultimo minuto",
    titlePrefix: "Tour de ultimo minuto",
    keyword: "tour hoy o manana",
    audience: "viajeros que ya estan en destino y necesitan reservar rapido",
    angle:
      "enfatiza decision rapida, cupos, disponibilidad y confirmacion directa",
    proof:
      "La pagina reduce dudas con precio, horario, inclusiones y reserva inmediata.",
    cta: "Ver cupo disponible",
  },
  {
    slug: "mejor-precio",
    label: "Mejor precio",
    titlePrefix: "Tour con precio claro",
    keyword: "mejor precio excursion",
    audience: "compradores que comparan valor, inclusiones y transparencia",
    angle:
      "presenta el precio como una decision completa, no solo un numero bajo",
    proof:
      "Se muestran inclusiones, duracion, fotos y condiciones antes de reservar.",
    cta: "Reservar precio claro",
  },
  {
    slug: "top-rated",
    label: "Top rated",
    titlePrefix: "Tour recomendado",
    keyword: "tour recomendado",
    audience: "viajeros que quieren elegir rapido una opcion confiable",
    angle:
      "organiza la informacion para que el cliente entienda por que este tour merece prioridad",
    proof:
      "La experiencia combina fotos reales, itinerario, proveedor, preguntas frecuentes y reserva directa.",
    cta: "Elegir este tour",
  },
  {
    slug: "comparativa-excursiones",
    label: "Comparativa",
    titlePrefix: "Comparativa de excursion",
    keyword: "comparar excursiones",
    audience: "personas que comparan opciones antes de pagar",
    angle:
      "ayuda a comparar alternativas relacionadas antes de elegir una experiencia",
    proof:
      "Incluye tours relacionados, diferencias, datos operativos y ruta de reserva directa.",
    cta: "Comparar y reservar",
  },
];

const NUEVA_GENERACION_INTENT_LOCALE_COPY: Record<
  string,
  Partial<Record<NuevaGeneracionLocale, Partial<NuevaGeneracionIntent>>>
> = {
  "con-recogida-en-hotel": {
    en: {
      slug: "hotel-pickup",
      label: "Hotel pickup",
      titlePrefix: "Tour with hotel pickup",
      keyword: "tour with hotel pickup",
      audience:
        "travelers who want to avoid taxis, confusing meeting points and manual coordination",
      angle:
        "highlights organized departure, WhatsApp support and clear confirmation before payment",
      proof:
        "The decision is centered on pickup point, schedule and passenger details.",
      cta: "Book with pickup",
    },
    fr: {
      slug: "prise-en-charge-hotel",
      label: "Prise en charge hôtel",
      titlePrefix: "Tour avec prise en charge hôtel",
      keyword: "tour avec prise en charge hôtel",
      audience:
        "voyageurs qui veulent éviter les taxis, les points de rencontre confus et la coordination manuelle",
      angle:
        "met en avant un départ organisé, le support WhatsApp et une confirmation claire avant le paiement",
      proof:
        "La décision se concentre sur le point de prise en charge, l'horaire et les informations passagers.",
      cta: "Réserver avec pickup",
    },
  },
  "para-familias": {
    en: {
      slug: "families",
      label: "Families",
      titlePrefix: "Family tour",
      keyword: "family excursion",
      audience:
        "families that need clarity, a manageable pace and safety before booking",
      angle:
        "presents the tour as an easy option to coordinate for adults, teens and children",
      proof:
        "The page highlights duration, preparation, inclusions and support during the trip.",
      cta: "Book for my family",
    },
    fr: {
      slug: "familles",
      label: "Familles",
      titlePrefix: "Tour pour familles",
      keyword: "excursion en famille",
      audience:
        "familles qui veulent de la clarté, un rythme simple et de la sécurité avant de réserver",
      angle:
        "présente le tour comme une option facile à coordonner pour adultes, adolescents et enfants",
      proof:
        "La page met en avant la durée, la préparation, les inclusions et le support pendant l'expérience.",
      cta: "Réserver en famille",
    },
  },
  "para-parejas": {
    en: {
      slug: "couples",
      label: "Couples",
      titlePrefix: "Tour for couples",
      keyword: "couples excursion",
      audience:
        "couples looking for photos, a memorable experience and a simple booking flow",
      angle:
        "turns the tour into a romantic or special plan without logistical friction",
      proof: "Photo moments, comfort and experience value are highlighted.",
      cta: "Book for two",
    },
    fr: {
      slug: "couples",
      label: "Couples",
      titlePrefix: "Tour pour couples",
      keyword: "excursion pour couples",
      audience:
        "couples qui cherchent des photos, une expérience mémorable et une réservation simple",
      angle:
        "transforme le tour en plan romantique ou spécial sans friction logistique",
      proof:
        "Les moments photo, le confort et la valeur de l'expérience sont mis en avant.",
      cta: "Réserver pour deux",
    },
  },
  "privado-vip": {
    en: {
      slug: "private-vip",
      label: "Private VIP",
      titlePrefix: "Private or VIP tour",
      keyword: "private VIP tour",
      audience:
        "customers who prefer privacy, flexibility and more personalized attention",
      angle:
        "positions the tour as a premium option with clear coordination and human support",
      proof:
        "Support, schedule, provider and operating details are reinforced before payment.",
      cta: "Request VIP experience",
    },
    fr: {
      slug: "prive-vip",
      label: "Privé VIP",
      titlePrefix: "Tour privé ou VIP",
      keyword: "tour privé VIP",
      audience:
        "clients qui préfèrent intimité, flexibilité et attention plus personnalisée",
      angle:
        "positionne le tour comme une option premium avec coordination claire et support humain",
      proof:
        "Le support, l'horaire, le fournisseur et les détails d'opération sont renforcés avant le paiement.",
      cta: "Demander l'expérience VIP",
    },
  },
  "ultimo-minuto": {
    en: {
      slug: "last-minute",
      label: "Last minute",
      titlePrefix: "Last-minute tour",
      keyword: "tour today or tomorrow",
      audience: "travelers already in destination who need to book quickly",
      angle:
        "emphasizes quick decisions, spaces, availability and direct confirmation",
      proof:
        "The page reduces doubt with price, schedule, inclusions and immediate booking.",
      cta: "Check availability",
    },
    fr: {
      slug: "derniere-minute",
      label: "Dernière minute",
      titlePrefix: "Tour de dernière minute",
      keyword: "tour aujourd'hui ou demain",
      audience: "voyageurs déjà sur place qui doivent réserver rapidement",
      angle:
        "met l'accent sur la décision rapide, les places, la disponibilité et la confirmation directe",
      proof:
        "La page réduit les doutes avec prix, horaire, inclusions et réservation immédiate.",
      cta: "Voir la disponibilité",
    },
  },
  "mejor-precio": {
    en: {
      slug: "best-price",
      label: "Best price",
      titlePrefix: "Tour with clear price",
      keyword: "best price excursion",
      audience: "buyers comparing value, inclusions and transparency",
      angle: "presents price as a complete decision, not just a low number",
      proof:
        "Inclusions, duration, photos and conditions are shown before booking.",
      cta: "Book clear price",
    },
    fr: {
      slug: "meilleur-prix",
      label: "Meilleur prix",
      titlePrefix: "Tour avec prix clair",
      keyword: "excursion meilleur prix",
      audience: "acheteurs qui comparent valeur, inclusions et transparence",
      angle:
        "présente le prix comme une décision complète, pas seulement un chiffre bas",
      proof:
        "Les inclusions, la durée, les photos et les conditions sont affichées avant de réserver.",
      cta: "Réserver au prix clair",
    },
  },
  "top-rated": {
    en: {
      slug: "top-rated",
      label: "Top rated",
      titlePrefix: "Recommended tour",
      keyword: "recommended tour",
      audience: "travelers who want to choose a reliable option quickly",
      angle:
        "organizes the information so the customer understands why this tour deserves priority",
      proof:
        "The experience combines real photos, itinerary, provider, FAQs and direct booking.",
      cta: "Choose this tour",
    },
    fr: {
      slug: "mieux-notes",
      label: "Mieux notés",
      titlePrefix: "Tour recommandé",
      keyword: "tour recommandé",
      audience: "voyageurs qui veulent choisir rapidement une option fiable",
      angle:
        "organise l'information pour comprendre pourquoi ce tour mérite la priorité",
      proof:
        "L'expérience combine photos réelles, itinéraire, fournisseur, FAQ et réservation directe.",
      cta: "Choisir ce tour",
    },
  },
  "comparativa-excursiones": {
    en: {
      slug: "compare-excursions",
      label: "Comparison",
      titlePrefix: "Excursion comparison",
      keyword: "compare excursions",
      audience: "people comparing options before paying",
      angle: "helps compare related alternatives before choosing an experience",
      proof:
        "Includes related tours, differences, operating data and a direct booking path.",
      cta: "Compare and book",
    },
    fr: {
      slug: "comparer-excursions",
      label: "Comparatif",
      titlePrefix: "Comparatif d'excursion",
      keyword: "comparer excursions",
      audience: "personnes qui comparent les options avant de payer",
      angle:
        "aide à comparer les alternatives liées avant de choisir une expérience",
      proof:
        "Inclut des tours liés, différences, données opérationnelles et chemin de réservation directe.",
      cta: "Comparer et réserver",
    },
  },
};

export const localizeNuevaGeneracionIntent = (
  intent: NuevaGeneracionIntent,
  locale: NuevaGeneracionLocale = "es",
): NuevaGeneracionIntent => ({
  ...intent,
  ...(NUEVA_GENERACION_INTENT_LOCALE_COPY[intent.slug]?.[locale] ?? {}),
});

export const getNuevaGeneracionIntents = (
  locale: NuevaGeneracionLocale = "es",
) =>
  NUEVA_GENERACION_INTENTS.map((intent) =>
    localizeNuevaGeneracionIntent(intent, locale),
  );

export const getNuevaGeneracionIntent = (
  slug: string,
  locale: NuevaGeneracionLocale = "es",
) => {
  if (locale === "es")
    return (
      NUEVA_GENERACION_INTENTS.find((intent) => intent.slug === slug) ?? null
    );
  const match = NUEVA_GENERACION_INTENTS.find((intent) => {
    const localizedSlug =
      NUEVA_GENERACION_INTENT_LOCALE_COPY[intent.slug]?.[locale]?.slug;
    return localizedSlug === slug || intent.slug === slug;
  });
  return match ? localizeNuevaGeneracionIntent(match, locale) : null;
};

export type NuevaGeneracionTour = Awaited<
  ReturnType<typeof getNuevaGeneracionTourBySlug>
>;
export type NuevaGeneracionTourListItem = Awaited<
  ReturnType<typeof getNuevaGeneracionTours>
>[number];

export const parseJsonArray = <T>(value?: string | null): T[] => {
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
  const times = value.filter(
    (item): item is string =>
      typeof item === "string" && item.trim().length > 0,
  );
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

const parseTextList = (value: unknown): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
      .map((item) => fixTourTextTypos(item.trim()));
  }
  if (typeof value === "string") {
    const parsed = parseJsonArray<unknown>(value);
    if (parsed.length) return parseTextList(parsed);
    return value
      .split(";")
      .map((item) => fixTourTextTypos(item.trim()))
      .filter(Boolean);
  }
  return [];
};

const fixTourTextTypos = (value: string) =>
  value.replace(/\btorres\b/gi, "toallas");

const getTourTranslation = (
  tour: { translations?: Array<Record<string, unknown>> },
  locale: NuevaGeneracionLocale,
) => (locale === "es" ? null : (tour.translations?.[0] ?? null));

const uniqueTextItems = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalizeIntentText(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const toAbsoluteImage = (image?: string | null) => {
  if (!image) return `${NUEVA_GENERACION_BASE_URL}/fototours/fotosimple.jpg`;
  if (image.startsWith("http")) return image;
  return `${NUEVA_GENERACION_BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
};

export const getNuevaGeneracionTours = async (
  locale: NuevaGeneracionLocale = "es",
) =>
  prisma.tour.findMany({
    where: {
      status: "published",
      slug: { not: HIDDEN_TRANSFER_SLUG },
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
      microZone: { select: { name: true, slug: true } },
      translations: {
        where: { locale },
        select: {
          title: true,
          subtitle: true,
          shortDescription: true,
          description: true,
          includesList: true,
          notIncludedList: true,
          highlights: true,
          durationUnit: true,
        },
        take: 1,
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 28,
  });

export const getNuevaGeneracionTourBySlug = async (
  slug: string,
  locale: NuevaGeneracionLocale = "es",
) =>
  prisma.tour.findFirst({
    where: {
      status: "published",
      AND: [{ slug }, { slug: { not: HIDDEN_TRANSFER_SLUG } }],
    },
    include: {
      SupplierProfile: {
        include: { User: { select: { name: true } } },
      },
      options: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
      },
      country: true,
      destination: true,
      departureDestination: true,
      microZone: true,
      translations: {
        where: { locale },
        take: 1,
      },
    },
  });

export const getNuevaGeneracionRelatedTours = async (
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>,
  take = 6,
  locale: NuevaGeneracionLocale = "es",
) =>
  prisma.tour.findMany({
    where: {
      status: "published",
      slug: { notIn: [HIDDEN_TRANSFER_SLUG, tour.slug] },
      OR: [
        ...(tour.destinationId ? [{ destinationId: tour.destinationId }] : []),
        ...(tour.departureDestinationId
          ? [{ departureDestinationId: tour.departureDestinationId }]
          : []),
        ...(tour.microZoneId ? [{ microZoneId: tour.microZoneId }] : []),
        { countryId: tour.countryId },
      ],
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
      microZone: { select: { name: true, slug: true } },
      translations: {
        where: { locale },
        select: { title: true, shortDescription: true },
        take: 1,
      },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take,
  });

export const getNuevaGeneracionDisplayTitle = (
  tour: {
    slug: string;
    title: string;
    translations?: Array<Record<string, unknown>>;
  },
  locale: NuevaGeneracionLocale = "es",
) => {
  if (tour.slug === "sunset-catamaran-snorkel") {
    if (locale === "en")
      return "Sunset Catamaran with Snorkeling in Punta Cana";
    if (locale === "fr")
      return "Catamaran au coucher du soleil avec snorkeling à Punta Cana";
    return "Catamarán al Atardecer con Snorkel en Punta Cana";
  }
  const translatedTitle = getTourTranslation(tour, locale)?.title;
  if (typeof translatedTitle === "string" && translatedTitle.trim())
    return fixTourTextTypos(translatedTitle.trim());
  return tour.title;
};

export const getNuevaGeneracionTourDescription = (
  tour: {
    shortDescription?: string | null;
    description?: string | null;
    translations?: Array<Record<string, unknown>>;
  },
  locale: NuevaGeneracionLocale = "es",
) => {
  const translation = getTourTranslation(tour, locale);
  const translatedShort = translation?.shortDescription;
  const translatedDescription = translation?.description;
  if (typeof translatedShort === "string" && translatedShort.trim())
    return fixTourTextTypos(translatedShort.trim());
  if (
    typeof translatedDescription === "string" &&
    translatedDescription.trim()
  ) {
    return fixTourTextTypos(translatedDescription.trim());
  }
  return fixTourTextTypos(
    (tour.shortDescription ?? tour.description ?? "").trim(),
  );
};

const normalizeIntentText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const resolveTourPersona = (
  tour: {
    slug?: string;
    title: string;
    description?: string | null;
    shortDescription?: string | null;
    category?: string | null;
    location?: string | null;
    translations?: Array<Record<string, unknown>>;
  },
  locale: NuevaGeneracionLocale = "es",
) => {
  const title = getNuevaGeneracionDisplayTitle(
    {
      slug: tour.slug ?? "",
      title: tour.title,
      translations: tour.translations,
    },
    locale,
  );
  const description = getNuevaGeneracionTourDescription(tour, locale);
  const normalized = normalizeIntentText(
    [title, description, tour.category, tour.location]
      .filter(Boolean)
      .join(" "),
  );
  if (
    /saona|catamaran|boat|barco|isla|snorkel|playa|beach|parasail|mar|ocean/.test(
      normalized,
    )
  ) {
    const copy = {
      es: {
        segment: "playa, mar y fotos",
        promise:
          "un dia de agua con logistica clara, tiempo para fotos y soporte antes de salir",
        hook: "Reserva el tour sin improvisar transporte, horarios ni punto de encuentro.",
        packing:
          "Traje de bano, ropa seca, protector solar y funda impermeable.",
        urgency:
          "Las salidas de playa y marina se cierran por cupos y ventanas de transporte.",
      },
      en: {
        segment: "beach, sea and photos",
        promise:
          "a water experience with clear logistics, photo time and support before departure",
        hook: "Book without improvising transport, schedules or meeting points.",
        packing: "Swimwear, dry clothes, sunscreen and a waterproof pouch.",
        urgency:
          "Beach and marina departures depend on seats and transport windows.",
      },
      fr: {
        segment: "plage, mer et photos",
        promise:
          "une expérience aquatique avec logistique claire, temps photo et support avant le départ",
        hook: "Réservez sans improviser transport, horaires ou point de rencontre.",
        packing:
          "Maillot de bain, vêtements secs, crème solaire et pochette imperméable.",
        urgency:
          "Les sorties plage et marina dépendent des places et des fenêtres de transport.",
      },
    };
    return copy[locale];
  }
  if (
    /buggy|atv|zip|horse|caballo|safari|aventura|adventure|off-road|offroad/.test(
      normalized,
    )
  ) {
    const copy = {
      es: {
        segment: "aventura y ruta activa",
        promise:
          "una experiencia con accion, paradas locales y coordinacion previa para evitar retrasos",
        hook: "Compra con salida organizada y detalles claros antes de llegar al punto de actividad.",
        packing:
          "Zapatos cerrados, ropa que pueda ensuciarse, lentes y protector solar.",
        urgency:
          "Los grupos de aventura dependen de briefing y horarios de ruta.",
      },
      en: {
        segment: "adventure and active route",
        promise:
          "an active experience with local stops and advance coordination to avoid delays",
        hook: "Book with organized departure and clear details before reaching the activity point.",
        packing:
          "Closed shoes, clothes that can get dirty, sunglasses and sunscreen.",
        urgency: "Adventure groups depend on briefing and route schedules.",
      },
      fr: {
        segment: "aventure et route active",
        promise:
          "une expérience active avec arrêts locaux et coordination en avance pour éviter les retards",
        hook: "Réservez avec départ organisé et détails clairs avant d'arriver au point d'activité.",
        packing:
          "Chaussures fermées, vêtements pouvant se salir, lunettes et crème solaire.",
        urgency:
          "Les groupes d'aventure dépendent du briefing et des horaires de route.",
      },
    };
    return copy[locale];
  }
  if (
    /santo domingo|historia|cultura|cultural|city|ciudad|museo/.test(normalized)
  ) {
    const copy = {
      es: {
        segment: "historia y cultura",
        promise:
          "una ruta guiada con tiempos protegidos para conocer puntos importantes sin correr",
        hook: "Ideal si quieres contexto local, transporte organizado y una visita con estructura.",
        packing:
          "Ropa ligera, zapatos comodos, identificacion y botella de agua.",
        urgency:
          "Las rutas culturales funcionan mejor con salida temprana y cupos confirmados.",
      },
      en: {
        segment: "history and culture",
        promise:
          "a guided route with protected timing to visit important places without rushing",
        hook: "Ideal if you want local context, organized transport and a structured visit.",
        packing: "Light clothing, comfortable shoes, ID and a bottle of water.",
        urgency:
          "Cultural routes work best with early departure and confirmed seats.",
      },
      fr: {
        segment: "histoire et culture",
        promise:
          "un parcours guidé avec temps protégé pour visiter les lieux importants sans courir",
        hook: "Idéal si vous voulez du contexte local, transport organisé et visite structurée.",
        packing:
          "Vêtements légers, chaussures confortables, pièce d'identité et bouteille d'eau.",
        urgency:
          "Les routes culturelles fonctionnent mieux avec départ tôt et places confirmées.",
      },
    };
    return copy[locale];
  }
  if (
    /samana|ballena|whale|cascada|waterfall|montana|nature|natural|rio/.test(
      normalized,
    )
  ) {
    const copy = {
      es: {
        segment: "naturaleza y dia completo",
        promise:
          "una salida larga con conexiones coordinadas y soporte durante el recorrido",
        hook: "Evita perder tiempo coordinando carretera, embarque o puntos de encuentro por separado.",
        packing:
          "Zapatos comodos, cambio ligero, protector solar y efectivo para extras.",
        urgency:
          "Las excursiones largas dependen de clima, carretera y cupos de embarque.",
      },
      en: {
        segment: "nature and full day",
        promise:
          "a long outing with coordinated connections and support during the route",
        hook: "Avoid losing time coordinating roads, boarding or meeting points separately.",
        packing:
          "Comfortable shoes, light change of clothes, sunscreen and cash for extras.",
        urgency:
          "Long excursions depend on weather, road timing and boarding capacity.",
      },
      fr: {
        segment: "nature et journée complète",
        promise:
          "une longue sortie avec connexions coordonnées et support pendant le parcours",
        hook: "Évitez de perdre du temps à coordonner route, embarquement ou points de rencontre séparément.",
        packing:
          "Chaussures confortables, change léger, crème solaire et espèces pour extras.",
        urgency:
          "Les longues excursions dépendent de la météo, de la route et des places d'embarquement.",
      },
    };
    return copy[locale];
  }
  const fallback = {
    es: {
      segment: "experiencia guiada",
      promise:
        "un tour con precio claro, confirmacion y apoyo humano para reservar sin friccion",
      hook: "Una experiencia organizada para decidir rapido con la informacion importante en un solo lugar.",
      packing:
        "Ropa comoda, protector solar, telefono cargado y confirmacion de reserva.",
      urgency:
        "Los mejores horarios suelen agotarse primero en temporada alta.",
    },
    en: {
      segment: "guided experience",
      promise:
        "a tour with clear price, confirmation and human support for a smooth booking",
      hook: "An organized experience that puts the important information in one place.",
      packing:
        "Comfortable clothes, sunscreen, charged phone and booking confirmation.",
      urgency: "The best times usually sell first in high season.",
    },
    fr: {
      segment: "expérience guidée",
      promise:
        "un tour avec prix clair, confirmation et support humain pour réserver sans friction",
      hook: "Une expérience organisée avec les informations importantes au même endroit.",
      packing:
        "Vêtements confortables, crème solaire, téléphone chargé et confirmation de réservation.",
      urgency:
        "Les meilleurs horaires partent souvent en premier en haute saison.",
    },
  };
  return fallback[locale];
};

export const buildTourFacts = (
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>,
  locale: NuevaGeneracionLocale = "es",
) => {
  const translation = getTourTranslation(tour, locale);
  const displayTitle = getNuevaGeneracionDisplayTitle(tour, locale);
  const gallery = parseJsonArray<string>(tour.gallery);
  const heroImage = tour.heroImage ?? gallery[0] ?? "/fototours/fotosimple.jpg";
  const images = [
    heroImage,
    ...gallery.filter((image) => image && image !== heroImage),
  ].slice(0, 8);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const firstTime = formatTimeSlot(timeSlots[0]);
  const duration = parseDuration(tour.duration);
  const itinerary = parseAdminItinerary(tour.adminNote ?? "");
  const parsedItinerary = itinerary.length
    ? itinerary
    : parseItinerary(tour.adminNote ?? "");
  const includesFromString = tour.includes
    ? tour.includes
        .split(";")
        .map((item) => fixTourTextTypos(item.trim()))
        .filter(Boolean)
    : [];
  const includesList = parseTextList(
    translation?.includesList ?? tour.includesList,
  );
  const notIncluded = parseTextList(
    translation?.notIncludedList ?? tour.notIncludedList,
  );
  const includes = includesList.length
    ? includesList
    : includesFromString.length
      ? includesFromString
      : ["Tour confirmado", "Asistencia local", "Soporte durante la reserva"];
  const categories = (tour.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = (tour.language ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const area =
    tour.departureDestination?.name ??
    tour.destination?.name ??
    tour.microZone?.name ??
    tour.location;

  return {
    heroImage,
    images,
    timeSlots,
    firstTime,
    duration,
    itinerary: parsedItinerary.length
      ? parsedItinerary
      : buildDefaultItinerary(displayTitle, area),
    includes,
    notIncluded,
    categories,
    languages,
    area: area ?? "Punta Cana",
    requirements: tour.requirements ?? null,
    cancellationPolicy: tour.cancellationPolicy ?? null,
    minAge: tour.minAge ?? null,
    physicalLevel: tour.physicalLevel ?? null,
    pickup: tour.pickup ?? null,
    meetingPoint: tour.meetingPoint ?? null,
  };
};

export const buildNuevaGeneracionConversionCopy = ({
  tour,
  facts,
  persona,
  locale = "es",
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  locale?: NuevaGeneracionLocale;
}) => {
  const displayTitle = getNuevaGeneracionDisplayTitle(tour, locale);
  const normalized = normalizeIntentText(
    [
      displayTitle,
      getNuevaGeneracionTourDescription(tour, locale),
      tour.category,
      tour.location,
      facts.area,
    ]
      .filter(Boolean)
      .join(" "),
  );
  const isParasailing = /parasail|parasailing/.test(normalized);
  const isWater =
    /saona|catamaran|boat|barco|isla|snorkel|playa|beach|mar|ocean|lancha/.test(
      normalized,
    );
  const isAdventure =
    /buggy|atv|zip|horse|caballo|safari|aventura|adventure|off-road|offroad/.test(
      normalized,
    );

  const localizedConversion = {
    es: {
      parasailing: `Vuela sobre las aguas turquesas de ${facts.area} con una salida organizada, equipo de seguridad y confirmación clara antes de pagar.`,
      water: `Disfruta ${facts.area} con tiempo para fotos, agua caribeña, logística clara y soporte local desde la reserva.`,
      adventure:
        "Vive una ruta activa con briefing, paradas claras y coordinación previa para llegar listo a la experiencia.",
      generic: `${persona.promise}. Reserva con precio visible, horario claro y asistencia humana antes de salir.`,
      defaultExclusions: isParasailing
        ? [
            "Fotos y videos profesionales, si el operador los ofrece, se pagan por separado",
            "Propinas y gastos personales",
            "Traslados fuera de la zona confirmada, si aplican",
          ]
        : isWater
          ? [
              "Fotos, videos o bebidas premium no indicadas como incluidas",
              "Propinas y gastos personales",
              "Servicios fuera del itinerario confirmado",
            ]
          : [
              "Gastos personales y propinas",
              "Servicios no indicados como incluidos",
              "Cambios fuera del horario confirmado",
            ],
      cancellationTitle: "Cancelación gratuita hasta 24h antes",
      cancellationBody:
        "Puedes cancelar sin cargo hasta 24 horas antes de la salida confirmada.",
      weatherTitle: isParasailing
        ? "Salida según viento y seguridad"
        : "Clima y operación claros",
      weatherBody: isParasailing
        ? "Si el viento o el operador detienen la salida por seguridad, coordinamos reprogramación o la solución que aplique."
        : "Si el clima impide operar la experiencia, coordinamos reprogramación o la solución que aplique según la política del tour.",
      confirmationTitle: "Confirmación humana",
      confirmationBody:
        "Validamos pasajeros, horario, hotel o punto de encuentro para que llegues con la información importante lista.",
      trustBadges: [
        "Cancelación gratis 24h",
        isParasailing ? "Operación según viento" : "Precio claro en USD",
        facts.pickup ? "Recogida coordinada" : "Soporte local",
      ],
      bookingPrompt: isParasailing
        ? "Elige fecha, pasajeros y horario para confirmar tu vuelo sobre la costa."
        : "Elige fecha, pasajeros y horario para confirmar tu experiencia.",
    },
    en: {
      parasailing: `Fly above the turquoise water of ${facts.area} with an organized departure, safety equipment and clear confirmation before payment.`,
      water: `Enjoy ${facts.area} with photo time, Caribbean water, clear logistics and local support from booking.`,
      adventure:
        "Enjoy an active route with briefing, clear stops and advance coordination before the experience.",
      generic: `${persona.promise}. Book with visible price, clear schedule and human support before departure.`,
      defaultExclusions: isParasailing
        ? [
            "Professional photos and videos, when offered by the operator, are paid separately",
            "Tips and personal expenses",
            "Transfers outside the confirmed zone, if applicable",
          ]
        : isWater
          ? [
              "Photos, videos or premium drinks not listed as included",
              "Tips and personal expenses",
              "Services outside the confirmed itinerary",
            ]
          : [
              "Personal expenses and tips",
              "Services not listed as included",
              "Changes outside the confirmed schedule",
            ],
      cancellationTitle: "Free cancellation up to 24h before",
      cancellationBody:
        "You can cancel free of charge up to 24 hours before the confirmed departure.",
      weatherTitle: isParasailing
        ? "Departure depends on wind and safety"
        : "Clear weather and operating policy",
      weatherBody: isParasailing
        ? "If wind or the operator stops the departure for safety, we coordinate rescheduling or the applicable solution."
        : "If weather prevents the experience from operating, we coordinate rescheduling or the applicable solution under the tour policy.",
      confirmationTitle: "Human confirmation",
      confirmationBody:
        "We validate passengers, schedule, hotel or meeting point so you arrive with the important information ready.",
      trustBadges: [
        "Free cancellation 24h",
        isParasailing ? "Wind-based operation" : "Clear USD price",
        facts.pickup ? "Pickup coordinated" : "Local support",
      ],
      bookingPrompt: isParasailing
        ? "Choose date, passengers and time to confirm your flight over the coast."
        : "Choose date, passengers and time to confirm your experience.",
    },
    fr: {
      parasailing: `Survolez les eaux turquoise de ${facts.area} avec un départ organisé, équipement de sécurité et confirmation claire avant paiement.`,
      water: `Profitez de ${facts.area} avec du temps pour les photos, l'eau des Caraïbes, une logistique claire et un support local dès la réservation.`,
      adventure:
        "Vivez une route active avec briefing, arrêts clairs et coordination avant l'expérience.",
      generic: `${persona.promise}. Réservez avec prix visible, horaire clair et support humain avant le départ.`,
      defaultExclusions: isParasailing
        ? [
            "Photos et vidéos professionnelles, si proposées par l'opérateur, payées séparément",
            "Pourboires et dépenses personnelles",
            "Transferts hors zone confirmée, si applicable",
          ]
        : isWater
          ? [
              "Photos, vidéos ou boissons premium non indiquées comme incluses",
              "Pourboires et dépenses personnelles",
              "Services hors itinéraire confirmé",
            ]
          : [
              "Dépenses personnelles et pourboires",
              "Services non indiqués comme inclus",
              "Changements hors horaire confirmé",
            ],
      cancellationTitle: "Annulation gratuite jusqu'à 24h avant",
      cancellationBody:
        "Vous pouvez annuler sans frais jusqu'à 24 heures avant le départ confirmé.",
      weatherTitle: isParasailing
        ? "Départ selon vent et sécurité"
        : "Météo et opération claires",
      weatherBody: isParasailing
        ? "Si le vent ou l'opérateur bloque la sortie pour sécurité, nous coordonnons reprogrammation ou solution applicable."
        : "Si la météo empêche l'expérience, nous coordonnons reprogrammation ou solution applicable selon la politique du tour.",
      confirmationTitle: "Confirmation humaine",
      confirmationBody:
        "Nous validons passagers, horaire, hôtel ou point de rencontre pour arriver avec les informations importantes.",
      trustBadges: [
        "Annulation gratuite 24h",
        isParasailing ? "Opération selon vent" : "Prix clair en USD",
        facts.pickup ? "Pickup coordonné" : "Support local",
      ],
      bookingPrompt: isParasailing
        ? "Choisissez date, passagers et horaire pour confirmer votre vol au-dessus de la côte."
        : "Choisissez date, passagers et horaire pour confirmer votre expérience.",
    },
  }[locale];

  const heroSubtitle = isParasailing
    ? localizedConversion.parasailing
    : isWater
      ? localizedConversion.water
      : isAdventure
        ? localizedConversion.adventure
        : localizedConversion.generic;

  const confidence = [
    {
      title: localizedConversion.cancellationTitle,
      body:
        tour.cancellationPolicy?.trim() || localizedConversion.cancellationBody,
    },
    {
      title: localizedConversion.weatherTitle,
      body: localizedConversion.weatherBody,
    },
    {
      title: localizedConversion.confirmationTitle,
      body: localizedConversion.confirmationBody,
    },
  ];

  return {
    heroSubtitle,
    exclusions: uniqueTextItems([
      ...(facts.notIncluded ?? []),
      ...localizedConversion.defaultExclusions,
    ]).slice(0, 6),
    confidence,
    trustBadges: localizedConversion.trustBadges,
    bookingPrompt: localizedConversion.bookingPrompt,
  };
};

const buildDefaultItinerary = (
  title: string,
  area?: string | null,
): ItineraryStop[] => [
  {
    time: "Inicio",
    title: `Confirmacion de ${title}`,
    description:
      "Revisamos datos de reserva, pasajeros, horario y punto operativo antes de la salida.",
  },
  {
    time: area ?? "Ruta",
    title: "Experiencia principal",
    description: `Disfruta la actividad con ruta organizada, soporte local y detalles pensados para reducir incertidumbre.`,
  },
  {
    time: "Cierre",
    title: "Regreso y seguimiento",
    description:
      "Finaliza la experiencia con asistencia para cualquier ajuste posterior a la actividad.",
  },
];

const PROACTIVITIS_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Punta Cana, La Altagracia",
  addressLocality: "Punta Cana",
  addressRegion: "La Altagracia",
  postalCode: "23000",
  addressCountry: "DO",
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
    name: "Republica Dominicana",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Service",
    email: "info@proactivitis.com",
    telephone: "+1 (829) 475-6298",
    availableLanguage: ["es", "en"],
  },
};

const SERVICE_SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingRate: {
    "@type": "MonetaryAmount",
    value: 0,
    currency: "USD",
  },
  shippingDestination: {
    "@type": "DefinedRegion",
    addressCountry: "DO",
  },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY",
    },
    transitTime: {
      "@type": "QuantitativeValue",
      minValue: 0,
      maxValue: 1,
      unitCode: "DAY",
    },
  },
};

const MERCHANT_RETURN_POLICY = {
  "@type": "MerchantReturnPolicy",
  url: `${NUEVA_GENERACION_BASE_URL}/legal/refund-policy`,
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 1,
  applicableCountry: "DO",
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
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
  relatedTours = [],
  locale = "es",
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  canonical: string;
  intent?: NuevaGeneracionIntent | null;
  relatedTours?: Awaited<ReturnType<typeof getNuevaGeneracionRelatedTours>>;
  locale?: NuevaGeneracionLocale;
}) => {
  const supplierName =
    tour.SupplierProfile?.company ??
    tour.SupplierProfile?.User?.name ??
    "Proactivitis";
  const displayTitle = getNuevaGeneracionDisplayTitle(tour, locale);
  const absoluteImages = facts.images.map(toAbsoluteImage);
  const faq = buildNuevaGeneracionFaq(
    displayTitle,
    facts.area,
    persona,
    intent,
    locale,
  );
  const pageName = intent
    ? `${intent.titlePrefix}: ${displayTitle}`
    : displayTitle;
  const pageDescription = intent
    ? locale === "en"
      ? `${displayTitle} for ${intent.audience}. ${intent.angle}.`
      : locale === "fr"
        ? `${displayTitle} pour ${intent.audience}. ${intent.angle}.`
        : `${displayTitle} para ${intent.audience}. ${intent.angle}.`
    : getNuevaGeneracionTourDescription(tour, locale) || persona.promise;
  const priceValidUntil = getPriceValidUntil();

  return {
    "@context": "https://schema.org",
    "@graph": [
      PROACTIVITIS_PROVIDER,
      {
        "@type": "WebSite",
        "@id": `${NUEVA_GENERACION_BASE_URL}#website`,
        name: "Proactivitis",
        url: NUEVA_GENERACION_BASE_URL,
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        name: pageName,
        url: canonical,
        description: pageDescription,
        inLanguage: locale,
        isPartOf: { "@id": `${NUEVA_GENERACION_BASE_URL}#website` },
        mainEntity: [
          { "@id": `${canonical}#product` },
          { "@id": `${canonical}#tour` },
        ],
        breadcrumb: { "@id": `${canonical}#breadcrumb` },
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
          {
            "@type": "PropertyValue",
            name: "Primera salida",
            value: facts.firstTime,
          },
          {
            "@type": "PropertyValue",
            name: "Tipo de viajero",
            value: persona.segment,
          },
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
          acceptedPaymentMethod: [
            "https://schema.org/CreditCard",
            "https://schema.org/ByBankTransferInAdvance",
          ],
        },
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
          name: supplierName,
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
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
        },
        itinerary: facts.itinerary.slice(0, 8).map((stop, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: stop.title,
          description: stop.description,
          startTime: stop.time,
        })),
        location: {
          "@type": "Place",
          name: facts.area,
        },
      },
      {
        "@type": "OfferCatalog",
        "@id": `${canonical}#related-offers`,
        name: intent
          ? `Tours relacionados para ${intent.label}`
          : `Tours relacionados con ${displayTitle}`,
        itemListElement: relatedTours.map((related, index) => ({
          "@type": "Offer",
          position: index + 1,
          name: getNuevaGeneracionDisplayTitle(related, locale),
          url: `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(related.slug, locale)}`,
          price: related.price.toFixed(2),
          priceCurrency: "USD",
          priceValidUntil,
          availability: "https://schema.org/InStock",
          seller: PROACTIVITIS_PROVIDER,
          shippingDetails: SERVICE_SHIPPING_DETAILS,
          hasMerchantReturnPolicy: MERCHANT_RETURN_POLICY,
          itemOffered: {
            "@type": "TouristTrip",
            name: getNuevaGeneracionDisplayTitle(related, locale),
            image: toAbsoluteImage(
              related.heroImage ??
                parseJsonArray<string>(related.gallery)[0] ??
                null,
            ),
            touristType: related.category ?? "Tour",
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${canonical}#related-tours`,
        name:
          locale === "en"
            ? "Alternative tours inside Proactivitis"
            : locale === "fr"
              ? "Tours alternatifs dans Proactivitis"
              : "Tours alternativos dentro de Proactivitis",
        itemListElement: relatedTours.map((related, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: getNuevaGeneracionDisplayTitle(related, locale),
          url: `${NUEVA_GENERACION_BASE_URL}${buildNuevaGeneracionTourPath(related.slug, locale)}`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "ImageGallery",
        "@id": `${canonical}#gallery`,
        name: `${tour.title} fotos`,
        image: absoluteImages.map((image, index) => ({
          "@type": "ImageObject",
          position: index + 1,
          url: image,
          caption: `${displayTitle} - imagen ${index + 1}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Tours",
            item: `${NUEVA_GENERACION_BASE_URL}${locale === "es" ? "/tours" : `/${locale}/tours`}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name:
              locale === "en"
                ? "Punta Cana excursions"
                : locale === "fr"
                  ? "Excursions Punta Cana"
                  : "Excursiones Punta Cana",
            item: `${NUEVA_GENERACION_BASE_URL}${getNuevaGeneracionHubPath(locale)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: displayTitle,
            item: canonical,
          },
        ],
      },
    ],
  };
};

export const buildNuevaGeneracionFaq = (
  title: string,
  area: string,
  persona: ReturnType<typeof resolveTourPersona>,
  intent?: NuevaGeneracionIntent | null,
  locale: NuevaGeneracionLocale = "es",
) => {
  const normalizedTitle = normalizeIntentText(title);
  const isParasailing = /parasail|parasailing/.test(normalizedTitle);
  const faqCopy = {
    es: {
      why: intent
        ? `Por que reservar ${title} como ${intent.keyword}?`
        : `Por que reservar ${title} con Proactivitis?`,
      whyAnswer: intent
        ? `${title} encaja con viajeros que buscan ${intent.keyword}: ${intent.audience}. ${intent.angle}.`
        : `${title} reune precio, horario, fotos, preparacion, soporte local y reserva directa en una sola experiencia.`,
      different: `Que hace diferente a ${title} frente a otros tours en ${area}?`,
      differentAnswer: `${persona.promise}. La pagina destaca lo que importa antes de reservar: precio, horario, fotos, inclusiones, preparacion y soporte local.`,
      packing: `Que debo llevar para ${title}?`,
      weather: "Que pasa si llueve o el clima no permite operar?",
      weatherAnswer:
        "Si el clima impide operar de forma segura, coordinamos reprogramacion o la solucion que aplique segun la politica del tour y del operador confirmado.",
      pickup: "La recogida en hotel esta incluida?",
      pickupAnswer:
        "Cuando el tour incluye recogida, se confirma el hotel, punto de encuentro y horario antes de la salida. Si una zona requiere ajuste, se informa antes de completar la reserva.",
      hiddenFees: "Hay cargos ocultos?",
      hiddenFeesAnswer:
        "La pagina separa lo incluido y lo no incluido para que puedas ver precio, extras, propinas o servicios opcionales antes de reservar.",
      advance: "Conviene reservar con anticipacion?",
      weight: "Cual es el limite de peso para parasailing?",
      weightAnswer:
        "El limite exacto depende del operador, el viento y las condiciones del dia. Se confirma antes de operar para mantener la salida segura.",
      tandem: "Pueden volar dos personas juntas en tandem?",
      tandemAnswer:
        "Muchas salidas permiten vuelo tandem, pero depende del peso combinado, viento y criterio del capitan. La confirmacion se realiza antes de la actividad.",
    },
    en: {
      why: intent
        ? `Why book ${title} as a ${intent.keyword}?`
        : `Why book ${title} with Proactivitis?`,
      whyAnswer: intent
        ? `${title} fits travelers looking for ${intent.keyword}: ${intent.audience}. ${intent.angle}.`
        : `${title} brings price, schedule, photos, preparation, local support and direct booking into one experience.`,
      different: `What makes ${title} different from other tours in ${area}?`,
      differentAnswer: `${persona.promise}. The page highlights what matters before booking: price, schedule, photos, inclusions, preparation and local support.`,
      packing: `What should I bring for ${title}?`,
      weather: "What happens if it rains or weather prevents operation?",
      weatherAnswer:
        "If weather prevents safe operation, we coordinate rescheduling or the applicable solution under the tour and confirmed operator policy.",
      pickup: "Is hotel pickup included?",
      pickupAnswer:
        "When pickup is included, hotel, meeting point and schedule are confirmed before departure. If a zone requires adjustment, it is shown before completing the booking.",
      hiddenFees: "Are there hidden fees?",
      hiddenFeesAnswer:
        "The page separates included and not included items so you can see price, extras, tips or optional services before booking.",
      advance: "Should I book in advance?",
      weight: "What is the weight limit for parasailing?",
      weightAnswer:
        "The exact limit depends on the operator, wind and daily conditions. It is confirmed before operation to keep the departure safe.",
      tandem: "Can two people fly together in tandem?",
      tandemAnswer:
        "Many departures allow tandem flight, but it depends on combined weight, wind and the captain's decision. Confirmation happens before the activity.",
    },
    fr: {
      why: intent
        ? `Pourquoi réserver ${title} comme ${intent.keyword} ?`
        : `Pourquoi réserver ${title} avec Proactivitis ?`,
      whyAnswer: intent
        ? `${title} convient aux voyageurs qui cherchent ${intent.keyword} : ${intent.audience}. ${intent.angle}.`
        : `${title} réunit prix, horaire, photos, préparation, support local et réservation directe dans une seule expérience.`,
      different: `Qu'est-ce qui différencie ${title} des autres tours à ${area} ?`,
      differentAnswer: `${persona.promise}. La page met en avant ce qui compte avant de réserver : prix, horaire, photos, inclusions, préparation et support local.`,
      packing: `Que faut-il apporter pour ${title} ?`,
      weather:
        "Que se passe-t-il s'il pleut ou si la météo empêche l'opération ?",
      weatherAnswer:
        "Si la météo empêche une opération sûre, nous coordonnons reprogrammation ou solution applicable selon la politique du tour et de l'opérateur confirmé.",
      pickup: "La prise en charge à l'hôtel est-elle incluse ?",
      pickupAnswer:
        "Quand la prise en charge est incluse, l'hôtel, le point de rencontre et l'horaire sont confirmés avant le départ. Si une zone demande un ajustement, c'est indiqué avant de terminer la réservation.",
      hiddenFees: "Y a-t-il des frais cachés ?",
      hiddenFeesAnswer:
        "La page sépare les éléments inclus et non inclus pour voir le prix, les extras, pourboires ou services optionnels avant de réserver.",
      advance: "Faut-il réserver à l'avance ?",
      weight: "Quelle est la limite de poids pour le parasailing ?",
      weightAnswer:
        "La limite exacte dépend de l'opérateur, du vent et des conditions du jour. Elle est confirmée avant l'opération pour garder la sortie sûre.",
      tandem: "Deux personnes peuvent-elles voler ensemble en tandem ?",
      tandemAnswer:
        "Beaucoup de sorties permettent le vol tandem, mais cela dépend du poids combiné, du vent et de la décision du capitaine. La confirmation se fait avant l'activité.",
    },
  }[locale];

  const baseFaq = [
    { question: faqCopy.why, answer: faqCopy.whyAnswer },
    { question: faqCopy.different, answer: faqCopy.differentAnswer },
    { question: faqCopy.packing, answer: persona.packing },
    { question: faqCopy.weather, answer: faqCopy.weatherAnswer },
    { question: faqCopy.pickup, answer: faqCopy.pickupAnswer },
    { question: faqCopy.hiddenFees, answer: faqCopy.hiddenFeesAnswer },
    { question: faqCopy.advance, answer: persona.urgency },
  ];

  if (!isParasailing) return baseFaq;

  return [
    ...baseFaq.slice(0, 4),
    {
      question: faqCopy.weight,
      answer: faqCopy.weightAnswer,
    },
    {
      question: faqCopy.tandem,
      answer: faqCopy.tandemAnswer,
    },
    ...baseFaq.slice(4),
  ];
};

export const buildIntentLandingCopy = ({
  tour,
  facts,
  persona,
  intent,
  locale = "es",
}: {
  tour: NonNullable<Awaited<ReturnType<typeof getNuevaGeneracionTourBySlug>>>;
  facts: ReturnType<typeof buildTourFacts>;
  persona: ReturnType<typeof resolveTourPersona>;
  intent: NuevaGeneracionIntent;
  locale?: NuevaGeneracionLocale;
}) => ({
  title: `${intent.titlePrefix}: ${getNuevaGeneracionDisplayTitle(tour, locale)}`,
  eyebrow: `${intent.label} | ${facts.area}`,
  description:
    locale === "en"
      ? `${getNuevaGeneracionDisplayTitle(tour, locale)} for ${intent.audience}. ${intent.angle}. ${persona.promise}.`
      : locale === "fr"
        ? `${getNuevaGeneracionDisplayTitle(tour, locale)} pour ${intent.audience}. ${intent.angle}. ${persona.promise}.`
        : `${getNuevaGeneracionDisplayTitle(tour, locale)} para ${intent.audience}. ${intent.angle} ${persona.promise}.`,
  decision: [
    {
      title:
        locale === "en"
          ? "Who it is for"
          : locale === "fr"
            ? "Pour qui"
            : "Para quien es",
      body:
        locale === "en"
          ? `Designed for ${intent.audience}.`
          : locale === "fr"
            ? `Pensé pour ${intent.audience}.`
            : `Pensado para ${intent.audience}.`,
    },
    {
      title:
        locale === "en"
          ? "Before booking"
          : locale === "fr"
            ? "Avant de réserver"
            : "Antes de reservar",
      body: intent.proof,
    },
    {
      title:
        locale === "en"
          ? "Booking tip"
          : locale === "fr"
            ? "Conseil de réservation"
            : "Consejo de reserva",
      body: `${persona.hook} ${persona.urgency}`,
    },
  ],
  cta: intent.cta,
});
