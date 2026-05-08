import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { fr } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("families", fr);

export default function ProDiscoveryFamiliesPageFr() {
  return <ProDiscoveryNichePage locale={fr} niche="families" />;
}
