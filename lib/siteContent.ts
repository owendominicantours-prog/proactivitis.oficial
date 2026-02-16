import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";

export type HomeContentOverrides = {
  hero?: {
    brand?: string;
    title?: string;
    description?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
  benefits?: {
    label?: string;
    title?: string;
    description?: string;
    items?: Array<{ title?: string; description?: string }>;
  };
  recommended?: {
    label?: string;
    title?: string;
  };
  puntaCana?: {
    subtitle?: string;
    title?: string;
  };
  longform?: {
    eyebrow?: string;
    title?: string;
    body1?: string;
    body2?: string;
    body3?: string;
    points?: Array<{ title?: string; body?: string }>;
  };
  transferBanner?: {
    label?: string;
    title?: string;
    description?: string;
    cta?: string;
    backgroundImage?: string;
  };
  about?: {
    label?: string;
    title?: string;
    description?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
  };
};

export type ContactContentOverrides = {
  hero?: {
    tagline?: string;
    title?: string;
    description?: string;
  };
  phone?: {
    label?: string;
    details?: string;
    number?: string;
  };
  whatsapp?: {
    label?: string;
    cta?: string;
    number?: string;
    link?: string;
  };
  emails?: {
    sectionTitle?: string;
    general?: string;
    reservations?: string;
    suppliers?: string;
  };
  longform?: {
    eyebrow?: string;
    title?: string;
    body1?: string;
    body2?: string;
    body3?: string;
  };
};

export type GlobalBannerOverrides = {
  enabled?: boolean;
  message?: string;
  link?: string;
  linkLabel?: string;
  tone?: "info" | "success" | "warning" | "urgent";
};

export type HotelLandingOverrides = {
  seoTitle?: string;
  seoDescription?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  galleryImages?: string[];
  stars?: string;
  locationLabel?: string;
  mapUrl?: string;
  priceFromUSD?: string;
  reviewRating?: string;
  reviewCount?: string;
  quoteCta?: string;
  overviewTitle?: string;
  description1?: string;
  description2?: string;
  description3?: string;
  highlights?: string[];
  roomTypes?: Array<{ name: string; priceFrom?: string; image?: string }>;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
  cancellationPolicy?: string;
  groupPolicy?: string;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  bullet4?: string;
  toursTitle?: string;
  transfersTitle?: string;
};

const HOTEL_LANDING_FALLBACKS: Record<string, Partial<Record<Locale, HotelLandingOverrides>>> = {
  "bahia-principe-grand-bavaro": {
    es: {
      seoTitle: "Bahia Principe Grand Bavaro - Reserva en Punta Cana al Mejor Precio",
      seoDescription:
        "Bahia Principe Grand Bavaro Todo Incluido en Punta Cana al Mejor Precio. Resort familiar con piscinas, 16 bares, restaurantes y areas para ninos.",
      heroTitle: "Bahia Principe Grand Bavaro - Reserva en Punta Cana al Mejor Precio",
      heroSubtitle:
        "Resort todo incluido ideal para familias, con gran oferta gastronomica, ocio y actividades en Bavaro.",
      stars: "5",
      locationLabel: "Arena Gorda, Bavaro, Punta Cana",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bahia+Principe+Grand+Bavaro",
      quoteCta: "Consultar Disponibilidad",
      overviewTitle: "Bahia Principe Grand Bavaro: resort familiar todo incluido",
      description1:
        "Bahia Principe Grand Bavaro es un resort de gran formato en Arena Gorda, Punta Cana, pensado para viajeros que buscan un plan todo incluido con infraestructura completa y entretenimiento diario.",
      description2:
        "El hotel integra piscinas tipo lago, jacuzzi, spa, instalaciones deportivas, centro de actividades acuaticas, campo de golf cercano, espacios para eventos y una oferta gastronomica robusta.",
      description3:
        "Alrededor del hotel tienes 13 restaurantes en un radio cercano y 16 atracciones proximas como Arena Gorda Beach, Splash Water World y zonas de ocio nocturno, lo que amplifica la experiencia dentro y fuera del resort.",
      highlights: [
        "2 piscinas tipo lago, jacuzzi, solariums y servicio de tumbonas, sombrillas y toallas.",
        "1 buffet + restaurantes de especialidades y 16 bares dentro del complejo.",
        "Gimnasio, pista de tenis, cancha multiusos y centro de actividades acuaticas.",
        "Punta Blanca Golf Club de 18 hoyos y area comercial/ocio Pueblo Principe.",
        "Entorno con oferta cercana de gastronomia y atracciones para complementar la estancia."
      ],
      bullet1: "Resort todo incluido ideal para familias",
      bullet2: "16 bares y restaurantes de especialidades",
      bullet3: "Piscinas, deporte, spa y ocio",
      bullet4: "Programa infantil y teen club",
      roomTypes: [
        { name: "Junior Suite Superior", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Junior Suite Club Golden", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Suite con vistas al mar", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Suite familiar", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Habitacion no fumadores", priceFrom: "Cotizacion personalizada", image: "" }
      ],
      amenities: [
        "Aparcamiento gratuito",
        "Aparcamiento",
        "Wi-Fi",
        "Gimnasio / sala de entrenamiento",
        "Clases de fitness",
        "Piscina",
        "Piscina exterior",
        "Jacuzzi",
        "Toallas para piscina y playa",
        "Bar/salon",
        "Bar dentro de la piscina",
        "Bar junto a la piscina",
        "Restaurante",
        "Desayuno disponible",
        "Desayuno buffet",
        "Playa",
        "Casino y juegos de azar",
        "Campo de golf",
        "Mini golf",
        "Pista de tenis",
        "Parque acuatico",
        "Aerobic",
        "Personal de animacion",
        "Animacion nocturna",
        "Karaoke",
        "Pub/DJ",
        "Zona infantil de juegos cubierta",
        "Actividades para ninos (familias)",
        "Zona infantil",
        "Guarderia",
        "Transporte desde/al aeropuerto",
        "Centro de negocios con Internet",
        "Instalaciones para conferencias",
        "Sala de banquetes",
        "Salas de reuniones",
        "Balneario",
        "Masaje en pareja",
        "Tratamientos faciales",
        "Masaje de cuerpo entero",
        "Masaje de cabeza",
        "Masaje",
        "Conserje",
        "Cambio de divisas",
        "Tienda de regalos",
        "Tiendas",
        "Tumbonas/sillas de playa",
        "Sombrillas",
        "Servicio de mayordomo",
        "Recepcion 24 horas",
        "Lavado en seco",
        "Servicio de lavanderia",
        "Aire acondicionado en habitacion",
        "Servicio de limpieza",
        "Balcon privado",
        "Servicio de habitaciones",
        "Caja fuerte",
        "Minibar",
        "Televisor de pantalla plana"
      ],
      checkInTime: "3:00 PM",
      checkOutTime: "12:00 PM",
      cancellationPolicy:
        "Las politicas pueden variar por tarifa y temporada. Solicita cotizacion para validar condiciones exactas antes de confirmar.",
      groupPolicy:
        "Atencion especial para grupos, bodas, incentivos y aniversarios. Tarifas para grupos disponibles segun volumen y fechas.",
      toursTitle: "Excursiones recomendadas desde Bahia Principe Grand Bavaro",
      transfersTitle: "Traslados recomendados para Bahia Principe Grand Bavaro"
    }
  },
  "bahia-principe-grand-punta-cana": {
    es: {
      seoTitle: "Bahia Principe Grand Bavaro - Reserva en Punta Cana al Mejor Precio",
      seoDescription:
        "Bahia Principe Grand Bavaro Todo Incluido en Punta Cana al Mejor Precio. Resort familiar con piscinas, 16 bares, restaurantes y areas para ninos.",
      heroTitle: "Bahia Principe Grand Bavaro - Reserva en Punta Cana al Mejor Precio",
      heroSubtitle:
        "Resort todo incluido ideal para familias, con gran oferta gastronomica, ocio y actividades en Bavaro.",
      stars: "5",
      locationLabel: "Arena Gorda, Bavaro, Punta Cana",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bahia+Principe+Grand+Bavaro",
      quoteCta: "Consultar Disponibilidad",
      overviewTitle: "Bahia Principe Grand Bavaro: resort familiar todo incluido",
      description1:
        "Bahia Principe Grand Bavaro es un resort de gran formato en Arena Gorda, Punta Cana, pensado para viajeros que buscan un plan todo incluido con infraestructura completa y entretenimiento diario.",
      description2:
        "El hotel integra piscinas tipo lago, jacuzzi, spa, instalaciones deportivas, centro de actividades acuaticas, campo de golf cercano, espacios para eventos y una oferta gastronomica robusta.",
      description3:
        "Alrededor del hotel tienes 13 restaurantes en un radio cercano y 16 atracciones proximas como Arena Gorda Beach, Splash Water World y zonas de ocio nocturno, lo que amplifica la experiencia dentro y fuera del resort.",
      highlights: [
        "2 piscinas tipo lago, jacuzzi, solariums y servicio de tumbonas, sombrillas y toallas.",
        "1 buffet + restaurantes de especialidades y 16 bares dentro del complejo.",
        "Gimnasio, pista de tenis, cancha multiusos y centro de actividades acuaticas.",
        "Punta Blanca Golf Club de 18 hoyos y area comercial/ocio Pueblo Principe.",
        "Entorno con oferta cercana de gastronomia y atracciones para complementar la estancia."
      ],
      bullet1: "Resort todo incluido ideal para familias",
      bullet2: "16 bares y restaurantes de especialidades",
      bullet3: "Piscinas, deporte, spa y ocio",
      bullet4: "Programa infantil y teen club",
      roomTypes: [
        { name: "Junior Suite Superior", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Junior Suite Club Golden", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Suite con vistas al mar", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Suite familiar", priceFrom: "Cotizacion personalizada", image: "" },
        { name: "Habitacion no fumadores", priceFrom: "Cotizacion personalizada", image: "" }
      ],
      amenities: [
        "Aparcamiento gratuito",
        "Aparcamiento",
        "Wi-Fi",
        "Gimnasio / sala de entrenamiento",
        "Clases de fitness",
        "Piscina",
        "Piscina exterior",
        "Jacuzzi",
        "Toallas para piscina y playa",
        "Bar/salon",
        "Bar dentro de la piscina",
        "Bar junto a la piscina",
        "Restaurante",
        "Desayuno disponible",
        "Desayuno buffet",
        "Playa",
        "Casino y juegos de azar",
        "Campo de golf",
        "Mini golf",
        "Pista de tenis",
        "Parque acuatico",
        "Aerobic",
        "Personal de animacion",
        "Animacion nocturna",
        "Karaoke",
        "Pub/DJ",
        "Zona infantil de juegos cubierta",
        "Actividades para ninos (familias)",
        "Zona infantil",
        "Guarderia",
        "Transporte desde/al aeropuerto",
        "Centro de negocios con Internet",
        "Instalaciones para conferencias",
        "Sala de banquetes",
        "Salas de reuniones",
        "Balneario",
        "Masaje en pareja",
        "Tratamientos faciales",
        "Masaje de cuerpo entero",
        "Masaje de cabeza",
        "Masaje",
        "Conserje",
        "Cambio de divisas",
        "Tienda de regalos",
        "Tiendas",
        "Tumbonas/sillas de playa",
        "Sombrillas",
        "Servicio de mayordomo",
        "Recepcion 24 horas",
        "Lavado en seco",
        "Servicio de lavanderia",
        "Aire acondicionado en habitacion",
        "Servicio de limpieza",
        "Balcon privado",
        "Servicio de habitaciones",
        "Caja fuerte",
        "Minibar",
        "Televisor de pantalla plana"
      ],
      checkInTime: "3:00 PM",
      checkOutTime: "12:00 PM",
      cancellationPolicy:
        "Las politicas pueden variar por tarifa y temporada. Solicita cotizacion para validar condiciones exactas antes de confirmar.",
      groupPolicy:
        "Atencion especial para grupos, bodas, incentivos y aniversarios. Tarifas para grupos disponibles segun volumen y fechas.",
      toursTitle: "Excursiones recomendadas desde Bahia Principe Grand Bavaro",
      transfersTitle: "Traslados recomendados para Bahia Principe Grand Bavaro"
    }
  }
};

export const getHomeContentOverrides = async (locale: Locale): Promise<HomeContentOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "HOME" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as HomeContentOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting HOME", error);
    return {};
  }
};

