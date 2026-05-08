import { redirectProDiscoveryTourToPlanner } from "@/lib/prodiscoveryRedirects";
import { en } from "@/lib/translations";

export default async function ProDiscoveryTourPageEn({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await redirectProDiscoveryTourToPlanner(en, slug);
}
