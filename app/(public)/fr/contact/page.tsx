import type { Metadata } from "next";
import { fr } from "@/lib/translations";
import PublicContactPage from "@/components/public/PublicContactPage";

const canonicalUrl = "https://proactivitis.com/fr/contact";

export const metadata: Metadata = {
  title: "Contact | Proactivitis | Assistance mondiale",
  description:
    "Support 24h/24 en espagnol et en anglais via email, WhatsApp et téléphone. Écrivez-nous et nous traitons votre demande rapidement.",
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
