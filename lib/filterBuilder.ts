export type TourSearchParams = {
  country?: string;
  destination?: string;
  minPrice?: string;
  maxPrice?: string;
  language?: string;
  duration?: string;
};

const normalizeToSlug = (value: string | undefined) => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

  if (params.country) {
    const destinationIs = ensureDestinationIs(where);
    destinationIs.country = { slug: params.country };
  }

  if (params.destination) {
    const destinationIs = ensureDestinationIs(where);
    const normalizedSlug = normalizeToSlug(params.destination);
    const searchValue = params.destination.trim();
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
