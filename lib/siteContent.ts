import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";
import { warnOnce } from "@/lib/logOnce";

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

export type PremiumTransferContentOverrides = {
  seoTitle?: string;
  seoDescription?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBackgroundImage?: string;
  heroSpotlightImage?: string;
  ctaPrimaryLabel?: string;
  ctaSecondaryLabel?: string;
  bookingTitle?: string;
  fleetTitle?: string;
  experienceTitle?: string;
  experienceBody?: string;
  galleryImages?: string[];
  cadillacImage?: string;
  suburbanImage?: string;
  lifestyleImage?: string;
  vipBullets?: string[];
  vipCertifications?: string[];
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

const PREMIUM_TRANSFER_FALLBACKS: Record<Locale, PremiumTransferContentOverrides> = {
  es: {
    seoTitle: "Punta Cana Premium Transfer Services | Cadillac Escalade & Chevrolet Suburban",
    seoDescription:
      "Servicio VIP en Punta Cana con SUV de lujo, chofer profesional y reserva inmediata. Cadillac Escalade y Chevrolet Suburban para aeropuerto, hoteles y eventos privados.",
    heroBadge: "Elite Ground Transportation",
    heroTitle: "Punta Cana Premium Transfer Services",
    heroSubtitle:
      "Traslados VIP con Cadillac Escalade y Chevrolet Suburban. Servicio privado, puntual y de alto nivel para viajeros que exigen excelencia.",
    heroBackgroundImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    heroSpotlightImage:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
    ctaPrimaryLabel: "Reservar Transfer VIP",
    ctaSecondaryLabel: "Hablar por WhatsApp",
    bookingTitle: "Cotiza tu transfer premium ahora",
    fleetTitle: "Flota premium seleccionada",
    experienceTitle: "Experiencia de lujo desde que aterrizas",
    experienceBody:
      "Nuestro equipo coordina tu llegada con seguimiento de vuelo y conductor asignado. Desde PUJ hasta tu resort, marina o villa privada, disfrutas una experiencia discreta, segura y de primer nivel.",
    galleryImages: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549925862-9909b6cf2d0f?auto=format&fit=crop&w=1200&q=80"
    ],
    cadillacImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    suburbanImage:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    lifestyleImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    vipBullets: [
      "Chofer profesional bilingue con protocolo VIP.",
      "Monitoreo de vuelo y ventana de espera incluida.",
      "Vehiculos full size con aire premium y espacio superior.",
      "Servicio privado 24/7 para aeropuertos, hoteles y eventos."
    ],
    vipCertifications: [
      "Operador turistico verificado en Republica Dominicana",
      "Conductores con licencia profesional y entrenamiento VIP",
      "Poliza de responsabilidad civil activa",
      "Protocolos de seguridad y asistencia 24/7"
    ]
  },
  en: {
    seoTitle: "Punta Cana Premium Transfer Services | Cadillac Escalade & Chevrolet Suburban",
    seoDescription:
      "VIP transfer service in Punta Cana with luxury SUVs, professional drivers, and instant booking. Cadillac Escalade and Chevrolet Suburban for airport, resorts, and private events.",
    heroBadge: "Elite Ground Transportation",
    heroTitle: "Punta Cana Premium Transfer Services",
    heroSubtitle:
      "VIP transfers with Cadillac Escalade and Chevrolet Suburban. Private, punctual, and high-standard service for travelers who expect excellence.",
    heroBackgroundImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    heroSpotlightImage:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
    ctaPrimaryLabel: "Book VIP Transfer",
    ctaSecondaryLabel: "Chat on WhatsApp",
    bookingTitle: "Get your premium transfer quote",
    fleetTitle: "Curated premium fleet",
    experienceTitle: "Luxury experience from touchdown",
    experienceBody:
      "Our operations team coordinates your arrival with flight tracking and assigned driver. From PUJ to your resort, marina, or private villa, you get a discreet and premium ride.",
    galleryImages: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549925862-9909b6cf2d0f?auto=format&fit=crop&w=1200&q=80"
    ],
    cadillacImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    suburbanImage:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    lifestyleImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    vipBullets: [
      "Professional bilingual driver with VIP protocol.",
      "Flight tracking and included waiting window.",
      "Full-size vehicles with premium comfort and luggage space.",
      "24/7 private service for airports, resorts, and events."
    ],
    vipCertifications: [
      "Verified Dominican Republic tourism operator",
      "Licensed professional chauffeurs with VIP training",
      "Active liability insurance coverage",
      "24/7 safety and guest assistance protocols"
    ]
  },
  fr: {
    seoTitle: "Punta Cana Premium Transfer Services | Cadillac Escalade & Chevrolet Suburban",
    seoDescription:
      "Service VIP a Punta Cana avec SUV de luxe, chauffeur professionnel et reservation immediate. Cadillac Escalade et Chevrolet Suburban pour aeroport, resorts et evenements prives.",
    heroBadge: "Elite Ground Transportation",
    heroTitle: "Punta Cana Premium Transfer Services",
    heroSubtitle:
      "Transferts VIP en Cadillac Escalade et Chevrolet Suburban. Service prive, ponctuel et haut de gamme pour voyageurs exigeants.",
    heroBackgroundImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80",
    heroSpotlightImage:
      "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1400&q=80",
    ctaPrimaryLabel: "Reserver un transfer VIP",
    ctaSecondaryLabel: "WhatsApp direct",
    bookingTitle: "Obtenez votre devis premium",
    fleetTitle: "Flotte premium selectionnee",
    experienceTitle: "Experience luxe des votre arrivee",
    experienceBody:
      "Notre equipe coordonne votre arrivee avec suivi de vol et chauffeur dedie. De PUJ vers votre resort, marina ou villa, vous profitez d'un trajet discret et premium.",
    galleryImages: [
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1549925862-9909b6cf2d0f?auto=format&fit=crop&w=1200&q=80"
    ],
    cadillacImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
    suburbanImage:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=80",
    lifestyleImage:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
    vipBullets: [
      "Chauffeur bilingue professionnel avec protocole VIP.",
      "Suivi de vol et fenetre d'attente incluse.",
      "Vehicules full-size avec confort premium et grand espace bagages.",
      "Service prive 24/7 pour aeroport, resorts et evenements."
    ],
    vipCertifications: [
      "Operateur touristique verifie en Republique Dominicaine",
      "Chauffeurs professionnels licences avec formation VIP",
      "Assurance responsabilite civile active",
      "Protocoles de securite et assistance client 24/7"
    ]
  }
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
    warnOnce("site-content-home-fallback", "No se pudo cargar SiteContentSetting HOME", error);
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
    warnOnce("site-content-contact-fallback", "No se pudo cargar SiteContentSetting CONTACT", error);
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
    warnOnce("site-content-global-banner-fallback", "No se pudo cargar SiteContentSetting GLOBAL_BANNER", error);
    return {};
  }
};

