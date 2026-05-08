import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { es } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("corporate", es);

export default function ProDiscoveryCorporateGroupsPage() {
  return <ProDiscoveryNichePage locale={es} niche="corporate" />;
}
