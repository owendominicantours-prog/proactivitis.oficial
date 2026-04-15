import type { Metadata } from "next";
import PublicContactPage from "@/components/public/PublicContactPage";
import { SITE_CONFIG } from "@/lib/site-config";
import { fr } from "@/lib/translations";

const canonicalUrl = `${SITE_CONFIG.url}/fr/contact`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Contact | Funjet Tour Operador | Assistance commerciale"
      : "Contact | Proactivitis | Assistance mondiale",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Contactez Funjet Tour Operador. Les canaux WhatsApp, telephone et email sont operes par Proactivitis, societe mere de l'operation."
      : "Support 24h/24 en espagnol et en anglais via email, WhatsApp et telephone. Ecrivez-nous et nous traitons votre demande rapidement.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/contact",
      en: "/en/contact",
      fr: "/fr/contact"
    }
  }
};

export default function FrenchContactPage() {
  return <PublicContactPage locale={fr} />;
}
