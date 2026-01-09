import { fr } from "@/lib/translations";
import { ExcursionKeywordLandingPage, buildExcursionLandingMetadata, excursionLandingSlugs } from "@/components/public/ExcursionKeywordLandingPage";

export async function generateStaticParams() {
  return excursionLandingSlugs.map((landingSlug) => ({ landingSlug }));
}

export async function generateMetadata({ params }: { params: Promise<{ landingSlug: string }> }) {
  const resolved = await params;
  return buildExcursionLandingMetadata(resolved.landingSlug, fr);
}

export default async function ExcursionesLandingPage({ params }: { params: Promise<{ landingSlug: string }> }) {
  const resolved = await params;
  return <ExcursionKeywordLandingPage landingSlug={resolved.landingSlug} locale={fr} />;
}
