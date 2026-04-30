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

export default async function FrenchGeminiSeoPage({ params, searchParams }: Props) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { preview?: string })
  ]);
  return <GeminiSeoLandingPage slug={slug} locale={fr} preview={resolvedSearchParams.preview === "1"} />;
}
