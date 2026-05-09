import GeminiSeoLandingPage, { buildGeminiSeoLandingMetadata } from "@/components/public/GeminiSeoLandingPage";
import { fr } from "@/lib/translations";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildGeminiSeoLandingMetadata(slug, fr);
}

export default async function ProDiscoveryFrenchGeminiSeoLanding({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  return <GeminiSeoLandingPage slug={slug} locale={fr} preview={resolvedSearchParams.preview === "1"} />;
}
