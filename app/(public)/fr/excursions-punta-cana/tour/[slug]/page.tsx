import type { Metadata } from "next";

import {
  NuevaGeneracionTourLandingPage,
  buildNuevaGeneracionTourMetadata
} from "@/components/public/NuevaGeneracionExperiencePages";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return buildNuevaGeneracionTourMetadata(slug, "fr");
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <NuevaGeneracionTourLandingPage slug={slug} locale="fr" />;
}
