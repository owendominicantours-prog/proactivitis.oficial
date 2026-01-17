import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PuntaCanaTransferHub from "@/components/public/PuntaCanaTransferHub";

const canonicalUrl = "https://proactivitis.com/en/punta-cana/traslado";

export const metadata: Metadata = {
  title: "Punta Cana Transfers | Airport, hotels, and zones",
  description:
    "Book private transfers in Punta Cana with verified drivers, clear pricing, and instant confirmation. Door-to-door service with 24/7 support for airport and hotel pickups.",
  keywords: ["Punta Cana transfers", "PUJ airport transfer", "private driver", "hotel pickup", "Proactivitis"],
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/punta-cana/traslado",
      en: "/en/punta-cana/traslado",
      fr: "/fr/punta-cana/traslado"
    }
  }
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PuntaCanaTrasladoPage() {
  return <PuntaCanaTransferHub locale={en} />;
}
