import type { Metadata } from "next";
import { buildRecogidaHubMetadata, RecogidaHubPage } from "@/components/public/RecogidaPage";

export async function generateMetadata(): Promise<Metadata> {
  return buildRecogidaHubMetadata("es");
}

export default function ExcursionesConRecogidaHubRoute() {
  return <RecogidaHubPage locale="es" />;
}
