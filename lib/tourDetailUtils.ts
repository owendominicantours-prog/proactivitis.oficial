import type { Metadata } from "next";
import type { Locale } from "@/lib/translations";
import { translate } from "@/lib/translations";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { HIDDEN_TRANSFER_SLUG } from "@/lib/hiddenTours";

const DEFAULT_TOUR_IMAGE = "/fototours/fotosimple.jpg";

type TourImageSource = { heroImage?: string | null; gallery?: string | null };

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    return (JSON.parse(gallery) as unknown as string[]) ?? [];
  } catch {
    return [];
  }
};

const resolveTourHeroImage = (tour: TourImageSource) => {
  const gallery = parseGallery(tour.gallery);
  return tour.heroImage ?? gallery[0] ?? DEFAULT_TOUR_IMAGE;
};

const MAX_TITLE_LENGTH = 55;
const MAX_DESCRIPTION_LENGTH = 160;
const BRAND_SUFFIX = " | Proactivitis";
const PUNTA_CANA_MARKERS = [
  "punta cana",
  "punta-cana",
  "bavaro",
  "cap cana",
  "cap-cana",
  "uvero alto",
  "uvero-alto",
  "macao",
  "cabeza de toro",
  "cabeza-de-toro"
];
const PUNTA_CANA_KEYWORDS: Record<Locale, string[]> = {
  es: [
    "tours punta cana",
    "excursiones punta cana",
    "actividades punta cana",
    "tours con recogida en hotel",
    "excursiones con traslado",
    "tours privados punta cana"
  ],
  en: [
    "punta cana tours",
    "punta cana excursions",
    "things to do punta cana",
    "tours with hotel pickup",
    "private tours punta cana",
    "punta cana activities"
  ],
  fr: [
    "excursions punta cana",
    "activites punta cana",
    "tours a punta cana",
    "prise en charge hotel punta cana",
    "excursions privees punta cana",
    "choses a faire punta cana"
  ]
};
const META_TITLE_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "transfer-privado-proactivitis": {
    es: "Traslado privado en Punta Cana con chofer verificado",
    en: "Private transfer in Punta Cana with verified driver",
    fr: "Transfert prive a Punta Cana avec chauffeur verifie"
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Avistamiento de ballenas en Samana + Cayo Levantado",
    en: "Samana whale watching + Cayo Levantado day trip",
    fr: "Observation des baleines a Samana + Cayo Levantado"
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Isla Saona desde Punta Cana: tour + entrada",
    en: "Saona Island from Punta Cana: tour + ticket",
    fr: "Ile Saona depuis Punta Cana : tour + billet"
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "Medio dia en ATV o buggy 4x4 desde Bayahibe",
    en: "Half-day ATV or buggy 4x4 from Bayahibe",
    fr: "Demi-journee en ATV ou buggy 4x4 depuis Bayahibe"
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Tour en buggy en Punta Cana: aventura off-road",
    en: "Punta Cana buggy tour: off-road adventure",
    fr: "Tour en buggy a Punta Cana : aventure off-road"
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Safari cultural en Republica Dominicana desde Punta Cana",
    en: "Dominican cultural safari from Punta Cana",
    fr: "Safari culturel en Republique dominicaine depuis Punta Cana"
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Excursion en buggy y ATV en Punta Cana",
    en: "Punta Cana buggy & ATV excursion",
    fr: "Excursion buggy et ATV a Punta Cana"
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Isla Saona desde Bayahibe: tour de dia",
    en: "Saona Island day tour from Bayahibe",
    fr: "Ile Saona : excursion d'une journee depuis Bayahibe"
  },
  "sunset-catamaran-snorkel": {
    es: "Party boat en Punta Cana: catamaran con snorkel",
    en: "Punta Cana party boat: catamaran + snorkel",
    fr: "Party boat a Punta Cana : catamaran + snorkel"
  },
  "parasailing-punta-cana": {
    es: "Parasailing en Punta Cana: vistas aereas del Caribe",
    en: "Punta Cana parasailing: Caribbean aerial views",
    fr: "Parasailing a Punta Cana : vues aeriennes"
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: "Santo Domingo desde Punta Cana: tour de un dia",
    en: "Santo Domingo day trip from Punta Cana",
    fr: "Excursion a Saint-Domingue depuis Punta Cana"
  },
  "cayo-levantado-luxury-beach-day": {
    es: "Samana + Cayo Levantado desde Punta Cana",
    en: "Samana + Cayo Levantado from Punta Cana",
    fr: "Samana + Cayo Levantado depuis Punta Cana"
  },
  "party-boat-sosua": {
    es: "Sosua Party Boat: open bar y snorkel",
    en: "Sosua party boat: open bar & snorkel",
    fr: "Party boat a Sosua : open bar et snorkel"
  }
};
const META_DESCRIPTION_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "transfer-privado-proactivitis": {
    es: "Traslado privado en Punta Cana con choferes verificados, precios claros y confirmacion rapida. Reserva ida o ida y vuelta.",
    en: "Private Punta Cana transfer with verified drivers, clear pricing and fast confirmation. Book one-way or round trip.",
    fr: "Transfert prive a Punta Cana avec chauffeurs verifies, prix clairs et confirmation rapide. Aller simple ou aller-retour."
  },
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Ballenas jorobadas en Samana, Cascada El Limon y Cayo Levantado en un solo dia. Incluye almuerzo y traslados desde Punta Cana.",
    en: "Humpback whales in Samana, El Limon Waterfall and Cayo Levantado in one day. Includes lunch and transfers from Punta Cana.",
    fr: "Baleines a bosse a Samana, cascade El Limon et Cayo Levantado en une journee. Dejeuner et transferts inclus."
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Isla Saona desde Punta Cana con entradas, transporte y playa. Reserva rapida con confirmacion inmediata.",
    en: "Saona Island from Punta Cana with tickets, transport and beach time. Fast booking and instant confirmation.",
    fr: "Ile Saona depuis Punta Cana avec billets, transport et plage. Reservation rapide et confirmation immediate."
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "Aventura 4x4 en ATV o buggy desde Bayahibe/La Romana con rutas off-road y paradas locales. Reserva en minutos.",
    en: "4x4 ATV or buggy adventure from Bayahibe/La Romana with off-road routes and local stops. Book in minutes.",
    fr: "Aventure en ATV/buggy 4x4 depuis Bayahibe/La Romana avec pistes off-road et arrets locaux. Reservez en minutes."
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Tour en buggy por caminos de tierra, paradas locales y adrenalina en Punta Cana. Reserva segura y rapida.",
    en: "Buggy tour on dirt trails, local stops and adrenaline in Punta Cana. Secure, fast booking.",
    fr: "Tour en buggy sur pistes, arrets locaux et adrenaline a Punta Cana. Reservation rapide et sure."
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Safari cultural desde Punta Cana con paisajes rurales, paradas tipicas y guia local. Incluye transporte.",
    en: "Cultural safari from Punta Cana with rural landscapes, classic stops and a local guide. Transport included.",
    fr: "Safari culturel depuis Punta Cana avec paysages ruraux, arrets typiques et guide local. Transport inclus."
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Excursion en buggy y ATV por rutas de tierra en Punta Cana con paradas locales. Reserva facil y confirmacion clara.",
    en: "Buggy & ATV excursion on dirt routes in Punta Cana with local stops. Easy booking and clear confirmation.",
    fr: "Excursion buggy & ATV sur pistes a Punta Cana avec arrets locaux. Reservation facile et confirmation claire."
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Salida desde Bayahibe/La Romana a Isla Saona con playa, navegacion y almuerzo. Reserva facil y rapida.",
    en: "Depart from Bayahibe/La Romana to Saona Island with beach time, cruise and lunch. Easy, fast booking.",
    fr: "Depart de Bayahibe/La Romana vers l'Ile Saona avec plage, navigation et dejeuner. Reservation facile."
  },
  "sunset-catamaran-snorkel": {
    es: "Party boat en Punta Cana con catamaran, snorkel y musica. Incluye open bar y paradas en el mar.",
    en: "Punta Cana party boat with catamaran, snorkel and music. Open bar and ocean stops included.",
    fr: "Party boat a Punta Cana avec catamaran, snorkel et musique. Open bar et arrets en mer inclus."
  },
  "parasailing-punta-cana": {
    es: "Vuela en parasailing sobre Punta Cana con vistas del Caribe. Experiencia segura y memorable en la costa.",
    en: "Parasail over Punta Cana with Caribbean views. A safe, memorable coastal experience.",
    fr: "Parasailing au-dessus de Punta Cana avec vues sur les Caraibes. Experience sure et memorable."
  },
  "excursion-de-un-dia-a-santo-domingo-desde-punta-cana": {
    es: "Santo Domingo en un dia desde Punta Cana con historia colonial, paradas clave y guia local.",
    en: "Santo Domingo day trip from Punta Cana with colonial history, key stops and a local guide.",
    fr: "Excursion d'une journee a Saint-Domingue depuis Punta Cana avec histoire coloniale et guide local."
  },
  "cayo-levantado-luxury-beach-day": {
    es: "Dia de playa en Samana y Cayo Levantado desde Punta Cana con traslados y tiempo libre.",
    en: "Samana and Cayo Levantado beach day from Punta Cana with transfers and free time.",
    fr: "Journee plage a Samana et Cayo Levantado depuis Punta Cana avec transferts et temps libre."
  },
  "party-boat-sosua": {
    es: "Party boat en Sosua con open bar, snorkel y pick-up desde Puerto Plata. Elige Share, Private o VIP con brunch.",
    en: "Sosua party boat with open bar, snorkel and pickup from Puerto Plata. Choose Share, Private or VIP with brunch.",
    fr: "Party boat a Sosua avec open bar, snorkel et pickup depuis Puerto Plata. Choisissez Share, Private ou VIP."
  }
};

