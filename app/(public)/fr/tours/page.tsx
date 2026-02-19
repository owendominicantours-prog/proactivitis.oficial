import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export const metadata: Metadata = {
  title: "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
  description:
    "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et support local. Ile Saona, buggy, catamaran, party boat et plus.",
  keywords: [
    "meilleures excursions punta cana",
    "tours punta cana",
    "excursion ile saona",
    "tour buggy punta cana",
    "party boat punta cana"
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
    title: "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
    description:
      "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et confirmation rapide.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
    description: "Reservez des activites a Punta Cana avec pickup hotel et support 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function FrenchToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={fr} />;
}
