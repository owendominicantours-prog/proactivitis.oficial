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

export default async function SpanishPuntaCanaLandingPage({ params, searchParams }: Props) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { preview?: string })
  ]);
  return <GeminiSeoLandingPage slug={slug} locale={es} preview={resolvedSearchParams.preview === "1"} />;
}
