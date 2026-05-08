import { ProDiscoveryNichePage, getProDiscoveryNicheMetadata } from "@/components/public/ProDiscoveryNichePage";
import { es } from "@/lib/translations";

export const metadata = getProDiscoveryNicheMetadata("families", es);

export default function ProDiscoveryFamiliesPage() {
  return <ProDiscoveryNichePage locale={es} niche="families" />;
}
