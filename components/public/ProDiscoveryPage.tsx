import Link from "next/link";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import StructuredData from "@/components/schema/StructuredData";
import { allLandings } from "@/data/transfer-landings";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { getTourReviewSummaryForTours } from "@/lib/tourReviews";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  searchParams?: Record<string, string | string[] | undefined>;
};

type ItemType = "tour" | "transfer" | "hotel";
type Destination = "all" | "punta-cana" | "sosua" | "puerto-plata" | "santo-domingo";

type DiscoveryItem = {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  image: string;
  schemaImages?: string[];
  rating: number;
  reviews: number;
  price: number | null;
  destination: Destination;
  href: string;
  tag: string;
  badges: string[];
};

type DiscoveryCopy = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterTours: string;
  filterTransfers: string;
  filterHotels: string;
  destinationLabel: string;
  minRatingLabel: string;
  sortLabel: string;
  sortRecommended: string;
  sortRating: string;
  sortReviews: string;
  sortPriceLow: string;
  sortPriceHigh: string;
  clear: string;
  results: string;
  noResults: string;
  noResultsBody: string;
  from: string;
  reviewsWord: string;
  commentsTitle: string;
  commentsSubtitle: string;
  open: string;
  page: string;
  prev: string;
  next: string;
  bubbleLabel: string;
  topFiltersTitle: string;
  destinationAll: string;
  consultRate: string;
  compareSelect: string;
  compareRemove: string;
  compareNow: string;
  compareSelected: string;
  compareLimit: string;
  compareClear: string;
  compareTableTitle: string;
  removeFilter: string;
  map: string;
  badgeTop: string;
  badgePrice: string;
  badgeCertified: string;
  faqQ1: string;
  faqA1: string;
  faqQ2: string;
  faqA2: string;
  faqQ3: string;
  faqA3: string;
};

