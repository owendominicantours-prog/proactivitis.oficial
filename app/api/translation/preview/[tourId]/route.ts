import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SUPPORTED_LOCALES = ["en", "fr"] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export async function GET(request: NextRequest) {
  const pathSegments = request.nextUrl.pathname.split("/").filter(Boolean);
  const tourId = pathSegments[pathSegments.length - 1];
  if (!tourId) {
    return NextResponse.json({ message: "tourId is required" }, { status: 400 });
  }

  const localeParam = request.nextUrl.searchParams.get("locale") ?? "en";
  const locale = SUPPORTED_LOCALES.includes(localeParam as SupportedLocale)
    ? (localeParam as SupportedLocale)
    : ("en" as SupportedLocale);

  const translation = await prisma.tourTranslation.findUnique({
    where: { tourId_locale: { tourId, locale } }
  });

  if (!translation) {
    return NextResponse.json({ message: "translation not ready", ready: false }, { status: 404 });
  }

  return NextResponse.json({
    title: translation.title,
    subtitle: translation.subtitle,
    shortDescription: translation.shortDescription,
    description: translation.description,
    highlights: translation.highlights ?? [],
    includesList: translation.includesList ?? [],
    notIncludedList: translation.notIncludedList ?? [],
    itineraryStops: translation.itineraryStops ?? [],
    locale
  });
}
