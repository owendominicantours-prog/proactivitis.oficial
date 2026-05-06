export type RentCarLocale = "es" | "en" | "fr";

export type RentCarCategorySlug = string;
export const rentCarMarginTypes = ["economy", "sedan", "suv", "premium", "luxury"] as const;
export type RentCarMargin = (typeof rentCarMarginTypes)[number];
export type RentCarTransmission = "Automatic" | "Manual";
export type RentCarFuelType = "Gasoline" | "Hybrid" | "Diesel" | "Electric";

export type RentCarVehicleSpecs = {
  passengers: number;
  doors: number;
  transmission: RentCarTransmission;
  fuelType: RentCarFuelType;
  airConditioning: boolean;
  bags: number;
  largeBags: number;
  bluetooth: boolean;
  usb: boolean;
  appleCarplay: boolean;
  androidAuto: boolean;
  fourByFour: boolean;
  convertible: boolean;
};

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

const vehicleSpecDefaults: Record<RentCarCategorySlug, RentCarVehicleSpecs> = {
  "kia-picanto-2025": {
    passengers: 4,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 2,
    largeBags: 1,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "hyundai-i10-grand": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 2,
    largeBags: 1,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "hyundai-elantra-n-line": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 3,
    largeBags: 2,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "toyota-corolla-hybrid": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Hybrid",
    airConditioning: true,
    bags: 3,
    largeBags: 2,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "hyundai-sonata": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 4,
    largeBags: 3,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "toyota-camry": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 4,
    largeBags: 3,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "kia-sportage": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 5,
    largeBags: 3,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "hyundai-tucson": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 5,
    largeBags: 3,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "toyota-rav4": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 5,
    largeBags: 3,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "jeep-grand-cherokee": {
    passengers: 5,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 5,
    largeBags: 4,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "suzuki-jimny-4x4": {
    passengers: 4,
    doors: 2,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 2,
    largeBags: 1,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: true,
    convertible: false
  },
  "chevrolet-tahoe-z71": {
    passengers: 7,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 6,
    largeBags: 5,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: true,
    convertible: false
  },
  "chevrolet-suburban": {
    passengers: 8,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 8,
    largeBags: 6,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "toyota-prado-vx": {
    passengers: 7,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Diesel",
    airConditioning: true,
    bags: 6,
    largeBags: 4,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: true,
    convertible: false
  },
  "ford-explorer": {
    passengers: 7,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 6,
    largeBags: 4,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "cadillac-escalade": {
    passengers: 7,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 6,
    largeBags: 5,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "cadillac-escalade-esv": {
    passengers: 7,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 8,
    largeBags: 6,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: false
  },
  "ford-mustang-gt-convertible": {
    passengers: 4,
    doors: 2,
    transmission: "Automatic",
    fuelType: "Gasoline",
    airConditioning: true,
    bags: 2,
    largeBags: 1,
    bluetooth: true,
    usb: true,
    appleCarplay: true,
    androidAuto: true,
    fourByFour: false,
    convertible: true
  },
  "hyundai-h-1": {
    passengers: 12,
    doors: 4,
    transmission: "Automatic",
    fuelType: "Diesel",
    airConditioning: true,
    bags: 10,
    largeBags: 8,
    bluetooth: true,
    usb: true,
    appleCarplay: false,
    androidAuto: false,
    fourByFour: false,
    convertible: false
  },
  "toyota-hiace": {
    passengers: 15,
    doors: 4,
    transmission: "Manual",
    fuelType: "Diesel",
    airConditioning: true,
    bags: 12,
    largeBags: 10,
    bluetooth: true,
    usb: true,
    appleCarplay: false,
    androidAuto: false,
    fourByFour: false,
    convertible: false
  }
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
    margin: RentCarMargin;
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

export type RentCarVehicleSetting = {
  slug: string;
  model: string;
  basePrice: number;
  label: string;
  displayName: string;
  tag: string;
  seats: number;
  luggage: number;
  doors: number;
  transmission: RentCarTransmission;
  fuelType: RentCarFuelType;
  airConditioning: boolean;
  bags: number;
  largeBags: number;
  bluetooth: boolean;
  usb: boolean;
  appleCarplay: boolean;
  androidAuto: boolean;
  fourByFour: boolean;
  convertible: boolean;
  image: string;
  priority: number;
  margin: RentCarMargin;
  active: boolean;
};

export type RentCarLocationSetting = {
  id: string;
  code: string;
  name: string;
  regionId: string;
  highProfile: boolean;
  airportLabel: string;
  searchTerms: string[];
  multiplier: number;
  active: boolean;
};

export type RentCarFleetSettings = {
  lastUpdate: string;
  currency: string;
  vehicles: RentCarVehicleSetting[];
  locations: RentCarLocationSetting[];
};

const locationMultipliers: Record<string, number> = {
  "puj-cap-cana": 1,
  "santo-domingo-sdq": 0.92,
  "santiago-cibao": 0.94,
  "la-romana-bayahibe": 0.98,
  "puerto-plata-cabarete": 0.95,
  "samana-las-terrenas": 1.08
};

const toVehicleSetting = (slug: string): RentCarVehicleSetting => {
  const template = fleetTemplate[slug];
  const meta = categoryMeta[slug];
  const specs = vehicleSpecDefaults[slug];

  return {
    slug,
    model: template?.model ?? slug,
    basePrice: template?.base_price ?? 0,
    label: meta?.label ?? "Vehicle",
    displayName: meta?.displayName ?? "Rent a Car",
    tag: meta?.tag ?? "Proactivitis",
    seats: specs?.passengers ?? meta?.seats ?? 4,
    luggage: specs?.bags ?? meta?.luggage ?? 1,
    doors: specs?.doors ?? 4,
    transmission: specs?.transmission ?? "Automatic",
    fuelType: specs?.fuelType ?? "Gasoline",
    airConditioning: specs?.airConditioning ?? true,
    bags: specs?.bags ?? meta?.luggage ?? 1,
    largeBags: specs?.largeBags ?? meta?.luggage ?? 1,
    bluetooth: specs?.bluetooth ?? true,
    usb: specs?.usb ?? true,
    appleCarplay: specs?.appleCarplay ?? true,
    androidAuto: specs?.androidAuto ?? true,
    fourByFour: specs?.fourByFour ?? false,
    convertible: specs?.convertible ?? false,
    image: meta?.image ?? "/transfer/sedan.png",
    priority: meta?.priority ?? 10,
    margin: meta?.margin ?? "economy",
    active: true
  };
};

const toLocationSetting = (location: (typeof locationMeta)[string]): RentCarLocationSetting => ({
  id: location.id,
  code: String(location.code),
  name: location.name,
  regionId: location.regionId,
  highProfile: Boolean(location.highProfile),
  airportLabel: location.airportLabel,
  searchTerms: location.searchTerms,
  multiplier: locationMultipliers[location.id] ?? 1,
  active: true
});

export const defaultRentCarFleetSettings: RentCarFleetSettings = {
  lastUpdate: rawFleet.last_update,
  currency: rawFleet.currency,
  vehicles: Object.keys(fleetTemplate).map(toVehicleSetting),
  locations: Object.values(locationMeta).map(toLocationSetting)
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const readString = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const readNumber = (value: unknown, fallback: number) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readBoolean = (value: unknown, fallback: boolean) =>
  typeof value === "boolean" ? value : fallback;

const readStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : fallback;

const normalizeMargin = (value: unknown, fallback: RentCarMargin): RentCarMargin =>
  rentCarMarginTypes.includes(value as RentCarMargin) ? (value as RentCarMargin) : fallback;

const normalizeTransmission = (value: unknown, fallback: RentCarTransmission): RentCarTransmission =>
  value === "Manual" || value === "Automatic" ? value : fallback;

const normalizeFuelType = (value: unknown, fallback: RentCarFuelType): RentCarFuelType =>
  value === "Gasoline" || value === "Hybrid" || value === "Diesel" || value === "Electric" ? value : fallback;

export const normalizeRentCarFleetSettings = (value: unknown): RentCarFleetSettings => {
  if (!isRecord(value)) return defaultRentCarFleetSettings;

  const defaultVehiclesBySlug = new Map(defaultRentCarFleetSettings.vehicles.map((vehicle) => [vehicle.slug, vehicle]));
  const incomingVehicles = Array.isArray(value.vehicles) ? value.vehicles : [];
  const mergedVehicles = incomingVehicles
    .filter(isRecord)
    .map((vehicle) => {
      const slug = readString(vehicle.slug, "");
      if (!slug) return null;
      const fallback = defaultVehiclesBySlug.get(slug) ?? toVehicleSetting(slug);
      const hasModernSpecs = "doors" in vehicle || "fuelType" in vehicle || "largeBags" in vehicle;
      return {
        slug,
        model: readString(vehicle.model, fallback.model),
        basePrice: Math.max(0, readNumber(vehicle.basePrice, fallback.basePrice)),
        label: readString(vehicle.label, fallback.label),
        displayName: readString(vehicle.displayName, fallback.displayName),
        tag: readString(vehicle.tag, fallback.tag),
        seats: Math.max(1, Math.round(readNumber(hasModernSpecs ? vehicle.seats : undefined, fallback.seats))),
        luggage: Math.max(0, Math.round(readNumber(hasModernSpecs ? vehicle.luggage : undefined, fallback.luggage))),
        doors: Math.max(0, Math.round(readNumber(vehicle.doors, fallback.doors))),
        transmission: normalizeTransmission(vehicle.transmission, fallback.transmission),
        fuelType: normalizeFuelType(vehicle.fuelType, fallback.fuelType),
        airConditioning: readBoolean(vehicle.airConditioning, fallback.airConditioning),
        bags: Math.max(0, Math.round(readNumber(vehicle.bags, fallback.bags))),
        largeBags: Math.max(0, Math.round(readNumber(vehicle.largeBags, fallback.largeBags))),
        bluetooth: readBoolean(vehicle.bluetooth, fallback.bluetooth),
        usb: readBoolean(vehicle.usb, fallback.usb),
        appleCarplay: readBoolean(vehicle.appleCarplay, fallback.appleCarplay),
        androidAuto: readBoolean(vehicle.androidAuto, fallback.androidAuto),
        fourByFour: readBoolean(vehicle.fourByFour, fallback.fourByFour),
        convertible: readBoolean(vehicle.convertible, fallback.convertible),
        image: readString(vehicle.image, fallback.image),
        priority: Math.round(readNumber(vehicle.priority, fallback.priority)),
        margin: normalizeMargin(vehicle.margin, fallback.margin),
        active: readBoolean(vehicle.active, fallback.active)
      } satisfies RentCarVehicleSetting;
    })
    .filter(Boolean) as RentCarVehicleSetting[];

  const mergedVehicleSlugs = new Set(mergedVehicles.map((vehicle) => vehicle.slug));
  const vehicles = [
    ...defaultRentCarFleetSettings.vehicles.filter((vehicle) => !mergedVehicleSlugs.has(vehicle.slug)),
    ...mergedVehicles
  ];

  const defaultLocationsById = new Map(defaultRentCarFleetSettings.locations.map((location) => [location.id, location]));
  const incomingLocations = Array.isArray(value.locations) ? value.locations : [];
  const mergedLocations = incomingLocations
    .filter(isRecord)
    .map((location) => {
      const id = readString(location.id, "");
      if (!id) return null;
      const fallback = defaultLocationsById.get(id) ?? {
        id,
        code: id.toUpperCase().slice(0, 4),
        name: id,
        regionId: id.toUpperCase().replace(/-/g, "_"),
        highProfile: false,
        airportLabel: "",
        searchTerms: [],
        multiplier: 1,
        active: true
      };
      return {
        id,
        code: readString(location.code, fallback.code),
        name: readString(location.name, fallback.name),
        regionId: readString(location.regionId, fallback.regionId),
        highProfile: readBoolean(location.highProfile, fallback.highProfile),
        airportLabel: readString(location.airportLabel, fallback.airportLabel),
        searchTerms: readStringArray(location.searchTerms, fallback.searchTerms),
        multiplier: Math.max(0, readNumber(location.multiplier, fallback.multiplier)),
        active: readBoolean(location.active, fallback.active)
      } satisfies RentCarLocationSetting;
    })
    .filter(Boolean) as RentCarLocationSetting[];

  const mergedLocationIds = new Set(mergedLocations.map((location) => location.id));
  const locations = [
    ...defaultRentCarFleetSettings.locations.filter((location) => !mergedLocationIds.has(location.id)),
    ...mergedLocations
  ];

  return {
    lastUpdate: readString(value.lastUpdate, defaultRentCarFleetSettings.lastUpdate),
    currency: readString(value.currency, defaultRentCarFleetSettings.currency),
    vehicles,
    locations
  };
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

export const getRentCarLocationDefaultPath = (
  locationId: string,
  locale: RentCarLocale = "en",
  settings?: RentCarFleetSettings
) => getRentCarOptionPath(locationId, getRentCarOptions(locationId, settings)[0]?.categorySlug ?? "kia-picanto-2025", locale);

export const getRentCarPrice = (margin: RentCarMargin, basePrice: number) => {
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
  categorySlug: string;
  categoryLabel: string;
  model: string;
  displayName: string;
  tag: string;
  price: number;
  currency: string;
  seats: number;
  luggage: number;
  doors: number;
  transmission: RentCarTransmission;
  fuelType: RentCarFuelType;
  airConditioning: boolean;
  bags: number;
  largeBags: number;
  bluetooth: boolean;
  usb: boolean;
  appleCarplay: boolean;
  androidAuto: boolean;
  fourByFour: boolean;
  convertible: boolean;
  image: string;
  href: string;
  highProfile: boolean;
};

export const getRentCarLocations = (settings: RentCarFleetSettings = defaultRentCarFleetSettings) =>
  normalizeRentCarFleetSettings(settings).locations.filter((location) => location.active);

export const getRentCarLocation = (locationId: string, settings: RentCarFleetSettings = defaultRentCarFleetSettings) =>
  getRentCarLocations(settings).find((location) => location.id === locationId) ?? null;

export const getRentCarOptions = (
  locationId?: string,
  settings: RentCarFleetSettings = defaultRentCarFleetSettings
): RentCarOption[] => {
  const normalized = normalizeRentCarFleetSettings(settings);
  const vehicles = normalized.vehicles.filter((vehicle) => vehicle.active);
  const locations = locationId
    ? normalized.locations.filter((location) => location.active && location.id === locationId)
    : normalized.locations.filter((location) => location.active);
  return locations.flatMap((location) => {
    const options = vehicles.map((vehicle) => {
      return {
        locationId: location.id,
        regionId: location.regionId,
        locationName: location.name,
        airportLabel: location.airportLabel,
        categorySlug: vehicle.slug,
        categoryLabel: vehicle.label,
        model: vehicle.model,
        displayName: vehicle.displayName,
        tag: vehicle.tag,
        price: getRentCarPrice(vehicle.margin, vehicle.basePrice * location.multiplier),
        currency: normalized.currency,
        seats: vehicle.seats,
        luggage: vehicle.luggage,
        doors: vehicle.doors,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        airConditioning: vehicle.airConditioning,
        bags: vehicle.bags,
        largeBags: vehicle.largeBags,
        bluetooth: vehicle.bluetooth,
        usb: vehicle.usb,
        appleCarplay: vehicle.appleCarplay,
        androidAuto: vehicle.androidAuto,
        fourByFour: vehicle.fourByFour,
        convertible: vehicle.convertible,
        image: vehicle.image,
        href: getRentCarOptionPath(location.id, vehicle.slug, "en"),
        highProfile: Boolean(location.highProfile)
      };
    });
    return options.sort((a, b) => {
      if (!location.highProfile) return a.price - b.price;
      const aPriority = vehicles.find((vehicle) => vehicle.slug === a.categorySlug)?.priority ?? 0;
      const bPriority = vehicles.find((vehicle) => vehicle.slug === b.categorySlug)?.priority ?? 0;
      return bPriority - aPriority;
    });
  });
};

export const getRentCarOption = (
  locationId: string,
  categorySlug: string,
  settings: RentCarFleetSettings = defaultRentCarFleetSettings
) => getRentCarOptions(locationId, settings).find((option) => option.categorySlug === categorySlug) ?? null;

export const detectRentCarLocationId = (input: string, settings: RentCarFleetSettings = defaultRentCarFleetSettings) => {
  const text = input.toLowerCase();
  const match = getRentCarLocations(settings).find((location) =>
    location.searchTerms.some((term) => text.includes(term))
  );
  return match?.id ?? "puj-cap-cana";
};

export const getRentCarSpecBadges = (option: RentCarOption, locale: RentCarLocale = "en") => {
  const labels = {
    en: {
      passengers: "passengers",
      doors: "doors",
      bags: "bags",
      large: "large",
      automatic: "Automatic",
      manual: "Manual",
      gasoline: "Gasoline",
      hybrid: "Hybrid",
      diesel: "Diesel",
      electric: "Electric",
      ac: "A/C",
      carplay: "CarPlay",
      android: "Android Auto",
      fourByFour: "4x4",
      convertible: "Convertible"
    },
    es: {
      passengers: "pasajeros",
      doors: "puertas",
      bags: "maletas",
      large: "grandes",
      automatic: "Automatico",
      manual: "Manual",
      gasoline: "Gasolina",
      hybrid: "Hibrido",
      diesel: "Diesel",
      electric: "Electrico",
      ac: "A/C",
      carplay: "CarPlay",
      android: "Android Auto",
      fourByFour: "4x4",
      convertible: "Convertible"
    },
    fr: {
      passengers: "passagers",
      doors: "portes",
      bags: "bagages",
      large: "grands",
      automatic: "Automatique",
      manual: "Manuel",
      gasoline: "Essence",
      hybrid: "Hybride",
      diesel: "Diesel",
      electric: "Electrique",
      ac: "Clim.",
      carplay: "CarPlay",
      android: "Android Auto",
      fourByFour: "4x4",
      convertible: "Cabriolet"
    }
  }[locale];

  const transmission = option.transmission === "Manual" ? labels.manual : labels.automatic;
  const fuel =
    option.fuelType === "Hybrid"
      ? labels.hybrid
      : option.fuelType === "Diesel"
        ? labels.diesel
        : option.fuelType === "Electric"
          ? labels.electric
          : labels.gasoline;

  return [
    `${option.seats} ${labels.passengers}`,
    `${option.doors} ${labels.doors}`,
    transmission,
    fuel,
    option.airConditioning ? labels.ac : null,
    `${option.bags} ${labels.bags}`,
    `${option.largeBags} ${labels.large}`,
    option.appleCarplay ? labels.carplay : null,
    option.androidAuto ? labels.android : null,
    option.fourByFour ? labels.fourByFour : null,
    option.convertible ? labels.convertible : null
  ].filter(Boolean) as string[];
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
      vehicleTransmission: option.transmission,
      fuelType: option.fuelType,
      numberOfDoors: option.doors,
      additionalProperty: [
        { "@type": "PropertyValue", name: "Bags", value: option.bags },
        { "@type": "PropertyValue", name: "Large bags", value: option.largeBags },
        { "@type": "PropertyValue", name: "Air conditioning", value: option.airConditioning },
        { "@type": "PropertyValue", name: "Apple CarPlay", value: option.appleCarplay },
        { "@type": "PropertyValue", name: "Android Auto", value: option.androidAuto },
        { "@type": "PropertyValue", name: "4x4", value: option.fourByFour },
        { "@type": "PropertyValue", name: "Convertible", value: option.convertible }
      ],
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
