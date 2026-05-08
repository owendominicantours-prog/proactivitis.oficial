import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { es } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("dominican", es);

export default function ProDiscoveryDominicanRepublicPage() {
  return <ProDiscoveryNichePage locale={es} niche="dominican" />;
}
