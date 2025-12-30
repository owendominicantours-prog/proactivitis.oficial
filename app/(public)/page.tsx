import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/";

export const metadata: Metadata = {
  title: "Proactivitis | Traslados Privados y Tours de Calidad",
  description:
    "Reserva traslados privados y tours con Proactivitis. Servicio profesional en los mejores destinos del mundo. Precios fijos y confirmación inmediata.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr"
    }
  }
};

export const runtime = "nodejs";

export default function SpanishHomePage() {
  return <PublicHomePage locale={es} />;
}
