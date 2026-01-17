import type { Metadata } from "next";
import { fr } from "../../../../lib/translations";
import PublicTransferPage from "../../../../components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/fr/traslado";

export const metadata: Metadata = {
  title: "Transferts prives Proactivitis",
  description:
    "Reservez votre transfert prive avec chauffeurs bilingues, prix fixes et support 24/7. Service porte a porte, confirmation rapide et vehicules verifies.",
  keywords: ["transferts prives", "transfert aeroport", "Punta Cana", "chauffeurs bilingues", "Proactivitis"],
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
