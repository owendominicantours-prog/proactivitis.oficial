import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProDiscoveryTopPage from "@/components/public/ProDiscoveryTopPage";
import { buildProDiscoveryTopMetadata } from "@/lib/prodiscoverySeo";
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
  return buildProDiscoveryTopMetadata({ locale: "en", destination, category });
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
