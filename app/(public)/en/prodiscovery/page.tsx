import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { en } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/en/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Find top-rated tours and transfers | Proactivitis",
  description:
    "Compare tours and transfers by reputation and verified reviews before booking. ProDiscovery connects discovery with direct booking.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/prodiscovery",
      en: "/en/prodiscovery",
      fr: "/fr/prodiscovery",
      "x-default": "/prodiscovery"
    }
  },
  openGraph: {
    title: "ProDiscovery: Find top-rated tours and transfers | Proactivitis",
    description:
      "Compare tours and transfers by reputation and verified reviews before booking.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery | Proactivitis",
    description: "Discover top-rated experiences and book with confidence."
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function ProDiscoveryEnglishPage() {
  return <ProDiscoveryPage locale={en} />;
}
