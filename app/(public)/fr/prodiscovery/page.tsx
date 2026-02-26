import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { fr } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/fr/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Avis Excursions, Hotels et Transferts",
  description: "Marketplace de comparaison avec filtres, photos et avis pour excursions, hotels et transferts.",
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
    title: "ProDiscovery: Avis Excursions, Hotels et Transferts",
    description: "Comparez selon note, prix, photos et commentaires verifies.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery",
    description: "Explorez des fiches avec filtres avances et avis reels."
  },
  robots: { index: true, follow: true }
};

export default async function ProDiscoveryFrenchPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={fr} searchParams={(await searchParams) ?? {}} />;
}
