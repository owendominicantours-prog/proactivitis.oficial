import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/traslado";

export const metadata: Metadata = {
  title: "Traslados Privados | Reserva en Proactivitis",
  description:
    "Reserva traslados privados con choferes verificados, precios claros y confirmacion inmediata. Conecta aeropuerto, hotel y ciudad con soporte 24/7.",
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
