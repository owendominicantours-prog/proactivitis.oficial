import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { buildProDiscoveryHomeMetadata } from "@/lib/prodiscoverySeo";
import { fr } from "@/lib/translations";

export const metadata: Metadata = buildProDiscoveryHomeMetadata(fr);

export default async function ProDiscoveryFrenchPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={fr} searchParams={(await searchParams) ?? {}} />;
}
