import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/fr`;

export const metadata: Metadata = {
  title: SITE_CONFIG.homeTitle.fr,
  description: SITE_CONFIG.homeDescription.fr,
  keywords: [
    "tours punta cana",
    "excursions punta cana",
    "transferts punta cana",
    "transfert aeroport punta cana",
    "activites punta cana"
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
    title: SITE_CONFIG.homeTitle.fr,
    description: SITE_CONFIG.homeDescription.fr,
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.homeTitle.fr,
    description: SITE_CONFIG.homeDescription.fr
  },
  robots: {
    index: true,
    follow: true
  }
};

export const runtime = "nodejs";

export default function FrenchHomePage() {
  return <PublicHomePage locale={fr} />;
}
