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
  adventure: "Aventura",
  gastronomy: "Gastronomia",
  relax: "Relax",
  transport: "Logistica de transporte",
  culture: "Cultura local",
  nightlife: "Vida nocturna"
};
