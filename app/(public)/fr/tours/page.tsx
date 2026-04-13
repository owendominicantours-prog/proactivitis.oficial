import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/fr/tours`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Funjet Tour Oprador"
      : "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Reservez des excursions a Punta Cana avec support direct, prix clairs et confirmation rapide. Ile Saona, buggy, catamaran, party boat et plus."
      : "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et support local. Ile Saona, buggy, catamaran, party boat et plus.",
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
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Funjet Tour Oprador"
        : "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reservez des excursions a Punta Cana avec support direct, prix clairs et confirmation rapide."
        : "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et confirmation rapide.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Excursions a Punta Cana | Funjet Tour Oprador"
        : "Excursions a Punta Cana: Saona, Buggy, Catamaran et Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reservez des activites a Punta Cana avec support direct et prix clairs."
        : "Reservez des activites a Punta Cana avec pickup hotel et support 24/7."
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
