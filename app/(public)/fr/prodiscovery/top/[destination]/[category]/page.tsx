import { redirectProDiscoveryTopToPlanner } from "@/lib/prodiscoveryRedirects";

export default async function ProDiscoveryTopFrPage({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}) {
  const { destination } = await params;
  redirectProDiscoveryTopToPlanner("fr", destination);
}
