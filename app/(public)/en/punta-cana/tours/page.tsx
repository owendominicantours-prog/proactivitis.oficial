import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/en/punta-cana/tours";

export const metadata: Metadata = {
  title: "Best Punta Cana Tours: Saona, Buggy and Party Boat | Proactivitis",
  description:
    "Compare and book the best Punta Cana tours with hotel pickup, including Saona Island, buggy tours, party boat cruises, and catamaran experiences.",
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
    title: "Best Punta Cana Tours: Saona, Buggy and Party Boat | Proactivitis",
    description:
      "Compare and book top Punta Cana tours with hotel pickup: Saona Island, buggy tours, party boat cruises, and catamaran trips.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Punta Cana Tours: Saona, Buggy and Party Boat | Proactivitis",
    description: "Book top-rated Punta Cana activities with instant confirmation."
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
