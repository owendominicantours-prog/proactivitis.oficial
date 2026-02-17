import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/";

export const metadata: Metadata = {
  title: "Tours, Excursiones y Traslados en Punta Cana | Proactivitis",
  description:
    "Reserva tours en Punta Cana, excursiones todo incluido y traslados privados al aeropuerto con precios claros, soporte 24/7 y confirmacion inmediata.",
  keywords: [
    "tours punta cana",
    "excursiones punta cana",
    "traslados punta cana",
    "transfer aeropuerto punta cana",
    "things to do punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr",
      "x-default": "/"
    }
  },
  openGraph: {
    title: "Tours, Excursiones y Traslados en Punta Cana | Proactivitis",
    description:
      "Reserva tours en Punta Cana, excursiones todo incluido y traslados privados con confirmacion inmediata.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours, Excursiones y Traslados en Punta Cana | Proactivitis",
    description: "Reserva experiencias y traslados en Punta Cana con precios claros y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";

export default function SpanishHomePage() {
  return <PublicHomePage locale={es} />;
}
