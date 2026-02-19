import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/en/punta-cana/tours";

export const metadata: Metadata = {
  title: "Punta Cana Excursions: Saona, Buggy, Party Boat and Catamaran | Proactivitis",
  description:
    "Compare and book Punta Cana excursions with hotel pickup, including Saona Island, buggy tours, party boat cruises, and catamaran experiences.",
  keywords: [
    "best punta cana tours",
    "saona island tour punta cana",
    "buggy tour punta cana",
    "punta cana party boat",
    "catamaran tour punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/tours",
      en: "/en/punta-cana/tours",
      fr: "/fr/punta-cana/tours",
      "x-default": "/punta-cana/tours"
    }
  },
  openGraph: {
    title: "Punta Cana Excursions: Saona, Buggy, Party Boat and Catamaran | Proactivitis",
    description:
      "Book top Punta Cana excursions with hotel pickup, clear pricing, and local support.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana Excursions: Saona, Buggy, Party Boat and Catamaran | Proactivitis",
    description: "Book top Punta Cana activities with hotel pickup, clear pricing, and fast confirmation."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaToursPage() {
  return <PuntaCanaToursHub locale={en} />;
}
