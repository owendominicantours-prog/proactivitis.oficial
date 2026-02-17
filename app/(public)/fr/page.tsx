import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/fr";

export const metadata: Metadata = {
  title: "Tours, Excursions et Transferts a Punta Cana | Proactivitis",
  description:
    "Reservez des tours a Punta Cana, des excursions populaires et des transferts prives aeroport avec prix clairs, support 24/7 et confirmation rapide.",
  keywords: [
    "tours punta cana",
    "excursions punta cana",
    "transferts punta cana",
    "transfert aeroport punta cana",
    "activites punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr",
      "x-default": "/"
    }
  }
};

export const runtime = "nodejs";

export default function FrenchHomePage() {
  return <PublicHomePage locale={fr} />;
}
