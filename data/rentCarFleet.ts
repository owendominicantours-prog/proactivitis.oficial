export type RentCarLocale = "es" | "en" | "fr";

export type RentCarCategorySlug =
  | "kia-picanto-2025"
  | "hyundai-i10-grand"
  | "hyundai-elantra-n-line"
  | "toyota-corolla-hybrid"
  | "hyundai-sonata"
  | "toyota-camry"
  | "kia-sportage"
  | "hyundai-tucson"
  | "toyota-rav4"
  | "jeep-grand-cherokee"
  | "suzuki-jimny-4x4"
  | "chevrolet-tahoe-z71"
  | "chevrolet-suburban"
  | "toyota-prado-vx"
  | "ford-explorer"
  | "cadillac-escalade"
  | "cadillac-escalade-esv"
  | "ford-mustang-gt-convertible"
  | "hyundai-h-1"
  | "toyota-hiace";

type RawFleetCategory = {
  model: string;
  base_price: number;
  final_price?: number;
};

type RawFleetLocation = {
  name: string;
  categories: Partial<Record<RentCarCategorySlug, RawFleetCategory>>;
};

const fleetTemplate: Record<RentCarCategorySlug, { model: string; base_price: number }> = {
  "kia-picanto-2025": { model: "Kia Picanto 2025", base_price: 28 },
  "hyundai-i10-grand": { model: "Hyundai i10 Grand", base_price: 30 },
  "hyundai-elantra-n-line": { model: "Hyundai Elantra N-Line", base_price: 48 },
  "toyota-corolla-hybrid": { model: "Toyota Corolla Hybrid", base_price: 52 },
  "hyundai-sonata": { model: "Hyundai Sonata", base_price: 58 },
  "toyota-camry": { model: "Toyota Camry", base_price: 62 },
  "kia-sportage": { model: "Kia Sportage", base_price: 68 },
  "hyundai-tucson": { model: "Hyundai Tucson", base_price: 70 },
  "toyota-rav4": { model: "Toyota RAV4", base_price: 78 },
  "jeep-grand-cherokee": { model: "Jeep Grand Cherokee", base_price: 95 },
  "suzuki-jimny-4x4": { model: "Suzuki Jimny 4x4", base_price: 72 },
  "chevrolet-tahoe-z71": { model: "Chevrolet Tahoe Z71", base_price: 145 },
  "chevrolet-suburban": { model: "Chevrolet Suburban", base_price: 155 },
  "toyota-prado-vx": { model: "Toyota Prado VX", base_price: 130 },
  "ford-explorer": { model: "Ford Explorer", base_price: 110 },
  "cadillac-escalade": { model: "Cadillac Escalade", base_price: 220 },
  "cadillac-escalade-esv": { model: "Cadillac Escalade ESV", base_price: 250 },
  "ford-mustang-gt-convertible": { model: "Ford Mustang GT Convertible", base_price: 185 },
  "hyundai-h-1": { model: "Hyundai H-1", base_price: 125 },
  "toyota-hiace": { model: "Toyota Hiace", base_price: 135 }
};

const buildFleet = (multiplier = 1): Partial<Record<RentCarCategorySlug, RawFleetCategory>> =>
  Object.fromEntries(
    Object.entries(fleetTemplate).map(([slug, vehicle]) => [
      slug,
      {
        model: vehicle.model,
        base_price: Math.round(vehicle.base_price * multiplier)
      }
    ])
  ) as Partial<Record<RentCarCategorySlug, RawFleetCategory>>;

const rawFleet = {
  last_update: "2026-05-05",
  currency: "USD",
  locations: {
    PUJ: {
      name: "Punta Cana / Cap Cana",
      categories: buildFleet(1)
    },
    SDQ: {
      name: "Santo Domingo (Las Americas / Ciudad)",
      categories: buildFleet(0.92)
    },
    STI: {
      name: "Santiago / Cibao",
      categories: buildFleet(0.94)
    },
    LRM: {
      name: "La Romana / Bayahibe",
      categories: buildFleet(0.98)
    },
    POP: {
      name: "Puerto Plata / Cabarete",
      categories: buildFleet(0.95)
    },
    SAM: {
      name: "Samana / Las Terrenas",
      categories: buildFleet(1.08)
    }
  } satisfies Record<string, RawFleetLocation>
};

