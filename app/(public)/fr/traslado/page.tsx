import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/fr/traslado";

export const metadata: Metadata = {
  title: "Transferts prives | Reservez avec Proactivitis",
  description:
    "Reservez des transferts prives avec prix clairs, chauffeurs verifies et confirmation immediate. Aeroport, hotel et ville avec support 24/7.",
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
