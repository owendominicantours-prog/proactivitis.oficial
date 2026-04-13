import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/fr/traslado`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Transfert aeroport Punta Cana (PUJ) vers hotels et resorts | Funjet Tour Oprador"
      : "Transfert Aeroport Punta Cana (PUJ) vers Hotels et Resorts | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Reservez un transfert prive a Punta Cana avec tarif fixe, suivi de vol et confirmation rapide sur WhatsApp."
      : "Reservez un transfert prive depuis PUJ vers les hotels et resorts de Punta Cana avec tarif fixe, suivi de vol et support 24/7.",
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
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Transfert aeroport Punta Cana (PUJ) vers hotels et resorts | Funjet Tour Oprador"
        : "Transfert Aeroport Punta Cana (PUJ) vers Hotels et Resorts | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reservez un transfert prive a Punta Cana avec tarif fixe et suivi de vol."
        : "Reservez un transfert prive depuis PUJ vers les hotels de Punta Cana avec tarif fixe et suivi de vol.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Transferts Punta Cana | Funjet Tour Oprador"
        : "Transfert Aeroport Punta Cana (PUJ) vers Hotels et Resorts | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reservez un transfert prive a Punta Cana avec tarif fixe et support direct."
        : "Reservez un transfert prive a Punta Cana avec tarif fixe et support local."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FrenchTrasladoPage() {
  return <PublicTransferPage locale={fr} />;
}
