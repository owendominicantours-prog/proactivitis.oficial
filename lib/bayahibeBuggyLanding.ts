import { cache } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  PROACTIVITIS_EMAIL,
  PROACTIVITIS_LOCALBUSINESS,
  PROACTIVITIS_LOGO,
  PROACTIVITIS_PHONE,
  PROACTIVITIS_URL,
  PROACTIVITIS_WHATSAPP_LINK,
  getPriceValidUntil
} from "@/lib/seo";

export const BAYAHIBE_BUGGY_SLUG = "half-day-atv-o-buggy-4x4-from-bayahibe-la-romana";
export const DEFAULT_IMAGE = "/fototours/fototour.jpeg";
export const HERO_IMAGE_WIDTH = 1600;
export const HERO_IMAGE_HEIGHT = 900;

export type BayahibeBuggyLandingContent = {
  locale: "es" | "en" | "fr";
  pageUrl: string;
  title: string;
  description: string;
  ogLocale: string;
  pageName: string;
  subheadline: string;
  intro: string;
  heroBadge: string;
  navAvailability: string;
  primaryCta: string;
  secondaryCta: string;
  whatsappCta: string;
  microBenefits: string[];
  quickFacts: string;
  priceFrom: string;
  durationLabel: string;
  areaLabel: string;
  areaValue: string;
  seoEyebrow: string;
  seoHeading: string;
  seoParagraphs: string[];
  seoCards: string[];
  seoCardEyebrow: string;
  experienceHeading: string;
  experienceParagraphs: string[];
  experienceCards: string[];
  itineraryHeading: string;
  itinerary: Array<{ title: string; copy: string }>;
  includesHeading: string;
  includesItems: string[];
  keyInfoHeading: string;
  keyInfoItems: Array<{ label: string; value: string }>;
  whyHeading: string;
  whyItems: string[];
  galleryEyebrow: string;
  galleryHeading: string;
  galleryCaptions: string[];
  travelerHeading: string;
  travelerCards: Array<{ title: string; copy: string }>;
  faqHeading: string;
  faqItems: Array<{ q: string; a: string }>;
  finalHeading: string;
  finalEyebrow: string;
  finalBody: string;
  trustEyebrow: string;
  trustHeading: string;
  trustParagraphs: string[];
  visibleDataHeading: string;
  brandLabel: string;
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  usefulLinksLabel: string;
  directContactLabel: string;
  allToursLabel: string;
  contactLabel: string;
  footer: string;
  organizationDescription: string;
  breadcrumbHome: string;
  breadcrumbTours: string;
  breadcrumbCurrent: string;
  serviceName: string;
  serviceType: string;
  availableLanguages: string[];
  tripDescription: string;
  itinerarySchema: string[];
  audienceTypes: string[];
  localeLinks: {
    home: string;
    tours: string;
    contact: string;
  };
};

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  try {
    const parsed = JSON.parse(gallery);
    return Array.isArray(parsed) ? parsed.map((value) => String(value)).filter(Boolean) : [];
  } catch {
    return [];
  }
};

const buildImageList = (heroImage?: string | null, gallery?: string | null) => {
  const images = [heroImage, ...parseGallery(gallery)].filter((value): value is string => Boolean(value));
  return Array.from(new Set(images)).slice(0, 6);
};

export const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export const getBayahibeBuggyData = cache(async (localePrefix = "") => {
  const tour = await prisma.tour.findFirst({
    where: {
      status: "published",
      slug: BAYAHIBE_BUGGY_SLUG
    },
    select: {
      slug: true,
      price: true,
      heroImage: true,
      gallery: true
    }
  });

  const toursPrefix = localePrefix ? `${localePrefix}/tours` : "/tours";
  const reserveHref = tour ? `${toursPrefix}/${tour.slug}` : toursPrefix;
  const bookingHref = `${reserveHref}#booking`;

  return {
    heroImage: tour?.heroImage ?? DEFAULT_IMAGE,
    galleryImages: buildImageList(tour?.heroImage, tour?.gallery),
    reserveHref,
    bookingHref,
    lowestPrice: Number(tour?.price) > 0 ? Number(tour?.price) : 80
  };
});

