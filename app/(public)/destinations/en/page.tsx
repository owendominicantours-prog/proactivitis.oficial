import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/en/destinos";

export const metadata: Metadata = {
  title: "Verified destinations | Tours and transfers with Proactivitis",
  description:
    "Explore destinations with tours, excursions, and private transfers. Compare zones, clear prices, 24/7 support.",
  keywords: ["destinations", "tours", "excursions", "transfers", "activities", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/destinos",
      en: "/en/destinos",
      fr: "/fr/destinos"
    }
  }
};

export default function EnglishDestinationsPage() {
  return <PublicDestinationsPage locale={en} />;
}
