import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/en/traslado";

export const metadata: Metadata = {
  title: "Punta Cana airport transfers | Proactivitis",
  description: "Book private airport and hotel transfers in Punta Cana with fixed pricing, flight tracking, and 24/7 support.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/traslado",
      en: "/en/traslado",
      fr: "/fr/traslado"
    }
  }
};

export default function EnglishTrasladoPage() {
  return <PublicTransferPage locale={en} />;
}
