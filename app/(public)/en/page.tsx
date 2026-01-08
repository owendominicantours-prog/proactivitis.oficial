import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/en";

export const metadata: Metadata = {
  title: "Proactivitis | Tours, Transfers & Activities to Book",
  description:
    "Book tours, transfers, and activities with Proactivitis. Clear pricing, verified providers, and instant confirmation.",
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