export const getContactContentOverrides = async (locale: Locale): Promise<ContactContentOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "CONTACT" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as ContactContentOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting CONTACT", error);
    return {};
  }
};

export const getGlobalBannerOverrides = async (locale: Locale): Promise<GlobalBannerOverrides> => {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "GLOBAL_BANNER" }
    });
    if (!record?.content || typeof record.content !== "object") return {};
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return {};
    return localeContent as GlobalBannerOverrides;
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting GLOBAL_BANNER", error);
    return {};
  }
};

export const getHotelLandingOverrides = async (
  hotelSlug: string,
  locale: Locale
): Promise<HotelLandingOverrides> => {
  const fallback = getHotelLandingFallbackSafe(hotelSlug, locale);
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "HOTEL_LANDING" }
    });
    if (!record?.content || typeof record.content !== "object") return fallback;
    const content = record.content as Record<string, Record<string, HotelLandingOverrides>>;
    const hotelMap = content[hotelSlug];
    if (!hotelMap || typeof hotelMap !== "object") return fallback;
    const localeContent = hotelMap[locale];
    if (!localeContent || typeof localeContent !== "object") return fallback;
    return mergeHotelOverrides(fallback, localeContent as HotelLandingOverrides);
  } catch (error) {
    console.warn("No se pudo cargar SiteContentSetting HOTEL_LANDING", error);
    return fallback;
  }
};

function getHotelLandingFallbackSafe(hotelSlug: string, locale: Locale): HotelLandingOverrides {
  const byHotel = HOTEL_LANDING_FALLBACKS[hotelSlug];
  if (!byHotel) return {};
  return byHotel[locale] ?? {};
}

function mergeHotelOverrides(
  fallback: HotelLandingOverrides,
  override: HotelLandingOverrides
): HotelLandingOverrides {
  const merged: HotelLandingOverrides = { ...fallback };
  const entries = Object.entries(override) as Array<[keyof HotelLandingOverrides, unknown]>;

  for (const [key, value] of entries) {
    if (typeof value === "string") {
      if (!value.trim()) continue;
      merged[key] = value as never;
      continue;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      merged[key] = value as never;
      continue;
    }
    if (value === null || value === undefined) continue;
    merged[key] = value as never;
  }

  return merged;
}
