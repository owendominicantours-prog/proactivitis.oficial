import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import {
  findPremiumTransferMarketLandingBySlug,
  premiumTransferMarketLandingSlugs
} from "@/data/premium-transfer-market-landings";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { PROACTIVITIS_URL } from "@/lib/seo";

export async function generateStaticParams() {
  return premiumTransferMarketLandingSlugs.map((variantSlug) => ({ variantSlug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ variantSlug: string }>;
}): Promise<Metadata> {
  const { variantSlug } = await params;
  const variant = findPremiumTransferMarketLandingBySlug(variantSlug);
  if (!variant) return {};

  const fallback = await getPremiumTransferContentOverrides("en");
  const path = `/punta-cana/premium-transfer-services/${variant.slug}`;
  const canonical = `${PROACTIVITIS_URL}/en${path}`;
  const image = fallback.heroBackgroundImage || "/transfer/suv.png";

  return {
    title: variant.seoTitle.en,
    description: variant.seoDescription.en,
    keywords: [variant.keyword.en, "punta cana premium transfer services", "vip airport transfer punta cana"],
    alternates: {
      canonical,
      languages: {
        es: path,
        en: `/en${path}`,
        fr: `/fr${path}`,
        "x-default": path
      }
    },
    openGraph: {
      title: variant.seoTitle.en,
      description: variant.seoDescription.en,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "en_US",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: variant.seoTitle.en,
      description: variant.seoDescription.en,
      images: [image]
    }
  };
}

export default async function PremiumTransferVariantPageEN({
  params
}: {
  params: Promise<{ variantSlug: string }>;
}) {
  const { variantSlug } = await params;
  const variant = findPremiumTransferMarketLandingBySlug(variantSlug);
  if (!variant) return notFound();
  return <PremiumTransferLandingPage locale="en" variant={variant} />;
}

