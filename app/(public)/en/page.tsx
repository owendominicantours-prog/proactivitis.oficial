import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicHomePage from "@/components/public/PublicHomePage";
import { SITE_CONFIG } from "@/lib/site-config";

const canonicalUrl = `${SITE_CONFIG.url}/en`;

export const metadata: Metadata = {
  title: SITE_CONFIG.homeTitle.en,
  description: SITE_CONFIG.homeDescription.en,
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
    title: SITE_CONFIG.homeTitle.en,
    description: SITE_CONFIG.homeDescription.en,
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.homeTitle.en,
    description: SITE_CONFIG.homeDescription.en
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
