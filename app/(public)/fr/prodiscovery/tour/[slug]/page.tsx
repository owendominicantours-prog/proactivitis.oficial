import { redirectProDiscoveryTourToPlanner } from "@/lib/prodiscoveryRedirects";
import { fr } from "@/lib/translations";

export default async function ProDiscoveryTourPageFr({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await redirectProDiscoveryTourToPlanner(fr, slug);
}
