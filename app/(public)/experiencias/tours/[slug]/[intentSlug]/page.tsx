import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; intentSlug: string }>;
};

export default async function LegacyExperienciasIntentTourPage({ params }: PageProps) {
  const { slug, intentSlug } = await params;
  redirect(`/excursiones-punta-cana/${intentSlug}/${slug}`);
}
