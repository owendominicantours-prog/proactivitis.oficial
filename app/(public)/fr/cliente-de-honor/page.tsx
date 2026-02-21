import type { Metadata } from "next";
import HonorClientsPage from "@/components/public/HonorClientsPage";
import { getActiveHonorClients } from "@/lib/honorClients";

const canonical = "https://proactivitis.com/fr/cliente-de-honor";

export const metadata: Metadata = {
  title: "Client d'Honneur | Proactivitis VIP",
  description:
    "Nous reconnaissons les clients qui ont cru en nous des le debut. Mur VIP exclusif Proactivitis.",
  alternates: {
    canonical
  },
  openGraph: {
    title: "Client d'Honneur | Proactivitis VIP",
    description: "Mur exclusif de reconnaissance pour les clients elite de Proactivitis.",
    url: canonical,
    siteName: "Proactivitis",
    type: "website"
  }
};

export default async function HonorClientsPublicPageFr() {
  const clients = await getActiveHonorClients();
  return <HonorClientsPage clients={clients} locale="fr" />;
}
