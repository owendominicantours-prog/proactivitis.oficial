import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { en } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("dominican", en);

export default function ProDiscoveryDominicanRepublicPageEn() {
  return <ProDiscoveryNichePage locale={en} niche="dominican" />;
}
