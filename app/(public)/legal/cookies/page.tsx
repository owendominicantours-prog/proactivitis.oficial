import type { Metadata } from "next";

import { LegalPolicyPage } from "@/components/public/LegalPolicyPage";

export const metadata: Metadata = {
  title: "Politica de cookies | Proactivitis",
  description: "Uso de cookies y tecnologias similares en Proactivitis.",
  alternates: { canonical: "https://proactivitis.com/legal/cookies" }
};

const sections = [
  {
    title: "1. Que son las cookies",
    body: [
      "Las cookies son archivos pequenos que el navegador guarda para recordar sesiones, preferencias y datos tecnicos necesarios para que una web funcione correctamente.",
      "Tambien usamos tecnologias similares para seguridad, analitica y medicion de rendimiento."
    ]
  },
  {
    title: "2. Cookies esenciales",
    body: [
      "Son necesarias para iniciar sesion, mantener la reserva, procesar pagos, proteger formularios y recordar preferencias basicas.",
      "Sin estas cookies algunas partes de la web pueden no funcionar correctamente."
    ]
  },
  {
    title: "3. Analitica y medicion",
    body: [
      "Podemos usar herramientas de analitica para entender visitas, conversiones, errores y rendimiento de la web.",
      "Estas mediciones nos ayudan a mejorar la experiencia y detectar problemas tecnicos."
    ]
  },
  {
    title: "4. Gestion del navegador",
    body: [
      "Puedes bloquear o eliminar cookies desde la configuracion de tu navegador.",
      "Si bloqueas cookies esenciales, el checkout, inicio de sesion o seguimiento de reserva pueden dejar de funcionar."
    ]
  }
];

export default function CookiesPage() {
  return (
    <LegalPolicyPage
      title="Politica de cookies"
      description="Informacion sobre cookies esenciales, analitica y controles del navegador."
      updatedAt="26 de junio de 2026"
      canonicalPath="/legal/cookies"
      sections={sections}
    />
  );
}
