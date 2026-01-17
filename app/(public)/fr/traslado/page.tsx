import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/fr/traslado";

export const metadata: Metadata = {
  title: "Transferts a Punta Cana | Proactivitis",
  description: "Reservez des transferts prives aeroport et hotel a Punta Cana avec prix fixes et support 24/7.",
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
