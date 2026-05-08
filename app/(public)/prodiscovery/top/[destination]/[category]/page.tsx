import { redirectProDiscoveryTopToPlanner } from "@/lib/prodiscoveryRedirects";

export default async function ProDiscoveryTopEsPage({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}) {
  const { destination } = await params;
  redirectProDiscoveryTopToPlanner("es", destination);
}
