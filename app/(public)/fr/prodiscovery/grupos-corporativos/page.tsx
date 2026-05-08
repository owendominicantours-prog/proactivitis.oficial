import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { fr } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("corporate", fr);

export default function ProDiscoveryCorporateGroupsPageFr() {
  return <ProDiscoveryNichePage locale={fr} niche="corporate" />;
}
