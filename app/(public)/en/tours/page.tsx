import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { en } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/en/tours";

export const metadata: Metadata = {
  title: "Tours & activities | Proactivitis",
  description:
    "Book tours and activities with clear pricing, verified operators, and instant confirmation.",
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
