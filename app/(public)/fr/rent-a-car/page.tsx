import type { Metadata } from "next";
import RentCarIndexPage from "@/components/rentals/RentCarIndexPage";
import { getRentCarCopy } from "@/data/rentCarFleet";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";

export const revalidate = 86400;

const copy = getRentCarCopy("fr");

export const metadata: Metadata = {
  title: `${String(copy.rootTitle)} | Proactivitis`,
  description: String(copy.rootDescription),
  alternates: { canonical: "https://proactivitis.com/fr/rent-a-car" }
};

export default async function Page() {
  const settings = await getRentCarFleetSettings();
  return <RentCarIndexPage locale="fr" settings={settings} />;
}
