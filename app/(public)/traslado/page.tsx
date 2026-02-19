import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/traslado";

export const metadata: Metadata = {
  title: "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
  description:
    "Reserva traslados privados en Punta Cana desde el aeropuerto PUJ a hoteles y resorts con tarifa fija, monitoreo de vuelo y soporte 24/7.",
  keywords: [
    "traslado aeropuerto punta cana",
    "transfer punta cana",
    "traslado privado punta cana",
    "transporte puj hotel",
    "taxi privado punta cana"
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
    title: "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
    description:
      "Reserva traslados privados en Punta Cana desde PUJ a hoteles y resorts con tarifa fija y monitoreo de vuelo.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
    description: "Reserva tu transfer privado en Punta Cana con tarifa fija y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function SpanishTrasladoPage() {
  return <PublicTransferPage locale={es} />;
}
