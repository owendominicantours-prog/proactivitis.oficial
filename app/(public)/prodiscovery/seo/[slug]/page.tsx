import GeminiSeoLandingPage, { buildGeminiSeoLandingMetadata } from "@/components/public/GeminiSeoLandingPage";
import { es } from "@/lib/translations";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildGeminiSeoLandingMetadata(slug, es);
}

export default async function ProDiscoveryGeminiSeoLanding({ params, searchParams }: Props) {
  const { slug } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  return <GeminiSeoLandingPage slug={slug} locale={es} preview={resolvedSearchParams.preview === "1"} />;
}
