import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { fr } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("dominican", fr);

export default function ProDiscoveryDominicanRepublicPageFr() {
  return <ProDiscoveryNichePage locale={fr} niche="dominican" />;
}
