import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export const metadata: Metadata = {
  title: "Tours et activites | Proactivitis",
  description:
    "Reservez des tours et activites avec prix clairs, prestataires verifies et confirmation immediate.",
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
