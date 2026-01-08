import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/";

export const metadata: Metadata = {
  title: "Proactivitis | Tours, Traslados y Actividades para Reservar",
  description:
    "Reserva tours, traslados privados y actividades con Proactivitis. Servicio profesional, precios claros y confirmacion inmediata.",
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
