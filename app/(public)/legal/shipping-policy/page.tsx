import type { Metadata } from "next";

import { LegalPolicyPage } from "@/components/public/LegalPolicyPage";

export const metadata: Metadata = {
  title: "Politica de envio y entrega | Proactivitis",
  description: "Politica de entrega para e-tickets, confirmaciones y servicios turisticos de Proactivitis.",
  alternates: { canonical: "https://proactivitis.com/legal/shipping-policy" }
};

const sections = [
  {
    title: "1. No vendemos productos fisicos enviados por paqueteria",
    body: [
      "Proactivitis vende servicios turisticos, traslados, rent car y experiencias. No enviamos productos fisicos por correo postal o paqueteria.",
      "La entrega principal es digital: confirmacion, voucher, e-ticket o instrucciones de servicio."
    ]
  },
  {
    title: "2. Entrega digital",
    body: [
      "Despues de completar una reserva, el cliente recibe confirmacion en la web y, cuando aplique, por correo electronico.",
      "El e-ticket o comprobante tambien puede estar disponible desde el panel del cliente o pagina de confirmacion."
    ]
  },
  {
    title: "3. Fecha estimada de entrega del servicio",
    body: [
      "Para tours, traslados y rent car, la fecha estimada de entrega corresponde a la fecha programada del servicio.",
      "El pais operativo usado para entrega de servicios actuales es Republica Dominicana (DO), salvo que una reserva indique otro destino."
    ]
  },
  {
    title: "4. Recogida, punto de encuentro o entrega local",
    body: [
      "El punto exacto de recogida, encuentro o entrega se confirma segun el tipo de servicio, hotel, aeropuerto, villa, zona y disponibilidad operativa.",
      "El cliente debe revisar la confirmacion y mantener disponible el telefono o correo usado en la reserva."
    ]
  },
  {
    title: "5. Problemas de entrega",
    body: [
      "Si no recibes confirmacion o necesitas corregir datos, contacta a info@proactivitis.com lo antes posible con tu codigo de reserva.",
      "Datos incorrectos de correo, telefono, hotel, fecha u hora pueden retrasar la confirmacion o afectar la operacion."
    ]
  }
];

export default function ShippingPolicyPage() {
  return (
    <LegalPolicyPage
      title="Politica de envio y entrega"
      description="Como se entregan confirmaciones, e-tickets e instrucciones de servicios reservados en Proactivitis."
      updatedAt="26 de junio de 2026"
      canonicalPath="/legal/shipping-policy"
      sections={sections}
    />
  );
}
