import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/tours";

export const metadata: Metadata = {
  title: "Tours y actividades | Proactivitis",
  description:
    "Reserva tours y actividades verificadas con precios claros y confirmacion inmediata. Soporte humano 24/7 para tus viajes.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/tours",
      en: "/en/tours",
      fr: "/fr/tours"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SpanishToursPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={es} />;
}
