import type { Metadata } from "next";
import HonorClientsPage from "@/components/public/HonorClientsPage";
import { getActiveHonorClients } from "@/lib/honorClients";

const canonical = "https://proactivitis.com/en/cliente-de-honor";

export const metadata: Metadata = {
  title: "Honor Client | Proactivitis VIP",
  description:
    "Recognizing clients who trusted us from the beginning. Exclusive VIP recognition wall by Proactivitis.",
  alternates: {
    canonical
  },
  openGraph: {
    title: "Honor Client | Proactivitis VIP",
    description: "Exclusive recognition wall for Proactivitis elite clients.",
    url: canonical,
    siteName: "Proactivitis",
    type: "website"
  }
};

export default async function HonorClientsPublicPageEn() {
  const clients = await getActiveHonorClients();
  return <HonorClientsPage clients={clients} locale="en" />;
}
