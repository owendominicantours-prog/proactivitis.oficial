import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Transferts Punta Cana: Aeroport PUJ vers Bavaro, Cap Cana et Hotels | Proactivitis",
  description:
    "Reservez vos transferts a Punta Cana depuis PUJ vers Bavaro, Cap Cana, Uvero Alto et les resorts avec tarif fixe et support local.",
  keywords: [
    "transferts punta cana",
    "transfert aeroport puj",
    "transfert bavaro",
    "transfert cap cana",
    "transfert uvero alto"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/traslado",
      en: "/en/punta-cana/traslado",
      fr: "/fr/punta-cana/traslado",
      "x-default": "/punta-cana/traslado"
    }
  },
  openGraph: {
    title: "Transferts Punta Cana: Aeroport PUJ vers Bavaro, Cap Cana et Hotels | Proactivitis",
    description:
      "Reservez vos transferts a Punta Cana depuis PUJ vers hotels et zones touristiques avec tarif fixe et suivi de vol.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Transferts Punta Cana: Aeroport PUJ vers Bavaro, Cap Cana et Hotels | Proactivitis",
    description: "Transferts prives a Punta Cana avec tarif fixe et chauffeur professionnel."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const revalidate = 3600;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={fr} />;
}
