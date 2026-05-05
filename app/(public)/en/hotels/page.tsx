import type { Metadata } from "next";
import HotelsDirectoryPage from "@/components/public/HotelsDirectoryPage";
import { en } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/en/hotels";

export const metadata: Metadata = {
  title: "Punta Cana Hotels, Resorts, Apartments & Vacation Homes | Proactivitis",
  description:
    "Compare Punta Cana hotels, resorts, apartments and vacation homes. Request a stay quote with transfers and tours connected.",
  keywords: [
    "punta cana hotels",
    "all inclusive resorts punta cana",
    "where to stay in punta cana",
    "punta cana accommodation",
    "punta cana apartments",
    "punta cana villas",
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
    title: "Punta Cana Hotels, Resorts, Apartments & Vacation Homes | Proactivitis",
    description:
      "Compare hotels, resorts, apartments and villas in Punta Cana and request your quote in minutes.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana Hotels, Resorts, Apartments & Vacation Homes | Proactivitis",
    description: "Request hotel, apartment and villa quotes in Punta Cana with personalized assistance."
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
