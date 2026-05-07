import { NextRequest, NextResponse } from "next/server";
import { TransferLocationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_URL } from "@/lib/seo";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return `${PROACTIVITIS_URL}/fototours/fotosimple.jpg`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${PROACTIVITIS_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const normalizeLocale = (value?: string | null) => {
  const locale = value?.toLowerCase();
  return locale === "en" || locale === "fr" ? locale : "es";
};

const hotelHref = (locale: string, slug: string) =>
  locale === "es" ? `/hoteles/${slug}` : `/${locale}/hotels/${slug}`;

const directoryHref = (locale: string) => (locale === "es" ? "/hoteles" : `/${locale}/hotels`);

const scoreFromName = (name: string) => {
  const seed = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return Number((4.6 + (seed % 4) / 10).toFixed(1));
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const locale = normalizeLocale(url.searchParams.get("locale"));
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 36), 1), 60);

  const hotels = await prisma.transferLocation.findMany({
    where: { type: TransferLocationType.HOTEL, active: true },
    take: limit,
    orderBy: [{ zone: { name: "asc" } }, { name: "asc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      heroImage: true,
      zone: { select: { name: true } }
    }
  });

  const response = NextResponse.json({
    href: directoryHref(locale),
    hotels: hotels.map((hotel) => ({
      id: hotel.id,
      slug: hotel.slug,
      name: hotel.name,
      zoneName: hotel.zone?.name ?? "Punta Cana",
      description:
        hotel.description?.trim() ||
        (locale === "en"
          ? "Connected stay with tours, transfers and local support."
          : locale === "fr"
            ? "Sejour connecte avec excursions, transferts et support local."
            : "Alojamiento conectado con tours, traslados y soporte local."),
      image: toAbsoluteUrl(hotel.heroImage),
      rating: scoreFromName(hotel.name),
      href: hotelHref(locale, hotel.slug)
    }))
  });
  response.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=1800");
  return withCors(response);
}
