import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/tours";

export const metadata: Metadata = {
  title: "Tours en Punta Cana | Excursiones, Saona y Buggy",
  description:
    "Descubre los mejores tours en Punta Cana con recogida en hotel, precios claros y confirmación inmediata. Saona, buggy, party boat y más.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/tours",
      en: "/en/punta-cana/tours",
      fr: "/fr/punta-cana/tours"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaToursPage() {
  return <PuntaCanaToursHub locale={es} />;
}