const buildSeoTitle = (baseTitle: string) => {
  const trimmed = baseTitle.trim();
  if (!trimmed) return `Proactivitis`;
  if (trimmed.length + BRAND_SUFFIX.length <= MAX_TITLE_LENGTH) {
    return `${trimmed}${BRAND_SUFFIX}`;
  }
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `${trimmed.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
  }
  const available = MAX_TITLE_LENGTH - BRAND_SUFFIX.length - 3;
  if (available <= 0) {
    return `${trimmed.slice(0, MAX_TITLE_LENGTH - 3).trimEnd()}...`;
  }
  return `${trimmed.slice(0, available).trimEnd()}...${BRAND_SUFFIX}`;
};

const trimDescription = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_DESCRIPTION_LENGTH) return trimmed;
  return `${trimmed.slice(0, MAX_DESCRIPTION_LENGTH - 3).trimEnd()}...`;
};

const toAbsoluteUrl = (value: string) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_TOUR_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${PROACTIVITIS_URL}${normalized}`;
};

const buildLanguageAlternates = (slug: string) => {
  const normalizedSlug = slug.startsWith("/") ? slug : `/tours/${slug}`;
  return {
    es: `/tours/${slug}`,
    en: `/en/tours/${slug}`,
    fr: `/fr/tours/${slug}`
  };
};

