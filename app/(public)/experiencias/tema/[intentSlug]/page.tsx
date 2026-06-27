import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ intentSlug: string }>;
};

export default async function LegacyExperienciasTemaPage({ params }: PageProps) {
  const { intentSlug } = await params;
  redirect(`/excursiones-punta-cana/${intentSlug}`);
}
