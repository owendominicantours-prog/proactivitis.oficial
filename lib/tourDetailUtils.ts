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
  const resolvedTitle = translation?.title ?? tour.title;
  const resolvedDescription =
    translation?.shortDescription ??
    translation?.description ??
    tour.shortDescription ??
    translate(locale, "tour.metadata.descriptionFallback");
  const title = buildSeoTitle(resolvedTitle);
  const description = trimDescription(resolvedDescription);
  const heroImage = toAbsoluteUrl(resolveTourHeroImage(tour));
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
      images: [
        {
          url: heroImage,
          alt: title
        }
      ],
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