export async function generateTourMetadata(
  { params }: { params: Promise<{ slug?: string }> },
  locale: Locale
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) {
    return {
      title: translate(locale, "tour.metadata.titleFallback"),
      description: translate(locale, "tour.metadata.descriptionFallback")
    };
  }

  if (slug === HIDDEN_TRANSFER_SLUG) {
    return {
      title: translate(locale, "tour.metadata.unavailableTitle")
    };
  }

  const tour = await prisma.tour.findFirst({
    where: { slug },
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      heroImage: true,
      gallery: true,
      country: { select: { name: true, slug: true } },
      destination: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } },
      translations: {
        where: { locale },
        select: {
          title: true,
          shortDescription: true,
          description: true
        }
      }
    }
  });

  if (!tour) {
    return {
      title: translate(locale, "tour.metadata.titleFallback"),
      description: translate(locale, "tour.metadata.descriptionFallback")
    };
  }

  const translation = tour.translations?.[0];
  const resolvedTitle = META_TITLE_OVERRIDES[slug]?.[locale] ?? translation?.title ?? tour.title;
  const resolvedDescription =
    META_DESCRIPTION_OVERRIDES[slug]?.[locale] ??
    translation?.shortDescription ??
    translation?.description ??
    tour.shortDescription ??
    translate(locale, "tour.metadata.descriptionFallback");
  const haystack = [
    tour.title,
    translation?.title,
    tour.destination?.name,
    tour.destination?.slug,
    tour.departureDestination?.name,
    tour.departureDestination?.slug
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isPuntaCanaTour = PUNTA_CANA_MARKERS.some((marker) => haystack.includes(marker));
  const title = buildSeoTitle(resolvedTitle);
  const description = trimDescription(resolvedDescription);
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour));
  const galleryImages = parseGallery(tour.gallery)
    .map((image) => toAbsoluteUrl(image))
    .filter((image) => image && image !== heroImage);
  const ogImages = [heroImage, ...galleryImages].slice(0, 5);
  const heroImageType = heroImage.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const canonicalSlug = buildLanguageAlternates(slug)[locale];
  const canonicalUrl = `${PROACTIVITIS_URL}${canonicalSlug}`;

  return {
    title,
    description,
    keywords: isPuntaCanaTour ? PUNTA_CANA_KEYWORDS[locale] : undefined,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        es: buildLanguageAlternates(slug).es,
        en: buildLanguageAlternates(slug).en,
        fr: buildLanguageAlternates(slug).fr
      }
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: ogImages.map((url, index) => ({
        url,
        width: 1200,
        height: 630,
        type: index === 0 ? heroImageType : undefined,
        alt: title
      })),
      siteName: "Proactivitis",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [heroImage]
    }
  };
}
