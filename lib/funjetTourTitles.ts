const FUNJET_TITLE_BY_SLUG: Record<string, string> = {
  "tour-en-buggy-en-punta-cana": "Punta Cana Buggies",
  "excursion-en-buggy-y-atv-en-punta-cana": "Punta Cana Buggies & ATV",
  "tour-isla-saona-desde-bayhibe-la-romana": "Punta Cana Saona desde Bayahibe",
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": "Punta Cana Saona desde Punta Cana",
  "sunset-catamaran-snorkel": "Punta Cana Catamaran & Snorkel",
  "parasailing-punta-cana": "Punta Cana Parasailing",
  "cayo-levantado-luxury-beach-day": "Punta Cana Cayo Levantado Luxury",
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": "Punta Cana Santo Domingo VIP",
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": "Punta Cana Safari Cultural",
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": "Punta Cana Ballenas & Samana"
};

export const resolveFunjetTourTitle = (slug: string, fallbackTitle: string) =>
  FUNJET_TITLE_BY_SLUG[slug] ?? fallbackTitle;
