import type { Metadata } from "next";
import { buildRecogidaHubMetadata, RecogidaHubPage } from "@/components/public/RecogidaPage";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await buildRecogidaHubMetadata("fr");
  return {
    ...metadata,
    alternates: {
      canonical: "https://proactivitis.com/excursions-avec-pickup-hotel",
      languages: {
        es: "/excursiones-con-recogida",
        en: "/en/excursions-with-hotel-pickup",
        fr: "/excursions-avec-pickup-hotel",
        "x-default": "/excursions-avec-pickup-hotel"
      }
    },
    robots: { index: true, follow: true }
  };
}

export default function RootFrenchExcursionsAvecPickupHotelHubRoute() {
  return <RecogidaHubPage locale="fr" />;
}
