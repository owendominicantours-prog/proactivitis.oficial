import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { es } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/hoteles";

export const metadata: Metadata = {
  title: "Hoteles Punta Cana Todo Incluido: Bavaro, Cap Cana y Uvero Alto | Proactivitis",
  description:
    "Compara hoteles y resorts todo incluido en Punta Cana y solicita cotizacion en Bavaro, Cap Cana y Uvero Alto con asesoria personalizada.",
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
    title: "Hoteles Punta Cana Todo Incluido: Bavaro, Cap Cana y Uvero Alto | Proactivitis",
    description:
      "Compara hoteles y resorts todo incluido en Punta Cana y cotiza tu estancia en minutos.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoteles Punta Cana Todo Incluido: Bavaro, Cap Cana y Uvero Alto | Proactivitis",
    description: "Cotiza hoteles y resorts en Punta Cana con asesoria personalizada."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function SpanishHotelsIndexPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HotelsDirectoryPage locale={es} searchParams={searchParams} />;
}

