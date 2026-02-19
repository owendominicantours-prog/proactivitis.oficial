import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Traslado Punta Cana: Aeropuerto PUJ, Bavaro, Cap Cana y Hoteles | Proactivitis",
  description:
    "Reserva traslado en Punta Cana desde PUJ a Bavaro, Cap Cana, Uvero Alto y hoteles con tarifa fija, chofer profesional y soporte 24/7.",
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
    title: "Traslado Punta Cana: Aeropuerto PUJ, Bavaro, Cap Cana y Hoteles | Proactivitis",
    description:
      "Reserva traslado en Punta Cana desde PUJ a hoteles y zonas turisticas con tarifa fija y confirmacion rapida.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Traslado Punta Cana: Aeropuerto PUJ, Bavaro, Cap Cana y Hoteles | Proactivitis",
    description: "Traslados privados en Punta Cana con tarifa fija y chofer profesional."
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
