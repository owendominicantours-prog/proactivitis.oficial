import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { buildProDiscoveryHomeMetadata } from "@/lib/prodiscoverySeo";
import { es } from "@/lib/translations";

export const metadata: Metadata = buildProDiscoveryHomeMetadata(es);

export default async function ProDiscoverySpanishPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={es} searchParams={(await searchParams) ?? {}} />;
}
