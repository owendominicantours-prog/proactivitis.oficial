import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicTransferPage from "@/components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/en/traslado";

export const metadata: Metadata = {
  title: "Private Transfers | Book with Proactivitis",
  description:
    "Book private transfers with verified drivers, clear prices, and instant confirmation. Airport, hotel, and city connections with 24/7 support.",
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
