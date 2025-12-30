import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/traslado";

export const metadata: Metadata = {
  title: "Traslados Privados Proactivitis",
  description:
    "Reserva tu traslado privado con chofer bilingüe, precios cerrados y flexibilidad total. Proactivitis conecta vuelos, hoteles y proveedores en toda la región.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/traslado",
      en: "/en/traslado",
      fr: "/fr/traslado"
    }
  }
};

export default function SpanishTrasladoPage() {
  return <PublicTransferPage locale={es} />;
}
