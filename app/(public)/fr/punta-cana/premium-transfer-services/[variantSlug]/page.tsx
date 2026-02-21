import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import {
  findPremiumTransferMarketLandingBySlug,
  premiumTransferMarketLandingSlugs
} from "@/data/premium-transfer-market-landings";
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

  const fallback = await getPremiumTransferContentOverrides("fr");
  const path = `/punta-cana/premium-transfer-services/${variant.slug}`;
  const canonical = `${PROACTIVITIS_URL}/fr${path}`;
  const image = fallback.heroBackgroundImage || "/transfer/suv.png";
  const seoTitle = ensureLeadingCapital(variant.seoTitle.fr);

  return {
    title: seoTitle,
    description: variant.seoDescription.fr,
    keywords: [variant.keyword.fr, "punta cana premium transfer services", "transfert vip punta cana"],
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
      title: seoTitle,
      description: variant.seoDescription.fr,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "fr_FR",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: variant.seoDescription.fr,
      images: [image]
    }
  };
}

export default async function PremiumTransferVariantPageFR({
  params
}: {
  params: Promise<{ variantSlug: string }>;
}) {
  const { variantSlug } = await params;
  const variant = findPremiumTransferMarketLandingBySlug(variantSlug);
  if (!variant) return notFound();
  return <PremiumTransferLandingPage locale="fr" variant={variant} />;
}
