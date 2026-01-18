import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export const metadata: Metadata = {
  title: "Excursions a Punta Cana | Proactivitis",
  description: "Reservez des excursions a Punta Cana avec prise en charge hotel, prix clairs et confirmation rapide. Comparez les options et reservez en minutes.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/tours",
      en: "/en/tours",
      fr: "/fr/tours"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FrenchToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={fr} />;
}
