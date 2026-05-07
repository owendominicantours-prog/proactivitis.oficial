import { Prisma } from "@prisma/client";

import {
  containsInsensitive,
  countryMatchesScopeText,
  formatScopeLine,
  isDominicanRepublicScope,
  isGlobalScope,
  normalizeScopeText,
  textMatchesScope,
  uniqueScopeItems
} from "@/lib/workplaceFilters";

type WorkplaceScope = {
  countries: string[];
  cities: string[];
  niches: string[];
  products: string[];
  companies: string[];
  modules: string[];
};

export type WorkplaceTourFilters = {
  q?: string;
  status?: string;
  provider?: string;
  zone?: string;
  date?: string;
};

export type ScopedTourRecord = {
  id: string;
  title: string;
  slug: string;
  productId: string;
  status: string;
  price: number;
  location: string;
  category: string | null;
  countryId: string;
  heroImage: string | null;
  gallery: string | null;
  createdAt: Date;
  SupplierProfile: {
    id: string;
    company: string;
    userId: string;
  };
  country?: { code: string; name: string; slug: string } | null;
  destination?: { name: string; slug: string } | null;
  microZone?: { name: string; slug: string } | null;
  departureDestination?: { name: string; slug: string } | null;
};

const insensitive = Prisma.QueryMode.insensitive;

export const normalizeWorkplaceText = normalizeScopeText;
const uniqueTerms = uniqueScopeItems;
const containsText = containsInsensitive;
const normalizeSlugTerm = (value: string) => normalizeWorkplaceText(value).replace(/\s+/g, "-");
const isDominicanRepublicTerm = isDominicanRepublicScope;

const countryConditionsForTerm = (term: string): Prisma.TourWhereInput[] => {
  if (isDominicanRepublicTerm(term)) {
    return [
      { countryId: { equals: "RD", mode: insensitive } },
      { country: { is: { code: { equals: "RD", mode: insensitive } } } },
      { country: { is: { name: containsText("Dominican") } } },
      { country: { is: { name: containsText("Republica Dominicana") } } },
      { location: containsText("Republica Dominicana") },
      { location: containsText("Dominican Republic") }
    ];
  }

  return [
    { countryId: { equals: term.toUpperCase(), mode: insensitive } },
    { country: { is: { code: { equals: term.toUpperCase(), mode: insensitive } } } },
    { country: { is: { name: containsText(term) } } },
    { country: { is: { slug: containsText(normalizeSlugTerm(term)) } } }
  ];
};

const textMatchesAny = (haystack: string, terms: string[]) => {
  return textMatchesScope(haystack, terms);
};

export function workplaceScopeAllowsTours(scope: WorkplaceScope) {
  const moduleAllowed =
    isGlobalScope(scope.modules) ||
    scope.modules.some((module) => ["tour", "tours", "experiencias"].includes(normalizeWorkplaceText(module)));

  const nicheAllowed =
    isGlobalScope(scope.niches) ||
    scope.niches.some((niche) => {
      const normalized = normalizeWorkplaceText(niche);
      return ["tour", "tours", "experiencia", "experiencias", "excursion", "excursiones"].includes(normalized);
    });

  return moduleAllowed && nicheAllowed;
}

