import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ slug: string; intentSlug: string }>;
};

export default async function LegacyNuevaGeneracionIntentTourPage({ params }: PageProps) {
  const { slug, intentSlug } = await params;
  redirect(`/experiencias/tours/${slug}/${intentSlug}`);
}
