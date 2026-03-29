import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarRange,
  ClipboardList,
  Link2,
  MonitorSmartphone,
  Route,
  ShieldCheck
} from "lucide-react";
import { getAgencyTutorialContentOverrides } from "@/lib/siteContent";

export const metadata = {
  title: "Programa para agencias | Proactivitis",
  description:
    "Descubre como funciona Proactivitis para agencias: reservas directas, AgencyPro, traslados, control operativo y herramientas para vender mejor."
};

const metrics = [
  { value: "2 modelos", label: "Reserva directa y AgencyPro" },
  { value: "Tours + traslados", label: "Inventario listo para vender" },
  { value: "Panel operativo", label: "Clientes, reservas y seguimiento" },
  { value: "Mobile ready", label: "Trabajo real desde telefono" }
];

const pillars = [
  {
    title: "Reserva directa de agencia",
    body:
      "Tu equipo entra al panel, busca el producto, crea la reserva y trabaja con la tarifa neta que le corresponde a la agencia.",
    icon: ClipboardList
  },
  {
    title: "AgencyPro para vender con tu precio",
    body:
      "Genera enlaces comerciales para tours y traslados con tu precio final. El cliente reserva online y tu agencia conserva el margen definido.",
    icon: Link2
  },
  {
    title: "Operacion mas ordenada",
    body:
      "Reservas, clientes, fechas, rutas, estados y seguimiento comercial en un mismo panel, sin depender de procesos sueltos.",
    icon: CalendarRange
  },
  {
    title: "Herramienta para crecer",
    body:
      "Pensado para agencias que quieren responder mas rapido, presentar mejor sus productos y vender con una estructura profesional.",
    icon: MonitorSmartphone
  }
];

const workflows = [
  {
    step: "01",
    title: "Solicita acceso y activa tu cuenta",
    body:
      "Aplicas como agencia, validamos tu perfil comercial y habilitamos tu panel para trabajar con el programa de Proactivitis."
  },
  {
    step: "02",
    title: "Elige como vas a vender",
    body:
      "Puedes reservar directamente para tus clientes o usar AgencyPro para compartir enlaces con tu precio final."
  },
  {
    step: "03",
    title: "Opera y da seguimiento",
    body:
      "Controla reservas, traslados, proximas salidas, clientes, estados y margen comercial desde una sola herramienta."
  }
];

const faqs = [
  {
    question: "Como gana dinero una agencia dentro de Proactivitis?",
    answer:
      "Hay dos modelos. En la reserva directa trabajas con tarifa neta de agencia. En AgencyPro fijas tu precio final y conservas el margen que agregaste."
  },
  {
    question: "AgencyPro funciona tambien para traslados?",
    answer:
      "Si. La agencia puede generar enlaces comerciales tanto para tours como para traslados y compartirlos directamente con el cliente."
  },
  {
    question: "La plataforma sirve solo en computadora?",
    answer:
      "No. El panel fue ajustado para trabajo movil, de modo que una agencia pueda cotizar, revisar reservas y operar desde el telefono."
  },
  {
    question: "Que obtiene una agencia despues de ser aprobada?",
    answer:
      "Acceso al panel, catalogo de tours, modulo de traslados, reservas, calendario, reportes, AgencyPro y control comercial."
  }
];

const screenshotLabels = [
  {
    key: "primary" as const,
    title: "Catalogo comercial",
    copy: "Busca tours, revisa netos y crea reservas directas o enlaces AgencyPro desde el mismo flujo."
  },
  {
    key: "secondary" as const,
    title: "Cotizador de traslados",
    copy: "Consulta rutas, vehiculos, ida y vuelta y tarifa neta de agencia sin mezclar precios publicos."
  },
  {
    key: "tertiary" as const,
    title: "Control de reservas",
    copy: "Monitorea clientes, estados, fechas de servicio y detalle operativo desde una vista central."
  }
];

