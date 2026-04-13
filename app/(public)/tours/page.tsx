import type { Metadata } from "next";
import type { TourSearchParams } from "@/lib/filterBuilder";
import { es } from "@/lib/translations";
import PublicToursPage from "@/components/public/PublicToursPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/tours`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Funjet Tour Oprador"
      : "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Reserva tours y excursiones en Punta Cana con atencion directa, precios claros y confirmacion rapida. Saona, buggy, catamaran, party boat y mas."
      : "Reserva tours y excursiones en Punta Cana con recogida en hotel, precios claros y soporte 24/7. Saona, buggy, catamaran, party boat y mas experiencias.",
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
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Funjet Tour Oprador"
        : "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva tours y excursiones en Punta Cana con atencion directa y precios claros."
        : "Reserva tours y excursiones en Punta Cana con pickup en hotel, precios claros y soporte local.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Tours en Punta Cana | Funjet Tour Oprador"
        : "Tours en Punta Cana: Saona, Buggy, Catamaran y Party Boat | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva tours en Punta Cana con confirmacion rapida y soporte directo."
        : "Reserva tours en Punta Cana con pickup en hotel, precio claro y soporte 24/7."
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
