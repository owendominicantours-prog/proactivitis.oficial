import ProDiscoveryTourDetailPage, { getProDiscoveryTourGroupMetadata } from "@/components/public/ProDiscoveryTourDetailPage";
import { es } from "@/lib/translations";
import type { Metadata } from "next";

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getProDiscoveryTourGroupMetadata(es, slug);
}

export default async function ProDiscoveryTourPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProDiscoveryTourDetailPage locale={es} slug={slug} />;
}
