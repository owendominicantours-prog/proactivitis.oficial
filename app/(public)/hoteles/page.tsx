import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { es } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/hoteles";

export const metadata: Metadata = {
  title: "Hoteles, Resorts y Casas Vacacionales en Punta Cana | Proactivitis",
  description:
    "Compara hoteles, resorts, apartamentos y casas vacacionales en Punta Cana. Solicita cotizacion con traslado y tours conectados.",
  keywords: [
    "hoteles punta cana",
    "resorts punta cana",
    "hoteles todo incluido punta cana",
    "alojamiento punta cana",
    "apartamentos punta cana",
    "villas punta cana",
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
    title: "Hoteles, Resorts y Casas Vacacionales en Punta Cana | Proactivitis",
    description:
      "Compara hoteles, resorts, apartamentos y villas en Punta Cana y cotiza tu estancia en minutos.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoteles, Resorts y Casas Vacacionales en Punta Cana | Proactivitis",
    description: "Cotiza hoteles, apartamentos y villas en Punta Cana con asesoria personalizada."
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

