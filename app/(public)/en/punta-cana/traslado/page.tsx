import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/en/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Punta Cana Transfers: PUJ Airport and Hotels | Proactivitis",
  description:
    "Book Punta Cana transfers from PUJ airport to Bavaro, Cap Cana, Uvero Alto, and resorts with fixed rates, professional drivers, and 24/7 support.",
  keywords: [
    "punta cana transfers",
    "puj airport transfer",
    "bavaro transfer",
    "cap cana transfer",
    "uvero alto transfer"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/traslado",
      en: "/en/punta-cana/traslado",
      fr: "/fr/punta-cana/traslado",
      "x-default": "/punta-cana/traslado"
    }
  },
  openGraph: {
    title: "Punta Cana Transfers: PUJ Airport and Hotels | Proactivitis",
    description:
      "Book Punta Cana transfers from PUJ airport to Bavaro, Cap Cana, Uvero Alto, and resorts with fixed rates and 24/7 support.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana Transfers: PUJ Airport and Hotels | Proactivitis",
    description: "Private PUJ airport transfers to Punta Cana hotels with professional drivers."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";
export const revalidate = 3600;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={en} />;
}
