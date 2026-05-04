import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { localizedCountryName, localizedDestinationName } from "@/lib/localizedPlaces";

const canonicalUrl = "https://proactivitis.com/en/tours";

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<TourSearchParams>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const countryName = params?.country ? localizedCountryName({ slug: params.country }, en) : null;
  const destinationName = params?.destination ? localizedDestinationName({ slug: params.destination }, en) : null;
  const placeName = destinationName || countryName;
  const scopedCanonical = params?.country
    ? `${canonicalUrl}?country=${encodeURIComponent(params.country)}${params.destination ? `&destination=${encodeURIComponent(params.destination)}` : ""}`
    : canonicalUrl;
  const title = placeName
    ? `${placeName} tours and activities | Proactivitis`
    : "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Proactivitis";
  const description = placeName
    ? `Book tours and activities in ${placeName} with clear pricing, useful details, and Proactivitis support before and after booking.`
    : "Book Punta Cana tours and excursions with hotel pickup, clear pricing, and local support. Saona Island, buggy, catamaran, party boat, and more.";

  return {
    title,
    description,
    keywords: placeName
      ? [`${placeName} tours`, `${placeName} activities`, `${placeName} excursions`, "Proactivitis"]
      : ["best punta cana tours", "punta cana excursions", "saona island tour", "buggy tour punta cana", "punta cana party boat"],
    alternates: {
      canonical: scopedCanonical,
      languages: {
        es: "/tours",
        en: "/en/tours",
        fr: "/fr/tours",
        "x-default": "/tours"
      }
    },
    openGraph: {
      title,
      description,
      url: scopedCanonical,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EnglishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={en} />;
}
