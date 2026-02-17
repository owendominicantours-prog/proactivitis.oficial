import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Transferts Punta Cana: Aeroport PUJ et Hotels | Proactivitis",
  description:
    "Reservez vos transferts a Punta Cana depuis l aeroport PUJ vers Bavaro, Cap Cana, Uvero Alto et les resorts avec tarif fixe et support 24/7.",
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
  }
};

export const runtime = "nodejs";
export const revalidate = 3600;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={fr} />;
}
