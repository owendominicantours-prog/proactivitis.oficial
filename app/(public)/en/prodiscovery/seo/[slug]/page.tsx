import GeminiSeoLandingPage, { buildGeminiSeoLandingMetadata } from "@/components/public/GeminiSeoLandingPage";
import { en } from "@/lib/translations";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildGeminiSeoLandingMetadata(slug, en);
}

export default async function ProDiscoveryEnglishGeminiSeoLanding({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  return <GeminiSeoLandingPage slug={slug} locale={en} preview={resolvedSearchParams.preview === "1"} />;
}
