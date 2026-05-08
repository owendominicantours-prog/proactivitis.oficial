import { redirectProDiscoveryTourToPlanner } from "@/lib/prodiscoveryRedirects";
import { es } from "@/lib/translations";

export default async function ProDiscoveryTourPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await redirectProDiscoveryTourToPlanner(es, slug);
}
