import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/destinos";

export const metadata: Metadata = {
  title: "Destinos verificados | Tours y traslados en Proactivitis",
  description:
    "Explora destinos con tours, excursiones y traslados privados. Compara zonas, precios claros y soporte 24/7.",
  keywords: ["destinos", "tours", "excursiones", "traslados", "actividades", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/destinos",
      en: "/en/destinos",
      fr: "/fr/destinos"
    }
  }
};

export default function SpanishDestinationsPage() {
  return <PublicDestinationsPage locale={es} />;
}
