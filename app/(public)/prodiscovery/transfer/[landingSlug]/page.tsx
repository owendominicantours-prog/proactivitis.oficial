import { redirectProDiscoveryTransferToPlanner } from "@/lib/prodiscoveryRedirects";
import { es } from "@/lib/translations";

export default async function ProDiscoveryTransferPage({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  redirectProDiscoveryTransferToPlanner(es, landingSlug);
}