const locationMeta: Record<
  string,
  {
    id: string;
    code: keyof typeof rawFleet.locations;
    name: string;
    regionId: string;
    highProfile?: boolean;
    airportLabel: string;
    searchTerms: string[];
  }
> = {
  "puj-cap-cana": {
    id: "puj-cap-cana",
    code: "PUJ",
    name: "Punta Cana / Cap Cana",
    regionId: "PUJ_CAP_CANA",
    highProfile: true,
    airportLabel: "PUJ",
    searchTerms: ["punta cana", "cap cana", "bavaro", "puj", "uvero alto"]
  },
  "santo-domingo-sdq": {
    id: "santo-domingo-sdq",
    code: "SDQ",
    name: "Santo Domingo / Las Americas",
    regionId: "SDQ_SANTO_DOMINGO",
    airportLabel: "SDQ",
    searchTerms: ["santo domingo", "sdq", "las americas"]
  },
  "santiago-cibao": {
    id: "santiago-cibao",
    code: "STI",
    name: "Santiago / Cibao",
    regionId: "STI_CIBAO",
    airportLabel: "STI",
    searchTerms: ["santiago", "cibao", "sti"]
  },
  "la-romana-bayahibe": {
    id: "la-romana-bayahibe",
    code: "LRM",
    name: "La Romana / Bayahibe",
    regionId: "LRM_BAYAHIBE",
    highProfile: true,
    airportLabel: "LRM",
    searchTerms: ["la romana", "bayahibe", "casa de campo", "lrm"]
  },
  "puerto-plata-cabarete": {
    id: "puerto-plata-cabarete",
    code: "POP",
    name: "Puerto Plata / Cabarete",
    regionId: "POP_PUERTO_PLATA",
    airportLabel: "POP",
    searchTerms: ["puerto plata", "cabarete", "sosua", "pop"]
  },
  "samana-las-terrenas": {
    id: "samana-las-terrenas",
    code: "SAM",
    name: "Samana / Las Terrenas",
    regionId: "SAM_LAS_TERRENAS",
    airportLabel: "AZS",
    searchTerms: ["samana", "las terrenas", "azs"]
  }
};

const categoryMeta: Record<
  RentCarCategorySlug,
  {
    label: string;
    displayName: string;
    tag: string;
    seats: number;
    luggage: number;
    image: string;
    priority: number;
    margin: "economy" | "sedan" | "suv" | "premium" | "luxury";
  }
