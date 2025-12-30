import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";

const canonicalUrl = "https://proactivitis.com/tours";

export const metadata: Metadata = {
  title: "Tours y Experiencias Exclusivas | Reserve con Confianza en Proactivitis",
  description:
    "Explore nuestra colección de tours y actividades premium. Confirmación inmediata, pagos seguros y soporte global 24/7 para sus vacaciones perfectas.",
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