const COPY: Record<Locale, DiscoveryCopy> = {
  es: {
    title: "ProDiscovery",
    subtitle: "Compara tours, traslados y hoteles con resenas reales, fotos y filtros avanzados.",
    searchPlaceholder: "Buscar por tour, hotel, traslado o zona",
    filterAll: "Todo",
    filterTours: "Tours",
    filterTransfers: "Traslados",
    filterHotels: "Hoteles",
    destinationLabel: "Destino",
    minRatingLabel: "Puntuacion minima",
    sortLabel: "Orden",
    sortRecommended: "Recomendados",
    sortRating: "Mejor puntuacion",
    sortReviews: "Mas resenas",
    sortPriceLow: "Precio menor",
    sortPriceHigh: "Precio mayor",
    clear: "Limpiar",
    results: "resultados",
    noResults: "No encontramos resultados con esos filtros",
    noResultsBody: "Prueba otro termino, cambia destino o baja la puntuacion minima.",
    from: "Desde",
    reviewsWord: "resenas",
    commentsTitle: "Comentarios de viajeros",
    commentsSubtitle: "Ultimas opiniones publicas verificadas",
    open: "Abrir ficha",
    page: "Pagina",
    prev: "Anterior",
    next: "Siguiente",
    bubbleLabel: "Burbujas",
    topFiltersTitle: "Filtros rapidos",
    destinationAll: "Todos",
    consultRate: "Consultar tarifa",
    compareSelect: "Comparar",
    compareRemove: "Quitar",
    compareNow: "Comparar ahora",
    compareSelected: "seleccionados",
    compareLimit: "Maximo 3 fichas",
    compareClear: "Limpiar comparacion",
    compareTableTitle: "Comparacion rapida",
    removeFilter: "Quitar filtro",
    map: "Ver en mapa",
    badgeTop: "Mas reservado",
    badgePrice: "Mejor precio",
    badgeCertified: "Certificado ProDiscovery",
    faqQ1: "Como comparo tours y traslados en ProDiscovery?",
    faqA1: "Usa filtros por destino, tipo de servicio, puntuacion y precio para elegir la mejor opcion para tu viaje.",
    faqQ2: "Las resenas son reales?",
    faqA2: "Mostramos resenas aprobadas de clientes verificadas por nuestro sistema interno.",
    faqQ3: "Puedo reservar en USD?",
    faqA3: "Si, las tarifas se muestran en USD y el proceso de reserva mantiene ese formato."
  },
  en: {
    title: "ProDiscovery",
    subtitle: "Compare tours, transfers, and hotels with real reviews, photos, and smart filters.",
    searchPlaceholder: "Search by tour, hotel, transfer, or area",
    filterAll: "All",
    filterTours: "Tours",
    filterTransfers: "Transfers",
    filterHotels: "Hotels",
    destinationLabel: "Destination",
    minRatingLabel: "Minimum rating",
    sortLabel: "Sort",
    sortRecommended: "Recommended",
    sortRating: "Highest rating",
    sortReviews: "Most reviews",
    sortPriceLow: "Lowest price",
    sortPriceHigh: "Highest price",
    clear: "Clear",
    results: "results",
    noResults: "No matches found for these filters",
    noResultsBody: "Try another keyword, destination, or lower the minimum rating.",
    from: "From",
    reviewsWord: "reviews",
    commentsTitle: "Traveler comments",
    commentsSubtitle: "Latest approved public reviews",
    open: "Open listing",
    page: "Page",
    prev: "Previous",
    next: "Next",
    bubbleLabel: "Bubbles",
    topFiltersTitle: "Quick filters",
    destinationAll: "All",
    consultRate: "Check rate",
    compareSelect: "Compare",
    compareRemove: "Remove",
    compareNow: "Compare now",
    compareSelected: "selected",
    compareLimit: "Max 3 listings",
    compareClear: "Clear compare",
    compareTableTitle: "Quick comparison",
    removeFilter: "Remove filter",
    map: "View map",
    badgeTop: "Most booked",
    badgePrice: "Best value",
    badgeCertified: "ProDiscovery certified",
    faqQ1: "How do I compare tours and transfers on ProDiscovery?",
    faqA1: "Use destination, service type, rating, and price filters to find the best option for your trip.",
    faqQ2: "Are the reviews real?",
    faqA2: "We display approved reviews from verified customers through our internal moderation flow.",
    faqQ3: "Can I book in USD?",
    faqA3: "Yes. Prices are displayed in USD and booking keeps that same currency format."
  },
  fr: {
    title: "ProDiscovery",
    subtitle: "Comparez excursions, transferts et hotels avec de vrais avis, photos et filtres intelligents.",
    searchPlaceholder: "Rechercher tour, hotel, transfert ou zone",
    filterAll: "Tout",
    filterTours: "Excursions",
    filterTransfers: "Transferts",
    filterHotels: "Hotels",
    destinationLabel: "Destination",
    minRatingLabel: "Note minimale",
    sortLabel: "Tri",
    sortRecommended: "Recommandes",
    sortRating: "Meilleure note",
    sortReviews: "Plus d avis",
    sortPriceLow: "Prix croissant",
    sortPriceHigh: "Prix decroissant",
    clear: "Effacer",
    results: "resultats",
    noResults: "Aucun resultat avec ces filtres",
    noResultsBody: "Essayez un autre mot-cle, destination, ou reduisez la note minimale.",
    from: "A partir de",
    reviewsWord: "avis",
    commentsTitle: "Avis voyageurs",
    commentsSubtitle: "Derniers avis publics verifies",
    open: "Voir fiche",
    page: "Page",
    prev: "Precedent",
    next: "Suivant",
    bubbleLabel: "Bulles",
    topFiltersTitle: "Filtres rapides",
    destinationAll: "Tous",
    consultRate: "Demander tarif",
    compareSelect: "Comparer",
    compareRemove: "Retirer",
    compareNow: "Comparer maintenant",
    compareSelected: "selectionnes",
    compareLimit: "Maximum 3 fiches",
    compareClear: "Effacer la comparaison",
    compareTableTitle: "Comparaison rapide",
    removeFilter: "Supprimer filtre",
    map: "Voir la carte",
    badgeTop: "Plus reserve",
    badgePrice: "Meilleur prix",
    badgeCertified: "Certifie ProDiscovery",
    faqQ1: "Comment comparer excursions et transferts sur ProDiscovery?",
    faqA1: "Utilisez les filtres par destination, type de service, note et prix pour choisir la meilleure option.",
    faqQ2: "Les avis sont-ils reels?",
    faqA2: "Nous affichons des avis approuves de clients verifies via notre moderation interne.",
    faqQ3: "Puis-je reserver en USD?",
    faqA3: "Oui. Les tarifs sont affiches en USD et la reservation conserve cette meme devise."
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

const firstImage = (primary?: string | null, gallery?: string | null, fallback = "/fototours/fotosimple.jpg") =>
  primary || parseGallery(gallery)[0] || fallback;
const SCHEMA_COLLAGE_SIZE = 5;
const TRANSFER_COLLAGE_POOL = ["/transfer/sedan.png", "/transfer/suv.png", "/transfer/mini van.png"];

const uniqueImages = (images: Array<string | null | undefined>) =>
  Array.from(new Set(images.filter((img): img is string => Boolean(img))));

const buildSchemaImageCollage = (
  preferred: Array<string | null | undefined>,
  fallbackPool: string[] = ["/fototours/fotosimple.jpg"],
  desiredCount: number = SCHEMA_COLLAGE_SIZE
) => {
  const merged = uniqueImages([...preferred, ...fallbackPool]);
  if (merged.length >= desiredCount) return merged.slice(0, desiredCount);
  const filled = [...merged];
  let idx = 0;
  while (filled.length < desiredCount && fallbackPool.length > 0) {
    filled.push(fallbackPool[idx % fallbackPool.length]);
    idx += 1;
  }
  return uniqueImages(filled).slice(0, desiredCount);
};

const round1 = (value: number) => Math.round(value * 10) / 10;

const detectDestination = (value: string): Destination => {
  const text = value.toLowerCase();
  if (text.includes("sosua")) return "sosua";
  if (text.includes("puerto plata")) return "puerto-plata";
  if (text.includes("santo domingo")) return "santo-domingo";
  if (text.includes("punta cana") || text.includes("bavaro") || text.includes("cap cana")) return "punta-cana";
  return "all";
};

const toHotelHref = (locale: Locale, slug: string) => (locale === "es" ? `/hoteles/${slug}` : `/${locale}/hotels/${slug}`);
const toTourHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/prodiscovery/tour/${slug}`;
const toTransferHref = (locale: Locale, slug: string) => `${localePrefix(locale)}/prodiscovery/transfer/${slug}`;
const toMapHref = (item: DiscoveryItem) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.title} ${item.destination.replace("-", " ")}`)}`;
const toAbsoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${PROACTIVITIS_URL}${path.startsWith("/") ? path : `/${path}`}`;

