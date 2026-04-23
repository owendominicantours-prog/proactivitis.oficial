import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

export const PREMIUM_TRANSFER_BASE_PATH = "/punta-cana/premium-transfer-services";

export function buildPremiumTransferLanguageAlternates(path: string) {
  return {
    es: `${PROACTIVITIS_URL}${path}`,
    en: `${PROACTIVITIS_URL}/en${path}`,
    fr: `${PROACTIVITIS_URL}/fr${path}`,
    "x-default": `${PROACTIVITIS_URL}/en${path}`
  };
}

export function buildPremiumTransferSeoTitle(locale: Locale, sourceTitle?: string) {
  const normalized = sourceTitle?.trim();
  if (locale !== "en") {
    return normalized;
  }

  if (!normalized) {
    return "Punta Cana Luxury Airport Pickup & Private SUV Transfer | Proactivitis";
  }

  const lower = normalized.toLowerCase();
  if (
    lower.includes("luxury airport pickup") ||
    lower.includes("private suv transfer") ||
    lower.includes("luxury airport transfer")
  ) {
    return normalized;
  }

  if (lower.includes("premium transfer services")) {
    return normalized.replace(
      /premium transfer services/i,
      "Luxury Airport Pickup & Private SUV Transfer"
    );
  }

  return `${normalized} | Luxury Airport Pickup & Private SUV Transfer`;
}

export function buildPremiumTransferSeoDescription(locale: Locale, sourceDescription?: string) {
  if (locale !== "en") {
    return sourceDescription;
  }

  const normalized = sourceDescription?.trim();
  if (!normalized) {
    return "Book a luxury airport pickup or private SUV transfer in Punta Cana with professional drivers, flight tracking, and direct service to Bavaro, Cap Cana, and Uvero Alto.";
  }

  const lower = normalized.toLowerCase();
  if (
    lower.includes("luxury airport pickup") ||
    lower.includes("private suv transfer") ||
    lower.includes("luxury airport transfer")
  ) {
    return normalized;
  }

  return `${normalized} Luxury airport pickup and private SUV transfer service with professional drivers, flight tracking, and direct resort service.`;
}

export function buildPremiumTransferKeywords(locale: Locale, primaryKeyword: string, areaLabel?: string) {
  const areaSuffix = areaLabel ? ` ${areaLabel}` : "";

  if (locale === "en") {
    return [
      primaryKeyword,
      `private suv transfer punta cana${areaSuffix}`.trim(),
      `luxury airport pickup punta cana${areaSuffix}`.trim(),
      `luxury airport transfer punta cana${areaSuffix}`.trim(),
      `private airport pickup punta cana${areaSuffix}`.trim(),
      "vip airport transfer punta cana",
      "punta cana chauffeur service"
    ];
  }

  if (locale === "fr") {
    return [
      primaryKeyword,
      "transfert prive suv punta cana",
      "prise en charge aeroport luxe punta cana",
      "transfert aeroport luxe punta cana",
      "chauffeur prive punta cana",
      "transfert vip punta cana"
    ];
  }

  return [
    primaryKeyword,
    "traslado privado SUV Punta Cana",
    "recogida premium aeropuerto Punta Cana",
    "transfer de lujo aeropuerto Punta Cana",
    "chofer privado Punta Cana",
    "transfer VIP Punta Cana"
  ];
}
