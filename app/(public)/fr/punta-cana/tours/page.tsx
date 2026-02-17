import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/tours";

export const metadata: Metadata = {
  title: "Meilleurs Tours a Punta Cana: Saona, Buggy et Party Boat | Proactivitis",
  description:
    "Comparez et reservez les meilleurs tours a Punta Cana avec pickup hotel: Ile Saona, buggy, party boat, catamaran et autres activites populaires.",
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
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaToursPage() {
  return <PuntaCanaToursHub locale={fr} />;
}
