import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/en/traslado";

export const metadata: Metadata = {
  title: "Punta Cana Airport Transfers and Hotel Transportation | Proactivitis",
  description:
    "Book private Punta Cana airport transfers from PUJ to hotels and resorts with fixed rates, flight tracking, bilingual drivers, and instant confirmation.",
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
  }
};

export default function EnglishTrasladoPage() {
  return <PublicTransferPage locale={en} />;
}
