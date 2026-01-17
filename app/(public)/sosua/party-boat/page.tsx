import SosuaPartyBoatLanding, {
  buildSosuaPartyBoatMetadata
} from "@/components/public/SosuaPartyBoatLanding";
import { es } from "@/lib/translations";

export async function generateMetadata() {
  return buildSosuaPartyBoatMetadata(es);
}

export default function SosuaPartyBoatPage() {
  return <SosuaPartyBoatLanding locale={es} />;
}
