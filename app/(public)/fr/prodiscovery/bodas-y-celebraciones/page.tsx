import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { fr } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("weddings", fr);

export default function ProDiscoveryWeddingsPageFr() {
  return <ProDiscoveryNichePage locale={fr} niche="weddings" />;
}
