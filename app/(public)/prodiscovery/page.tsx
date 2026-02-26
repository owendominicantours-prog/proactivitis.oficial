import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { es } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Descubre tours y traslados mejor valorados | Proactivitis",
  description:
    "Compara tours y traslados por reputacion y reseñas verificadas antes de reservar. ProDiscovery conecta descubrimiento con reserva directa.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/prodiscovery",
      en: "/en/prodiscovery",
      fr: "/fr/prodiscovery",
      "x-default": "/prodiscovery"
    }
  },
  openGraph: {
    title: "ProDiscovery: Descubre tours y traslados mejor valorados | Proactivitis",
    description:
      "Compara tours y traslados por reputacion y reseñas verificadas antes de reservar.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery | Proactivitis",
    description: "Descubre experiencias mejor valoradas y reserva con confianza."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ProDiscoverySpanishPage() {
  return <ProDiscoveryPage locale={es} />;
}
