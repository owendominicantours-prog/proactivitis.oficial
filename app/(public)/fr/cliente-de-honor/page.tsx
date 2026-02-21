import type { Metadata } from "next";
import HonorClientsPage from "@/components/public/HonorClientsPage";
import { getActiveHonorClients } from "@/lib/honorClients";

const canonical = "https://proactivitis.com/fr/cliente-de-honor";

export const metadata: Metadata = {
  title: "Cliente de Honor | Proactivitis VIP",
  description:
    "Reconociendo a los clientes que creyeron en nosotros desde el principio. Muro exclusivo VIP de Proactivitis.",
  alternates: {
    canonical
  },
  openGraph: {
    title: "Cliente de Honor | Proactivitis VIP",
    description: "Mur exclusif de reconnaissance pour les clients elite de Proactivitis.",
    url: canonical,
    siteName: "Proactivitis",
    type: "website"
  }
};

export default async function HonorClientsPublicPageFr() {
  const clients = await getActiveHonorClients();
  return <HonorClientsPage clients={clients} />;
}
