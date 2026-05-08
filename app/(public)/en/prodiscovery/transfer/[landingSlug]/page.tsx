import { redirectProDiscoveryTransferToPlanner } from "@/lib/prodiscoveryRedirects";
import { en } from "@/lib/translations";

export default async function ProDiscoveryTransferPageEn({
  params
}: {
  params: Promise<{ landingSlug: string }>;
}) {
  const { landingSlug } = await params;
  redirectProDiscoveryTransferToPlanner(en, landingSlug);
}
