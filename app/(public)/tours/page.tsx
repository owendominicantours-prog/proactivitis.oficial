import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { localizedCountryName, localizedDestinationName } from "@/lib/localizedPlaces";

const canonicalUrl = "https://proactivitis.com/tours";

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<TourSearchParams>;
}): Promise<Metadata> {
  const params = searchParams ? await searchParams : undefined;
  const countryName = params?.country ? localizedCountryName({ slug: params.country }, es) : null;
  const destinationName = params?.destination ? localizedDestinationName({ slug: params.destination }, es) : null;
  const placeName = destinationName || countryName;
  const scopedCanonical = params?.country
    ? `${canonicalUrl}?country=${encodeURIComponent(params.country)}${params.destination ? `&destination=${encodeURIComponent(params.destination)}` : ""}`
    : canonicalUrl;
  const title = placeName
    ? `Tours y actividades en ${placeName} | Proactivitis`
    : "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Proactivitis";
  const description = placeName
    ? `Reserva tours y actividades en ${placeName} con precios claros, detalles utiles y soporte Proactivitis antes y despues de tu reserva.`
    : "Reserva tours y excursiones en Punta Cana con recogida en hotel, precios claros y soporte 24/7. Saona, buggy, catamaran, party boat y mas experiencias.";

  return {
    title,
    description,
    keywords: placeName
      ? [`tours ${placeName}`, `actividades ${placeName}`, `excursiones ${placeName}`, "Proactivitis"]
      : ["mejores tours punta cana", "excursiones punta cana", "isla saona tour", "buggy punta cana", "party boat punta cana"],
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

export default function SpanishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={es} />;
}
