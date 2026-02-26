import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { fr } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/fr/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Trouvez les meilleures excursions et transferts | Proactivitis",
  description:
    "Comparez excursions et transferts selon reputation et avis verifies avant de reserver. ProDiscovery relie decouverte et reservation directe.",
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
    title: "ProDiscovery: Trouvez les meilleures excursions et transferts | Proactivitis",
    description:
      "Comparez excursions et transferts selon reputation et avis verifies avant de reserver.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery | Proactivitis",
    description: "Decouvrez des experiences bien notees et reservez en confiance."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ProDiscoveryFrenchPage() {
  return <ProDiscoveryPage locale={fr} />;
}
