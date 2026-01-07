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
    select: { name: true }
  });

  if (!hotel) {
    return { title: "Guide de securite indisponible" };
  }

  const title = translate(fr, "safetyGuide.meta.title", { hotel: hotel.name });
  const description = translate(fr, "safetyGuide.meta.description", { hotel: hotel.name });
  const canonical = buildSafetyGuideUrl(fr, baseSlug);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical
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
