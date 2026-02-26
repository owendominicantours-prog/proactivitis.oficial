import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { es } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Reviews de Tours, Hoteles y Traslados",
  description: "Marketplace de comparacion con filtros, fotos y resenas para tours, hoteles y traslados.",
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
    title: "ProDiscovery: Reviews de Tours, Hoteles y Traslados",
    description: "Compara por puntuacion, precio, fotos y comentarios verificados.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery",
    description: "Explora listings con filtros y opiniones reales."
  },
  robots: { index: true, follow: true }
};

export default async function ProDiscoverySpanishPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={es} searchParams={(await searchParams) ?? {}} />;
}
