import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { buildProDiscoveryHomeMetadata } from "@/lib/prodiscoverySeo";
import { en } from "@/lib/translations";

export const metadata: Metadata = buildProDiscoveryHomeMetadata(en);

export default async function ProDiscoveryEnglishPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={en} searchParams={(await searchParams) ?? {}} />;
}
