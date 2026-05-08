import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { es } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("weddings", es);

export default function ProDiscoveryWeddingsPage() {
  return <ProDiscoveryNichePage locale={es} niche="weddings" />;
}
