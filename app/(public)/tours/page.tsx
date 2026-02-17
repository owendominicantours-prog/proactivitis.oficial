import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/tours";

export const metadata: Metadata = {
  title: "Tours y excursiones en Punta Cana | Proactivitis",
  description:
    "Reserva tours, excursiones y actividades en Punta Cana con precios claros, recogida en hotel y confirmacion inmediata. Compara opciones y reserva en minutos.",
  keywords: [
    "tours punta cana",
    "excursiones punta cana",
    "actividades punta cana",
    "tours con recogida en hotel",
    "mejores tours punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/tours",
      en: "/en/tours",
      fr: "/fr/tours",
      "x-default": "/tours"
    }
  },
  openGraph: {
    title: "Tours y excursiones en Punta Cana | Proactivitis",
    description:
      "Reserva tours, excursiones y actividades en Punta Cana con recogida en hotel y confirmacion inmediata.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Tours y excursiones en Punta Cana | Proactivitis",
    description: "Reserva tours y excursiones en Punta Cana con recogida en hotel y precios claros."
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SpanishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={es} />;
}
