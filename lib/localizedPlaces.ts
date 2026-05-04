export type PlaceLocale = "es" | "en" | "fr";

type LocalizablePlace = {
  code?: string | null;
  slug?: string | null;
  name?: string | null;
};

type LocalizedNames = Record<PlaceLocale, string>;

const normalizeKey = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const countryNames: Record<string, LocalizedNames> = {
  rd: { es: "República Dominicana", en: "Dominican Republic", fr: "République dominicaine" },
  do: { es: "República Dominicana", en: "Dominican Republic", fr: "République dominicaine" },
  it: { es: "Italia", en: "Italy", fr: "Italie" },
  fr: { es: "Francia", en: "France", fr: "France" },
  es: { es: "España", en: "Spain", fr: "Espagne" },
  nl: { es: "Países Bajos", en: "Netherlands", fr: "Pays-Bas" },
  gb: { es: "Reino Unido", en: "United Kingdom", fr: "Royaume-Uni" },
  uk: { es: "Reino Unido", en: "United Kingdom", fr: "Royaume-Uni" },
  us: { es: "Estados Unidos", en: "United States", fr: "États-Unis" },
  mx: { es: "México", en: "Mexico", fr: "Mexique" },
  br: { es: "Brasil", en: "Brazil", fr: "Brésil" },
  ar: { es: "Argentina", en: "Argentina", fr: "Argentine" },
  co: { es: "Colombia", en: "Colombia", fr: "Colombie" },
  pe: { es: "Perú", en: "Peru", fr: "Pérou" },
  ae: { es: "Emiratos Árabes Unidos", en: "United Arab Emirates", fr: "Émirats arabes unis" },
  ma: { es: "Marruecos", en: "Morocco", fr: "Maroc" },
  eg: { es: "Egipto", en: "Egypt", fr: "Égypte" },
  za: { es: "Sudáfrica", en: "South Africa", fr: "Afrique du Sud" },
  gr: { es: "Grecia", en: "Greece", fr: "Grèce" },
  tr: { es: "Turquía", en: "Turkey", fr: "Turquie" },
  id: { es: "Indonesia", en: "Indonesia", fr: "Indonésie" },
  th: { es: "Tailandia", en: "Thailand", fr: "Thaïlande" },
  jp: { es: "Japón", en: "Japan", fr: "Japon" },
  kr: { es: "Corea del Sur", en: "South Korea", fr: "Corée du Sud" },
  au: { es: "Australia", en: "Australia", fr: "Australie" },
  nz: { es: "Nueva Zelanda", en: "New Zealand", fr: "Nouvelle-Zélande" },
  is: { es: "Islandia", en: "Iceland", fr: "Islande" },
  pt: { es: "Portugal", en: "Portugal", fr: "Portugal" },
  cz: { es: "República Checa", en: "Czech Republic", fr: "Tchéquie" },
  hu: { es: "Hungría", en: "Hungary", fr: "Hongrie" },
  at: { es: "Austria", en: "Austria", fr: "Autriche" }
};

const countryAliases: Record<string, string> = {
  "dominican-republic": "rd",
  "republica-dominicana": "rd",
  "republique-dominicaine": "rd",
  italy: "it",
  italia: "it",
  italie: "it",
  france: "fr",
  francia: "fr",
  spain: "es",
  espana: "es",
  espagne: "es",
  netherlands: "nl",
  "paises-bajos": "nl",
  "pays-bas": "nl",
  "united-kingdom": "gb",
  "reino-unido": "gb",
  "royaume-uni": "gb",
  "united-states": "us",
  "estados-unidos": "us",
  "etats-unis": "us",
  mexico: "mx",
  mexique: "mx",
  brazil: "br",
  brasil: "br",
  bresil: "br",
  argentina: "ar",
  argentine: "ar",
  colombia: "co",
  colombie: "co",
  peru: "pe",
  perou: "pe",
  "united-arab-emirates": "ae",
  "emiratos-arabes-unidos": "ae",
  "emirats-arabes-unis": "ae",
  morocco: "ma",
  marruecos: "ma",
  maroc: "ma",
  egypt: "eg",
  egipto: "eg",
  egypte: "eg",
  "south-africa": "za",
  sudafrica: "za",
  "afrique-du-sud": "za",
  greece: "gr",
  grecia: "gr",
  grece: "gr",
  turkey: "tr",
  turquia: "tr",
  turquie: "tr",
  indonesia: "id",
  thailand: "th",
  tailandia: "th",
  thailande: "th",
  japan: "jp",
  japon: "jp",
  "south-korea": "kr",
  "corea-del-sur": "kr",
  "coree-du-sud": "kr",
  australia: "au",
  "new-zealand": "nz",
  "nueva-zelanda": "nz",
  "nouvelle-zelande": "nz",
  iceland: "is",
  islandia: "is",
  islande: "is",
  portugal: "pt",
  "czech-republic": "cz",
  "republica-checa": "cz",
  tchequie: "cz",
  hungary: "hu",
  hungria: "hu",
  hongrie: "hu",
  austria: "at",
  autriche: "at"
};