export const buildBayahibeBuggyMetadata = async (
  content: BayahibeBuggyLandingContent,
  alternates: { canonical: string; languages: Record<string, string> }
): Promise<Metadata> => {
  const localePrefix = content.locale === "es" ? "" : `/${content.locale}`;
  const { heroImage } = await getBayahibeBuggyData(localePrefix);
  const ogImage = toAbsoluteUrl(heroImage);

  return {
    title: content.title,
    description: content.description,
    alternates,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1
      }
    },
    openGraph: {
      type: "website",
      title: content.title,
      description: content.description,
      url: content.pageUrl,
      siteName: "Proactivitis",
      locale: content.ogLocale,
      images: [
        {
          url: ogImage,
          width: HERO_IMAGE_WIDTH,
          height: HERO_IMAGE_HEIGHT,
          alt: content.pageName
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
      images: [ogImage]
    }
  };
};

export const buildBayahibeBuggySchemaGraph = (
  content: BayahibeBuggyLandingContent,
  data: Awaited<ReturnType<typeof getBayahibeBuggyData>>
) => {
  const heroImageAbsolute = toAbsoluteUrl(data.heroImage);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${PROACTIVITIS_URL}/#organization`,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: {
          "@type": "ImageObject",
          "@id": `${PROACTIVITIS_URL}/#logo`,
          url: PROACTIVITIS_LOGO
        },
        image: heroImageAbsolute,
        email: PROACTIVITIS_EMAIL,
        telephone: PROACTIVITIS_PHONE,
        description: content.organizationDescription
      },
      {
        "@type": "WebSite",
        "@id": `${PROACTIVITIS_URL}/#website`,
        url: PROACTIVITIS_URL,
        name: "Proactivitis",
        publisher: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        inLanguage: content.ogLocale.replace("_", "-")
      },
      {
        "@type": "WebPage",
        "@id": `${content.pageUrl}/#webpage`,
        url: content.pageUrl,
        name: content.title,
        description: content.description,
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        primaryImageOfPage: {
          "@id": `${content.pageUrl}/#primaryimage`
        },
        breadcrumb: {
          "@id": `${content.pageUrl}/#breadcrumb`
        },
        inLanguage: content.ogLocale.replace("_", "-")
      },
      {
        "@type": "ImageObject",
        "@id": `${content.pageUrl}/#primaryimage`,
        url: heroImageAbsolute,
        contentUrl: heroImageAbsolute,
        caption: content.pageName,
        width: HERO_IMAGE_WIDTH,
        height: HERO_IMAGE_HEIGHT
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${content.pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: content.breadcrumbHome,
            item: `${PROACTIVITIS_URL}${content.localeLinks.home}`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: content.breadcrumbTours,
            item: `${PROACTIVITIS_URL}${content.localeLinks.tours}`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: content.breadcrumbCurrent,
            item: content.pageUrl
          }
        ]
      },
      {
        "@type": "Service",
        "@id": `${content.pageUrl}/#service`,
        name: content.serviceName,
        serviceType: content.serviceType,
        provider: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        areaServed: [
          { "@type": "Place", name: "Bayahibe" },
          { "@type": "Place", name: "La Romana" },
          { "@type": "Place", name: "Dominican Republic" }
        ],
        audience: {
          "@type": "Audience",
          audienceType: content.audienceTypes
        },
        availableLanguage: content.availableLanguages,
        description: content.description,
        offers: {
          "@id": `${content.pageUrl}/#offer`
        }
      },
      {
        "@type": "Offer",
        "@id": `${content.pageUrl}/#offer`,
        url: data.reserveHref.startsWith("http") ? data.reserveHref : `${PROACTIVITIS_URL}${data.reserveHref}`,
        priceCurrency: "USD",
        price: data.lowestPrice,
        availability: "https://schema.org/InStock",
        priceValidUntil: getPriceValidUntil(),
        category: "Adventure tour",
        itemOffered: {
          "@id": `${content.pageUrl}/#service`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${content.pageUrl}/#faq`,
        mainEntity: content.faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a
          }
        }))
      },
      {
        "@type": "TouristTrip",
        "@id": `${content.pageUrl}/#trip`,
        name: content.serviceName,
        description: content.tripDescription,
        provider: {
          "@id": `${PROACTIVITIS_URL}/#organization`
        },
        itinerary: content.itinerarySchema,
        touristType: content.audienceTypes,
        offers: {
          "@id": `${content.pageUrl}/#offer`
        }
      },
      {
        ...PROACTIVITIS_LOCALBUSINESS,
        "@id": `${PROACTIVITIS_URL}/#localbusiness`
      }
    ]
  };
};

export const sharedBayahibeBusiness = {
  email: PROACTIVITIS_EMAIL,
  phone: PROACTIVITIS_PHONE,
  whatsappLink: PROACTIVITIS_WHATSAPP_LINK
};
