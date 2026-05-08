export type ProDiscoveryItineraryDraft = {
  summary: string;
  days: Array<{
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
    logistics: string;
  }>;
  supplierNeeds: string[];
  riskNotes: string[];
  nextQuestions: string[];
};

export const GROUP_TYPE_LABELS: Record<string, string> = {
  companies: "Empresas / incentivos",
  families: "Familias",
  bachelor: "Despedidas",
  weddings: "Bodas",
  friends: "Amigos",
  other: "Otro grupo"
};

export const BUDGET_TIER_LABELS: Record<string, string> = {
  low: "Bajo",
  mid: "Medio",
  premium: "Premium",
  vip: "VIP"
};

export const INTEREST_LABELS: Record<string, string> = {
  active: "Activo",
  adventure: "Aventura",
  nature: "Naturaleza",
  local: "Vida local",
  offbeat: "Diferente",
  gastronomy: "Gastronomia",
  relax: "Relax",
  transport: "Logistica de transporte",
  "group-logistics": "Logistica de grupo",
  accommodation: "Alojamiento",
  culture: "Cultura local",
  nightlife: "Vida nocturna",
  insurance: "Seguro de viaje grupal",
  photographer: "Fotografo privado",
  "private-dinner": "Cena privada",
  events: "Eventos"
};

export const LANGUAGE_LABELS: Record<string, string> = {
  es: "Espanol",
  en: "Ingles",
  fr: "Frances",
  de: "Aleman",
  it: "Italiano",
  pt: "Portugues"
};

export const ASSISTANCE_LABELS: Record<string, string> = {
  transport: "Transporte privado",
  accommodation: "Alojamiento",
  "group-logistics": "Logistica de grupo",
  "private-dinner": "Cenas privadas",
  events: "Eventos"
};

export const HOLIDAY_STYLE_LABELS: Record<string, string> = {
  active: "Activo",
  local: "Vida local",
  nature: "Naturaleza",
  offbeat: "Diferente",
  relax: "Relax",
  gastronomy: "Gastronomia"
};

export const ADDITIONAL_SERVICE_LABELS: Record<string, string> = {
  insurance: "Seguro de viaje grupal",
  photographer: "Fotografo privado",
  "private-dinner": "Cena privada",
  nightlife: "Vida nocturna",
  culture: "Ruta cultural"
};
