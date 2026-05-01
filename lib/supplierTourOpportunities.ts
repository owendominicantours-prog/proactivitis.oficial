export type SupplierTourOpportunity = {
  name: string;
  aliases?: string[];
};

export type SupplierTourOpportunityCategory = {
  title: string;
  description: string;
  opportunities: SupplierTourOpportunity[];
};

export type TourCoverageSource = {
  title: string;
  slug?: string | null;
  category?: string | null;
  location?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  status?: string | null;
};

export type ComparedSupplierTourOpportunity = SupplierTourOpportunity & {
  category: string;
  categoryDescription: string;
  covered: boolean;
  matches: TourCoverageSource[];
};

export const supplierTourOpportunityCategories: SupplierTourOpportunityCategory[] = [
  {
    title: "Islas / Playa",
    description: "Experiencias de playa, islas, piscinas naturales y escapes costeros.",
    opportunities: [
      { name: "Isla Saona", aliases: ["saona", "isla saona"] },
      { name: "Isla Saona VIP", aliases: ["saona vip", "isla saona vip"] },
      { name: "Isla Saona privada", aliases: ["saona privada", "private saona", "isla saona privada"] },
      { name: "Isla Catalina", aliases: ["catalina", "isla catalina"] },
      { name: "Saona + Catalina", aliases: ["saona catalina", "saona + catalina"] },
      { name: "Cayo Levantado", aliases: ["cayo levantado", "bacardi island"] },
      { name: "Playa Rincon", aliases: ["playa rincon", "rincon beach"] },
      { name: "Playa Fronton", aliases: ["playa fronton", "fronton beach"] },
      { name: "Playa Macao", aliases: ["playa macao", "macao beach"] },
      { name: "Playa Juanillo", aliases: ["playa juanillo", "juanillo beach"] },
      { name: "Palmilla piscinas naturales", aliases: ["palmilla", "piscinas naturales", "natural pool"] }
    ]
  },
  {
    title: "Mar / Agua",
    description: "Actividades acuaticas con alta demanda en hoteles, playas y marinas.",
    opportunities: [
      { name: "Snorkeling", aliases: ["snorkel", "snorkeling"] },
      { name: "Buceo scuba diving", aliases: ["buceo", "scuba", "scuba diving"] },
      { name: "Seaquarium", aliases: ["seaquarium", "sea aquarium"] },
      { name: "Paseo en catamaran", aliases: ["catamaran", "paseo en catamaran"] },
      { name: "Party boat", aliases: ["party boat", "boat party", "fiesta en barco"] },
      { name: "Lancha rapida", aliases: ["lancha rapida", "speed boat", "speedboat"] },
      { name: "Jet ski", aliases: ["jet ski", "jetski"] },
      { name: "Parasailing", aliases: ["parasailing", "paravelismo"] },
      { name: "Pesca de altura", aliases: ["pesca de altura", "deep sea fishing", "fishing"] },
      { name: "Crucero al atardecer", aliases: ["sunset cruise", "crucero al atardecer", "atardecer"] },
      { name: "Paddleboard", aliases: ["paddleboard", "stand up paddle", "sup"] },
      { name: "Kayak", aliases: ["kayak", "kayaking"] },
      { name: "Surf / windsurf", aliases: ["surf", "windsurf", "windsurfing"] },
      { name: "Esqui acuatico", aliases: ["esqui acuatico", "water ski", "waterski"] },
      { name: "Rafting / tubing", aliases: ["rafting", "tubing"] }
    ]
  },
  {
    title: "Naturaleza / Eco",
    description: "Rutas naturales, parques, cascadas, cuevas y experiencias de conservacion.",
    opportunities: [
      { name: "Parque Nacional Los Haitises", aliases: ["los haitises", "haitises"] },
      { name: "Cascada El Limon", aliases: ["el limon", "cascada limon", "salto el limon"] },
      { name: "Montana Redonda", aliases: ["montana redonda", "redonda mountain"] },
      { name: "Ojos Indigenas", aliases: ["ojos indigenas", "indigenous eyes"] },
      { name: "Hoyo Azul", aliases: ["hoyo azul", "blue hole"] },
      { name: "Laguna Dudu", aliases: ["laguna dudu", "dudu lagoon"] },
      { name: "Salto El Nicho", aliases: ["salto el nicho", "el nicho"] },
      { name: "Lago Enriquillo", aliases: ["lago enriquillo", "lake enriquillo"] },
      { name: "Pico Duarte trekking", aliases: ["pico duarte", "trekking pico duarte"] },
      { name: "27 Charcos de Damajagua", aliases: ["27 charcos", "damajagua", "27 waterfalls"] },
      { name: "Cuevas Las Maravillas", aliases: ["cuevas", "las maravillas", "cave"] }
    ]
  },
  {
    title: "Animales",
    description: "Experiencias con fauna, naturaleza y actividades familiares.",
    opportunities: [
      { name: "Monkeyland", aliases: ["monkeyland", "monkey land", "monos"] },
      { name: "Nado con delfines", aliases: ["delfines", "dolphin", "dolphins", "nado con delfines"] },
      { name: "Avistamiento de ballenas", aliases: ["ballenas", "whale watching", "whales"] },
      { name: "Cabalgatas", aliases: ["cabalgata", "cabalgatas", "horseback", "horse riding"] },
      { name: "Tours de fauna ecologica", aliases: ["fauna", "wildlife", "ecologica", "ecologico"] }
    ]
  },
  {
    title: "Aventura",
    description: "Productos de adrenalina, rutas todoterreno y experiencias activas.",
    opportunities: [
      { name: "Buggies", aliases: ["buggy", "buggies", "dune buggy"] },
      { name: "ATV 4x4", aliases: ["atv", "4x4", "quad"] },
      { name: "Zipline", aliases: ["zipline", "zip line"] },
      { name: "Canopy", aliases: ["canopy"] },
      { name: "Safari truck", aliases: ["safari truck", "safari"] },
      { name: "Off-road tours", aliases: ["off-road", "off road", "todoterreno"] },
      { name: "Cuevas + cenotes", aliases: ["cuevas cenotes", "cenote", "cenotes"] },
      { name: "Trekking / senderismo", aliases: ["trekking", "senderismo", "hiking"] },
      { name: "Rutas en moto", aliases: ["moto", "motorbike", "motorcycle"] },
      { name: "Rutas todoterreno", aliases: ["todoterreno", "offroad", "off-road"] }
    ]
  },
  {
    title: "Ciudades / Cultura",
    description: "Historia dominicana, city tours, monumentos, museos y recorridos guiados.",
    opportunities: [
      { name: "Santo Domingo city tour", aliases: ["santo domingo city tour", "santo domingo"] },
      { name: "Zona Colonial", aliases: ["zona colonial", "colonial zone"] },
      { name: "Los Tres Ojos", aliases: ["los tres ojos", "three eyes"] },
      { name: "Faro a Colon", aliases: ["faro a colon", "columbus lighthouse"] },
      { name: "Altos de Chavon", aliases: ["altos de chavon", "chavon"] },
      { name: "Puerto Plata city tour", aliases: ["puerto plata city tour", "puerto plata"] },
      { name: "Santiago city tour", aliases: ["santiago city tour", "santiago"] },
      { name: "Museos historicos", aliases: ["museo", "museos", "museum"] },
      { name: "Recorridos a pie", aliases: ["walking tour", "recorrido a pie"] },
      { name: "Tours historicos guiados", aliases: ["historico", "historical", "guided historical"] }
    ]
  },
  {
    title: "Experiencias / Productos",
    description: "Sabores locales, productos dominicanos y experiencias culturales comerciales.",
    opportunities: [
      { name: "Tour de cacao", aliases: ["cacao", "chocolate"] },
      { name: "Tour de cafe", aliases: ["cafe", "coffee"] },
      { name: "Tour de ron", aliases: ["ron", "rum"] },
      { name: "Fabrica de cigarros", aliases: ["cigar", "cigarro", "cigar factory"] },
      { name: "Clases de cocina dominicana", aliases: ["cocina dominicana", "cooking class"] },
      { name: "Degustaciones", aliases: ["degustacion", "tasting"] },
      { name: "Tours gastronomicos", aliases: ["gastronomico", "food tour", "gastronomy"] }
    ]
  },
  {
    title: "Nocturnos",
    description: "Vida nocturna, shows, cenas, discotecas y experiencias despues del atardecer.",
    opportunities: [
      { name: "Coco Bongo", aliases: ["coco bongo"] },
      { name: "Discotecas + transporte", aliases: ["discoteca", "nightclub", "club transfer"] },
      { name: "Party bus", aliases: ["party bus"] },
      { name: "Cena show", aliases: ["cena show", "dinner show"] },
      { name: "Casino tours", aliases: ["casino"] },
      { name: "Night tours", aliases: ["night tour", "nocturno"] }
    ]
  },
  {
    title: "Lujo / VIP",
    description: "Servicios privados, premium y personalizados para clientes de mayor ticket.",
    opportunities: [
      { name: "Helicoptero", aliases: ["helicoptero", "helicopter"] },
      { name: "Yate privado", aliases: ["yate privado", "private yacht", "yacht"] },
      { name: "Catamaran privado", aliases: ["catamaran privado", "private catamaran"] },
      { name: "Tours personalizados VIP", aliases: ["vip", "personalizado", "custom tour", "private tour"] }
    ]
  },
  {
    title: "Combinados",
    description: "Paquetes de varias actividades que ayudan a subir conversion y valor por reserva.",
    opportunities: [
      { name: "Buggy + zipline + caballo", aliases: ["buggy zipline caballo", "buggy zipline horse"] },
      { name: "3 en 1 aventura", aliases: ["3 en 1", "3 in 1"] },
      { name: "4 en 1", aliases: ["4 en 1", "4 in 1"] },
      { name: "5 en 1", aliases: ["5 en 1", "5 in 1"] },
      { name: "Saona + buggy", aliases: ["saona buggy", "buggy saona"] },
      { name: "Haitises + cascada + montana", aliases: ["haitises cascada montana", "haitises waterfall mountain"] }
    ]
  }
];

