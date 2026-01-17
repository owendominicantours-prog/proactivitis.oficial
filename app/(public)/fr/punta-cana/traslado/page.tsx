import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Transferts a Punta Cana | Aeroport, hotels et zones",
  description:
    "Reservez des transferts prives a Punta Cana avec chauffeurs verifies, prix clairs et confirmation rapide. Service porte a porte avec support 24/7.",
  keywords: ["transferts Punta Cana", "transfert aeroport PUJ", "chauffeur prive", "pickup hotel", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/traslado",
      en: "/en/punta-cana/traslado",
      fr: "/fr/punta-cana/traslado"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={fr} />;
}
