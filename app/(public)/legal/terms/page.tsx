import type { Metadata } from "next";

import { LegalPolicyPage } from "@/components/public/LegalPolicyPage";

export const metadata: Metadata = {
  title: "Terminos y condiciones | Proactivitis",
  description: "Terminos de uso, reservas, pagos, cambios y responsabilidades de Proactivitis.",
  alternates: { canonical: "https://proactivitis.com/legal/terms" }
};

const sections = [
  {
    title: "1. Naturaleza del servicio",
    body: [
      "Proactivitis es una plataforma digital para reservar tours, traslados, rent car y servicios turisticos con operadores o proveedores locales.",
      "La ejecucion operativa de cada servicio puede estar a cargo de proveedores independientes, sujetos a disponibilidad, condiciones de seguridad, clima y reglas propias del servicio reservado."
    ]
  },
  {
    title: "2. Reservas y datos del cliente",
    body: [
      "El cliente debe proporcionar informacion correcta: nombre, correo, telefono, fecha, hora, hotel, vuelo, punto de recogida y cantidad de pasajeros cuando aplique.",
      "Datos incorrectos, falta de respuesta, llegada tarde o no presentacion pueden afectar la operacion y la elegibilidad de reembolso."
    ]
  },
  {
    title: "3. Precios, pagos y confirmacion",
    body: [
      "Los precios publicados se muestran en la moneda indicada durante la reserva. El banco del cliente puede aplicar conversiones, comisiones o retenciones propias.",
      "Los pagos se procesan mediante proveedores de pago seguros. Proactivitis no almacena los datos completos de tarjeta.",
      "La confirmacion puede ser instantanea o manual segun el servicio. Cuando un servicio no pueda confirmarse, ofreceremos alternativa, reprogramacion o reembolso segun corresponda."
    ]
  },
  {
    title: "4. Cambios, cancelaciones y reembolsos",
    body: [
      "Las cancelaciones, cambios y reembolsos se rigen por la politica de devoluciones publicada en /legal/refund-policy y por las condiciones especificas mostradas en cada producto.",
      "Los cambios de fecha, hora o punto de recogida estan sujetos a disponibilidad y pueden generar diferencia de precio."
    ]
  },
  {
    title: "5. Responsabilidad y fuerza mayor",
    body: [
      "Proactivitis trabaja para coordinar servicios confiables, pero no controla eventos de fuerza mayor como clima, cierres operativos, trafico, retrasos aereos, restricciones gubernamentales o instrucciones de autoridades.",
      "Cuando una situacion externa impida operar el servicio, se revisara el caso para ofrecer la alternativa razonable disponible."
    ]
  },
  {
    title: "6. Contacto legal",
    body: ["Para consultas sobre estos terminos escribe a info@proactivitis.com o usa la pagina de contacto."]
  }
];

export default function TermsPage() {
  return (
    <LegalPolicyPage
      title="Terminos y condiciones"
      description="Condiciones aplicables al uso de la web, reservas, pagos y servicios coordinados por Proactivitis."
      updatedAt="26 de junio de 2026"
      canonicalPath="/legal/terms"
      sections={sections}
    />
  );
}
