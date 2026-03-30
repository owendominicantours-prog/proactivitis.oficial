import type { Metadata } from "next";
import ProDiscoveryTransferDetailPage from "@/components/public/ProDiscoveryTransferDetailPage";
import { allLandings } from "@/data/transfer-landings";
import { en } from "@/lib/translations";
import { PROACTIVITIS_URL } from "@/lib/seo";

export async function generateMetadata({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}): Promise<Metadata> {
  const { landingSlug } = await params;
  const landing = allLandings().find((item) => item.landingSlug === landingSlug);
  if (!landing) return { title: "ProDiscovery | Transfer not found" };
  const canonical = `${PROACTIVITIS_URL}/en/prodiscovery/transfer/${landingSlug}`;
  return {
    title: `${landing.heroTitle} | ProDiscovery`,
    description: landing.metaDescription,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/transfer/${landingSlug}`,
        en: `/en/prodiscovery/transfer/${landingSlug}`,
        fr: `/fr/prodiscovery/transfer/${landingSlug}`,
        "x-default": `/prodiscovery/transfer/${landingSlug}`
      }
    }
  };
}

export default async function ProDiscoveryTransferPageEn({
  params,
  searchParams
}: {
  params: Promise<{ landingSlug: string }>;
  searchParams?: Promise<{ kw?: string }>;
}) {
  const { landingSlug } = await params;
  const sp = (await searchParams) ?? {};
  return <ProDiscoveryTransferDetailPage locale={en} landingSlug={landingSlug} reviewKeyword={sp.kw} />;
}
