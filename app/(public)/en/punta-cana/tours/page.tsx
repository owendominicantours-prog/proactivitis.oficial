import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PuntaCanaToursHub from "@/components/public/PuntaCanaToursHub";

const canonicalUrl = "https://proactivitis.com/en/punta-cana/tours";

export const metadata: Metadata = {
  title: "Punta Cana Tours | Saona, Buggy & Party Boat",
  description:
    "Explore the best Punta Cana tours with hotel pickup, clear pricing, and instant confirmation. Saona, buggy, party boat, and more.",
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
  return <PuntaCanaToursHub locale={en} />;
}
