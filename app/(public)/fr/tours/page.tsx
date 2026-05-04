import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { localizedCountryName, localizedDestinationName } from "@/lib/localizedPlaces";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<TourSearchParams>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const countryName = params?.country ? localizedCountryName({ slug: params.country }, fr) : null;
  const destinationName = params?.destination ? localizedDestinationName({ slug: params.destination }, fr) : null;
  const placeName = destinationName || countryName;
  const scopedCanonical = params?.country
    ? `${canonicalUrl}?country=${encodeURIComponent(params.country)}${params.destination ? `&destination=${encodeURIComponent(params.destination)}` : ""}`
    : canonicalUrl;
  const title = placeName
    ? `Tours et activites en ${placeName} | Proactivitis`
    : "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis";
  const description = placeName
    ? `Reservez des tours et activites en ${placeName} avec prix clairs, details utiles et support Proactivitis avant et apres la reservation.`
    : "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et support local. Ile Saona, buggy, catamaran, party boat et plus.";

  return {
    title,
    description,
    keywords: placeName
      ? [`tours ${placeName}`, `activites ${placeName}`, `excursions ${placeName}`, "Proactivitis"]
      : ["meilleures excursions punta cana", "tours punta cana", "excursion ile saona", "tour buggy punta cana", "party boat punta cana"],
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

export default function FrenchToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={fr} />;
}
