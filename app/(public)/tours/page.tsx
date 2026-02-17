import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/tours";

export const metadata: Metadata = {
  title: "Mejores Tours y Excursiones en Punta Cana | Proactivitis",
  description:
    "Reserva los mejores tours en Punta Cana con recogida en hotel, precios claros y confirmacion inmediata. Saona, buggies, catamaran, party boat y mas.",
  keywords: [
    "mejores tours punta cana",
    "excursiones punta cana",
    "isla saona tour",
    "buggy punta cana",
    "party boat punta cana"
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
    title: "Mejores Tours y Excursiones en Punta Cana | Proactivitis",
    description:
      "Reserva tours y excursiones en Punta Cana con recogida en hotel y confirmacion inmediata.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Mejores Tours y Excursiones en Punta Cana | Proactivitis",
    description: "Reserva tours en Punta Cana con precios claros y soporte 24/7."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SpanishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={es} />;
}
