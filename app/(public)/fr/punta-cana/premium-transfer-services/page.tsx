import type { Metadata } from "next";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import {
  buildPremiumTransferKeywords,
  buildPremiumTransferLanguageAlternates,
  buildPremiumTransferSeoDescription,
  buildPremiumTransferSeoTitle
} from "@/lib/premiumTransferSeo";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { ensureLeadingCapital } from "@/lib/text-format";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPremiumTransferContentOverrides("fr");
  const path = "/punta-cana/premium-transfer-services";
  const canonical = `${PROACTIVITIS_URL}/fr${path}`;
  const image = content.heroBackgroundImage || "/transfer/suv.png";
  const seoTitle = ensureLeadingCapital(
    buildPremiumTransferSeoTitle("fr", content.seoTitle ?? "Punta Cana Premium Transfer Services | Proactivitis")
  );
  const seoDescription = buildPremiumTransferSeoDescription("fr", content.seoDescription);
  return {
    title: seoTitle,
    description: seoDescription,
    robots: {
      index: true,
      follow: true
    },
    keywords: buildPremiumTransferKeywords("fr", "transfert premium punta cana"),
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
      locale: "fr_FR",
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

export default async function Page() {
  return <PremiumTransferLandingPage locale="fr" />;
}
