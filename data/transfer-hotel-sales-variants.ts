import type { TransferLandingData } from "@/data/transfer-landings";

export type TransferHotelSalesVariant = {
  id: string;
  marketKeyword: string;
  heroHook: string;
  subtitleHook: string;
  ctaAngle: string;
  badge: string;
};

export const TRANSFER_HOTEL_SALES_VARIANTS: TransferHotelSalesVariant[] = [
  {
    id: "private-airport-transfer",
    marketKeyword: "private airport transfer",
    heroHook: "Traslado privado aeropuerto-hotel",
    subtitleHook: "Servicio directo, puntual y sin paradas innecesarias.",
    ctaAngle: "Reserva privada inmediata",
    badge: "Private Transfer"
  },
  {
    id: "luxury-vip-transfer",
    marketKeyword: "vip luxury transfer",
    heroHook: "Transfer VIP de lujo",
    subtitleHook: "Experiencia premium con atencion ejecutiva y confort superior.",
    ctaAngle: "Upgrade premium",
    badge: "Luxury VIP"
  },
  {
    id: "round-trip-transfer",
    marketKeyword: "round trip airport transfer",
    heroHook: "Transfer ida y vuelta asegurado",
    subtitleHook: "Llega al hotel y regresa al aeropuerto con la misma operacion confiable.",
    ctaAngle: "Paquete round-trip",
    badge: "Round Trip"
  },
  {
    id: "family-transfer",
    marketKeyword: "family airport transfer",
    heroHook: "Transfer familiar seguro",
    subtitleHook: "Espacio para equipaje, ninos y llegada tranquila al resort.",
    ctaAngle: "Ideal familias",
    badge: "Family Friendly"
  },
  {
    id: "suv-transfer",
    marketKeyword: "private suv transfer",
    heroHook: "Transfer en SUV privado",
    subtitleHook: "Mas comodidad y privacidad para parejas, grupos y ejecutivos.",
    ctaAngle: "SUV premium",
    badge: "SUV Comfort"
  },
  {
    id: "direct-nonstop-transfer",
    marketKeyword: "nonstop airport transfer",
    heroHook: "Transfer directo sin escalas",
    subtitleHook: "Ruta optimizada desde PUJ hasta el hotel sin desvíos.",
    ctaAngle: "Ruta directa",
    badge: "Nonstop"
  },
  {
    id: "last-minute-transfer",
    marketKeyword: "last minute airport transfer",
    heroHook: "Transfer de ultima hora",
    subtitleHook: "Confirmacion rapida para reservas urgentes segun disponibilidad.",
    ctaAngle: "Reserva hoy",
    badge: "Last Minute"
  },
  {
    id: "executive-transfer",
    marketKeyword: "executive transfer service",
    heroHook: "Transfer ejecutivo",
    subtitleHook: "Servicio profesional para viajes corporativos y clientes premium.",
    ctaAngle: "Perfil ejecutivo",
    badge: "Executive"
  },
  {
    id: "group-transfer",
    marketKeyword: "group airport transfer",
    heroHook: "Transfer para grupos",
    subtitleHook: "Coordinacion eficiente para grupos, bodas y eventos.",
    ctaAngle: "Cotiza grupo",
    badge: "Groups"
  },
  {
    id: "hotel-concierge-transfer",
    marketKeyword: "hotel concierge transfer",
    heroHook: "Transfer estilo concierge",
    subtitleHook: "Asistencia personalizada antes, durante y despues del traslado.",
    ctaAngle: "Atencion concierge",
    badge: "Concierge"
  }
];

export const buildTransferHotelVariantSlug = (baseLandingSlug: string, variantId: string) =>
  `${baseLandingSlug}--${variantId}`;

export const parseTransferHotelVariantSlug = (slug: string): { baseSlug: string; variantId?: string } => {
  const marker = "--";
  if (!slug.includes(marker)) return { baseSlug: slug };
  const [baseSlug, variantId] = slug.split(marker);
  return { baseSlug, variantId: variantId?.trim() || undefined };
};

export const findTransferHotelSalesVariant = (variantId?: string) =>
  TRANSFER_HOTEL_SALES_VARIANTS.find((item) => item.id === variantId);

export const applyTransferHotelSalesVariant = (
  landing: TransferLandingData,
  variant: TransferHotelSalesVariant
): TransferLandingData => {
  const fullSlug = buildTransferHotelVariantSlug(landing.landingSlug, variant.id);
  const hotel = landing.hotelName;
  const transferFocus = `${variant.heroHook} a ${hotel}`;
  const toursFocus = `Tours recomendados desde ${hotel} con pick-up coordinado`;

  return {
    ...landing,
    landingSlug: fullSlug,
    reverseSlug: buildTransferHotelVariantSlug(landing.reverseSlug, variant.id),
    heroTitle: transferFocus,
    heroSubtitle: `${variant.subtitleHook} ${landing.heroSubtitle}`,
    heroTagline: `${variant.badge} | ${variant.ctaAngle}`,
    longCopy: [
      `${transferFocus}. Servicio privado con confirmacion rapida y atencion clara desde la reserva hasta la llegada.`,
      `${toursFocus}. Al llegar al hotel puedes continuar tu plan con excursiones verificadas y recogida en lobby para vender experiencia completa.`,
      `Este enfoque combina traslado + tours en una sola decision de compra, aumentando conversion y ticket promedio sin friccion.`
    ],
    trustBadges: [
      variant.badge,
      "Transfer + Tours en una sola reserva",
      "Soporte 24/7 y confirmacion por WhatsApp"
    ],
    faq: [
      {
        question: `El servicio ${variant.marketKeyword} aplica para ${hotel}?`,
        answer:
          "Si. Este servicio esta disponible para ese hotel con traslado privado, seguimiento de vuelo y confirmacion inmediata."
      },
      {
        question: "Puedo reservar tours luego del traslado?",
        answer:
          "Si, puedes añadir tours y actividades con recogida desde tu hotel para mantener toda la operacion en un solo proveedor."
      },
      {
        question: "Se puede coordinar ida y vuelta?",
        answer:
          "Claro. Puedes reservar llegada y salida con tarifa clara, conductor profesional y asistencia durante todo el proceso."
      }
    ],
    seoTitle: `${hotel} ${variant.marketKeyword} | Transfer + Tours Proactivitis`,
    metaDescription: `Reserva ${variant.marketKeyword} para ${hotel}. Incluye traslado privado desde PUJ y opcion de tours con recogida en hotel para vender una experiencia completa.`,
    keywords: [
      ...landing.keywords,
      `${hotel} ${variant.marketKeyword}`,
      `${hotel} transfer and tours`,
      `${hotel} private transfer punta cana`
    ],
    canonical: `https://proactivitis.com/transfer/${fullSlug}`
  };
};
