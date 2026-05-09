import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/translations";

export type ProDiscoveryGroupTitleInput = {
  slug: string;
  title: string;
  category?: string | null;
  destination?: string | null;
  location?: string | null;
};

type TitleRecord = {
  title?: string;
  cardTitle?: string;
  subtitle?: string;
};

type TitleStore = {
  kind?: string;
  titles?: Record<string, Partial<Record<Locale, TitleRecord>>>;
};

const STORE_KEY = "PRODISCOVERY_GROUP_TITLES_V1";

const sanitize = (value: string) =>
  value
    .replace(/\s+/g, " ")
    .replace(/\b(Tour|Tours|Excursion|Excursiones|Day Trip|Trip|Ticket|Tickets)\b/gi, "")
    .replace(/\s+:/g, ":")
    .replace(/:\s*$/g, "")
    .trim();

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const titleCaseFallback = (value: string) => value.replace(/\s+/g, " ").trim();

const titleStoreFromContent = (content: unknown): TitleStore => {
  if (!content || typeof content !== "object") return {};
  const store = content as TitleStore;
  return store.titles && typeof store.titles === "object" ? store : {};
};

export async function getProDiscoveryGroupTitleStore() {
  const record = await prisma.siteContentSetting.findUnique({
    where: { key: STORE_KEY },
    select: { content: true }
  });
  return titleStoreFromContent(record?.content);
}

export function resolveProDiscoveryGroupTitle(
  input: ProDiscoveryGroupTitleInput,
  locale: Locale,
  store?: TitleStore,
  field: "title" | "cardTitle" | "subtitle" = "title"
) {
  const fromGemini = store?.titles?.[input.slug]?.[locale]?.[field];
  if (hasText(fromGemini)) return fromGemini.trim();
  if (field === "subtitle") return fallbackSubtitle(input, locale);
  return fallbackGroupTitle(input, locale, field === "cardTitle");
}

export async function getProDiscoveryGroupTitle(input: ProDiscoveryGroupTitleInput, locale: Locale, field: "title" | "cardTitle" | "subtitle" = "title") {
  const store = await getProDiscoveryGroupTitleStore();
  return resolveProDiscoveryGroupTitle(input, locale, store, field);
}

function fallbackGroupTitle(input: ProDiscoveryGroupTitleInput, locale: Locale, compact: boolean) {
  const raw = titleCaseFallback(sanitize(input.title));
  const text = `${input.slug} ${input.title} ${input.category ?? ""} ${input.destination ?? ""} ${input.location ?? ""}`.toLowerCase();
  const isSantoDomingo = text.includes("santo domingo");
  const hasTresOjos = text.includes("tres ojos");
  const hasZonaColonial = text.includes("zona colonial") || text.includes("colonial");
  const hasFamily = text.includes("familia");
  const hasCorporate = text.includes("corporativo") || text.includes("empresa") || text.includes("incentivo");
  const hasSaona = text.includes("saona");
  const hasBeach = text.includes("isla") || text.includes("playa") || text.includes("saona") || text.includes("catamaran");
  const destination = input.destination || input.location || (locale === "en" ? "Dominican Republic" : locale === "fr" ? "Republique dominicaine" : "Republica Dominicana");

  if (locale === "en") {
    if (isSantoDomingo && hasTresOjos && hasZonaColonial) return "Los Tres Ojos and Colonial Zone for private groups";
    if (isSantoDomingo && hasZonaColonial) return "Private Colonial Santo Domingo for groups";
    if (isSantoDomingo) return "Private Santo Domingo experience for groups";
    if (hasSaona) return "Private Isla Saona experience for groups";
    if (hasFamily) return `${raw} for private families`;
    if (hasCorporate) return `${raw} for corporate groups`;
    if (hasBeach) return `${raw} for private beach groups`;
    return compact ? `${raw} for groups` : `${raw} as a private group experience`;
  }

  if (locale === "fr") {
    if (isSantoDomingo && hasTresOjos && hasZonaColonial) return "Los Tres Ojos et Zone Coloniale pour groupes prives";
    if (isSantoDomingo && hasZonaColonial) return "Santo Domingo colonial prive pour groupes";
    if (isSantoDomingo) return "Experience privee Santo Domingo pour groupes";
    if (hasSaona) return "Experience privee a Isla Saona pour groupes";
    if (hasFamily) return `${raw} pour familles privees`;
    if (hasCorporate) return `${raw} pour groupes d entreprise`;
    if (hasBeach) return `${raw} pour groupes plage prives`;
    return compact ? `${raw} pour groupes` : `${raw} comme experience privee pour groupes`;
  }

  if (isSantoDomingo && hasTresOjos && hasZonaColonial) return "Los Tres Ojos y Zona Colonial para grupos privados";
  if (isSantoDomingo && hasZonaColonial) return "Santo Domingo colonial privado para grupos";
  if (isSantoDomingo) return "Experiencia privada en Santo Domingo para grupos";
  if (hasSaona) return "Experiencia privada en Isla Saona para grupos";
  if (hasFamily) return `${raw} para familias privadas`;
  if (hasCorporate) return `${raw} para grupos corporativos`;
  if (hasBeach) return `${raw} para grupos privados de playa`;
  return compact ? `${raw} para grupos` : `${raw} como experiencia privada para grupos en ${destination}`;
}

function fallbackSubtitle(input: ProDiscoveryGroupTitleInput, locale: Locale) {
  const destination = input.destination || input.location || (locale === "en" ? "Dominican Republic" : locale === "fr" ? "Republique dominicaine" : "Republica Dominicana");
  if (locale === "en") return `Private guide, transport and timing adapted for groups in ${destination}.`;
  if (locale === "fr") return `Guide prive, transport et horaires adaptes aux groupes a ${destination}.`;
  return `Guia privado, transporte y horarios adaptados para grupos en ${destination}.`;
}
