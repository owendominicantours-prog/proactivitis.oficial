import SosuaPartyBoatLanding, {
  buildSosuaPartyBoatMetadata
} from "@/components/public/SosuaPartyBoatLanding";
import { fr } from "@/lib/translations";

export async function generateMetadata() {
  return buildSosuaPartyBoatMetadata(fr);
}

export default function SosuaPartyBoatPage() {
  return <SosuaPartyBoatLanding locale={fr} />;
}
