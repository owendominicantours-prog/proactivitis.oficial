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
  const canonical = `${PROACTIVITIS_URL}/prodiscovery/top/${destination}/${category}`;
  return {
    title: `Top ${category} ${destination} | ProDiscovery`,
    description: `Ranking de ${category} en ${destination} basado en resenas verificadas, recencia y reputacion.`,
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

export default async function ProDiscoveryTopEsPage({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}) {
  const { destination, category } = await params;
  if (!isValidDiscoveryDestination(destination) || !isValidDiscoveryCategory(category)) return notFound();
  return <ProDiscoveryTopPage locale="es" destination={destination} category={category} />;
}
