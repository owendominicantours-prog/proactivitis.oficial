import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/en/tours`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Funjet Tour Oprador"
      : "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Book Punta Cana tours and excursions with direct support, clear pricing, and fast confirmation. Saona Island, buggy, catamaran, party boat, and more."
      : "Book Punta Cana tours and excursions with hotel pickup, clear pricing, and local support. Saona Island, buggy, catamaran, party boat, and more.",
  keywords: [
    "best punta cana tours",
    "punta cana excursions",
    "saona island tour",
    "buggy tour punta cana",
    "punta cana party boat"
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
        ? "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Funjet Tour Oprador"
        : "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Book Punta Cana tours and excursions with direct support, transparent pricing, and fast confirmation."
        : "Book Punta Cana tours and excursions with hotel pickup, transparent pricing, and 24/7 support.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Punta Cana Tours | Funjet Tour Oprador"
        : "Punta Cana Tours: Saona, Buggy, Catamaran and Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Book top Punta Cana experiences with direct support and clear pricing."
        : "Book top Punta Cana experiences with hotel pickup, clear pricing, and local support."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EnglishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={en} />;
}
