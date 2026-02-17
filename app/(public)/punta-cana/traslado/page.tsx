import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Transfer Punta Cana: Aeropuerto PUJ y Hoteles | Proactivitis",
  description:
    "Reserva transfer en Punta Cana desde el aeropuerto PUJ a Bavaro, Cap Cana, Uvero Alto y hoteles con precio fijo, chofer profesional y soporte 24/7.",
  keywords: [
    "transfer punta cana",
    "traslado puj",
    "traslado bavaro",
    "traslado cap cana",
    "traslado uvero alto"
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
    title: "Transfer Punta Cana: Aeropuerto PUJ y Hoteles | Proactivitis",
    description:
      "Reserva transfer en Punta Cana desde PUJ a Bavaro, Cap Cana y Uvero Alto con precio fijo y confirmacion inmediata.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Transfer Punta Cana: Aeropuerto PUJ y Hoteles | Proactivitis",
    description: "Traslados privados en Punta Cana con chofer profesional y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const revalidate = 3600;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={es} />;
}
