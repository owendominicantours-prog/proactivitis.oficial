import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ intentSlug: string }>;
};

export default async function LegacyNuevaGeneracionIntentHubPage({ params }: PageProps) {
  const { intentSlug } = await params;
  redirect(`/experiencias/tema/${intentSlug}`);
}
