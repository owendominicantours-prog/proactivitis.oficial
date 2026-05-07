import { Prisma } from "@prisma/client";

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

export const normalizeWorkplaceText = (value?: string | null) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const uniqueTerms = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))).slice(0, 30);

const isGlobalScope = (items: string[]) => {
  if (!items.length) return true;
  return items.some((item) => {
    const normalized = normalizeWorkplaceText(item);
    return normalized === "*" || normalized === "global" || normalized === "all" || normalized === "todos";
  });
};

const containsText = (value: string): Prisma.StringFilter => ({
  contains: value,
  mode: insensitive
});

const textMatchesAny = (haystack: string, terms: string[]) => {
  if (isGlobalScope(terms)) return true;
  const normalizedHaystack = normalizeWorkplaceText(haystack);
  return terms.some((term) => {
    const normalizedTerm = normalizeWorkplaceText(term);
    return normalizedHaystack.includes(normalizedTerm) || normalizedTerm.includes(normalizedHaystack);
  });
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
      OR: countryTerms.flatMap((term) => [
        { countryId: { equals: term.toUpperCase(), mode: insensitive } },
        { country: { is: { code: { equals: term.toUpperCase(), mode: insensitive } } } },
        { country: { is: { name: containsText(term) } } },
        { country: { is: { slug: containsText(normalizeWorkplaceText(term).replace(/\s+/g, "-")) } } }
      ])
    });
  }

  const cityTerms = uniqueTerms(scope.cities);
  if (!isGlobalScope(cityTerms)) {
    and.push({
      OR: cityTerms.flatMap((term) => [
        { location: containsText(term) },
        { destination: { is: { name: containsText(term) } } },
        { destination: { is: { slug: containsText(normalizeWorkplaceText(term).replace(/\s+/g, "-")) } } },
        { microZone: { is: { name: containsText(term) } } },
        { microZone: { is: { slug: containsText(normalizeWorkplaceText(term).replace(/\s+/g, "-")) } } },
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
        { slug: containsText(normalizeWorkplaceText(term).replace(/\s+/g, "-")) }
      ])
    });
  }

  if (filters.q) {
    const q = filters.q.trim();
    and.push({
      OR: [
        { title: containsText(q) },
        { slug: containsText(normalizeWorkplaceText(q).replace(/\s+/g, "-")) },
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
    const countryText = [tour.countryId, tour.country?.code, tour.country?.name, tour.country?.slug].filter(Boolean).join(" ");
    if (!textMatchesAny(countryText, scope.countries)) return false;
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
  const city = isGlobalScope(scope.cities) ? "todas las zonas asignadas" : scope.cities.slice(0, 3).join(", ");
  const country = isGlobalScope(scope.countries)
    ? "Republica Dominicana"
    : scope.countries
        .slice(0, 2)
        .map((item) => (normalizeWorkplaceText(item) === "rd" ? "Republica Dominicana" : item))
        .join(", ");
  return `${city}, ${country}`;
}