function ScreenshotCard({
  src,
  title,
  copy
}: {
  src?: string;
  title: string;
  copy: string;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/10] bg-[linear-gradient(135deg,#e2e8f0,#f8fafc)]">
        {src ? (
          <Image src={src} alt={title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-4 shadow-md">
              <div className="h-3 w-28 rounded-full bg-slate-200" />
              <div className="mt-4 grid gap-3">
                <div className="h-16 rounded-2xl bg-slate-100" />
                <div className="h-16 rounded-2xl bg-slate-100" />
                <div className="h-16 rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2 p-6">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{copy}</p>
      </div>
    </article>
  );
}

export default async function AgencyProgramPage() {
  const content = await getAgencyTutorialContentOverrides();

  const screenshots = {
    primary: content.screenshotPrimary,
    secondary: content.screenshotSecondary,
    tertiary: content.screenshotTertiary
  };

  return (
    <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
        <section className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Programa para agencias
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                Vende Punta Cana con una plataforma hecha para agencias internacionales
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
                Proactivitis combina reservas directas, enlaces AgencyPro, cotizacion de traslados y control operativo
                en un entorno pensado para vender mas rapido, con mejor presentacion y mejor seguimiento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/agency-partners"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
              >
                Aplicar ahora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#capturas"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-400"
              >
                Ver como funciona
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-base font-semibold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-xl">
            <div className="rounded-[28px] bg-[radial-gradient(circle_at_top_left,#1e293b,#0f172a_65%)] p-6 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-200">
                Mas control comercial
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Una forma mas seria de vender tours y traslados</h2>
              <div className="mt-6 grid gap-4">
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <BadgeDollarSign className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">
                    Reserva directa con tarifa neta de agencia y comision ya aplicada en el flujo correcto.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Link2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">
                    AgencyPro para compartir enlaces con tu propio precio final en tours y traslados.
                  </p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">
                    Panel operativo para reservas, clientes, estados, fechas y seguimiento comercial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
          {pillars.map((item) => (
            <article key={item.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </section>

        <section id="capturas" className="mt-16 space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Capturas del sistema</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
              Asi trabaja una agencia dentro de Proactivitis
            </h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Esta landing puede mostrar tus propias capturas del panel. Desde admin podras subirlas para ensenar el
              catalogo, la venta con AgencyPro y el control de reservas sin depender de disenos estaticos.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {screenshotLabels.map((item) => (
              <ScreenshotCard
                key={item.key}
                src={screenshots[item.key]}
                title={item.title}
                copy={item.copy}
              />
            ))}
          </div>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Modelo 1</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Reserva directa de agencia</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Tu equipo entra al panel, busca el tour o traslado, completa la reserva para el cliente y trabaja con la
              tarifa neta de agencia. Es el modelo ideal cuando la agencia opera la venta de principio a fin.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <BadgeDollarSign className="mt-0.5 h-5 w-5 text-slate-700" />
                <p className="text-sm text-slate-700">La agencia paga el neto correcto y el sistema reconoce su cuenta.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ClipboardList className="mt-0.5 h-5 w-5 text-slate-700" />
                <p className="text-sm text-slate-700">La reserva queda identificada como venta de agencia y no como cliente web directo.</p>
              </div>
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-slate-950 p-7 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Modelo 2</p>
            <h2 className="mt-3 text-3xl font-semibold">AgencyPro</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Crea un enlace comercial con tu propio precio final para tours o traslados. El cliente entra, reserva
              online y tu agencia conserva el margen definido entre el precio base y el precio de venta.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Link2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                <p className="text-sm text-slate-100">Comparte enlaces por WhatsApp, correo, redes o campañas propias.</p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <Route className="mt-0.5 h-5 w-5 text-emerald-300" />
                <p className="text-sm text-slate-100">Funciona tambien para traslados con ruta, vehiculo y tipo de viaje definidos.</p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr,1.05fr]">
          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Como se activa</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Proceso de entrada al programa</h2>
            <div className="mt-6 space-y-4">
              {workflows.map((item) => (
                <div key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Paso {item.step}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Preguntas clave</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">Lo que una agencia necesita entender antes de entrar</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-16 rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#111827_65%,#14532d)] px-8 py-10 text-white shadow-xl">
          <div className="grid gap-6 lg:grid-cols-[1fr,auto] lg:items-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200">Siguiente paso</p>
              <h2 className="text-3xl font-semibold md:text-4xl">
                Si tu agencia vende Caribe, este programa te da una estructura mas seria para crecer
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed text-slate-200">
                Aplica, valida tu cuenta y empieza a trabajar con reservas directas, AgencyPro, traslados y control
                operativo en una sola plataforma.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/agency-partners"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-950 transition hover:bg-slate-100"
              >
                Aplicar como agencia
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-white/10"
              >
                Hablar con ventas
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
