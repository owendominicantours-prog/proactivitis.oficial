import type { Metadata } from "next";
import RentCarIndexPage from "@/components/rentals/RentCarIndexPage";
import { getRentCarCopy } from "@/data/rentCarFleet";

export const runtime = "edge";
export const revalidate = 86400;

const copy = getRentCarCopy("es");

export const metadata: Metadata = {
  title: `${String(copy.rootTitle)} | Proactivitis`,
  description: String(copy.rootDescription),
  alternates: { canonical: "https://proactivitis.com/rent-a-car" }
};

export default function Page() {
  return <RentCarIndexPage locale="es" />;
}
