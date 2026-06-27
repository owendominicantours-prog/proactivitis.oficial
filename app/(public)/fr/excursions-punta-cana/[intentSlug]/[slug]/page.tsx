import type { Metadata } from "next";

import {
  NuevaGeneracionIntentTourPage,
  buildNuevaGeneracionIntentTourMetadata
} from "@/components/public/NuevaGeneracionExperiencePages";

type PageProps = {
  params: Promise<{ slug: string; intentSlug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, intentSlug } = await params;
  return buildNuevaGeneracionIntentTourMetadata(slug, intentSlug, "fr");
}

export default async function Page({ params }: PageProps) {
  const { slug, intentSlug } = await params;
  return <NuevaGeneracionIntentTourPage slug={slug} intentSlug={intentSlug} locale="fr" />;
}
