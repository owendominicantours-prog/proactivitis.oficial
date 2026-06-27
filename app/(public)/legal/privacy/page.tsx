import type { Metadata } from "next";

import { LegalPolicyPage } from "@/components/public/LegalPolicyPage";

export const metadata: Metadata = {
  title: "Politica de privacidad | Proactivitis",
  description: "Como Proactivitis recopila, usa, protege y comparte datos personales necesarios para reservas y soporte.",
  alternates: { canonical: "https://proactivitis.com/legal/privacy" }
};

const sections = [
  {
    title: "1. Datos que recopilamos",
    body: [
      "Recopilamos datos necesarios para operar reservas: nombre, correo, telefono, fecha de servicio, cantidad de pasajeros, hotel, aeropuerto, vuelo, punto de recogida y notas proporcionadas por el cliente.",
      "Tambien podemos procesar datos de cuenta, preferencias, historial de reservas, comunicaciones de soporte, reseñas y datos tecnicos basicos del dispositivo o navegador."
    ]
  },
  {
    title: "2. Pagos",
    body: [
      "Los pagos se procesan con proveedores certificados. Proactivitis no guarda el numero completo de tarjeta ni codigos de seguridad.",
      "Podemos conservar importes, moneda, estado del pago, marca de tarjeta, ultimos cuatro digitos e identificadores de transaccion para soporte, conciliacion, fraude o disputas."
    ]
  },
  {
    title: "3. Uso de la informacion",
    body: [
      "Usamos la informacion para confirmar reservas, coordinar proveedores, emitir e-tickets, prestar soporte, procesar pagos, prevenir fraude y mejorar la experiencia de la web.",
      "Tambien podemos usar datos agregados para analitica, rendimiento y calidad del servicio."
    ]
  },
  {
    title: "4. Compartir informacion",
    body: [
      "Compartimos solo los datos necesarios con proveedores turisticos, operadores de transporte, procesadores de pago, herramientas de comunicacion y servicios tecnicos que ayudan a completar la reserva.",
      "No vendemos datos personales del cliente."
    ]
  },
  {
    title: "5. Derechos y eliminacion",
    body: [
      "Puedes solicitar acceso, correccion o eliminacion de datos escribiendo a info@proactivitis.com.",
      "Tambien ofrecemos la pagina /account-deletion para solicitudes relacionadas con cuenta o app. Podemos conservar registros minimos cuando sean necesarios por ley, pagos, seguridad, fraude o disputas."
    ]
  },
  {
    title: "6. Seguridad",
    body: [
      "Usamos HTTPS, controles de acceso y proveedores especializados para proteger la informacion.",
      "Ningun sistema es absolutamente infalible, pero aplicamos medidas razonables para reducir riesgos de acceso no autorizado."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <LegalPolicyPage
      title="Politica de privacidad"
      description="Transparencia sobre datos personales usados para reservas, pagos, soporte y seguridad."
      updatedAt="26 de junio de 2026"
      canonicalPath="/legal/privacy"
      jsonLdType="PrivacyPolicy"
      sections={sections}
    />
  );
}
