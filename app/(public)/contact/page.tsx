import type { Metadata } from "next";
import { es } from "@/lib/translations";
import PublicContactPage from "@/components/public/PublicContactPage";

const canonicalUrl = "https://proactivitis.com/contact";

export const metadata: Metadata = {
  title: "Contacto | Proactivitis | Soporte Global",
  description:
    "Asistencia 24/7 en español e inglés vía email, WhatsApp y teléfono. Escríbenos y resolveremos tu solicitud con rapidez.",
  alternates: {
    canonical: canonicalUrl,
    languages: {
      es: "/contact",
      en: "/en/contact",
      fr: "/fr/contact"
    }
  }
};

export default function SpanishContactPage() {
  return <PublicContactPage locale={es} />;
}
