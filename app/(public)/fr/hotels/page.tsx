import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { fr } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/fr/hotels";

export const metadata: Metadata = {
  title: "Hotels et Resorts Tout Inclus a Punta Cana | Proactivitis",
  description:
    "Consultez les hotels et resorts tout inclus a Punta Cana et demandez un devis au meilleur prix pour Bavaro, Cap Cana et Uvero Alto.",
  keywords: [
    "hotels punta cana",
    "resorts tout inclus punta cana",
    "hebergement punta cana",
    "ou loger a punta cana",
    "devis hotel punta cana"
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
    title: "Hotels et Resorts Tout Inclus a Punta Cana | Proactivitis",
    description:
      "Consultez les hotels et resorts tout inclus a Punta Cana et demandez un devis au meilleur prix.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotels et Resorts Tout Inclus a Punta Cana | Proactivitis",
    description: "Demandez un devis hotel a Punta Cana avec accompagnement personnalise."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FrenchHotelsIndexPage() {
  return <HotelsDirectoryPage locale={fr} />;
}
