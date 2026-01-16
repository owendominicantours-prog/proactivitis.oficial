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
const META_TITLE_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Avistamiento de ballenas en Samaná + Cayo Levantado",
    en: "Samaná whale watching + Cayo Levantado day trip",
    fr: "Observation des baleines à Samaná + Cayo Levantado"
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Isla Saona desde Punta Cana: tour y entrada",
    en: "Saona Island from Punta Cana tour & ticket",
    fr: "Île Saona depuis Punta Cana: tour + billet"
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "Medio día ATV o buggy 4x4 desde Bayahibe",
    en: "Half-day ATV or buggy 4x4 from Bayahibe",
    fr: "Demi-journée ATV ou buggy 4x4 depuis Bayahibe"
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Tour en buggy en Punta Cana: aventura off-road",
    en: "Punta Cana buggy tour: off-road adventure",
    fr: "Tour en buggy à Punta Cana: aventure off-road"
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Safari cultural por República Dominicana desde Punta Cana",
    en: "Dominican cultural safari from Punta Cana",
    fr: "Safari culturel en République dominicaine depuis Punta Cana"
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Excursión en buggy y ATV en Punta Cana",
    en: "Punta Cana buggy & ATV excursion",
    fr: "Excursion buggy et ATV à Punta Cana"
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Isla Saona desde Bayahibe: tour de día",
    en: "Saona Island day tour from Bayahibe",
    fr: "Île Saona: excursion d'une journée depuis Bayahibe"
  }
};
const META_DESCRIPTION_OVERRIDES: Record<string, Partial<Record<Locale, string>>> = {
  "avistamiento-de-ballenas-samana-cayo-levantado-y-cascadas-desde-punta-cana": {
    es: "Vive el avistamiento de ballenas jorobadas en Samaná. Incluye excursión a la Cascada El Limón, almuerzo típico y relax en Cayo Levantado desde Punta Cana. ¡Reserva tu aventura 3-en-1 aquí!",
    en: "Experience humpback whale watching in Samana. Includes the El Limon Waterfall excursion, a typical lunch, and relax in Cayo Levantado from Punta Cana. Book your 3-in-1 adventure here!",
    fr: "Vivez l'observation des baleines à bosse à Samaná. Inclut l'excursion à la cascade El Limón, un déjeuner typique et détente à Cayo Levantado depuis Punta Cana. Réservez votre aventure 3-en-1 ici !"
  },
  "tour-y-entrada-para-de-isla-saona-desde-punta-cana": {
    es: "Excursión a Isla Saona desde Punta Cana con transporte, entradas y tiempo de playa. Reserva fácil y confirmación rápida.",
    en: "Saona Island day tour from Punta Cana with transport, tickets and beach time. Easy booking and fast confirmation.",
    fr: "Excursion à l’île Saona depuis Punta Cana avec transport, billets et temps plage. Réservation facile, confirmation rapide."
  },
  "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana": {
    es: "Aventura 4x4 en ATV o buggy desde Bayahibe/La Romana con rutas off-road y paradas locales. Reserva rápida.",
    en: "4x4 ATV or buggy adventure from Bayahibe/La Romana with off-road routes and local stops. Book fast.",
    fr: "Aventure en ATV/buggy 4x4 depuis Bayahibe/La Romana avec pistes off-road et arrêts locaux. Réservez vite."
  },
  "tour-en-buggy-en-punta-cana": {
    es: "Ruta en buggy por caminos de tierra, paradas locales y adrenalina en Punta Cana. Reserva rápida y segura.",
    en: "Buggy ride through off-road trails, local stops and adrenaline in Punta Cana. Fast, secure booking.",
    fr: "Balade en buggy sur pistes off-road, arrêts locaux et adrénaline à Punta Cana. Réservation rapide."
  },
  "tour-de-safari-cultural-por-el-pais-de-republica-dominicana-desde-punta-cana": {
    es: "Tour terrestre con cultura local, paisajes rurales y paradas típicas desde Punta Cana. Incluye transporte y guía.",
    en: "Land tour with local culture, rural landscapes and classic stops from Punta Cana. Transport and guide included.",
    fr: "Circuit terrestre avec culture locale, paysages ruraux et arrêts typiques depuis Punta Cana. Transport et guide inclus."
  },
  "excursion-en-buggy-y-atv-en-punta-cana": {
    es: "Excursión en buggy y ATV por rutas de tierra y paradas locales en Punta Cana. Reserva rápida y confirmación clara.",
    en: "Buggy & ATV excursion on dirt routes and local stops in Punta Cana. Fast booking and clear confirmation.",
    fr: "Excursion buggy & ATV sur pistes et arrêts locaux à Punta Cana. Réservation rapide et claire."
  },
  "tour-isla-saona-desde-bayhibe-la-romana": {
    es: "Salida desde Bayahibe/La Romana a Isla Saona con playa, navegación y almuerzo. Reserva fácil y confirmación rápida.",
    en: "Depart from Bayahibe/La Romana to Saona Island with beach time, cruise and lunch. Easy booking, fast confirmation.",
    fr: "Départ de Bayahibe/La Romana vers l’île Saona avec plage, navigation et déjeuner. Réservation facile, confirmation rapide."
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
