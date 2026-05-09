import ProDiscoveryTourDetailPage, { getProDiscoveryTourGroupMetadata } from "@/components/public/ProDiscoveryTourDetailPage";
import { fr } from "@/lib/translations";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getProDiscoveryTourGroupMetadata(fr, slug);
}

export default async function ProDiscoveryTourPageFr({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProDiscoveryTourDetailPage locale={fr} slug={slug} />;
}
