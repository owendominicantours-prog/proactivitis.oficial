import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/fr/destinos";

export const metadata: Metadata = {
  title: "Destinations Curées | Proactivitis Global Destinations",
  description:
    "Découvrez notre liste VIP de destinations mondiales. Uniquement des régions auditées et des équipes locales contrôlées pour des expériences premium.",
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
