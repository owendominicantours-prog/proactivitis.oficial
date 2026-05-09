import ProDiscoveryTourDetailPage, { getProDiscoveryTourGroupMetadata } from "@/components/public/ProDiscoveryTourDetailPage";
import { en } from "@/lib/translations";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getProDiscoveryTourGroupMetadata(en, slug);
}

export default async function ProDiscoveryTourPageEn({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProDiscoveryTourDetailPage locale={en} slug={slug} />;
}