export const normalizeOpportunityText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const opportunitySlug = (value: string) =>
  normalizeOpportunityText(value).replace(/\s+/g, "-");

const getTourSearchText = (tour: TourCoverageSource) =>
  normalizeOpportunityText(
    [
      tour.title,
      tour.slug,
      tour.category,
      tour.location,
      tour.shortDescription,
      tour.description
    ]
      .filter(Boolean)
      .join(" ")
  );

const isCoveredByTour = (opportunity: SupplierTourOpportunity, tourText: string) => {
  const aliases = [opportunity.name, ...(opportunity.aliases ?? [])].map(normalizeOpportunityText);
  return aliases.some((alias) => {
    if (!alias) return false;
    if (alias.length <= 3) {
      return tourText.split(" ").includes(alias);
    }
    return tourText.includes(alias);
  });
};

export const compareSupplierTourOpportunities = (
  tours: TourCoverageSource[]
): ComparedSupplierTourOpportunity[] => {
  const indexedTours = tours.map((tour) => ({ tour, text: getTourSearchText(tour) }));

  return supplierTourOpportunityCategories.flatMap((category) =>
    category.opportunities.map((opportunity) => {
      const matches = indexedTours
        .filter(({ text }) => isCoveredByTour(opportunity, text))
        .map(({ tour }) => tour)
        .slice(0, 3);

      return {
        ...opportunity,
        category: category.title,
        categoryDescription: category.description,
        covered: matches.length > 0,
        matches
      };
    })
  );
};
