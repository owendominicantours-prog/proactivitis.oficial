import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { fr } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/fr/tours";

export const metadata: Metadata = {
  title: "Tours et Expériences Exclusives | Réservez en toute Confiance avec Proactivitis",
  description:
    "Découvrez notre sélection de tours et d’expériences premium. Confirmation instantanée, paiements sécurisés et support mondial 24/7 pour vos voyages d’exception.",
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
