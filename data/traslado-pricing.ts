export type VehicleCategory = "SEDAN" | "VAN" | "SUV";

export type TrasladoNode = {
  id: string;
  name: string;
  microzones: string[];
  featured_hotels: string[];
  transfers: Record<string, Record<VehicleCategory, number>>;
};

export const trasladoPricing: { nodes: TrasladoNode[] } = {
  nodes: [
    {
      id: "PUJ_BAVARO",
      name: "Punta Cana / Bávaro / Cap Cana",
      microzones: ["Cap Cana", "Punta Cana Village", "Bávaro Cortecito", "Los Corales", "Arena Gorda", "Playa Blanca"],
      featured_hotels: [
        "Barceló Bávaro Palace",
        "Hard Rock PC",
        "Iberostar Grand",
        "Majestic Colonial",
        "Secrets Royal Beach",
        "Tortuga Bay"
      ],
      transfers: {
        PUJ_BAVARO: { SEDAN: 35, VAN: 60, SUV: 120 },
        UVERO_MICHES: { SEDAN: 75, VAN: 110, SUV: 190 },
        ROMANA_BAYAHIBE: { SEDAN: 95, VAN: 145, SUV: 250 },
        SANTO_DOMINGO: { SEDAN: 175, VAN: 260, SUV: 450 },
        SAMANA: { SEDAN: 350, VAN: 490, SUV: 750 },
        NORTE_CIBAO: { SEDAN: 420, VAN: 580, SUV: 890 },
        SUR_PROFUNDO: { SEDAN: 550, VAN: 750, SUV: 1100 }
      }
    },
    {
      id: "UVERO_MICHES",
      name: "Uvero Alto / Miches",
      microzones: ["Uvero Alto", "Miches", "Sabana de la Mar", "Playa Esmeralda"],
      featured_hotels: ["Nickelodeon", "Dreams Onyx", "Excellence El Carmen", "Temptation Miches", "Club Med Michès"],
      transfers: {
        UVERO_MICHES: { SEDAN: 45, VAN: 75, SUV: 140 },
        PUJ_BAVARO: { SEDAN: 75, VAN: 110, SUV: 190 },
        ROMANA_BAYAHIBE: { SEDAN: 120, VAN: 180, SUV: 310 },
        SANTO_DOMINGO: { SEDAN: 210, VAN: 310, SUV: 520 },
        SAMANA: { SEDAN: 280, VAN: 410, SUV: 680 },
        NORTE_CIBAO: { SEDAN: 450, VAN: 620, SUV: 950 },
        SUR_PROFUNDO: { SEDAN: 580, VAN: 790, SUV: 1200 }
      }
    },
    {
      id: "ROMANA_BAYAHIBE",
      name: "La Romana / Bayahibe",
      microzones: ["La Romana City", "Casa de Campo", "Bayahibe Village", "Dominicus"],
      featured_hotels: ["Casa de Campo", "Hilton La Romana", "Dreams Dominicus", "Viva Wyndham Maya", "Iberostar Hacienda Dominicus"],
      transfers: {
        ROMANA_BAYAHIBE: { SEDAN: 40, VAN: 65, SUV: 130 },
        PUJ_BAVARO: { SEDAN: 95, VAN: 145, SUV: 250 },
        UVERO_MICHES: { SEDAN: 120, VAN: 180, SUV: 310 },
        SANTO_DOMINGO: { SEDAN: 110, VAN: 165, SUV: 280 },
        SAMANA: { SEDAN: 320, VAN: 460, SUV: 780 },
        NORTE_CIBAO: { SEDAN: 350, VAN: 490, SUV: 820 },
        SUR_PROFUNDO: { SEDAN: 450, VAN: 630, SUV: 990 }
      }
    },
    {
      id: "SANTO_DOMINGO",
      name: "Santo Domingo / Juan Dolio",
      microzones: ["Distrito Nacional", "SDQ Airport", "Boca Chica", "Juan Dolio"],
      featured_hotels: ["JW Marriott", "Renaissance Jaragua", "El Embajador", "Emotions Juan Dolio", "Hodelpa Nicolás de Ovando"],
      transfers: {
        SANTO_DOMINGO: { SEDAN: 45, VAN: 70, SUV: 150 },
        PUJ_BAVARO: { SEDAN: 175, VAN: 260, SUV: 450 },
        UVERO_MICHES: { SEDAN: 210, VAN: 310, SUV: 520 },
        ROMANA_BAYAHIBE: { SEDAN: 110, VAN: 165, SUV: 280 },
        SAMANA: { SEDAN: 195, VAN: 285, SUV: 490 },
        NORTE_CIBAO: { SEDAN: 185, VAN: 270, SUV: 460 },
        SUR_PROFUNDO: { SEDAN: 280, VAN: 410, SUV: 690 }
      }
    },
    {
      id: "SAMANA",
      name: "Samaná / Las Terrenas",
      microzones: ["Las Terrenas", "Las Galeras", "Samaná Port", "El Limón", "Cosón"],
      featured_hotels: ["Bahia Principe Cayo Levantado", "Sublime Samana", "The Bannister", "Viva V Samaná"],
      transfers: {
        SAMANA: { SEDAN: 60, VAN: 95, SUV: 180 },
        PUJ_BAVARO: { SEDAN: 350, VAN: 490, SUV: 750 },
        UVERO_MICHES: { SEDAN: 280, VAN: 410, SUV: 680 },
        ROMANA_BAYAHIBE: { SEDAN: 320, VAN: 460, SUV: 780 },
        SANTO_DOMINGO: { SEDAN: 195, VAN: 285, SUV: 490 },
        NORTE_CIBAO: { SEDAN: 220, VAN: 320, SUV: 550 },
        SUR_PROFUNDO: { SEDAN: 480, VAN: 690, SUV: 1100 }
      }
    },
    {
      id: "NORTE_CIBAO",
      name: "Norte / Cibao",
      microzones: ["Santiago (STI)", "Puerto Plata (POP)", "Cabarete", "Sosúa"],
      featured_hotels: ["Hodelpa Gran Almirante", "Senator Puerto Plata", "Iberostar Costa Dorada", "BlueBay Villas"],
      transfers: {
        NORTE_CIBAO: { SEDAN: 50, VAN: 85, SUV: 160 },
        PUJ_BAVARO: { SEDAN: 420, VAN: 580, SUV: 890 },
        SANTO_DOMINGO: { SEDAN: 185, VAN: 270, SUV: 460 },
        SAMANA: { SEDAN: 220, VAN: 320, SUV: 550 },
        SUR_PROFUNDO: { SEDAN: 390, VAN: 560, SUV: 920 }
      }
    },
    {
      id: "SUR_PROFUNDO",
      name: "Sur Profundo",
      microzones: ["Barahona", "Pedernales", "Bahía de las Águilas", "Baní"],
      featured_hotels: ["Eco-del-Mar", "Hotel Guarocuya", "Casa del Mar Barahona"],
      transfers: {
        SUR_PROFUNDO: { SEDAN: 70, VAN: 110, SUV: 210 },
        SANTO_DOMINGO: { SEDAN: 280, VAN: 410, SUV: 690 },
        PUJ_BAVARO: { SEDAN: 550, VAN: 750, SUV: 1100 }
      }
    }
  ]
};

