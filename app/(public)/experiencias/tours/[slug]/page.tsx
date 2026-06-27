import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyExperienciasTourPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/excursiones-punta-cana/tour/${slug}`);
}
