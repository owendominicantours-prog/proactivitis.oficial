import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/en/tours";

export const metadata: Metadata = {
  title: "Curated Tours & Experiences | Book with Confidence at Proactivitis",
  description:
    "Discover our collection of premium tours and curated experiences. Instant confirmation, secure payments, and 24/7 global support for unforgettable travel.",
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

export default function EnglishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={en} />;
}
