import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/en/traslado`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Punta Cana airport transfer (PUJ) to hotels and resorts | Funjet Tour Oprador"
      : "Punta Cana Airport Transfer (PUJ) to Hotels and Resorts | Proactivitis",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Book private Punta Cana airport transfers with fixed rates, flight tracking, and fast WhatsApp confirmation."
      : "Book private Punta Cana airport transfers from PUJ to hotels and resorts with fixed rates, flight tracking, bilingual drivers, and 24/7 support.",
  keywords: [
    "punta cana airport transfer",
    "private transfer punta cana",
    "puj transfer",
    "punta cana hotel transportation",
    "punta cana taxi service"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/traslado",
      en: "/en/traslado",
      fr: "/fr/traslado",
      "x-default": "/traslado"
    }
  },
  openGraph: {
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Punta Cana airport transfer (PUJ) to hotels and resorts | Funjet Tour Oprador"
        : "Punta Cana Airport Transfer (PUJ) to Hotels and Resorts | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Book private Punta Cana airport transfers with fixed rates and flight tracking."
        : "Book private Punta Cana airport transfers from PUJ to hotels and resorts with fixed rates and flight tracking.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title:
      SITE_CONFIG.variant === "funjet"
        ? "Punta Cana airport transfer | Funjet Tour Oprador"
        : "Punta Cana Airport Transfer (PUJ) to Hotels and Resorts | Proactivitis",
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Book private PUJ airport transfers with fixed rates and direct support."
        : "Book private PUJ airport transfers with fixed rates, professional drivers, and local support."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function EnglishTrasladoPage() {
  return <PublicTransferPage locale={en} />;
}
