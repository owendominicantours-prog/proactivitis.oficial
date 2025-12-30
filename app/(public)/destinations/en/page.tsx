import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicDestinationsPage from "@/components/public/PublicDestinationsPage";

const canonicalUrl = "https://proactivitis.com/en/destinos";

export const metadata: Metadata = {
  title: "Curated Destinations | Proactivitis Global Destinations",
  description:
    "Explore our VIP list of global destinations. Only audited regions and vetted local teams for premium experiences.",
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
