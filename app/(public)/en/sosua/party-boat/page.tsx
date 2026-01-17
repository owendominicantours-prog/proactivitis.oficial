import SosuaPartyBoatLanding, {
  buildSosuaPartyBoatMetadata
} from "@/components/public/SosuaPartyBoatLanding";
import { en } from "@/lib/translations";

export async function generateMetadata() {
  return buildSosuaPartyBoatMetadata(en);
}

export default function SosuaPartyBoatPage() {
  return <SosuaPartyBoatLanding locale={en} />;
}