export const getPremiumTransferContentOverrides = async (
  locale: Locale
): Promise<PremiumTransferContentOverrides> => {
  const fallback = PREMIUM_TRANSFER_FALLBACKS[locale] ?? PREMIUM_TRANSFER_FALLBACKS.es;
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: "PREMIUM_TRANSFER_LANDING" }
    });
    if (!record?.content || typeof record.content !== "object") return fallback;
    const content = record.content as Record<string, unknown>;
    const localeContent = content[locale];
    if (!localeContent || typeof localeContent !== "object") return fallback;
    const override = localeContent as PremiumTransferContentOverrides;
    return {
      ...fallback,
      ...override,
      galleryImages:
        Array.isArray(override.galleryImages) && override.galleryImages.length > 0
          ? override.galleryImages
          : fallback.galleryImages,
      vipBullets:
        Array.isArray(override.vipBullets) && override.vipBullets.length > 0
          ? override.vipBullets
          : fallback.vipBullets,
      vipCertifications:
        Array.isArray(override.vipCertifications) && override.vipCertifications.length > 0
          ? override.vipCertifications
          : fallback.vipCertifications
    };
  } catch (error) {
    warnOnce("site-content-premium-transfer-fallback", "No se pudo cargar SiteContentSetting PREMIUM_TRANSFER_LANDING", error);
    return fallback;
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
    warnOnce("site-content-hotel-landing-fallback", "No se pudo cargar SiteContentSetting HOTEL_LANDING", error);
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
