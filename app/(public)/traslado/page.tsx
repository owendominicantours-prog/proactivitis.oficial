import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/traslado";

export const metadata: Metadata = {
  title: "Traslado Aeropuerto Punta Cana y Hoteles | Proactivitis",
  description:
    "Reserva traslado privado en Punta Cana desde PUJ a hoteles y zonas turisticas con precio fijo, monitoreo de vuelo, chofer profesional y confirmacion inmediata.",
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
    title: "Traslado Aeropuerto Punta Cana y Hoteles | Proactivitis",
    description:
      "Reserva traslado privado en Punta Cana desde PUJ a hoteles y zonas turisticas con precio fijo y confirmacion inmediata.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Traslado Aeropuerto Punta Cana y Hoteles | Proactivitis",
    description: "Reserva tu transfer privado en Punta Cana con monitoreo de vuelo y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function SpanishTrasladoPage() {
  return <PublicTransferPage locale={es} />;
}