const microzoneIndex = new Map<string, string>();
trasladoPricing.nodes.forEach((node) =>
  node.microzones.forEach((microzone) => microzoneIndex.set(microzone.toLowerCase(), node.id))
);

export const DEFAULT_ZONE_ID = "PUJ_BAVARO";

const microZoneSlugToZoneId: Record<string, string> = {
  "cap-cana": "PUJ_BAVARO",
  "cabeza-de-toro": "PUJ_BAVARO",
  "bavaro-cortecito": "PUJ_BAVARO",
  "arena-gorda": "PUJ_BAVARO",
  "uvero-alto": "UVERO_MICHES",
  "bavaro-majestic": "PUJ_BAVARO",
  "bavaro-ocean": "PUJ_BAVARO",
  "macao": "ROMANA_BAYAHIBE",
  "punta-cana-resort": "PUJ_BAVARO",
  "la-romana": "ROMANA_BAYAHIBE"
};

export function resolveZoneId(hotel?: {
  microZoneSlug?: string | null;
  microZoneName?: string | null;
  destinationName?: string | null;
}) {
  if (!hotel) return DEFAULT_ZONE_ID;
  const candidates = [hotel.microZoneName, hotel.destinationName].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const match = microzoneIndex.get(candidate.toLowerCase());
    if (match) return match;
  }
  if (hotel.microZoneSlug) {
    const slugMatch = microZoneSlugToZoneId[hotel.microZoneSlug.toLowerCase()];
    if (slugMatch) return slugMatch;
  }
  return DEFAULT_ZONE_ID;
}

export function getTransferPrice(originId: string, destinationId: string, vehicle: VehicleCategory) {
  const originNode = trasladoPricing.nodes.find((node) => node.id === originId);
  const destinationRates = originNode?.transfers[destinationId];
  if (destinationRates?.[vehicle]) return destinationRates[vehicle];
  const fallback = trasladoPricing.nodes.find((node) => node.id === DEFAULT_ZONE_ID);
  return fallback?.transfers[destinationId]?.[vehicle] ?? fallback?.transfers[DEFAULT_ZONE_ID]?.[vehicle] ?? 0;
}
