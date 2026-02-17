import type { Metadata } from "next";
import PremiumTransferLandingPage from "@/components/public/PremiumTransferLandingPage";
import { getPremiumTransferContentOverrides } from "@/lib/siteContent";
import { PROACTIVITIS_URL } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPremiumTransferContentOverrides("es");
  const path = "/punta-cana/premium-transfer-services";
  const canonical = `${PROACTIVITIS_URL}${path}`;
  const image = content.heroBackgroundImage || "/transfer/suv.png";
  return {
    title: content.seoTitle,
    description: content.seoDescription,
    robots: {
      index: true,
      follow: true
    },
    keywords: [
      "punta cana premium transfer services",
      "cadillac escalade punta cana",
      "suburban transfer punta cana",
      "vip airport transfer punta cana",
      "luxury transfer punta cana"
    ],
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
      siteName: "Proactivitis",
      type: "website",
      locale: "es_DO",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: content.seoTitle,
      description: content.seoDescription,
      images: [image]
    }
  };
}

export default async function Page() {
  return <PremiumTransferLandingPage locale="es" />;
}