> = {
  "kia-picanto-2025": {
    label: "Economy",
    displayName: "Smart City Rental",
    tag: "Budget Control",
    seats: 4,
    luggage: 1,
    image: "/transfer/sedan.png",
    priority: 20,
    margin: "economy"
  },
  "hyundai-i10-grand": {
    label: "Economy",
    displayName: "Smart City Rental",
    tag: "Budget Control",
    seats: 4,
    luggage: 1,
    image: "/transfer/sedan.png",
    priority: 21,
    margin: "economy"
  },
  "hyundai-elantra-n-line": {
    label: "Sedan",
    displayName: "Comfort Sedan Rental",
    tag: "Clean Business",
    seats: 5,
    luggage: 2,
    image: "/transfer/sedan.png",
    priority: 40,
    margin: "sedan"
  },
  "toyota-corolla-hybrid": {
    label: "Hybrid Sedan",
    displayName: "Hybrid Sedan Rental",
    tag: "Fuel Smart",
    seats: 5,
    luggage: 2,
    image: "/transfer/sedan.png",
    priority: 42,
    margin: "sedan"
  },
  "hyundai-sonata": {
    label: "Sedan",
    displayName: "Comfort Sedan Rental",
    tag: "Clean Business",
    seats: 5,
    luggage: 2,
    image: "/transfer/sedan.png",
    priority: 44,
    margin: "sedan"
  },
  "toyota-camry": {
    label: "Sedan",
    displayName: "Comfort Sedan Rental",
    tag: "Executive Comfort",
    seats: 5,
    luggage: 2,
    image: "/transfer/sedan.png",
    priority: 46,
    margin: "sedan"
  },
  "kia-sportage": {
    label: "SUV",
    displayName: "Executive SUV Rental",
    tag: "Boss Mode",
    seats: 5,
    luggage: 3,
    image: "/transfer/suv.png",
    priority: 80,
    margin: "suv"
  },
  "hyundai-tucson": {
    label: "SUV",
    displayName: "Executive SUV Rental",
    tag: "Boss Mode",
    seats: 5,
    luggage: 3,
    image: "/transfer/suv.png",
    priority: 81,
    margin: "suv"
  },
  "toyota-rav4": {
    label: "SUV",
    displayName: "Executive SUV Rental",
    tag: "Adventure Ready",
    seats: 5,
    luggage: 3,
    image: "/transfer/suv.png",
    priority: 82,
    margin: "suv"
  },
  "jeep-grand-cherokee": {
    label: "Premium SUV",
    displayName: "Premium SUV Rental",
    tag: "Boss Mode",
    seats: 5,
    luggage: 4,
    image: "/transfer/suv.png",
    priority: 96,
    margin: "premium"
  },
  "suzuki-jimny-4x4": {
    label: "4x4",
    displayName: "Compact 4x4 Rental",
    tag: "Adventure Ready",
    seats: 4,
    luggage: 2,
    image: "/transfer/suv.png",
    priority: 83,
    margin: "suv"
  },
  "chevrolet-tahoe-z71": {
    label: "Luxury SUV",
    displayName: "Presidential SUV Rental",
    tag: "Presidential Arrival",
    seats: 7,
    luggage: 4,
    image: "/transfer/suv.png",
    priority: 105,
    margin: "luxury"
  },
  "chevrolet-suburban": {
    label: "Luxury SUV",
    displayName: "Presidential SUV Rental",
    tag: "Group Luxury",
    seats: 7,
    luggage: 5,
    image: "/transfer/suv.png",
    priority: 106,
    margin: "luxury"
  },
  "toyota-prado-vx": {
    label: "Premium SUV",
    displayName: "Premium SUV Rental",
    tag: "Boss Mode",
    seats: 7,
    luggage: 4,
    image: "/transfer/suv.png",
    priority: 98,
    margin: "premium"
  },
  "ford-explorer": {
    label: "Premium SUV",
    displayName: "Premium SUV Rental",
    tag: "Family Command",
    seats: 7,
    luggage: 4,
    image: "/transfer/suv.png",
    priority: 97,
    margin: "premium"
  },
  "cadillac-escalade": {
    label: "Luxury",
    displayName: "Presidential Luxury Rental",
    tag: "Presidential Arrival",
    seats: 7,
    luggage: 4,
    image: "/transfer/suv.png",
    priority: 115,
    margin: "luxury"
  },
  "cadillac-escalade-esv": {
    label: "Ultra Luxury",
    displayName: "Ultra Luxury Rental",
    tag: "Presidential Arrival",
    seats: 7,
    luggage: 5,
    image: "/transfer/suv.png",
    priority: 116,
    margin: "luxury"
  },
  "ford-mustang-gt-convertible": {
    label: "Convertible",
    displayName: "Convertible Rental",
    tag: "Beach Drive",
    seats: 4,
    luggage: 1,
    image: "/transfer/sedan.png",
    priority: 112,
    margin: "luxury"
  },
  "hyundai-h-1": {
    label: "Premium Van",
    displayName: "Group Van Rental",
    tag: "Family Command",
    seats: 8,
    luggage: 5,
    image: "/transfer/mini van.png",
    priority: 75,
    margin: "premium"
  },
  "toyota-hiace": {
    label: "Premium Van",
    displayName: "Group Van Rental",
    tag: "Family Command",
    seats: 10,
    luggage: 6,
    image: "/transfer/mini van.png",
    priority: 76,
    margin: "premium"
  }
};

const money = (value: number) => Math.ceil(value / 5) * 5;

export const getRentCarLocalePrefix = (locale: RentCarLocale = "en") =>
  locale === "es" ? "" : `/${locale}`;

export const getRentCarRootPath = (locale: RentCarLocale = "en") =>
  `${getRentCarLocalePrefix(locale)}/rent-a-car`;

export const getRentCarOptionPath = (
  locationId: string,
  categorySlug: RentCarCategorySlug | string,
  locale: RentCarLocale = "en"
) => `${getRentCarRootPath(locale)}/${locationId}/${categorySlug}`;

export const getRentCarLocationDefaultPath = (locationId: string, locale: RentCarLocale = "en") =>
  getRentCarOptionPath(locationId, getRentCarOptions(locationId)[0]?.categorySlug ?? "economy", locale);

