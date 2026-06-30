import type { Metadata } from "next";
import ProDiscoveryPage from "@/components/public/ProDiscoveryPage";
import { buildProDiscoveryHomeMetadata } from "@/lib/prodiscoverySeo";
import { en } from "@/lib/translations";

const hasSearchParams = (params?: Record<string, string | string[] | undefined>) =>
  Boolean(params && Object.keys(params).length > 0);

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  return buildProDiscoveryHomeMetadata(en, { noindex: hasSearchParams(resolvedSearchParams) });
}

export default async function ProDiscoveryEnglishPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ProDiscoveryPage locale={en} searchParams={(await searchParams) ?? {}} />;
}
