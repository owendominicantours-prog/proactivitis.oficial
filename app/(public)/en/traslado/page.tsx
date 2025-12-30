import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/en/traslado";

export const metadata: Metadata = {
  title: "Private Transfers by Proactivitis",
  description:
    "Book your private transfer with bilingual chauffeurs, fixed prices, and total flexibility. Proactivitis connects flights, hotels, and trusted partners across the region.",
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