export const getRentCarPrice = (category: RentCarCategorySlug, basePrice: number) => {
  const margin = categoryMeta[category].margin;
  if (margin === "economy") return money(basePrice + 8);
  if (margin === "sedan") return money(basePrice + 10);
  if (margin === "suv") return money(basePrice * 1.2);
  if (margin === "premium") return money(basePrice * 1.2);
  return money(basePrice * 1.25);
};

export type RentCarOption = {
  locationId: string;
  regionId: string;
  locationName: string;
  airportLabel: string;
  categorySlug: RentCarCategorySlug;
  categoryLabel: string;
  model: string;
  displayName: string;
  tag: string;
  price: number;
  currency: string;
  seats: number;
  luggage: number;
  image: string;
  href: string;
  highProfile: boolean;
};

export const getRentCarLocations = () => Object.values(locationMeta);

export const getRentCarLocation = (locationId: string) => locationMeta[locationId] ?? null;

export const getRentCarOptions = (locationId?: string): RentCarOption[] => {
  const locations = locationId ? [locationMeta[locationId]].filter(Boolean) : Object.values(locationMeta);
  return locations.flatMap((location) => {
    const raw = rawFleet.locations[location.code];
    const options = Object.entries(raw.categories).map(([categorySlug, category]) => {
      const slug = categorySlug as RentCarCategorySlug;
      const meta = categoryMeta[slug];
      return {
        locationId: location.id,
        regionId: location.regionId,
        locationName: location.name,
        airportLabel: location.airportLabel,
        categorySlug: slug,
        categoryLabel: meta.label,
        model: category.model,
        displayName: meta.displayName,
        tag: meta.tag,
        price: getRentCarPrice(slug, category.base_price),
        currency: rawFleet.currency,
        seats: meta.seats,
        luggage: meta.luggage,
        image: meta.image,
        href: getRentCarOptionPath(location.id, slug, "en"),
        highProfile: Boolean(location.highProfile)
      };
    });
    return options.sort((a, b) => {
      if (!location.highProfile) return a.price - b.price;
      return categoryMeta[b.categorySlug].priority - categoryMeta[a.categorySlug].priority;
    });
  });
};

export const getRentCarOption = (locationId: string, categorySlug: string) =>
  getRentCarOptions(locationId).find((option) => option.categorySlug === categorySlug) ?? null;

export const detectRentCarLocationId = (input: string) => {
  const text = input.toLowerCase();
  const match = Object.values(locationMeta).find((location) =>
    location.searchTerms.some((term) => text.includes(term))
  );
  return match?.id ?? "puj-cap-cana";
};

