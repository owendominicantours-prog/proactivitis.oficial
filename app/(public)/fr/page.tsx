import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/fr";

export const metadata: Metadata = {
  title: "Proactivitis | Tours, transferts et activites a reserver",
  description:
    "Reservez des tours, transferts et activites avec Proactivitis. Prix clairs, prestataires verifies et confirmation immediate.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr"
    }
  }
};

export const runtime = "nodejs";

export default function FrenchHomePage() {
  return <PublicHomePage locale={fr} />;
}
