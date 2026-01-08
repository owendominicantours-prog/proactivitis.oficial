import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { translate, fr } from "@/lib/translations";
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
  `Guide de securite pour ${hotel}`,
  `Transport securise depuis ${hotel}`,
  "securite hotel Punta Cana",
  "transferts Punta Cana",
  "tours certifies Punta Cana",
  "Proactivitis"
];

type Params = {
  params: Promise<{ hotelSlug: string }>;
};

export async function generateStaticParams() {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true }
  });
  return hotels.map((hotel) => ({
    hotelSlug: `${hotel.slug}${SAFETY_GUIDE_SLUG_SUFFIX}`
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await params;
  const baseSlug = normalizeSafetyGuideSlug(resolved.hotelSlug);
  const hotel = await prisma.transferLocation.findUnique({
    where: { slug: baseSlug },
    select: { name: true, heroImage: true }
  });

  if (!hotel) {
    return { title: "Guide de securite indisponible" };
  }

  const title = translate(fr, "safetyGuide.meta.title", { hotel: hotel.name });
  const description = translate(fr, "safetyGuide.meta.description", { hotel: hotel.name }).trim();
  const seoTitle = `${title} | Proactivitis`;
  const seoDescription = description.endsWith(".") ? description : `${description}.`;
  const canonical = buildSafetyGuideUrl(fr, baseSlug);
  const imageUrl = toAbsoluteUrl(hotel.heroImage);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildKeywords(hotel.name),
    alternates: { canonical },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "fr_FR",
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

  const hotel = await prisma.transferLocation.findUnique({
    where: { slug: baseSlug },
    select: { slug: true, name: true, description: true, heroImage: true }
  });

  if (!hotel) {
    return notFound();
  }

  const [tours, transferHotels] = await Promise.all([
    prisma.tour.findMany({
      where: { status: "published" },
      select: { slug: true, title: true, price: true, heroImage: true, gallery: true },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true, name: true, heroImage: true, zone: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5
    })
  ]);

  return <HotelSafetyGuidePage locale={fr} hotel={hotel} tours={tours} transferHotels={transferHotels} />;
}
