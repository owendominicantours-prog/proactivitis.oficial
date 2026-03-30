import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { en } from "@/lib/translations";

const canonicalUrl = "https://proactivitis.com/en/prodiscovery";

export const metadata: Metadata = {
  title: "ProDiscovery: Tour, Hotel and Transfer Reviews",
  description: "Comparison marketplace with filters, photos, and reviews for tours, hotels, and transfers.",
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
    title: "ProDiscovery: Tour, Hotel and Transfer Reviews",
    description: "Compare by rating, price, photos, and verified traveler comments.",
    url: canonicalUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ProDiscovery",
    description: "Explore listings with advanced filters and real feedback."
  },
  robots: { index: true, follow: true }
};

export default async function ProDiscoveryEnglishPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={en} searchParams={(await searchParams) ?? {}} />;
}
