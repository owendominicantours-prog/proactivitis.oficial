import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/fr/traslado";

export const metadata: Metadata = {
  title: "Transferts privés Proactivitis",
  description:
    "Réservez votre transfert privé avec chauffeur bilingue, tarifs fixes et flexibilité totale. Proactivitis coordonne vols, hôtels et prestataires sur toute la région.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/traslado",
      en: "/en/traslado",
      fr: "/fr/traslado"
    }
  }
};

export default function FrenchTrasladoPage() {
  return <PublicTransferPage locale={fr} />;
}
