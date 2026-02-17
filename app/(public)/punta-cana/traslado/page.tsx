import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Traslados en Punta Cana | Aeropuerto, hoteles y zonas",
  description:
    "Reserva traslados privados en Punta Cana con choferes verificados, precios claros y confirmacion inmediata. Aeropuerto, hoteles y zonas con servicio puerta a puerta y soporte 24/7.",
  keywords: ["traslados Punta Cana", "transfer aeropuerto PUJ", "hoteles Punta Cana", "chofer privado", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/traslado",
      en: "/en/punta-cana/traslado",
      fr: "/fr/punta-cana/traslado"
    }
  }
};

export const runtime = "nodejs";
export const revalidate = 3600;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={es} />;
}
