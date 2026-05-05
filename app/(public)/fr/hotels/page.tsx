import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { fr } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/fr/hotels";

export const metadata: Metadata = {
  title: "Hotels, Resorts, Appartements et Villas a Punta Cana | Proactivitis",
  description:
    "Comparez hotels, resorts, appartements et maisons de vacances a Punta Cana. Demandez un devis avec transferts et excursions connectes.",
  keywords: [
    "hotels punta cana",
    "resorts tout inclus punta cana",
    "hebergement punta cana",
    "appartements punta cana",
    "villas punta cana",
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
    title: "Hotels, Resorts, Appartements et Villas a Punta Cana | Proactivitis",
    description:
      "Comparez hotels, resorts, appartements et villas a Punta Cana et demandez votre devis en quelques minutes.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotels, Resorts, Appartements et Villas a Punta Cana | Proactivitis",
    description: "Demandez un devis hotel, appartement ou villa a Punta Cana avec accompagnement personnalise."
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

