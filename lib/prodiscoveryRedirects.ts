import { redirect } from "next/navigation";
import { parseTransferHotelVariantSlug } from "@/data/transfer-hotel-sales-variants";
import { allLandings } from "@/data/transfer-landings";
import { prisma } from "@/lib/prisma";
import type { Locale } from "@/lib/translations";

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const titleFromSlug = (value: string) =>
  value
    .replace(/^planificador-grupos-/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const proDiscoveryPlannerHref = (locale: Locale, destination: string) =>
  `${localePrefix(locale)}/prodiscovery?dest=${encodeURIComponent(destination)}#planner`;

export async function redirectProDiscoveryTourToPlanner(locale: Locale, slug: string) {
  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      title: true,
      location: true,
      destination: { select: { name: true } },
      departureDestination: { select: { name: true } }
    }
  });
  const destination = tour?.departureDestination?.name ?? tour?.destination?.name ?? tour?.location ?? titleFromSlug(slug);
  redirect(proDiscoveryPlannerHref(locale, destination));
}

export function redirectProDiscoveryTransferToPlanner(locale: Locale, landingSlug: string) {
  const parsed = parseTransferHotelVariantSlug(landingSlug);
  const landing = allLandings().find((item) => item.landingSlug === parsed.baseSlug);
  redirect(proDiscoveryPlannerHref(locale, landing?.hotelName ?? titleFromSlug(landingSlug)));
}

export function redirectProDiscoveryTopToPlanner(locale: Locale, destination: string) {
  redirect(proDiscoveryPlannerHref(locale, titleFromSlug(destination)));
}
