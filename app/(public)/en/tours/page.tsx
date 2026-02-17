import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/en/tours";

export const metadata: Metadata = {
  title: "Best Punta Cana Tours and Excursions | Proactivitis",
  description:
    "Book the best Punta Cana tours and excursions with hotel pickup, clear pricing, and instant confirmation. Saona Island, buggies, catamaran, party boat, and more.",
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
    title: "Best Punta Cana Tours and Excursions | Proactivitis",
    description:
      "Book Punta Cana tours and excursions with hotel pickup, transparent pricing, and instant confirmation.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Punta Cana Tours and Excursions | Proactivitis",
    description: "Book top Punta Cana experiences with hotel pickup and clear pricing."
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EnglishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={en} />;
}
