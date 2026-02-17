import type { Metadata } from "next";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { PROACTIVITIS_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPremiumTransferContentOverrides("fr");
  const path = "/punta-cana/premium-transfer-services";
  const canonical = `${PROACTIVITIS_URL}/fr${path}`;
  return {
    title: content.seoTitle,
    description: content.seoDescription,
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
      title: content.seoTitle,
      description: content.seoDescription,
      url: canonical,
      images: [content.heroBackgroundImage || "/transfer/suv.png"]
    }
  };
}

export default async function Page() {
  return <PremiumTransferLandingPage locale="fr" />;
}
