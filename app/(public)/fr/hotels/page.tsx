import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { fr } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/fr/hotels";

export const metadata: Metadata = {
  title: "Hotels Punta Cana Tout Inclus: Bavaro, Cap Cana et Uvero Alto | Proactivitis",
  description:
    "Comparez les hotels et resorts tout inclus a Punta Cana et demandez un devis pour Bavaro, Cap Cana et Uvero Alto avec accompagnement personnalise.",
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
    title: "Hotels Punta Cana Tout Inclus: Bavaro, Cap Cana et Uvero Alto | Proactivitis",
    description:
      "Comparez les hotels tout inclus a Punta Cana et demandez votre devis en quelques minutes.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotels Punta Cana Tout Inclus: Bavaro, Cap Cana et Uvero Alto | Proactivitis",
    description: "Demandez un devis hotel a Punta Cana avec accompagnement personnalise."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function FrenchHotelsIndexPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HotelsDirectoryPage locale={fr} searchParams={searchParams} />;
}

