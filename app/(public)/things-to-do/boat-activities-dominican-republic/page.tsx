import BoatActivitiesDominicanLanding, {
  buildBoatActivitiesMetadata
} from "@/components/public/BoatActivitiesDominicanLanding";
import { es } from "@/lib/translations";

export async function generateMetadata() {
  return buildBoatActivitiesMetadata(es);
}

export default function BoatActivitiesDominicanPage() {
  return <BoatActivitiesDominicanLanding locale={es} />;
}
