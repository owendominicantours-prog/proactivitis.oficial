import type { Metadata } from "next";
import PublicContactPage from "@/components/public/PublicContactPage";
import { SITE_CONFIG } from "@/lib/site-config";
import { es } from "@/lib/translations";

const canonicalUrl = `${SITE_CONFIG.url}/contact`;

export const metadata: Metadata = {
  title:
    SITE_CONFIG.variant === "funjet"
      ? "Contacto | Funjet Tour Operador | Atencion comercial"
      : "Contacto | Proactivitis | Soporte Global",
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Habla con Funjet Tour Operador. Los canales de WhatsApp, telefono y correo son gestionados por Proactivitis, empresa madre de la operacion."
      : "Asistencia 24/7 en espanol e ingles via email, WhatsApp y telefono. Escribenos y resolveremos tu solicitud con rapidez.",
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
