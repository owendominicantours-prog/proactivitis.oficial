export type TourCategoryOption = {
  value: string;
  label: string;
  description: string;
  aliases?: string[];
};

export const TOUR_CATEGORY_OPTIONS: TourCategoryOption[] = [
  {
    value: "Islas y playas",
    label: "Islas y playas",
    description: "Saona, Catalina, beach day, piscinas naturales y experiencias de costa.",
    aliases: ["playa", "playas", "isla", "islas", "relajacion", "relajaci?n", "beach", "island", "luxury beach"]
  },
  {
    value: "Mar y agua",
    label: "Mar y agua",
    description: "Catamaran, snorkel, buceo, party boat, pesca, kayak y deportes acuaticos.",
    aliases: ["agua", "acuatico", "acuaticos", "snorkel", "snorkeling", "boat", "catamaran", "party boat", "marine"]
  },
  {
    value: "Naturaleza y eco",
    label: "Naturaleza y eco",
    description: "Parques, cascadas, montanas, cuevas, rios, senderismo y rutas ecologicas.",
    aliases: ["naturaleza", "eco", "ecologico", "nature", "waterfall", "cascada", "cueva", "cenote"]
  },
  {
    value: "Animales",
    label: "Animales",
    description: "Monkeyland, delfines, ballenas, caballos y fauna controlada.",
    aliases: ["animal", "animales", "monkey", "monkeyland", "dolphin", "delfines", "ballenas", "fauna", "horseback"]
  },
  {
    value: "Aventura",
    label: "Aventura",
    description: "Buggy, ATV, zipline, off-road, safari truck y rutas con adrenalina.",
    aliases: ["adrenalina", "aventura", "buggy", "atv", "4x4", "zipline", "canopy", "off road", "off-road", "safari"]
  },
  {
    value: "Cultura e historia",
    label: "Cultura e historia",
    description: "Santo Domingo, Zona Colonial, museos, city tours y patrimonio dominicano.",
    aliases: ["cultura", "historia", "historico", "city", "city tour", "urbano", "zona colonial"]
  },
  {
    value: "Experiencias locales",
    label: "Experiencias locales",
    description: "Cacao, cafe, ron, cigarros, gastronomia, cocina y degustaciones.",
    aliases: ["gastronomia", "gastronom?a", "comida", "cocina", "cacao", "cafe", "ron", "cigarro", "degustacion"]
  },
  {
    value: "Nocturnos",
    label: "Nocturnos",
    description: "Coco Bongo, discotecas, party bus, cena show, casinos y nightlife.",
    aliases: ["nocturno", "noche", "night", "nightlife", "discoteca", "disco", "party bus", "show"]
  },
  {
    value: "Lujo y VIP",
    label: "Lujo y VIP",
    description: "Yates, helicopteros, experiencias privadas premium y servicios personalizados.",
    aliases: ["lujo", "vip", "premium", "private", "privado", "privada", "yate", "helicoptero", "luxury"]
  },
  {
    value: "Combinados",
    label: "Combinados",
    description: "Dos o mas actividades en una misma experiencia.",
    aliases: ["combo", "combos", "combinado", "combinados", "3 en 1", "4 en 1", "5 en 1"]
  },
  {
    value: "Familias",
    label: "Familias",
    description: "Tours aptos para ninos, grupos familiares y viajeros que buscan ritmo suave.",
    aliases: ["familia", "familias", "family", "kids", "ninos", "niños"]
  },
  {
    value: "Privados",
    label: "Privados",
    description: "Experiencias exclusivas para pareja, familia o grupo cerrado.",
    aliases: ["privado", "privada", "private", "exclusive", "exclusivo", "grupo privado"]
  }
];

export const TOUR_CATEGORY_LABELS = TOUR_CATEGORY_OPTIONS.map((category) => category.value);

const normalizeComparable = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9?]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const CATEGORY_ALIAS_LOOKUP = new Map<string, string>(
  TOUR_CATEGORY_OPTIONS.flatMap((category) => [
    [normalizeComparable(category.value), category.value],
    [normalizeComparable(category.label), category.value],
    ...(category.aliases ?? []).map((alias) => [normalizeComparable(alias), category.value] as const)
  ])
);

export const normalizeTourCategory = (value: unknown) => {
  if (typeof value !== "string") return "";
  const cleaned = value.trim();
  if (!cleaned) return "";
  return CATEGORY_ALIAS_LOOKUP.get(normalizeComparable(cleaned)) ?? "";
};

export const normalizeTourCategories = (values: unknown[], max = 3) => {
  const normalized: string[] = [];
  for (const value of values) {
    const category = normalizeTourCategory(value);
    if (category && !normalized.includes(category)) normalized.push(category);
    if (normalized.length >= max) break;
  }
  return normalized;
};
