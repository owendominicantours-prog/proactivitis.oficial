import type { Metadata } from "next";

import { LegalPolicyPage } from "@/components/public/LegalPolicyPage";

export const metadata: Metadata = {
  title: "Informacion legal | Proactivitis",
  description: "Informacion corporativa, contacto legal y naturaleza de los servicios de Proactivitis.",
  alternates: { canonical: "https://proactivitis.com/legal/information" }
};

const sections = [
  {
    title: "1. Identidad del sitio",
    body: [
      "Proactivitis opera la web https://proactivitis.com para reservas de tours, traslados, rent car y servicios turisticos.",
      "El nombre comercial usado frente al cliente es Proactivitis."
    ]
  },
  {
    title: "2. Contacto oficial",
    body: [
      "Correo de contacto general y soporte: info@proactivitis.com.",
      "Los clientes tambien pueden usar la pagina /contact para solicitudes de reserva, soporte, pagos o proveedores."
    ]
  },
  {
    title: "3. Naturaleza comercial",
    body: [
      "Proactivitis coordina servicios turisticos y de movilidad con proveedores locales o aliados operativos.",
      "Las condiciones finales de cada reserva pueden depender del proveedor, disponibilidad, clima, seguridad, fecha, hora y datos proporcionados por el cliente."
    ]
  },
  {
    title: "4. Politicas relacionadas",
    body: [
      "Terminos y condiciones: /legal/terms.",
      "Privacidad: /legal/privacy.",
      "Devoluciones y reembolsos: /legal/refund-policy.",
      "Envio y entrega de servicios: /legal/shipping-policy."
    ]
  }
];

export default function LegalInformationPage() {
  return (
    <LegalPolicyPage
      title="Informacion legal"
      description="Datos oficiales del sitio, contacto y naturaleza comercial de Proactivitis."
      updatedAt="26 de junio de 2026"
      canonicalPath="/legal/information"
      sections={sections}
    />
  );
}
