import BoatActivitiesDominicanLanding, {
  buildBoatActivitiesMetadata
} from "@/components/public/BoatActivitiesDominicanLanding";
import { fr } from "@/lib/translations";

export async function generateMetadata() {
  return buildBoatActivitiesMetadata(fr);
}

export default function BoatActivitiesDominicanPage() {
  return <BoatActivitiesDominicanLanding locale={fr} />;
}
