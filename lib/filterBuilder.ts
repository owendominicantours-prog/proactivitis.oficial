export type TourSearchParams = {
  country?: string;
  destination?: string;
  minPrice?: string;
  maxPrice?: string;
  language?: string;
  duration?: string;
  sort?: string;
};

export const DOMINICAN_REPUBLIC_CANONICAL_SLUG = "dominican-republic";

const DOMINICAN_REPUBLIC_COUNTRY_SLUGS = [
  DOMINICAN_REPUBLIC_CANONICAL_SLUG,
  "dominican-republic-rd",
  "republica-dominicana"
];

const normalizeToSlug = (value: string | undefined) => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const canonicalizeCountrySlug = (value: string | undefined) => {
  const slug = normalizeToSlug(value);
  return DOMINICAN_REPUBLIC_COUNTRY_SLUGS.includes(slug) ? DOMINICAN_REPUBLIC_CANONICAL_SLUG : slug;
};

export const getCountrySlugAliases = (value: string | undefined) => {
  const slug = normalizeToSlug(value);
  if (!slug) return [];
  return DOMINICAN_REPUBLIC_COUNTRY_SLUGS.includes(slug) ? DOMINICAN_REPUBLIC_COUNTRY_SLUGS : [slug];
};

const ensureDestinationIs = (where: any) => {
  if (!where.departureDestination) {
    where.departureDestination = {};
  }
  if (!where.departureDestination.is) {
    where.departureDestination.is = {};
  }
  return where.departureDestination.is;
};

export function buildTourFilter(params: TourSearchParams = {}) {
  const where: any = { status: "published" };
  const countrySlugs = getCountrySlugAliases(params.country);
  const destinationSearch = params.destination?.trim() ?? "";
  const hasDestination = Boolean(destinationSearch);

  if (countrySlugs.length && hasDestination) {
    const destinationIs = ensureDestinationIs(where);
    destinationIs.country = { slug: { in: countrySlugs } };
  } else if (countrySlugs.length) {
    where.OR = [
      { country: { slug: { in: countrySlugs } } },
      { departureDestination: { is: { country: { slug: { in: countrySlugs } } } } }
    ];
  }

  if (hasDestination) {
    const destinationIs = ensureDestinationIs(where);
    const normalizedSlug = normalizeToSlug(destinationSearch);
    const searchValue = destinationSearch;
    const orConditions: any[] = [];

    if (normalizedSlug) {
      destinationIs.slug = normalizedSlug;
      orConditions.push({ slug: normalizedSlug });
    }
    if (searchValue) {
      orConditions.push({ name: { contains: searchValue, mode: "insensitive" } });
    }

    if (orConditions.length === 1) {
      Object.assign(destinationIs, orConditions[0]);
    } else if (orConditions.length > 1) {
      destinationIs.OR = orConditions;
    }
  }

  const min = params.minPrice ? Number(params.minPrice) : undefined;
  const max = params.maxPrice ? Number(params.maxPrice) : undefined;

  if (!Number.isNaN(min) && min !== undefined) {
    where.price = { ...(where.price ?? {}), gte: min };
  }

  if (!Number.isNaN(max) && max !== undefined) {
    where.price = { ...(where.price ?? {}), lte: max };
  }

  if (params.language) {
    where.language = { contains: params.language, mode: "insensitive" };
  }

  if (params.duration) {
    where.duration = params.duration;
  }

  return where;
}
