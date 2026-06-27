import type { Metadata } from "next";

import {
  NuevaGeneracionIntentHubPage,
  buildNuevaGeneracionIntentHubMetadata
} from "@/components/public/NuevaGeneracionExperiencePages";
import { getNuevaGeneracionIntents } from "@/lib/nuevaGeneracionTours";

type PageProps = {
  params: Promise<{ intentSlug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getNuevaGeneracionIntents("en").map((intent) => ({ intentSlug: intent.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { intentSlug } = await params;
  return buildNuevaGeneracionIntentHubMetadata(intentSlug, "en");
}

export default async function Page({ params }: PageProps) {
  const { intentSlug } = await params;
  return <NuevaGeneracionIntentHubPage intentSlug={intentSlug} locale="en" />;
}
