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

export const DEFAULT_IMAGE = "/fototours/fototour.jpeg";
export const HERO_IMAGE_WIDTH = 1600;
export const HERO_IMAGE_HEIGHT = 900;

const PRIMARY_BUGGY_SLUG = "tour-en-buggy-en-punta-cana";
const SECONDARY_BUGGY_SLUG = "excursion-en-buggy-y-atv-en-punta-cana";

export type BuggyLandingContent = {
  locale: "es" | "en" | "fr";
  pageUrl: string;
  title: string;
  description: string;
  ogLocale: string;
  pageName: string;
  subheadline: string;
  intro: string;
  navbarContact: string;
  navbarAvailability: string;
  heroBadge: string;
  primaryCta: string;
  secondaryCta: string;
  whatsappCta: string;
  quickSummary: string;
  priceFrom: string;
  durationLabel: string;
  idealForLabel: string;
  idealForValue: string;
  toc: Array<{ id: string; label: string }>;
  microBenefits: string[];
  pillarEyebrow: string;
  pillarHeading: string;
  pillarParagraphs: string[];
  pillarCards: string[];
  pillarCardEyebrow: string;
  includesHeading: string;
  includesIntro: string;
  includes: Array<{ title: string; copy: string }>;
  routeHeading: string;
  routeIntro: string;
  routeSteps: Array<{ title: string; copy: string }>;
  routeStepLabel: string;
  chooseHeading: string;
  chooseParagraphs: string[];
  differentiators: string[];
  differentiatorEyebrow: string;
  pricingHeading: string;
  pricingCards: Array<{ label: string; value: string; detail: string }>;
  packingHeading: string;
  packingParagraph: string;
  packingTips: string[];
  bookingHeading: string;
  bookingParagraphs: string[];
  moreToursCta: string;
  galleryEyebrow: string;
  galleryHeading: string;
  galleryCaptions: string[];
  opinionsHeading: string;
  opinionsIntro: string;
  opinionCards: Array<{ title: string; copy: string }>;
  faqHeading: string;
  faq: Array<{ q: string; a: string }>;
  finalHeading: string;
  finalEyebrow: string;
  finalBody: string;
  trustEyebrow: string;
  trustHeading: string;
  trustParagraphs: string[];
  visibleDataEyebrow: string;
  brandLabel: string;
  emailLabel: string;
  phoneLabel: string;
  whatsappLabel: string;
  usefulLinksLabel: string;
  directContactLabel: string;
  allToursLabel: string;
  puntaCanaToursLabel: string;
  contactLabel: string;
  footer: string;
  seoTestingTitles: string[];
  organizationDescription: string;
  breadcrumbHome: string;
  breadcrumbTours: string;
  breadcrumbCurrent: string;
  serviceName: string;
  serviceType: string;
  audienceTypes: string[];
  highlights: string[];
  reviewSchemaComment: string;
  placeholderComment: string;
  localeLinks: {
    home: string;
    contact: string;
    tours: string;
    puntaCanaTours: string;
  };
};

export const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}${DEFAULT_IMAGE}`;
  if (value.startsWith("http")) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
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

const toImageList = (heroImage?: string | null, gallery?: string | null) => {
  const images = [heroImage, ...parseGallery(gallery)].filter((value): value is string => Boolean(value));
  return Array.from(new Set(images)).slice(0, 8);
};

export const getBuggyLandingData = cache(async (localePrefix = "") => {
  const buggyTours = await prisma.tour.findMany({
    where: {
      status: "published",
      OR: [
        { slug: { in: [PRIMARY_BUGGY_SLUG, SECONDARY_BUGGY_SLUG] } },
        { title: { contains: "buggy", mode: "insensitive" } },
        { title: { contains: "atv", mode: "insensitive" } },
        { slug: { contains: "buggy" } },
        { slug: { contains: "atv" } }
      ]
    },
    select: {
      slug: true,
      price: true,
      heroImage: true,
      gallery: true
    },
    orderBy: [{ slug: "asc" }],
    take: 6
  });

  const primaryTour =
    buggyTours.find((tour) => tour.slug === PRIMARY_BUGGY_SLUG) ??
    buggyTours.find((tour) => tour.slug === SECONDARY_BUGGY_SLUG) ??
    buggyTours[0] ??
    null;

  const heroImage = primaryTour?.heroImage ?? DEFAULT_IMAGE;
  const galleryImages = Array.from(
    new Set(
      buggyTours
        .flatMap((tour) => toImageList(tour.heroImage, tour.gallery))
        .filter(Boolean)
    )
  ).slice(0, 6);

  const tourPrefix = localePrefix ? `${localePrefix}/tours` : "/tours";
  const reserveHref = primaryTour ? `${tourPrefix}/${primaryTour.slug}` : tourPrefix;
  const bookingHref = `${reserveHref}#booking`;
  const lowestPrice =
    buggyTours
      .map((tour) => Number(tour.price))
      .filter((value) => Number.isFinite(value) && value > 0)
      .sort((a, b) => a - b)[0] ?? 40;

  return {
    heroImage,
    galleryImages,
    reserveHref,
    bookingHref,
    lowestPrice
  };
});

export const buildBuggyLandingMetadata = async (
  content: BuggyLandingContent,
  alternates: { canonical: string; languages: Record<string, string> }
): Promise<Metadata> => {
  const localePrefix = content.locale === "es" ? "" : `/${content.locale}`;
  const { heroImage } = await getBuggyLandingData(localePrefix);
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

export const buildBuggySchemaGraph = (
  content: BuggyLandingContent,
  data: Awaited<ReturnType<typeof getBuggyLandingData>>
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
        description: content.organizationDescription,
        sameAs: PROACTIVITIS_LOCALBUSINESS.sameAs
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
        "@type": "WebPage",
        "@id": `${content.pageUrl}/#webpage`,
        url: content.pageUrl,
        name: content.title,
        isPartOf: {
          "@id": `${PROACTIVITIS_URL}/#website`
        },
        about: {
          "@id": `${content.pageUrl}/#service`
        },
        primaryImageOfPage: {
          "@id": `${content.pageUrl}/#primaryimage`
        },
        description: content.description,
        inLanguage: content.ogLocale.replace("_", "-"),
        breadcrumb: {
          "@id": `${content.pageUrl}/#breadcrumb`
        }
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
          { "@type": "Place", name: "Punta Cana" },
          { "@type": "Place", name: "Bavaro" },
          { "@type": "Place", name: "Dominican Republic" }
        ],
        audience: {
          "@type": "Audience",
          audienceType: content.audienceTypes
        },
        availableLanguage: ["es", "en", "fr"],
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
        validFrom: new Date().toISOString().split("T")[0],
        priceValidUntil: getPriceValidUntil(),
        category: "Adventure tour",
        eligibleRegion: "DO",
        itemOffered: {
          "@id": `${content.pageUrl}/#service`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${content.pageUrl}/#faq`,
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a
          }
        }))
      },
      {
        "@type": "ItemList",
        "@id": `${content.pageUrl}/#highlights`,
        itemListElement: content.highlights.map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name
        }))
      },
      {
        ...PROACTIVITIS_LOCALBUSINESS,
        "@id": `${PROACTIVITIS_URL}/#localbusiness`
      }
    ]
  };
};

export const sharedBuggyContact = {
  email: PROACTIVITIS_EMAIL,
  phone: PROACTIVITIS_PHONE,
  whatsappLink: PROACTIVITIS_WHATSAPP_LINK
};
