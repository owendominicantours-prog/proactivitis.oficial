import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/fr/destinos";

export const metadata: Metadata = {
  title: "Destinations verifiees | Tours et transferts avec Proactivitis",
  description:
    "Decouvrez des destinations avec tours, excursions et transferts prives. Comparez les zones, prix clairs, support 24/7.",
  keywords: ["destinations", "tours", "excursions", "transferts", "activites", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/destinos",
      en: "/en/destinos",
      fr: "/fr/destinos"
    }
  }
};

export default function FrenchDestinationsPage() {
  return <PublicDestinationsPage locale={fr} />;
}
