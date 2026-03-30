import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProDiscoveryTopPage from "@/components/public/ProDiscoveryTopPage";
import { PROACTIVITIS_URL } from "@/lib/seo";
import {
  isValidDiscoveryCategory,
  isValidDiscoveryDestination
} from "@/lib/prodiscovery";

export async function generateMetadata({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}): Promise<Metadata> {
  const { destination, category } = await params;
  if (!isValidDiscoveryDestination(destination) || !isValidDiscoveryCategory(category)) {
    return { title: "ProDiscovery" };
  }
  const canonical = `${PROACTIVITIS_URL}/en/prodiscovery/top/${destination}/${category}`;
  return {
    title: `Top ${category} in ${destination} | ProDiscovery`,
    description: `Top ${category} in ${destination} based on verified reviews, recency, and reputation.`,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/top/${destination}/${category}`,
        en: `/en/prodiscovery/top/${destination}/${category}`,
        fr: `/fr/prodiscovery/top/${destination}/${category}`,
        "x-default": `/prodiscovery/top/${destination}/${category}`
      }
    }
  };
}

export default async function ProDiscoveryTopEnPage({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}) {
  const { destination, category } = await params;
  if (!isValidDiscoveryDestination(destination) || !isValidDiscoveryCategory(category)) return notFound();
  return <ProDiscoveryTopPage locale="en" destination={destination} category={category} />;
}
