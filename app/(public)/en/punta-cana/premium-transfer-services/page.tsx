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
  const content = await getPremiumTransferContentOverrides("en");
  const path = "/punta-cana/premium-transfer-services";
  const canonical = `${PROACTIVITIS_URL}/en${path}`;
  const image = content.heroBackgroundImage || "/transfer/suv.png";
  const seoTitle = ensureLeadingCapital(
    buildPremiumTransferSeoTitle("en", content.seoTitle ?? "Punta Cana Premium Transfer Services | Proactivitis")
  );
  const seoDescription = buildPremiumTransferSeoDescription("en", content.seoDescription);
  return {
    title: seoTitle,
    description: seoDescription,
    robots: {
      index: true,
      follow: true
    },
    keywords: buildPremiumTransferKeywords("en", "luxury airport pickup punta cana"),
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

export default async function Page() {
  return <PremiumTransferLandingPage locale="en" />;
}
