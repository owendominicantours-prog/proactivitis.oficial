import { allLandings } from "@/data/transfer-landings";

export type ProDiscoveryCategory = "tours" | "transfers";
export type ProDiscoveryDestination = "punta-cana" | "sosua" | "puerto-plata";

export const PRODISCOVERY_DESTINATIONS: ProDiscoveryDestination[] = [
  "punta-cana",
  "sosua",
  "puerto-plata"
];

export const PRODISCOVERY_CATEGORIES: ProDiscoveryCategory[] = ["tours", "transfers"];

const DESTINATION_MATCH: Record<ProDiscoveryDestination, string[]> = {
  "punta-cana": ["punta cana", "bavaro", "cap cana", "uvero alto", "cabeza de toro", "macao"],
  sosua: ["sosua"],
  "puerto-plata": ["puerto plata", "amber cove", "taino bay"]
};

export const isValidDiscoveryDestination = (value: string): value is ProDiscoveryDestination =>
  PRODISCOVERY_DESTINATIONS.includes(value as ProDiscoveryDestination);

export const isValidDiscoveryCategory = (value: string): value is ProDiscoveryCategory =>
  PRODISCOVERY_CATEGORIES.includes(value as ProDiscoveryCategory);

export const round1 = (value: number) => Math.round(value * 10) / 10;

const scoreRecency = (lastDate: Date | null) => {
  if (!lastDate) return 0;
  const ageDays = Math.max(0, (Date.now() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, 1 - ageDays / 365);
};

const scoreQuantity = (count: number) => Math.min(count, 150) / 150;

const scoreQuality = (rating: number) => Math.min(Math.max(rating / 5, 0), 1);

const scoreConsistency = (rating: number) => {
  const distance = Math.abs(5 - rating);
  return Math.max(0, 1 - distance / 4);
};

export const computeDiscoveryScore = (rating: number, count: number, lastDate: Date | null) => {
  const quality = scoreQuality(rating);
  const quantity = scoreQuantity(count);
  const recency = scoreRecency(lastDate);
  const consistency = scoreConsistency(rating);
  return quality * 0.45 + quantity * 0.2 + recency * 0.25 + consistency * 0.1;
};

export const matchesDestination = (source: string | null | undefined, destination: ProDiscoveryDestination) => {
  const text = (source || "").toLowerCase();
  return DESTINATION_MATCH[destination].some((token) => text.includes(token));
};

export const transferLandingMatchesDestination = (landingSlug: string, destination: ProDiscoveryDestination) => {
  const landing = allLandings().find((item) => item.landingSlug === landingSlug);
  if (!landing) return false;
  const haystack = `${landing.landingSlug} ${landing.hotelName} ${landing.heroTitle}`.toLowerCase();
  return DESTINATION_MATCH[destination].some((token) => haystack.includes(token));
};

