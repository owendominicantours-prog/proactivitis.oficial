import Link from "next/link";

const supportEmail = "info@proactivitis.com";

const refundSections = [
  {
    title: "1. Alcance de esta politica",
    body: [
      "Esta politica aplica a reservas realizadas en Proactivitis para tours, excursiones, traslados, rent car y otros servicios turisticos vendidos o coordinados desde nuestra web.",
      "Proactivitis vende servicios de viaje y experiencias. Por eso no existe una devolucion fisica de producto despues de que el servicio ha sido usado, iniciado o marcado como no-show.",
      "Algunos servicios pueden mostrar condiciones especificas de cancelacion en la pagina del producto o durante el checkout. Cuando una condicion especifica sea mas estricta, esa condicion prevalece para esa reserva."
    ]
  },
  {
    title: "2. Cancelaciones con reembolso",
    body: [
      "En servicios marcados como cancelacion flexible, puedes solicitar cancelacion con reembolso completo hasta 24 horas antes de la hora programada del servicio.",
      "Si Proactivitis, el proveedor local o el operador cancela el servicio por falta de disponibilidad, clima, seguridad, cierre operativo u otra causa fuera del control del cliente, ofreceremos reprogramacion sin costo o reembolso al metodo de pago original.",
      "Cuando un servicio requiere confirmacion manual y no puede ser confirmado, el pago sera anulado o reembolsado segun el estado de la transaccion."
    ]
  },
  {
    title: "3. Casos no reembolsables",
    body: [
      "No hay reembolso cuando el cliente no se presenta, llega tarde, no responde a la coordinacion operativa o proporciona datos incorrectos de recogida, hotel, aeropuerto, vuelo, fecha, hora o contacto.",
      "No hay reembolso por servicios ya iniciados, consumidos parcialmente o completados.",
      "Las reservas marcadas como no reembolsables, promociones especiales, servicios privados hechos a medida o solicitudes con costos ya comprometidos por proveedores pueden no ser elegibles para reembolso."
    ]
  },
  {
    title: "4. Cambios de fecha o datos de reserva",
    body: [
      "Los cambios de fecha, hora, punto de recogida o cantidad de personas estan sujetos a disponibilidad del proveedor y pueden generar diferencia de precio.",
      "Si el cambio se solicita dentro de las 24 horas previas al servicio, haremos lo posible por ayudar, pero no podemos garantizar aprobacion ni reembolso.",
      "Para cambios por retrasos de vuelo, emergencia o clima, revisaremos el caso con el proveedor y propondremos la alternativa disponible mas razonable."
    ]
  },
  {
    title: "5. Tiempo de procesamiento",
    body: [
      "Una vez aprobado, el reembolso se envia al metodo de pago original.",
      "La mayoria de bancos y procesadores reflejan el reembolso entre 5 y 10 dias habiles. Tarjetas internacionales, bancos emisores o conversiones de moneda pueden tardar mas.",
      "Proactivitis no controla los tiempos internos del banco despues de que el procesador confirma la devolucion."
    ]
  },
  {
    title: "6. Como solicitar un reembolso",
    body: [
      "Envia tu solicitud lo antes posible con el codigo de reserva, nombre del titular, fecha del servicio, servicio reservado y motivo de la solicitud.",
      `Puedes escribir a ${supportEmail} o usar la pagina de contacto. Revisaremos la reserva, la condicion aplicable y la informacion del proveedor antes de confirmar la decision.`,
      "Podemos pedir evidencia adicional cuando el caso dependa de retrasos, clima, cambios operativos, problemas de recogida o comunicaciones previas."
    ]
  },
  {
    title: "7. Derechos obligatorios del consumidor",
    body: [
      "Nada en esta politica limita derechos obligatorios que puedan aplicar por ley en la jurisdiccion correspondiente.",
      "Si una norma de proteccion al consumidor exige un tratamiento diferente para una reserva concreta, aplicaremos el estandar legal obligatorio que corresponda."
    ]
  }
];

export function RefundPolicyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Politica de devoluciones y reembolsos de Proactivitis",
    url: "https://proactivitis.com/legal/refund-policy",
    description:
      "Politica de devoluciones, cancelaciones y reembolsos para tours, traslados, rent car y servicios turisticos de Proactivitis.",
    publisher: {
      "@type": "Organization",
      name: "Proactivitis",
      url: "https://proactivitis.com"
    }
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-sky-700">Legal</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            Politica de devoluciones y reembolsos
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Reglas claras para cancelaciones, cambios, no-show y reembolsos de servicios reservados en Proactivitis.
          </p>
          <p className="mt-3 text-sm font-semibold text-slate-500">Ultima actualizacion: 26 de junio de 2026</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {refundSections.map((section) => (
              <article key={section.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400">Soporte</p>
            <h2 className="mt-2 text-xl font-black text-slate-950">Solicitar revision</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Para revisar una devolucion necesitamos el codigo de reserva y el motivo de la solicitud.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/contact"
                className="flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Contactar soporte
              </Link>
              <a
                href={`mailto:${supportEmail}?subject=Solicitud%20de%20reembolso%20Proactivitis`}
                className="flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                {supportEmail}
              </a>
            </div>
          </aside>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}
