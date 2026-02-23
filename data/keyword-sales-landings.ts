import { slugifyBlog } from "@/lib/blog";

export type KeywordSalesLanding = {
  keyword: string;
  slug: string;
  title: string;
  tagline: string;
  metaDescription: string;
  buyerAngle: string;
  transferPitch: string;
  hotelPitch: string;
  excursionPitch: string;
  sections: string[];
  country: string;
  path: string;
};

const HIGH_INTENT_KEYWORDS = [
  "Paradisus Palma Real Golf and Spa Resort",
  "Melia Punta Cana Beach solo adultos",
  "Iberostar Grand Bavaro",
  "Bahia Principe Luxury Esmeralda",
  "Royalton Chic Punta Cana solo adultos",
  "Majestic Colonial Punta Cana",
  "Riu Palace Bavaro",
  "Riu Palace Macao solo adultos",
  "Dreams Onyx Resort and Spa",
  "Breathless Punta Cana Resort and Spa",
  "Tour en helicoptero Punta Cana precios",
  "Excursion a Cayo Levantado Isla Bacardi",
  "Buggy aventura dunas de Macao",
  "Polaris 4x4 tour Punta Cana",
  "Snorkel en la piscina natural de Bavaro",
  "Marinarium Snorkeling Cruise",
  "Crucero al atardecer en catamaran Punta Cana",
  "Pesca privada en Punta Cana charters",
  "Alquiler de yates de lujo en Cap Cana",
  "Excursion de un dia a Isla Saona en lancha rapida",
  "Rastreo de vuelos aeropuerto Punta Cana PUJ",
  "Salidas y llegadas Aeropuerto Internacional Punta Cana",
  "Fast Track Punta Cana Airport precios",
  "Transporte privado Aeropuerto Punta Cana a Miches",
  "Traslado hotel a Santo Domingo precio taxi",
  "Taxis de Cap Cana tarifas fijas",
  "Tiempo de conduccion Punta Cana a Bayahibe",
  "Discoteca Pacha Punta Cana Riu",
  "Casinos abiertos 24 horas en Punta Cana",
  "Eventos de musica electronica Punta Cana 2026",
  "Viajar a Punta Cana con ninos de 2 anos",
  "Hoteles con cunas y servicio de ninera",
  "Resorts accesibles para silla de ruedas Punta Cana",
  "Resorts tranquilos para personas mayores",
  "Punta Cana vs Cancun cual es mas barato",
  "Punta Cana vs Riviera Maya para luna de miel",
  "Comparativa Riu vs Iberostar vs Bahia Principe",
  "Codigo promocional hoteles Punta Cana",
  "Ofertas flash viaje Punta Cana todo incluido",
  "Paquetes vuelo mas hotel Republica Dominicana",
  "Reserva ahora paga despues Punta Cana",
  "Black Friday ofertas Punta Cana 2026",
  "Cyber Monday viajes al Caribe",
  "Ultimo minuto resorts Punta Cana hoy"
];

export const keywordSalesLandings: KeywordSalesLanding[] = HIGH_INTENT_KEYWORDS.map((keyword) => {
  const slug = `sales-${slugifyBlog(keyword)}`;
  return {
    keyword,
    slug,
    title: `${keyword} - Reserva y soporte local en Punta Cana`,
    tagline:
      "Landing comercial optimizada para convertir busquedas de alta intencion en reservas de hotel, traslados y excursiones.",
    metaDescription: `${keyword}. Compara opciones reales, cotiza en USD y reserva con soporte local en Punta Cana.`,
    buyerAngle:
      "Usuario con intencion alta de compra que necesita claridad de precio, logistica y disponibilidad para convertir.",
    transferPitch:
      "Traslados privados y premium con confirmacion por WhatsApp, seguimiento de vuelo y coordinacion puerta a puerta.",
    hotelPitch:
      "Comparativa de resorts por zona, estilo de viaje y presupuesto para cerrar reserva sin friccion.",
    excursionPitch:
      "Excursiones top con disponibilidad real y recomendaciones por perfil de viajero para elevar conversion.",
    sections: [
      "Analisis comercial de la busqueda con enfoque en cierre.",
      "Ruta recomendada: hotel + traslado + excursiones en un solo flujo.",
      "Soporte local 24/7 para ajustes antes y durante el viaje."
    ],
    country: "Punta Cana",
    path: `/landing/${slug}`
  };
});

export const keywordSalesLandingSlugs = new Set(keywordSalesLandings.map((item) => item.slug));

