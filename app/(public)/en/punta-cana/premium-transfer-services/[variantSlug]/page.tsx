import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import {
  findPremiumTransferMarketLandingBySlug,
  premiumTransferMarketLandingSlugs
} from "@/data/premium-transfer-market-landings";
import {
  buildPremiumTransferKeywords,
  buildPremiumTransferLanguageAlternates,
  buildPremiumTransferSeoDescription,
  buildPremiumTransferSeoTitle
} from "@/lib/premiumTransferSeo";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { ensureLeadingCapital } from "@/lib/text-format";

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
  const seoTitle = ensureLeadingCapital(buildPremiumTransferSeoTitle("en", variant.seoTitle.en));
  const seoDescription = buildPremiumTransferSeoDescription("en", variant.seoDescription.en);

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: buildPremiumTransferKeywords("en", variant.keyword.en),
    alternates: {
      canonical,
      languages: buildPremiumTransferLanguageAlternates(path)
    },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "en_US",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
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
