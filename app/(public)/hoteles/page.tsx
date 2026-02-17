import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { es } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/hoteles";

export const metadata: Metadata = {
  title: "Hoteles en Punta Cana Todo Incluido | Proactivitis",
  description:
    "Encuentra hoteles y resorts en Punta Cana para cotizar al mejor precio: Bavaro, Cap Cana y Uvero Alto con atencion personalizada.",
  keywords: [
    "hoteles punta cana",
    "resorts punta cana",
    "hoteles todo incluido punta cana",
    "alojamiento punta cana",
    "cotizar hotel punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/hoteles",
      en: "/en/hotels",
      fr: "/fr/hotels",
      "x-default": "/hoteles"
    }
  },
  openGraph: {
    title: "Hoteles en Punta Cana Todo Incluido | Proactivitis",
    description:
      "Encuentra hoteles y resorts en Punta Cana para cotizar al mejor precio en Bavaro, Cap Cana y Uvero Alto.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoteles en Punta Cana Todo Incluido | Proactivitis",
    description: "Cotiza hoteles y resorts en Punta Cana con asesoria personalizada."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function SpanishHotelsIndexPage() {
  return <HotelsDirectoryPage locale={es} />;
}