export const rentCarCopy = {
  en: {
    rootTitle: "Rent a car by travel zone",
    rootDescription:
      "Reserve rent-a-car options by exact travel zone with final Proactivitis prices, 2024/2025 model guarantee and VIP Support.",
    eyebrow: "Proactivitis rent a car",
    heroTitle: "Choose your car and reserve in minutes",
    heroBody:
      "Search by airport, city or beach area. Pick a vehicle class, add pickup and return details, and Proactivitis support confirms the rental.",
    searchPlaceholder: "Search PUJ, Cap Cana, Santo Domingo, SUV...",
    searchTitle: "What are you looking for?",
    zonesTitle: "Choose pickup zone",
    zonesBody: "Real availability by local area",
    vehiclesTitle: "Cars ready to reserve",
    vehiclesBody: "Choose a vehicle that fits your trip",
    updated: "Updated",
    viewFleet: "View fleet",
    reserveNow: "Reserve now",
    book: "Book",
    from: "From",
    day: "day",
    highDemand: "High demand",
    modelGuarantee: "Model 2024/2025",
    vipSupport: "VIP Support",
    breadcrumb: "Rent a car",
    rating: "5.0 rating",
    requests: "100 verified rental requests",
    operated: "Operated by Original Proactivitis",
    facts: ["Vehicle", "Seats", "Luggage", "Airport"],
    passengers: "passengers",
    bags: "bags",
    expectEyebrow: "What to expect",
    expectTitle: "A rental flow built like a Proactivitis experience",
    expectBody:
      "Choose the vehicle, set pickup and return details, and send the request with the information ready. Support confirms the class, delivery instructions and next steps.",
    included: "Included",
    beforePickup: "Before pickup",
    localFleet: "Local fleet",
    otherRegions: "More regions",
    fleetEditorTitle: "Rent car fleet",
    fleetEditorBody: "Static fleet source used by the public catalog, hotel widgets and sitemap.",
    notFoundTitle: "Vehicle zone not available",
    notFoundBody: "This exact car rental page is not active yet. Choose one of the available Proactivitis zones.",
    notFoundCta: "View available fleet"
  },
  es: {
    rootTitle: "Rent a car por zona",
    rootDescription:
      "Reserva vehiculos por zona real con precios finales Proactivitis, garantia de modelo 2024/2025 y soporte VIP.",
    eyebrow: "Proactivitis rent a car",
    heroTitle: "Elige tu vehiculo y reserva en minutos",
    heroBody:
      "Busca por aeropuerto, ciudad o zona de playa. Elige la categoria, agrega recogida y devolucion, y soporte Proactivitis confirma la renta.",
    searchPlaceholder: "Busca PUJ, Cap Cana, Santo Domingo, SUV...",
    searchTitle: "Que estas buscando?",
    zonesTitle: "Elige zona de recogida",
    zonesBody: "Disponibilidad real por area local",
    vehiclesTitle: "Vehiculos listos para reservar",
    vehiclesBody: "Elige el vehiculo que encaja con tu viaje",
    updated: "Actualizado",
    viewFleet: "Ver flota",
    reserveNow: "Reservar ahora",
    book: "Reservar",
    from: "Desde",
    day: "dia",
    highDemand: "Alta demanda",
    modelGuarantee: "Modelo 2024/2025",
    vipSupport: "Soporte VIP",
    breadcrumb: "Rent a car",
    rating: "5.0 puntuacion",
    requests: "100 solicitudes verificadas",
    operated: "Operado por Original Proactivitis",
    facts: ["Vehiculo", "Asientos", "Equipaje", "Aeropuerto"],
    passengers: "pasajeros",
    bags: "maletas",
    expectEyebrow: "Que esperar",
    expectTitle: "Una renta organizada como experiencia Proactivitis",
    expectBody:
      "Elige el vehiculo, define recogida y devolucion, y envia la solicitud con la informacion lista. Soporte confirma la categoria, instrucciones y proximos pasos.",
    included: "Incluye",
    beforePickup: "Antes de recoger",
    localFleet: "Flota local",
    otherRegions: "Mas zonas",
    fleetEditorTitle: "Flota rent car",
    fleetEditorBody: "Fuente estatica usada por el catalogo publico, widgets de hoteles y sitemap.",
    notFoundTitle: "Zona o vehiculo no disponible",
    notFoundBody: "Esta pagina exacta de renta aun no esta activa. Elige una de las zonas disponibles.",
    notFoundCta: "Ver flota disponible"
  },
  fr: {
    rootTitle: "Location de voiture par zone",
    rootDescription:
      "Reservez des voitures par zone reelle avec prix finaux Proactivitis, modele 2024/2025 garanti et support VIP.",
    eyebrow: "Proactivitis location de voiture",
    heroTitle: "Choisissez votre voiture et reservez en quelques minutes",
    heroBody:
      "Recherchez par aeroport, ville ou zone de plage. Choisissez la categorie, ajoutez la prise en charge et le retour, puis Proactivitis confirme la location.",
    searchPlaceholder: "Cherchez PUJ, Cap Cana, Saint-Domingue, SUV...",
    searchTitle: "Que recherchez-vous?",
    zonesTitle: "Choisissez la zone de prise en charge",
    zonesBody: "Disponibilite reelle par zone locale",
    vehiclesTitle: "Voitures pretes a reserver",
    vehiclesBody: "Choisissez le vehicule adapte a votre voyage",
    updated: "Mis a jour",
    viewFleet: "Voir flotte",
    reserveNow: "Reserver",
    book: "Reserver",
    from: "A partir de",
    day: "jour",
    highDemand: "Forte demande",
    modelGuarantee: "Modele 2024/2025",
    vipSupport: "Support VIP",
    breadcrumb: "Location de voiture",
    rating: "Note 5.0",
    requests: "100 demandes verifiees",
    operated: "Operé par Original Proactivitis",
    facts: ["Vehicule", "Sieges", "Bagages", "Aeroport"],
    passengers: "passagers",
    bags: "bagages",
    expectEyebrow: "A quoi s'attendre",
    expectTitle: "Une location organisee comme une experience Proactivitis",
    expectBody:
      "Choisissez le vehicule, indiquez la prise en charge et le retour, puis envoyez une demande complete. Le support confirme la categorie, les instructions et les prochaines etapes.",
    included: "Inclus",
    beforePickup: "Avant la prise en charge",
    localFleet: "Flotte locale",
    otherRegions: "Autres zones",
    fleetEditorTitle: "Flotte rent car",
    fleetEditorBody: "Source statique utilisee par le catalogue public, les widgets hotels et le sitemap.",
    notFoundTitle: "Zone ou vehicule indisponible",
    notFoundBody: "Cette page de location n'est pas encore active. Choisissez une zone disponible.",
    notFoundCta: "Voir la flotte"
  }
} satisfies Record<RentCarLocale, Record<string, string | string[]>>;

