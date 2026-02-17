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
  }
};

export default function SpanishTrasladoPage() {
  return <PublicTransferPage locale={es} />;
}
