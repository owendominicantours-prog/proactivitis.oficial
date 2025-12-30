import type { Metadata } from "next";
import { en } from "@/lib/translations";
import PublicContactPage from "@/components/public/PublicContactPage";

const canonicalUrl = "https://proactivitis.com/en/contact";

export const metadata: Metadata = {
  title: "Contact | Proactivitis | Global Support",
  description:
    "24/7 support in Spanish and English via email, WhatsApp, and phone. Reach out and we'll handle your request quickly.",
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
