import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/fr/punta-cana/tours";

export const metadata: Metadata = {
  title: "Tours à Punta Cana | Saona, Buggy & Party Boat",
  description:
    "Découvrez les meilleurs tours à Punta Cana avec pickup hôtel, prix transparents et confirmation instantanée. Saona, buggy, party boat et plus.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/tours",
      en: "/en/punta-cana/tours",
      fr: "/fr/punta-cana/tours"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaToursPage() {
  return <PuntaCanaToursHub locale={fr} />;
}
