import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/`;

export const metadata: Metadata = {
  title: SITE_CONFIG.homeTitle.es,
  description: SITE_CONFIG.homeDescription.es,
  keywords: [
    "tours punta cana",
    "excursiones punta cana",
    "traslados punta cana",
    "transfer aeropuerto punta cana",
    "things to do punta cana"
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
    title: SITE_CONFIG.homeTitle.es,
    description: SITE_CONFIG.homeDescription.es,
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.homeTitle.es,
    description: SITE_CONFIG.homeDescription.es
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";

export default function SpanishHomePage() {
  return <PublicHomePage locale={es} />;
}
