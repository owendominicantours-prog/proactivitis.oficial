import type { Metadata } from "next";
import PublicContactPage from "@/components/public/PublicContactPage";
import { SITE_CONFIG } from "@/lib/site-config";
import { en } from "@/lib/translations";

const canonicalUrl = `${SITE_CONFIG.url}/en/contact`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Contact | Funjet Tour Operador | Commercial support"
      : "Contact | Proactivitis | Global Support",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Contact Funjet Tour Operador. WhatsApp, phone, and email channels are operated through Proactivitis, the parent company behind the operation."
      : "24/7 support in Spanish and English via email, WhatsApp, and phone. Reach out and we'll handle your request quickly.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/contact",
      en: "/en/contact",
      fr: "/fr/contact"
    }
  }
};

export default function EnglishContactPage() {
  return <PublicContactPage locale={en} />;
}
