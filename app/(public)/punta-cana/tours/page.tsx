import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/punta-cana/tours";

export const metadata: Metadata = {
  title: "Excursiones Punta Cana: Isla Saona, Buggy, Party Boat y Catamaran | Proactivitis",
  description:
    "Compara y reserva excursiones en Punta Cana con recogida en hotel: Isla Saona, buggy, party boat, catamaran y experiencias top.",
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
  },
  openGraph: {
    title: "Excursiones Punta Cana: Isla Saona, Buggy, Party Boat y Catamaran | Proactivitis",
    description:
      "Reserva excursiones en Punta Cana con pickup en hotel, precio claro y confirmacion rapida.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Excursiones Punta Cana: Isla Saona, Buggy, Party Boat y Catamaran | Proactivitis",
    description: "Reserva actividades top en Punta Cana con recogida en hotel y soporte 24/7."
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
  return <PuntaCanaToursHub locale={es} />;
}
