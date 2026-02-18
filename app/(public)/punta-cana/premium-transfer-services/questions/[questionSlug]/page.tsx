import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TransferQuestionSalesLandingPage, {
  findQuestionLandingOrNull
} from "@/components/public/TransferQuestionSalesLandingPage";
import { transferQuestionSalesLandingSlugs } from "@/data/transfer-question-sales-landings";
import { PROACTIVITIS_URL } from "@/lib/seo";

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
  return {
    title: entry.seoTitle.es,
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

