import { redirectProDiscoveryTopToPlanner } from "@/lib/prodiscoveryRedirects";

export default async function ProDiscoveryTopEnPage({
  params
}: {
  params: Promise<{ destination: string; category: string }>;
}) {
  const { destination } = await params;
  redirectProDiscoveryTopToPlanner("en", destination);
}
