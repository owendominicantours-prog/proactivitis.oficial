import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { en } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/en/hotels";

export const metadata: Metadata = {
  title: "Punta Cana Hotels and All-Inclusive Resorts | Proactivitis",
  description:
    "Browse Punta Cana hotels and all-inclusive resorts to request a quote at the best rate in Bavaro, Cap Cana, and Uvero Alto.",
  keywords: [
    "punta cana hotels",
    "all inclusive resorts punta cana",
    "where to stay in punta cana",
    "punta cana accommodation",
    "hotel quote punta cana"
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
    title: "Punta Cana Hotels and All-Inclusive Resorts | Proactivitis",
    description:
      "Browse Punta Cana hotels and all-inclusive resorts and request a quote at the best rate in Bavaro, Cap Cana, and Uvero Alto.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana Hotels and All-Inclusive Resorts | Proactivitis",
    description: "Request hotel quotes in Punta Cana with personalized assistance."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function EnglishHotelsIndexPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <HotelsDirectoryPage locale={en} searchParams={searchParams} />;
}
