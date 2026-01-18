import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/traslado";

export const metadata: Metadata = {
  title: "Traslados privados en Punta Cana | Proactivitis",
  description:
    "Reserva traslados privados desde el aeropuerto, hotel o ciudad con choferes verificados, precios fijos y soporte 24/7. Servicio puerta a puerta con confirmación inmediata, monitoreo de vuelo y vehículos climatizados.",
  keywords: ["traslados privados", "transfer aeropuerto", "Punta Cana", "choferes verificados", "Proactivitis"],
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
