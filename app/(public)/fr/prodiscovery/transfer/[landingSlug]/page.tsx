import { redirectProDiscoveryTransferToPlanner } from "@/lib/prodiscoveryRedirects";
import { fr } from "@/lib/translations";

export default async function ProDiscoveryTransferPageFr({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  redirectProDiscoveryTransferToPlanner(fr, landingSlug);
}