const destinationNames: Record<string, LocalizedNames> = {
  rome: { es: "Roma", en: "Rome", fr: "Rome" },
  paris: { es: "París", en: "Paris", fr: "Paris" },
  barcelona: { es: "Barcelona", en: "Barcelona", fr: "Barcelone" },
  madrid: { es: "Madrid", en: "Madrid", fr: "Madrid" },
  amsterdam: { es: "Ámsterdam", en: "Amsterdam", fr: "Amsterdam" },
  london: { es: "Londres", en: "London", fr: "Londres" },
  "new-york": { es: "Nueva York", en: "New York", fr: "New York" },
  "las-vegas": { es: "Las Vegas", en: "Las Vegas", fr: "Las Vegas" },
  page: { es: "Page", en: "Page", fr: "Page" },
  orlando: { es: "Orlando", en: "Orlando", fr: "Orlando" },
  miami: { es: "Miami", en: "Miami", fr: "Miami" },
  cancun: { es: "Cancún", en: "Cancun", fr: "Cancún" },
  tulum: { es: "Tulum", en: "Tulum", fr: "Tulum" },
  "mexico-city": { es: "Ciudad de México", en: "Mexico City", fr: "Mexico" },
  "rio-de-janeiro": { es: "Río de Janeiro", en: "Rio de Janeiro", fr: "Rio de Janeiro" },
  "buenos-aires": { es: "Buenos Aires", en: "Buenos Aires", fr: "Buenos Aires" },
  cartagena: { es: "Cartagena", en: "Cartagena", fr: "Carthagène" },
  medellin: { es: "Medellín", en: "Medellin", fr: "Medellín" },
  cusco: { es: "Cusco", en: "Cusco", fr: "Cusco" },
  dubai: { es: "Dubái", en: "Dubai", fr: "Dubaï" },
  marrakech: { es: "Marrakech", en: "Marrakech", fr: "Marrakech" },
  cairo: { es: "El Cairo", en: "Cairo", fr: "Le Caire" },
  "cape-town": { es: "Ciudad del Cabo", en: "Cape Town", fr: "Le Cap" },
  santorini: { es: "Santorini", en: "Santorini", fr: "Santorin" },
  athens: { es: "Atenas", en: "Athens", fr: "Athènes" },
  istanbul: { es: "Estambul", en: "Istanbul", fr: "Istanbul" },
  cappadocia: { es: "Capadocia", en: "Cappadocia", fr: "Cappadoce" },
  bali: { es: "Bali", en: "Bali", fr: "Bali" },
  bangkok: { es: "Bangkok", en: "Bangkok", fr: "Bangkok" },
  phuket: { es: "Phuket", en: "Phuket", fr: "Phuket" },
  tokyo: { es: "Tokio", en: "Tokyo", fr: "Tokyo" },
  kyoto: { es: "Kioto", en: "Kyoto", fr: "Kyoto" },
  seoul: { es: "Seúl", en: "Seoul", fr: "Séoul" },
  sydney: { es: "Sídney", en: "Sydney", fr: "Sydney" },
  queenstown: { es: "Queenstown", en: "Queenstown", fr: "Queenstown" },
  reykjavik: { es: "Reikiavik", en: "Reykjavik", fr: "Reykjavik" },
  lisbon: { es: "Lisboa", en: "Lisbon", fr: "Lisbonne" },
  porto: { es: "Oporto", en: "Porto", fr: "Porto" },
  prague: { es: "Praga", en: "Prague", fr: "Prague" },
  budapest: { es: "Budapest", en: "Budapest", fr: "Budapest" },
  vienna: { es: "Viena", en: "Vienna", fr: "Vienne" }
};

const resolveLocale = (locale: string): PlaceLocale => (locale === "en" || locale === "fr" ? locale : "es");

export const localizedCountryName = (place: LocalizablePlace, locale: string = "es") => {
  const safeLocale = resolveLocale(locale);
  const codeKey = (place.code ?? "").toLowerCase();
  const aliasKey = countryAliases[normalizeKey(place.slug)] ?? countryAliases[normalizeKey(place.name)];
  const names = countryNames[codeKey] ?? (aliasKey ? countryNames[aliasKey] : undefined);
  return names?.[safeLocale] ?? place.name ?? place.code ?? "";
};

export const localizedDestinationName = (place: LocalizablePlace, locale: string = "es") => {
  const safeLocale = resolveLocale(locale);
  const key = normalizeKey(place.slug) || normalizeKey(place.name);
  return destinationNames[key]?.[safeLocale] ?? place.name ?? "";
};

export const localizedLocationText = (value?: string | null, locale: string = "es") => {
  if (!value?.trim()) return "";
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return localizedDestinationName({ name: value }, locale);
  const country = parts[parts.length - 1];
  const destination = parts.slice(0, -1).join(", ");
  return [localizedDestinationName({ name: destination }, locale), localizedCountryName({ name: country }, locale)]
    .filter(Boolean)
    .join(", ");
};
