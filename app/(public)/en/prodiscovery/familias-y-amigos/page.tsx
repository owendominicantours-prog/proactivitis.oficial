import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { en } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("families", en);

export default function ProDiscoveryFamiliesPageEn() {
  return <ProDiscoveryNichePage locale={en} niche="families" />;
}