export function buildWorkplaceTourWhere(scope: WorkplaceScope, filters: WorkplaceTourFilters = {}) {
  if (!workplaceScopeAllowsTours(scope)) {
    return { id: "__no_tour_access__" } satisfies Prisma.TourWhereInput;
  }

  const and: Prisma.TourWhereInput[] = [];

  const countryTerms = uniqueTerms(scope.countries);
  if (!isGlobalScope(countryTerms)) {
    and.push({
      OR: countryTerms.flatMap((term) => countryConditionsForTerm(term))
    });
  }

  const cityTerms = uniqueTerms(scope.cities);
  if (!isGlobalScope(cityTerms)) {
    and.push({
      OR: cityTerms.flatMap((term) => [
        { location: containsText(term) },
        { destination: { is: { name: containsText(term) } } },
        { destination: { is: { slug: containsText(normalizeSlugTerm(term)) } } },
        { microZone: { is: { name: containsText(term) } } },
        { microZone: { is: { slug: containsText(normalizeSlugTerm(term)) } } },
        { departureDestination: { is: { name: containsText(term) } } }
      ])
    });
  }

  const companyTerms = uniqueTerms(scope.companies);
  if (!isGlobalScope(companyTerms)) {
    and.push({
      OR: companyTerms.map((term) => ({
        SupplierProfile: { is: { company: containsText(term) } }
      }))
    });
  }

  const productTerms = uniqueTerms(scope.products);
  if (!isGlobalScope(productTerms)) {
    and.push({
      OR: productTerms.flatMap((term) => [
        { id: { equals: term } },
        { productId: containsText(term) },
        { title: containsText(term) },
        { slug: containsText(normalizeSlugTerm(term)) }
      ])
    });
  }

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { title: containsText(q) },
        { slug: containsText(normalizeSlugTerm(q)) },
        { productId: containsText(q) },
        { location: containsText(q) },
        { SupplierProfile: { is: { company: containsText(q) } } }
      ]
    });
  }

  if (filters.status && filters.status !== "all") {
    and.push({ status: { equals: filters.status, mode: insensitive } });
  }

  if (filters.provider && filters.provider !== "all") {
    and.push({ SupplierProfile: { is: { company: containsText(filters.provider) } } });
  }

  if (filters.zone && filters.zone !== "all") {
    and.push({
      OR: [
        { location: containsText(filters.zone) },
        { destination: { is: { name: containsText(filters.zone) } } },
        { microZone: { is: { name: containsText(filters.zone) } } }
      ]
    });
  }

  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00.000Z`);
    const end = new Date(`${filters.date}T23:59:59.999Z`);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
      and.push({ createdAt: { gte: start, lte: end } });
    }
  }

  return and.length ? ({ AND: and } satisfies Prisma.TourWhereInput) : ({} satisfies Prisma.TourWhereInput);
}

export function getTourZoneLabel(tour: Pick<ScopedTourRecord, "location" | "destination" | "microZone">) {
  return tour.microZone?.name || tour.destination?.name || tour.location || "Zona sin definir";
}

export function getTourPrimaryImage(tour: Pick<ScopedTourRecord, "heroImage" | "gallery">) {
  if (tour.heroImage) return tour.heroImage;
  if (!tour.gallery) return "/placeholder-tour.jpg";
  const first = tour.gallery
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .find(Boolean);
  return first || "/placeholder-tour.jpg";
}

export function tourMatchesWorkplaceScope(tour: ScopedTourRecord, scope: WorkplaceScope) {
  if (!workplaceScopeAllowsTours(scope)) return false;
  if (!isGlobalScope(scope.countries)) {
    const countryAliases = tour.countryId === "RD" || tour.country?.code === "RD" ? "Republica Dominicana Dominican Republic Dominican Republica RD" : "";
    const countryText = [tour.countryId, tour.country?.code, tour.country?.name, tour.country?.slug, tour.location, countryAliases]
      .filter(Boolean)
      .join(" ");
    if (!countryMatchesScopeText(countryText, scope.countries)) return false;
  }
  if (!isGlobalScope(scope.cities)) {
    const zoneText = [
      tour.location,
      tour.destination?.name,
      tour.destination?.slug,
      tour.microZone?.name,
      tour.microZone?.slug,
      tour.departureDestination?.name
    ]
      .filter(Boolean)
      .join(" ");
    if (!textMatchesAny(zoneText, scope.cities)) return false;
  }
  if (!isGlobalScope(scope.companies)) {
    if (!textMatchesAny(tour.SupplierProfile.company, scope.companies)) return false;
  }
  if (!isGlobalScope(scope.products)) {
    const productText = [tour.id, tour.productId, tour.title, tour.slug].join(" ");
    if (!textMatchesAny(productText, scope.products)) return false;
  }
  return true;
}

export function formatWorkplaceTourScope(scope: WorkplaceScope) {
  return formatScopeLine(scope).replace(" - ", ", ");
}