function BubbleRating({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${label}: ${rating.toFixed(1)}/5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const n = idx + 1;
        const filled = rating >= n;
        const partial = !filled && rating > idx && rating < n;
        const percent = partial ? Math.max(10, Math.min(90, (rating - idx) * 100)) : 0;
        return (
          <span key={n} className="relative h-4 w-4 rounded-full border border-emerald-700/50 bg-emerald-50">
            <span
              className="absolute inset-0 rounded-full bg-emerald-600"
              style={{ width: filled ? "100%" : partial ? `${percent}%` : "0%" }}
            />
          </span>
        );
      })}
    </div>
  );
}

export default async function ProDiscoveryPage({ locale, searchParams = {} }: Props) {
  const t = COPY[locale];
  const typeFilter = (firstParam(searchParams.type) || "all") as "all" | ItemType;
  const destinationFilter = (firstParam(searchParams.destination) || "all") as Destination;
  const q = firstParam(searchParams.q).trim();
  const minRating = Number(firstParam(searchParams.minRating) || "0");
  const sort = firstParam(searchParams.sort) || "recommended";
  const page = Math.max(1, Number(firstParam(searchParams.page) || "1"));
  const compareRaw = firstParam(searchParams.compare);
  const compareIds = Array.from(
    new Set(
      compareRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, 3);

  const [tours, transferRatings, hotels, latestTourReviews, latestTransferReviews] = await Promise.all([
    prisma.tour.findMany({
      where: { status: { in: ["published", "seo_only"] } },
      select: {
        id: true,
        slug: true,
        title: true,
        shortDescription: true,
        description: true,
        price: true,
        location: true,
        heroImage: true,
        gallery: true,
        createdAt: true,
        translations: { where: { locale }, select: { title: true, shortDescription: true, description: true } }
      }
    }),
    prisma.transferReview.groupBy({
      by: ["transferLandingSlug"],
      where: { status: "APPROVED", transferLandingSlug: { not: null } },
      _avg: { rating: true },
      _count: { rating: true }
    }),
    prisma.transferLocation.findMany({
      where: { active: true, type: "HOTEL" },
      select: {
        slug: true,
        name: true,
        description: true,
        heroImage: true,
        zone: { select: { name: true } }
      },
      take: 400
    }),
    prisma.tourReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, customerName: true, rating: true, body: true, createdAt: true },
      take: 80
    }),
    prisma.transferReview.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      select: { id: true, customerName: true, rating: true, body: true, createdAt: true },
      take: 80
    })
  ]);

  const transferBySlug = new Map(
    transferRatings
      .filter((row) => row.transferLandingSlug)
      .map((row) => [
        row.transferLandingSlug as string,
        {
          rating: round1(Number(row._avg.rating ?? 0)),
          reviews: row._count.rating
        }
      ])
  );

  const tourSummary = await getTourReviewSummaryForTours(tours.map((tour) => tour.id));
  const transferLandings = allLandings();

  const tourItems: DiscoveryItem[] = tours.map((tour) => {
    const tr = tour.translations[0];
    const ratingData = tourSummary[tour.id] ?? { average: 0, count: 0 };
    const title = tr?.title || tour.title;
    const description = tr?.shortDescription || tr?.description || tour.shortDescription || tour.description;
    const gallery = parseGallery(tour.gallery);
    return {
      id: `tour-${tour.id}`,
      type: "tour",
      title,
      description: (description || "").slice(0, 160),
      image: firstImage(tour.heroImage, tour.gallery),
      schemaImages: buildSchemaImageCollage([tour.heroImage, ...gallery], ["/fototours/fotosimple.jpg"]),
      rating: round1(ratingData.average || 0),
      reviews: ratingData.count || 0,
      price: Math.round(tour.price),
      destination: detectDestination(tour.location || title),
      href: toTourHref(locale, tour.slug),
      tag: "Tour",
      badges: []
    };
  });

  const transferItems: DiscoveryItem[] = transferLandings.map((landing) => {
    const ratingData = transferBySlug.get(landing.landingSlug) ?? { rating: 0, reviews: 0 };
    return {
      id: `transfer-${landing.landingSlug}`,
      type: "transfer",
      title: landing.heroTitle,
      description: landing.heroSubtitle || landing.metaDescription,
      image: landing.heroImage || "/transfer/sedan.png",
      schemaImages: buildSchemaImageCollage([landing.heroImage], TRANSFER_COLLAGE_POOL),
      rating: ratingData.rating,
      reviews: ratingData.reviews,
      price: Math.round(landing.priceFrom),
      destination: detectDestination(`${landing.heroTitle} ${landing.hotelName}`),
      href: toTransferHref(locale, landing.landingSlug),
      tag: "Transfer",
      badges: []
    };
  });

  const hotelItems: DiscoveryItem[] = hotels.map((hotel) => {
    const candidates = transferLandings.filter(
      (l) => l.hotelSlug === hotel.slug || l.landingSlug.includes(hotel.slug) || hotel.slug.includes(l.hotelSlug)
    );
    const bestTransfer = candidates
      .map((l) => ({ landing: l, data: transferBySlug.get(l.landingSlug) }))
      .sort((a, b) => (b.data?.reviews ?? 0) - (a.data?.reviews ?? 0))[0];
    const rating = bestTransfer?.data?.rating ?? 0;
    const reviews = bestTransfer?.data?.reviews ?? 0;
    return {
      id: `hotel-${hotel.slug}`,
      type: "hotel",
      title: hotel.name,
      description: (hotel.description || `${hotel.name} in Punta Cana`).slice(0, 160),
      image: hotel.heroImage || "/fototours/fotosimple.jpg",
      schemaImages: buildSchemaImageCollage([hotel.heroImage], ["/fototours/fotosimple.jpg"]),
      rating,
      reviews,
      price: null,
      destination: detectDestination(`${hotel.zone?.name || ""} ${hotel.name}`),
      href: toHotelHref(locale, hotel.slug),
      tag: "Hotel",
      badges: []
    };
  });

  const allItemsRaw = [...tourItems, ...transferItems, ...hotelItems];
  const maxReviewsAll = Math.max(1, ...allItemsRaw.map((item) => item.reviews));
  const buildBadges = (reviews: number, rating: number, price: number | null) => {
    const badges: string[] = [];
    if (reviews >= Math.max(30, Math.round(maxReviewsAll * 0.7))) badges.push(t.badgeTop);
    if (price !== null && price <= 60) badges.push(t.badgePrice);
    if (rating >= 4.7 && reviews >= 8) badges.push(t.badgeCertified);
    return badges.slice(0, 2);
  };
  const allItems = allItemsRaw.map((item) => ({
    ...item,
    badges: buildBadges(item.reviews, item.rating, item.price)
  }));
  const queryLower = q.toLowerCase();
  const filtered = allItems.filter((item) => {
    const typeOk = typeFilter === "all" || item.type === typeFilter;
    const destinationOk = destinationFilter === "all" || item.destination === destinationFilter;
    const ratingOk = !Number.isFinite(minRating) || minRating <= 0 || item.rating >= minRating;
    const qOk =
      !q ||
      item.title.toLowerCase().includes(queryLower) ||
      item.description.toLowerCase().includes(queryLower) ||
      item.destination.replace("-", " ").includes(queryLower);
    return typeOk && destinationOk && ratingOk && qOk;
  });

  const scored = filtered
    .map((item) => {
      const score = item.rating * 8 + Math.min(item.reviews, 400) / 22 + (item.price ? Math.max(0, 10 - item.price / 25) : 2);
      return { ...item, score };
    })
    .sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
      if (sort === "reviews") return b.reviews - a.reviews || b.rating - a.rating;
      if (sort === "price-low") return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY);
      if (sort === "price-high") return (b.price ?? 0) - (a.price ?? 0);
      return b.score - a.score;
    });

  const pageSize = 18;
  const totalPages = Math.max(1, Math.ceil(scored.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = scored.slice(start, start + pageSize);

  const comments = [...latestTourReviews, ...latestTransferReviews]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 30);

  const makeHref = (
    targetPage?: number,
    compareOverride?: string[],
    overrides?: Partial<{
      q: string;
      type: "all" | ItemType;
      destination: Destination;
      minRating: number;
      sort: string;
    }>
  ) => {
    const params = new URLSearchParams();
    const nextQ = overrides?.q ?? q;
    const nextType = overrides?.type ?? typeFilter;
    const nextDestination = overrides?.destination ?? destinationFilter;
    const nextMinRating = overrides?.minRating ?? minRating;
    const nextSort = overrides?.sort ?? sort;
    if (nextQ) params.set("q", nextQ);
    if (nextType !== "all") params.set("type", nextType);
    if (nextDestination !== "all") params.set("destination", nextDestination);
    if (Number.isFinite(nextMinRating) && nextMinRating > 0) params.set("minRating", String(nextMinRating));
    if (nextSort !== "recommended") params.set("sort", nextSort);
    if (targetPage && targetPage > 1) params.set("page", String(targetPage));
    const compareList = compareOverride ?? compareIds;
    if (compareList.length > 0) params.set("compare", compareList.join(","));
    const qs = params.toString();
    return qs ? `${localePrefix(locale)}/prodiscovery?${qs}` : `${localePrefix(locale)}/prodiscovery`;
  };

  const byId = new Map(allItems.map((item) => [item.id, item]));
  const selectedCompare = compareIds.map((id) => byId.get(id)).filter(Boolean) as DiscoveryItem[];

  const getToggleCompareHref = (itemId: string) => {
    const isSelected = compareIds.includes(itemId);
    if (isSelected) return makeHref(currentPage, compareIds.filter((id) => id !== itemId));
    if (compareIds.length >= 3) return makeHref(currentPage, compareIds);
    return makeHref(currentPage, [...compareIds, itemId]);
  };

  const activeFilterChips = [
    q
      ? {
          key: "q",
          label: `"${q}"`,
          href: makeHref(1, compareIds, { q: "" })
        }
      : null,
    typeFilter !== "all"
      ? {
          key: "type",
          label: `${t.filterAll}: ${typeFilter}`,
          href: makeHref(1, compareIds, { type: "all" })
        }
      : null,
    destinationFilter !== "all"
      ? {
          key: "destination",
          label: `${t.destinationLabel}: ${destinationFilter.replace("-", " ")}`,
          href: makeHref(1, compareIds, { destination: "all" })
        }
      : null,
    Number.isFinite(minRating) && minRating > 0
      ? {
          key: "minRating",
          label: `${t.minRatingLabel}: ${minRating}+`,
          href: makeHref(1, compareIds, { minRating: 0 })
        }
      : null,
    sort !== "recommended"
      ? {
          key: "sort",
          label: `${t.sortLabel}: ${sort}`,
          href: makeHref(1, compareIds, { sort: "recommended" })
        }
      : null
  ].filter(Boolean) as Array<{ key: string; label: string; href: string }>;

  const pageUrl = `${PROACTIVITIS_URL}${makeHref()}`;
  const localeName = locale === "es" ? "es-DO" : locale === "fr" ? "fr-FR" : "en-US";
  const keywordDescription =
    locale === "es"
      ? "Tours en Punta Cana, party boat en Sosua, excursiones en Republica Dominicana, traslados privados aeropuerto PUJ, hoteles y transporte premium con resenas reales."
      : locale === "fr"
        ? "Excursions a Punta Cana, party boat a Sosua, transferts prives aeroport PUJ, hotels et services premium en Republique dominicaine avec avis verifies."
        : "Punta Cana tours, Sosua party boat, Dominican Republic excursions, private PUJ airport transfers, hotels and premium transportation with verified reviews.";

  const schemaProducts = allItems
    .filter((item) => item.type === "tour" || item.type === "transfer")
    .map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.title,
        description: item.description,
        image: (item.schemaImages?.length ? item.schemaImages : [item.image]).map((img) => toAbsoluteUrl(img)),
        url: toAbsoluteUrl(item.href),
        brand: {
          "@type": "Brand",
          name: "ProDiscovery"
        },
        ...(item.reviews > 0 && item.rating > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: item.rating,
                reviewCount: item.reviews
              }
            }
          : {}),
        ...(item.price
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "USD",
                price: item.price,
                availability: "https://schema.org/InStock",
                url: toAbsoluteUrl(item.href),
                shippingDetails: {
                  "@type": "OfferShippingDetails",
                  shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "USD" },
                  shippingDestination: {
                    "@type": "DefinedRegion",
                    addressCountry: "DO"
                  }
                },
                hasMerchantReturnPolicy: {
                  "@type": "MerchantReturnPolicy",
                  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                  merchantReturnDays: 2,
                  applicableCountry: "DO"
                }
              }
            }
          : {})
      }
    }));

  const schemaReviews = comments.map((comment, index) => ({
    "@type": "Review",
    "@id": `${pageUrl}#review-${index + 1}`,
    itemReviewed: {
      "@id": `${PROACTIVITIS_URL}#localbusiness`
    },
    author: {
      "@type": "Person",
      name: comment.customerName || "Traveler"
    },
    datePublished: comment.createdAt.toISOString(),
    reviewBody: comment.body,
    reviewRating: {
      "@type": "Rating",
      ratingValue: comment.rating,
      bestRating: 5,
      worstRating: 1
    }
  }));

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PROACTIVITIS_URL}#organization`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: `${PROACTIVITIS_URL}/logo.png`,
        sameAs: [
          "https://www.instagram.com/proactivitis",
          "https://www.facebook.com/proactivitis"
        ]
      },
      {
        "@type": "LocalBusiness",
        "@id": `${PROACTIVITIS_URL}#localbusiness`,
        name: "ProDiscovery by Proactivitis",
        url: pageUrl,
        image: `${PROACTIVITIS_URL}/logo.png`,
        description: keywordDescription,
        areaServed: ["DO", "US", "CA", "MX", "ES", "FR"],
        availableLanguage: ["es", "en", "fr"]
      },
      {
        "@type": "WebSite",
        "@id": `${PROACTIVITIS_URL}#website`,
        url: PROACTIVITIS_URL,
        name: "ProDiscovery",
        inLanguage: localeName,
        potentialAction: {
          "@type": "SearchAction",
          target: `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: `${t.title} - ${t.filterAll}`,
        description: `${t.subtitle} ${keywordDescription}`,
        inLanguage: localeName,
        mainEntity: {
          "@id": `${pageUrl}#catalog`
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "es" ? "Inicio" : locale === "fr" ? "Accueil" : "Home",
            item: `${PROACTIVITIS_URL}${locale === "es" ? "/" : `/${locale}`}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ProDiscovery",
            item: `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery`
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: t.faqQ1,
            acceptedAnswer: { "@type": "Answer", text: t.faqA1 }
          },
          {
            "@type": "Question",
            name: t.faqQ2,
            acceptedAnswer: { "@type": "Answer", text: t.faqA2 }
          },
          {
            "@type": "Question",
            name: t.faqQ3,
            acceptedAnswer: { "@type": "Answer", text: t.faqA3 }
          }
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#results`,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: start + index + 1,
          name: item.title,
          url: `${PROACTIVITIS_URL}${item.href}`
        }))
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#catalog`,
        name: "ProDiscovery tours and transfers catalog",
        numberOfItems: schemaProducts.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: schemaProducts
      }
    ].concat(schemaReviews as unknown as any[])
  };

  return (
    <main className="bg-[#f5f7f9] pb-28">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">{t.title}</h1>
          <p className="mt-2 max-w-3xl text-slate-600">{t.subtitle}</p>
          <form action={`${localePrefix(locale)}/prodiscovery`} method="get" className="mt-6 grid gap-3 lg:grid-cols-12">
            <input
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              className="lg:col-span-5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 focus:ring-2"
            />
            <select
              name="type"
              defaultValue={typeFilter}
              className="lg:col-span-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 focus:ring-2"
            >
              <option value="all">{t.filterAll}</option>
              <option value="tour">{t.filterTours}</option>
              <option value="transfer">{t.filterTransfers}</option>
              <option value="hotel">{t.filterHotels}</option>
            </select>
            <select
              name="destination"
              defaultValue={destinationFilter}
              className="lg:col-span-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 focus:ring-2"
            >
              <option value="all">{t.destinationAll}</option>
              <option value="punta-cana">Punta Cana</option>
              <option value="sosua">Sosua</option>
              <option value="puerto-plata">Puerto Plata</option>
              <option value="santo-domingo">Santo Domingo</option>
            </select>
            <select
              name="minRating"
              defaultValue={String(minRating || 0)}
              className="lg:col-span-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none ring-emerald-200 focus:ring-2"
            >
              <option value="0">0+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="4.5">4.5+</option>
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="lg:col-span-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 focus:ring-2"
            >
              <option value="recommended">{t.sortRecommended}</option>
              <option value="rating">{t.sortRating}</option>
              <option value="reviews">{t.sortReviews}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
            </select>
            <button className="lg:col-span-12 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
              {t.topFiltersTitle}
            </button>
          </form>
          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
            <span>
              <strong className="text-slate-900">{scored.length}</strong> {t.results}
            </span>
            <Link href={`${localePrefix(locale)}/prodiscovery`} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold">
              {t.clear}
            </Link>
          </div>
          {activeFilterChips.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={chip.href}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"
                >
                  {chip.label}
                  <span className="text-[10px] text-amber-700">{t.removeFilter}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">{t.topFiltersTitle}</h2>
            <div className="mt-3 grid gap-2">
              <Link href={makeHref()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {t.filterAll}
              </Link>
              <Link href={makeHref(currentPage, compareIds, { type: "tour" })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {t.filterTours}
              </Link>
              <Link href={makeHref(currentPage, compareIds, { type: "transfer" })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {t.filterTransfers}
              </Link>
              <Link href={makeHref(currentPage, compareIds, { type: "hotel" })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {t.filterHotels}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-700">{t.commentsTitle}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.commentsSubtitle}</p>
            <div className="mt-3 space-y-3">
              {comments.map((comment) => (
                <article key={comment.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{comment.customerName}</p>
                    <BubbleRating rating={comment.rating} label={t.bubbleLabel} />
                  </div>
                  <p className="mt-2 line-clamp-3 text-xs text-slate-600">{comment.body}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          {items.length === 0 ? (
            <article className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <h2 className="text-xl font-bold text-slate-900">{t.noResults}</h2>
              <p className="mt-2 text-sm text-slate-600">{t.noResultsBody}</p>
            </article>
          ) : (
            items.map((item) => (
              <article
                key={item.id}
                className={`group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${
                  compareIds.includes(item.id) ? "border-emerald-300 ring-1 ring-emerald-200" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  <Link href={item.href} className="relative block h-52 w-full shrink-0 overflow-hidden bg-slate-100 md:h-auto md:w-72">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-800">
                      {item.tag}
                    </span>
                    {item.badges[0] ? (
                      <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                        {item.badges[0]}
                      </span>
                    ) : null}
                    {compareIds.includes(item.id) ? (
                      <span className="absolute bottom-3 right-3 rounded-full border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        {t.compareSelected}
                      </span>
                    ) : null}
                  </Link>
                  <div className="flex w-full flex-col justify-between p-5">
                    <div>
                      <Link href={item.href} className="text-xl font-bold text-slate-900 hover:text-emerald-700">
                        {item.title}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <BubbleRating rating={item.rating} label={t.bubbleLabel} />
                        <span className="font-semibold text-slate-900">{item.rating.toFixed(1)}</span>
                        <span>({item.reviews} {t.reviewsWord})</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                          {item.destination.replace("-", " ")}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.description}</p>
                      {item.badges.length > 1 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.badges.slice(1).map((badge) => (
                            <span key={`${item.id}-${badge}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              {badge}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        {item.price ? (
                          <>
                            {t.from} <span className="text-2xl font-black text-slate-900">USD {Math.round(item.price)}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-slate-900">{t.consultRate}</span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={toMapHref(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-slate-400"
                        >
                          {t.map}
                        </a>
                        <Link
                          href={getToggleCompareHref(item.id)}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            compareIds.includes(item.id)
                              ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
                              : "border border-slate-300 bg-white text-slate-700"
                          }`}
                        >
                          {compareIds.includes(item.id) ? t.compareRemove : t.compareSelect}
                        </Link>
                        <Link
                          href={item.href}
                          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 group-hover:ring-2 group-hover:ring-emerald-200"
                        >
                          {t.open}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}

          {totalPages > 1 ? (
            <nav className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  {t.page} {currentPage}/{totalPages}
                </span>
                <div className="flex gap-2">
                  {currentPage > 1 ? (
                    <Link href={makeHref(currentPage - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
                      {t.prev}
                    </Link>
                  ) : null}
                  {currentPage < totalPages ? (
                    <Link href={makeHref(currentPage + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
                      {t.next}
                    </Link>
                  ) : null}
                </div>
              </div>
            </nav>
          ) : null}

          {selectedCompare.length > 1 ? (
            <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="mb-3 text-lg font-bold text-slate-900">{t.compareTableTitle}</h3>
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                    <th className="px-3 py-2">Item</th>
                    {selectedCompare.map((item) => (
                      <th key={item.id} className="px-3 py-2 min-w-[220px]">
                        <Link href={item.href} className="font-semibold text-slate-800 hover:text-emerald-700">
                          {item.title}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">Tipo</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-type`} className="px-3 py-2 text-slate-700">
                        {item.tag}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">{t.destinationLabel}</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-destination`} className="px-3 py-2 text-slate-700">
                        {item.destination.replace("-", " ")}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">{t.bubbleLabel}</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-rating`} className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <BubbleRating rating={item.rating} label={t.bubbleLabel} />
                          <span className="font-semibold text-slate-800">{item.rating.toFixed(1)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">{t.reviewsWord}</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-reviews`} className="px-3 py-2 text-slate-700">
                        {item.reviews}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">{t.from}</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-price`} className="px-3 py-2 text-slate-700">
                        {item.price ? `USD ${Math.round(item.price)}` : t.consultRate}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-slate-700">Accion</td>
                    {selectedCompare.map((item) => (
                      <td key={`${item.id}-cta`} className="px-3 py-2">
                        <Link href={item.href} className="inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                          {t.open}
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </section>
          ) : null}
        </section>
      </div>

      {selectedCompare.length > 0 ? (
        <section className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {selectedCompare.length} {t.compareSelected}
              </span>
              <span className="text-xs text-slate-500">{t.compareLimit}</span>
              <Link href={makeHref(currentPage, [])} className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700">
                {t.compareClear}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedCompare.map((item) => (
                <Link key={item.id} href={item.href} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800">
                  {item.title}
                </Link>
              ))}
              <Link href={selectedCompare[0]?.href ?? makeHref(currentPage)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                {t.compareNow}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
