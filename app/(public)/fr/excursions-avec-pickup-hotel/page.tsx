import type { Metadata } from "next";
import { buildRecogidaHubMetadata, RecogidaHubPage } from "@/components/public/RecogidaPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildRecogidaHubMetadata("fr");
}

export default function ExcursionsAvecPickupHotelHubRoute() {
  return <RecogidaHubPage locale="fr" />;
}
