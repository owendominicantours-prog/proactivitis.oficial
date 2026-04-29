import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/excursiones";

export const metadata: Metadata = {
  title: "Excursiones en Punta Cana: Saona, Buggy, Catamaran y mas | Proactivitis",
  description:
    "Reserva excursiones en Punta Cana con recogida en hotel, precios claros, fotos reales y soporte local 24/7.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/excursiones",
      en: "/en/tours",
      fr: "/fr/tours",
      "x-default": "/excursiones"
    }
  },
  robots: { index: true, follow: true }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ExcursionesPage({ searchParams }: { searchParams?: Promise<TourSearchParams> }) {
  return <PublicToursPage searchParams={searchParams} locale={es} />;
}
