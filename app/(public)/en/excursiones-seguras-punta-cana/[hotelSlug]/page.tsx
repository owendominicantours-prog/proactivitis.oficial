import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { translate, en, es, fr } from "@/lib/translations";
import HotelSafetyGuidePage from "@/components/public/HotelSafetyGuidePage";
import {
  SAFETY_GUIDE_SLUG_SUFFIX,
  normalizeSafetyGuideSlug,
  buildSafetyGuideUrl
} from "@/lib/safety-guide";

const BASE_URL = "https://proactivitis.com";
const FALLBACK_IMAGE = "/transfer/sedan.png";

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${BASE_URL}${FALLBACK_IMAGE}`;
  if (value.startsWith("http")) return value;
  const normalized = value.startsWith("/") ? value : `/${value}`;
  return `${BASE_URL}${normalized}`;
};

const buildKeywords = (hotel: string) => [
  `Safety guide for ${hotel}`,
  `Secure transport from ${hotel}`,
  "hotel safety guide",
  "Punta Cana transfers",
  "certified tours Punta Cana",
  "safe excursions Punta Cana",
  "Punta Cana tours",
  "hotel pickup Punta Cana",
  "Proactivitis"
];

type Params = {
  params: Promise<{ hotelSlug: string }>;
};

export async function generateStaticParams() {
  try {
    const hotels = await prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true }
    });
    return hotels.map((hotel) => ({
      hotelSlug: `${hotel.slug}${SAFETY_GUIDE_SLUG_SUFFIX}`
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await params;
  const baseSlug = normalizeSafetyGuideSlug(resolved.hotelSlug);
  const hotel = await prisma.transferLocation
    .findUnique({
      where: { slug: baseSlug },
      select: { name: true, heroImage: true }
    })
    .catch(() => null);

  if (!hotel) {
    return { title: "Safety guide not available" };
  }

  const title = translate(en, "safetyGuide.meta.title", { hotel: hotel.name });
  const description = translate(en, "safetyGuide.meta.description", { hotel: hotel.name }).trim();
  const seoTitle = `${title} | Proactivitis`;
  const seoDescription = description.endsWith(".") ? description : `${description}.`;
  const canonical = buildSafetyGuideUrl(en, baseSlug);
  const languages = {
    es: buildSafetyGuideUrl(es, baseSlug),
    en: buildSafetyGuideUrl(en, baseSlug),
    fr: buildSafetyGuideUrl(fr, baseSlug)
  };
  const imageUrl = toAbsoluteUrl(hotel.heroImage);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildKeywords(hotel.name),
    alternates: { canonical, languages },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "en_US",
      images: [{ url: imageUrl }]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [imageUrl]
    }
  };
}

export default async function SafetyGuidePage({ params }: Params) {
  const resolved = await params;
  const baseSlug = normalizeSafetyGuideSlug(resolved.hotelSlug);
  if (!resolved.hotelSlug.endsWith(SAFETY_GUIDE_SLUG_SUFFIX)) {
    return notFound();
  }

  const hotel = await prisma.transferLocation
    .findUnique({
      where: { slug: baseSlug },
      select: { slug: true, name: true, description: true, heroImage: true }
    })
    .catch(() => null);

  if (!hotel) {
    return notFound();
  }

  const [tours, transferHotels] = await Promise.all([
    prisma.tour
      .findMany({
        where: { status: "published" },
        select: { slug: true, title: true, price: true, heroImage: true, gallery: true },
        orderBy: { createdAt: "desc" },
        take: 5
      })
      .catch(() => []),
    prisma.transferLocation
      .findMany({
        where: { type: "HOTEL", active: true },
        select: { slug: true, name: true, heroImage: true, zone: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5
      })
      .catch(() => [])
  ]);

  return <HotelSafetyGuidePage locale={en} hotel={hotel} tours={tours} transferHotels={transferHotels} />;
}
