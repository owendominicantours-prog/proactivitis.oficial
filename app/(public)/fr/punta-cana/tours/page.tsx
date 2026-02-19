import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/tours";

export const metadata: Metadata = {
  title: "Excursions Punta Cana: Saona, Buggy, Party Boat et Catamaran | Proactivitis",
  description:
    "Comparez et reservez des excursions a Punta Cana avec pickup hotel: Ile Saona, buggy, party boat, catamaran et activites populaires.",
  keywords: [
    "meilleurs tours punta cana",
    "excursion ile saona punta cana",
    "tour buggy punta cana",
    "party boat punta cana",
    "catamaran punta cana"
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
    title: "Excursions Punta Cana: Saona, Buggy, Party Boat et Catamaran | Proactivitis",
    description:
      "Reservez des excursions a Punta Cana avec pickup hotel, prix clairs et confirmation rapide.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Excursions Punta Cana: Saona, Buggy, Party Boat et Catamaran | Proactivitis",
    description: "Reservez des activites incontournables a Punta Cana avec pickup hotel et support 24/7."
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
  return <PuntaCanaToursHub locale={fr} />;
}
