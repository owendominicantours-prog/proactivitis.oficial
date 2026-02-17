import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";

const canonicalUrl = "https://proactivitis.com/en";

export const metadata: Metadata = {
  title: "Punta Cana Tours, Excursions and Airport Transfers | Proactivitis",
  description:
    "Book Punta Cana tours, top excursions, and private airport transfers with clear pricing, verified operators, and instant confirmation.",
  keywords: [
    "punta cana tours",
    "punta cana excursions",
    "punta cana airport transfers",
    "things to do in punta cana",
    "private transfer punta cana"
  ],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/",
      en: "/en",
      fr: "/fr",
      "x-default": "/"
    }
  },
  openGraph: {
    title: "Punta Cana Tours, Excursions and Airport Transfers | Proactivitis",
    description:
      "Book Punta Cana tours, excursions, and private airport transfers with transparent pricing and instant confirmation.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Punta Cana Tours, Excursions and Airport Transfers | Proactivitis",
    description: "Book top Punta Cana experiences and private airport transfers in minutes."
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";

export default function EnglishHomePage() {
  return <PublicHomePage locale={en} />;
}
