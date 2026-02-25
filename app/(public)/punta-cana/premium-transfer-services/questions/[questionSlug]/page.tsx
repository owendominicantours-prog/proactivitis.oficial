import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransferQuestionSalesLandingPage, {
  findQuestionLandingOrNull
} from "@/components/public/TransferQuestionSalesLandingPage";
import { transferQuestionSalesLandingSlugs } from "@/data/transfer-question-sales-landings";
import { PROACTIVITIS_URL } from "@/lib/seo";
import { ensureLeadingCapital } from "@/lib/text-format";

export async function generateStaticParams() {
  return transferQuestionSalesLandingSlugs.map((questionSlug) => ({ questionSlug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ questionSlug: string }>;
}): Promise<Metadata> {
  const { questionSlug } = await params;
  const entry = findQuestionLandingOrNull(questionSlug);
  if (!entry) return {};
  const path = `/punta-cana/premium-transfer-services/questions/${entry.slug}`;
  const canonical = `${PROACTIVITIS_URL}${path}`;
  const image = `${PROACTIVITIS_URL}/transfer/suv.png`;
  const seoTitle = ensureLeadingCapital(entry.seoTitle.es);
  return {
    title: seoTitle,
    description: entry.seoDescription.es,
    keywords: entry.keywords,
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
      description: entry.seoDescription.es,
      url: canonical,
      siteName: "Proactivitis",
      type: "website",
      locale: "es_DO",
      images: [image]
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: entry.seoDescription.es,
      images: [image]
    }
  };
}

export default async function TransferQuestionSalesPage({
  params
}: {
  params: Promise<{ questionSlug: string }>;
}) {
  const { questionSlug } = await params;
  if (!findQuestionLandingOrNull(questionSlug)) return notFound();
  return <TransferQuestionSalesLandingPage locale="es" questionSlug={questionSlug} />;
}
