import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/traslado`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Traslados privados Punta Cana: aeropuerto PUJ a hoteles | Funjet Tour Oprador"
      : "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Reserva traslados privados en Punta Cana con tarifa fija, monitoreo de vuelo y confirmacion rapida por WhatsApp."
      : "Reserva traslados privados en Punta Cana desde el aeropuerto PUJ a hoteles y resorts con tarifa fija, monitoreo de vuelo y soporte 24/7.",
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
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Traslados privados Punta Cana: aeropuerto PUJ a hoteles | Funjet Tour Oprador"
        : "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva traslados privados en Punta Cana con tarifa fija y monitoreo de vuelo."
        : "Reserva traslados privados en Punta Cana desde PUJ a hoteles y resorts con tarifa fija y monitoreo de vuelo.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Traslados privados Punta Cana | Funjet Tour Oprador"
        : "Traslados Privados Punta Cana: Aeropuerto PUJ a Hoteles | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva tu transfer privado en Punta Cana con tarifa fija y confirmacion rapida."
        : "Reserva tu transfer privado en Punta Cana con tarifa fija y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function SpanishTrasladoPage() {
  return <PublicTransferPage locale={es} />;
}
