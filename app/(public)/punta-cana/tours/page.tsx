import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/tours";

export const metadata: Metadata = {
  title: "Mejores Tours en Punta Cana: Saona, Buggy y Party Boat | Proactivitis",
  description:
    "Compara y reserva los mejores tours en Punta Cana con recogida en hotel: Isla Saona, buggies, party boat, catamaran y mas actividades con confirmacion inmediata.",
  keywords: [
    "mejores tours en punta cana",
    "excursiones punta cana saona",
    "buggy punta cana",
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
  return <PuntaCanaToursHub locale={es} />;
}
