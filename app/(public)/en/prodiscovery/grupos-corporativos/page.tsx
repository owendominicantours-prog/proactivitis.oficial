import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { en } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("corporate", en);

export default function ProDiscoveryCorporateGroupsPageEn() {
  return <ProDiscoveryNichePage locale={en} niche="corporate" />;
}
