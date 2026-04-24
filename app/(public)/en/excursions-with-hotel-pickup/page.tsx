import type { Metadata } from "next";
import { buildRecogidaHubMetadata, RecogidaHubPage } from "@/components/public/RecogidaPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildRecogidaHubMetadata("en");
}

export default function ExcursionsWithHotelPickupHubRoute() {
  return <RecogidaHubPage locale="en" />;
}
