import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/fr";

export const metadata: Metadata = {
  title: "Proactivitis | Transferts privés et tours de qualité",
  description:
    "Réservez des transferts privés et des tours authentiques avec Proactivitis. Partenaires vérifiés, tarifs transparents et confirmation instantanée dans le monde entier.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr"
    }
  }
};

export const runtime = "nodejs";

export default function FrenchHomePage() {
  return <PublicHomePage locale={fr} />;
}
