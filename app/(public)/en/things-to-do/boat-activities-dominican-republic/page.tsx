import BoatActivitiesDominicanLanding, {
  buildBoatActivitiesMetadata
} from "@/components/public/BoatActivitiesDominicanLanding";
import { en } from "@/lib/translations";

export async function generateMetadata() {
  return buildBoatActivitiesMetadata(en);
}

export default function BoatActivitiesDominicanPage() {
  return <BoatActivitiesDominicanLanding locale={en} />;
}
