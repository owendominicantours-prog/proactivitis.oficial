import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { en } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("weddings", en);

export default function ProDiscoveryWeddingsPageEn() {
  return <ProDiscoveryNichePage locale={en} niche="weddings" />;
}
