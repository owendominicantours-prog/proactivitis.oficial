import type { Metadata } from "next";
import { en } from "../../../../lib/translations";
import PublicTransferPage from "../../../../components/public/PublicTransferPage";

const canonicalUrl = "https://proactivitis.com/en/traslado";

export const metadata: Metadata = {
  title: "Proactivitis Private Transfers",
  description:
    "Book your private transfer with bilingual drivers, fixed pricing, and 24/7 support. Door-to-door service, instant confirmation, and verified vehicles across the region.",
  keywords: ["private transfers", "airport transfer", "Punta Cana", "bilingual drivers", "Proactivitis"],
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
