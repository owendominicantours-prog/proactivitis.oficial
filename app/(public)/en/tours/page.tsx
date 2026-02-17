import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/en/tours";

export const metadata: Metadata = {
  title: "Punta Cana tours and excursions | Proactivitis",
  description:
    "Book Punta Cana tours, excursions, and activities with hotel pickup, clear pricing, and instant confirmation. Compare options and reserve in minutes.",
  keywords: [
    "punta cana tours",
    "punta cana excursions",
    "things to do punta cana",
    "tours with hotel pickup",
    "best tours in punta cana"
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
    title: "Punta Cana tours and excursions | Proactivitis",
    description:
      "Book Punta Cana tours and excursions with hotel pickup, clear pricing, and instant confirmation.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana tours and excursions | Proactivitis",
    description: "Book top-rated Punta Cana tours with hotel pickup and clear pricing."
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EnglishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={en} />;
}
