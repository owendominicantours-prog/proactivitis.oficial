import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/fr/traslado";

export const metadata: Metadata = {
  title: "Transfert Aeroport Punta Cana et Hotels | Proactivitis",
  description:
    "Reservez un transfert prive depuis PUJ vers les hotels de Punta Cana avec tarif fixe, suivi de vol, chauffeur professionnel et confirmation immediate.",
  keywords: [
    "transfert aeroport punta cana",
    "transfert prive punta cana",
    "puj transfert hotel",
    "transport hotel punta cana",
    "taxi prive punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/traslado",
      en: "/en/traslado",
      fr: "/fr/traslado",
      "x-default": "/traslado"
    }
  },
  openGraph: {
    title: "Transfert Aeroport Punta Cana et Hotels | Proactivitis",
    description:
      "Reservez un transfert prive depuis PUJ vers les hotels de Punta Cana avec tarif fixe et confirmation immediate.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Transfert Aeroport Punta Cana et Hotels | Proactivitis",
    description: "Reservez un transfert prive a Punta Cana avec suivi de vol et support 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FrenchTrasladoPage() {
  return <PublicTransferPage locale={fr} />;
}
