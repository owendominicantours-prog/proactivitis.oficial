export type TransferLandingPromotion = {
  landingSlug: string;
  destinationSlug: string;
  hotelName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroImageAlt: string;
  heroTagline: string;
  priceGuide: string;
  priceDetails: string[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  highlights: string[];
  trustBadges: string[];
  socialLinks: { label: string; url: string }[];
  gallery: string[];
  faq: { q: string; a: string }[];
  schemaRating: number;
  schemaReviewCount: number;
};

export const pujToHotelPromotions: TransferLandingPromotion[] = [
  {
    landingSlug: "puj-to-hard-rock-hotel-punta-cana",
    destinationSlug: "hard-rock-punta-cana",
    hotelName: "Hard Rock Hotel & Casino Punta Cana",
    heroTitle: "PUJ → Hard Rock Punta Cana en 30 minutos",
    heroSubtitle: "Traslado privado con chofer bilingüe y servicio todo incluido.",
    heroDescription:
      "Sal del Aeropuerto Internacional de Punta Cana y aterriza en el lobby del Hard Rock Hotel & Casino con comodidad, Wi-Fi a bordo y atención personalizada. Recomendado para familias y viajeros que buscan lujo sin complicaciones.",
    heroImage: "/transfer/mini van.png",
    heroImageAlt: "Mini van premium en carretera hacia Hard Rock Hotel",
    heroTagline: "Servicio VIP con espacio para equipaje y niños",
    priceGuide: "Desde $45 por persona",
    priceDetails: ["Incluye 60 min de espera", "Cortesía de agua y Wi-Fi", "Seguro de viaje incluido"],
    seoTitle: "Traslado PUJ a Hard Rock Hotel Punta Cana | Proactivitis",
    metaDescription:
      "Reserva tu traslado privado desde el Aeropuerto Internacional de Punta Cana hasta Hard Rock Hotel & Casino Punta Cana. Chofer bilingüe, vehículos premium y confirmación inmediata.",
    keywords: ["traslado Hard Rock Punta Cana", "PUJ hard rock transfer", "transfer privado punta cana"],
    highlights: [
      "Check-in rápido con chofer que conoce tu vuelo",
      "Vehículos con aire acondicionado y carga para maletas",
      "Atención 24/7 en español e inglés"
    ],
    trustBadges: ["Servicio privado Garantizado", "Chofer bilingüe | Wi-Fi incluido", "Cancelación flexible 24h"],
    socialLinks: [
      { label: "Instagram", url: "https://www.instagram.com/proactivitis/" },
      { label: "Facebook", url: "https://www.facebook.com/proactivitis" },
      { label: "TikTok", url: "https://www.tiktok.com/@proactivitis" }
    ],
    gallery: [
      "/transfer/mini van.png",
      "/transfer/sedan.png",
      "/transfer/suv.png"
    ],
    faq: [
      {
        q: "¿Cuánto tiempo tarda el traslado?",
        a: "El trayecto dura entre 25 y 35 minutos según el tráfico. El chofer te estará esperando en la salida de llegadas."
      },
      {
        q: "¿Puedo agregar paradas en ruta?",
        a: "Claro, avísanos al reservar y lo coordinamos con cargo adicional según distancia."
      }
    ],
    schemaRating: 4.9,
    schemaReviewCount: 120
  },
  {
    landingSlug: "puj-to-barcelo-bavaro-palace",
    destinationSlug: "barcelo-bavaro-palace",
    hotelName: "Barceló Bávaro Palace",
    heroTitle: "PUJ al Barceló Bávaro Palace con traslado diseñado para familias",
    heroSubtitle: "Van privada con espacio para equipaje y atención de concierge.",
    heroDescription:
      "Tu chofer llega al lobby de llegadas y te acompaña por el lobby hasta la entrada del Barceló Bávaro Palace. Vehículos amplios, sillas de bebé bajo petición y conexión directa con el equipo de soporte.",
    heroImage: "/transfer/sedan.png",
    heroImageAlt: "Sedan ejecutivo rumbo a Barceló Bávaro Palace",
    heroTagline: "Ideal para parejas y familias pequeñas",
    priceGuide: "Desde $42 por persona",
    priceDetails: ["Sillas para bebés y niñas disponibles", "Carga para 4 maletas grandes", "Apoyo 24/7 con nuestro concierge"],
    seoTitle: "Traslado privado PUJ a Barceló Bávaro Palace | Proactivitis",
    metaDescription:
      "Traslado privado desde PUJ hasta Barceló Bávaro Palace en vans o sedanes con chofer bilingüe, confirmación instantánea y póliza completa. Reserva hoy y viaja tranquilo.",
    keywords: ["Traslado Barceló Bávaro", "PUJ a Bávaro Palace transfer", "transfer privado Barceló"],
    highlights: [
      "Monitoreamos tu vuelo en vivo",
      "Equipaje asegurado y maleteros amplios",
      "Comunicación directa con concierge 24/7"
    ],
    trustBadges: ["Confirmación inmediata", "Vehículos con certificado sanitario", "Soporte en español e inglés"],
    socialLinks: [
      { label: "Instagram", url: "https://www.instagram.com/proactivitis/" },
      { label: "Facebook", url: "https://www.facebook.com/proactivitis" }
    ],
    gallery: [
      "/transfer/sedan.png",
      "/transfer/suv.png",
      "/transfer/mini van.png"
    ],
    faq: [
      {
        q: "¿Puedo pagar en efectivo?",
        a: "Aceptamos tarjetas Stripe y pagos mediante enlace enviado al correo o WhatsApp."
      },
      {
        q: "¿Qué pasa si mi vuelo se atrasa?",
        a: "El chofer espera sin costo extra hasta 60 minutos después del aterrizaje."
      }
    ],
    schemaRating: 4.8,
    schemaReviewCount: 92
  },
  {
    landingSlug: "puj-to-riu-republica",
    destinationSlug: "riu-republica",
    hotelName: "Riu República",
    heroTitle: "PUJ a Riu República con traslado sin sorpresas",
    heroSubtitle: "Mini vans y buses para grupos, siempre con tarifas transparentes.",
    heroDescription:
      "Si vienes con tu grupo o familia numerosa, el traslado al Riu República se confirma en minutos, con chofer y vehículo asignado al instante. No hay recargos ocultos ni espera sorpresa.",
    heroImage: "/transfer/suv.png",
    heroImageAlt: "SUV premium rumbo al Riu República",
    heroTagline: "Perfecto para grupos y bodas",
    priceGuide: "Desde $40 por persona",
    priceDetails: ["Vehículos adaptados para hasta 8 pax", "Cobertura contra retrasos y cambios de última hora", "Asistencia en español 24/7"],
    seoTitle: "Traslado privado PUJ a Riu República | Proactivitis",
    metaDescription:
      "Traslado privado desde el aeropuerto de Punta Cana a Riu República con vans, SUVs y buses privados. Confirmación inmediata, chofer bilingüe y soporte 24/7.",
    keywords: ["PUJ a Riu República", "transfer Punta Cana Riu República", "servicio privado Riu República"],
    highlights: [
      "Vehículos equipados con Wi-Fi y aire acondicionado",
      "Tarifa fija sin sorpresas",
      "Atención 24/7 y agencia local en Punta Cana"
    ],
    trustBadges: ["Grupo privado garantizado", "Soporte en vivo", "Vehículos sanitizados"],
    socialLinks: [
      { label: "Instagram", url: "https://www.instagram.com/proactivitis/" },
      { label: "Facebook", url: "https://www.facebook.com/proactivitis" }
    ],
    gallery: [
      "/transfer/suv.png",
      "/transfer/mini van.png"
    ],
    faq: [
      {
        q: "¿Pueden los invitados llegar antes?",
        a: "Sí, programemos juntas varias recogidas (opcional con recargo) y enviamos confirmación a cada grupo."
      },
      {
        q: "¿Tienen Wi-Fi a bordo?",
        a: "Todos nuestros vehículos tienen Wi-Fi y botellas de agua fría."
      }
    ],
    schemaRating: 4.7,
    schemaReviewCount: 76
  }
];
