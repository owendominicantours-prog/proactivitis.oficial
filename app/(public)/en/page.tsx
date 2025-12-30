import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/en";

export const metadata: Metadata = {
  title: "Proactivitis | Private Transfers & Top Tours",
  description:
    "Book private transfers and curated tours with Proactivitis. Trusted partners, transparent prices, and instant confirmation worldwide.",
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

export default function EnglishHomePage() {
  return <PublicHomePage locale={en} />;
}
