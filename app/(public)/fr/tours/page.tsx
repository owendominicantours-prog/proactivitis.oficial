import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export const metadata: Metadata = {
  title: "Excursions a Punta Cana | Proactivitis",
  description:
    "Reservez des excursions a Punta Cana avec prise en charge hotel, prix clairs et confirmation rapide. Comparez les options et reservez en minutes.",
  keywords: [
    "excursions punta cana",
    "activites punta cana",
    "choses a faire punta cana",
    "excursions avec prise en charge hotel",
    "meilleures excursions punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/tours",
      en: "/en/tours",
      fr: "/fr/tours",
      "x-default": "/tours"
    }
  },
  openGraph: {
    title: "Excursions a Punta Cana | Proactivitis",
    description:
      "Reservez des excursions a Punta Cana avec prise en charge hotel et prix clairs.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Excursions a Punta Cana | Proactivitis",
    description: "Reservez des excursions a Punta Cana avec prise en charge hotel."
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FrenchToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={fr} />;
}