export const getRentCarCopy = (locale: RentCarLocale = "en") => rentCarCopy[locale] ?? rentCarCopy.en;

export const buildRentCarH1 = (option: RentCarOption, locale: RentCarLocale = "en") => {
  if (locale === "es") return `${option.displayName.replace("Rental", "")} en ${option.locationName}`;
  if (locale === "fr") return `${option.displayName.replace("Rental", "")} a ${option.locationName}`;
  return `${option.displayName.replace("Rental", "Rental")} in ${option.locationName}`;
};

export const buildRentCarDescription = (option: RentCarOption, locale: RentCarLocale = "en") => {
  const tone =
    option.tag === "Boss Mode" || option.tag === "Presidential Arrival"
      ? "built for travelers who want a strong arrival, private control, and a vehicle that matches premium hotels and business movement"
      : option.tag === "Family Command"
        ? "built for families and groups who need space, luggage capacity, and a smoother airport-to-hotel plan"
        : "built for travelers who want a clean, simple, and predictable rental without wasting time at arrival";

  if (locale === "es") {
    return `${option.model} o similar en ${option.locationName}. Una opcion pensada para moverte con control, recogida organizada y soporte VIP Proactivitis durante la renta.`;
  }
  if (locale === "fr") {
    return `${option.model} ou similaire a ${option.locationName}. Une option concue pour voyager avec controle, prise en charge organisee et support VIP Proactivitis.`;
  }

  return `${option.model} or similar in ${option.locationName}, ${tone}. Proactivitis VIP Support helps coordinate pickup details, local questions, and trip changes so the rental feels managed, not improvised.`;
};

export const buildRentCarGeminiPrompt = (option: RentCarOption) =>
  [
    "Create a high-converting SEO section for a rent-a-car landing page.",
    `Vehicle display_name: ${option.displayName}`,
    `Vehicle tag: ${option.tag}`,
    `Location: ${option.locationName}`,
    `Model: ${option.model}`,
    "Mention Proactivitis VIP Support naturally.",
    "Do not expose supplier cost, margin, or internal pricing logic.",
    "Return clean JSON with h1, metaTitle, metaDescription, benefits, faq."
  ].join("\n");

export const getRentCarJsonLd = (option: RentCarOption, locale: RentCarLocale = "en") => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Product", "Car"],
      "@id": `https://proactivitis.com${getRentCarOptionPath(option.locationId, option.categorySlug, locale)}#rent-car`,
      name: `${option.model} - ${option.locationName}`,
      brand: {
        "@type": "Brand",
        name: option.model.split(" ")[0]
      },
      model: option.model,
      image: `https://proactivitis.com${option.image}`,
      description: buildRentCarDescription(option, locale),
      category: option.categoryLabel,
      vehicleSeatingCapacity: option.seats,
      offers: {
        "@type": "Offer",
        priceCurrency: option.currency,
        price: option.price,
        availability: "https://schema.org/InStock",
        url: `https://proactivitis.com${getRentCarOptionPath(option.locationId, option.categorySlug, locale)}`
      }
    },
    {
      "@type": "LocalBusiness",
      "@id": `https://proactivitis.com${getRentCarOptionPath(option.locationId, option.categorySlug, locale)}#provider`,
      name: "Proactivitis Rent a Car",
      areaServed: option.locationName,
      url: `https://proactivitis.com${getRentCarOptionPath(option.locationId, option.categorySlug, locale)}`
    }
  ]
});

export const rentCarLastUpdate = rawFleet.last_update;
