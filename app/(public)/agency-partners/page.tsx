import {
  BadgePercent,
  BriefcaseBusiness,
  ClipboardList,
  Globe,
  Link2,
  Route,
  ShieldCheck,
  Users
} from "lucide-react";
import Link from "next/link";
import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Alianzas con agencias | Proactivitis",
  description:
    "Registra tu agencia en Proactivitis y accede a reservas directas, AgencyPro, comisiones, panel operativo y herramientas para vender tours y traslados."
};

const highlights = [
  { value: "Reservas directas", label: "Con tarifa de agencia aplicada" },
  { value: "AgencyPro", label: "Enlaces de venta para tours y traslados" },
  { value: "Comisiones", label: "Control claro de margen y ganancia" },
  { value: "Panel operativo", label: "Clientes, reservas y seguimiento" }
];

const benefits = [
  {
    id: "direct-booking",
    title: "Reserva directa de agencia",
    description:
      "Accede a un catálogo de productos y crea reservas para tus clientes desde tu propia cuenta, con procesos más rápidos y estructura profesional.",
    icon: ClipboardList
  },
  {
    id: "agency-pro",
    title: "AgencyPro para vender mejor",
    description:
      "Genera enlaces personalizados con tu propio precio final para compartir por WhatsApp, redes o correo, sin depender de cotizaciones manuales.",
    icon: Link2
  },
  {
    id: "commission",
    title: "Comisiones y márgenes claros",
    description:
      "La plataforma diferencia entre reservas directas con comisión y enlaces AgencyPro con margen comercial, para que sepas cómo estás ganando en cada venta.",
    icon: BadgePercent
  }
];

const tools = [
  {
    title: "Catálogo de tours",
    description: "Busca productos, revisa tarifas y crea reservas de agencia desde una herramienta pensada para vender.",
    icon: Globe
  },
  {
    title: "Cotización de traslados",
    description: "Consulta rutas, vehículos y precios para generar reservas o compartir enlaces comerciales con tus clientes.",
    icon: Route
  },
  {
    title: "Panel de reservas",
    description: "Controla clientes, estados, fechas de servicio, logística y seguimiento operativo desde un solo lugar.",
    icon: BriefcaseBusiness
  },
  {
    title: "Mayor control comercial",
    description: "Trabaja con una estructura más organizada, reduce procesos manuales y mejora tu velocidad de respuesta al cliente.",
    icon: ShieldCheck
  }
];

const processSteps = [
  {
    step: "01",
    title: "Solicita tu alta",
    description: "Comparte la información de tu agencia, tipo de clientes y servicios que comercializas."
  },
  {
    step: "02",
    title: "Validación comercial",
    description: "Revisamos tu solicitud antes de habilitar el acceso para mantener control y calidad en el ecosistema."
  },
  {
    step: "03",
    title: "Empieza a vender",
    description: "Una vez aprobada, tu agencia podrá reservar, compartir enlaces AgencyPro y operar desde su panel."
  }
];

const requirements = [
  "Agencia, asesor independiente o equipo comercial con actividad real en venta turística.",
  "Capacidad para gestionar clientes, reservas y comunicación comercial de forma organizada.",
  "Datos de contacto claros, documentación básica y perfil de negocio consistente.",
  "Compromiso con procesos serios, buen servicio y operación profesional."
];

const faqs = [
  {
    question: "¿Qué puede hacer una agencia dentro de Proactivitis?",
    answer:
      "Puede reservar productos directamente, vender mediante AgencyPro, revisar clientes, controlar reservas y operar desde un panel unificado."
  },
  {
    question: "¿AgencyPro sirve para tours y traslados?",
    answer:
      "Sí. La agencia puede crear enlaces comerciales tanto para tours como para traslados, usando un precio final definido por su propio margen."
  },
  {
    question: "¿Cómo gana dinero la agencia?",
    answer:
      "La plataforma soporta dos modelos: comisión en reservas directas de agencia y margen comercial en enlaces AgencyPro."
  },
  {
    question: "¿La aprobación es automática?",
    answer:
      "No. El alta de agencias es revisada de forma manual para proteger la operación y mantener un entorno comercial más sólido."
  }
];

export default function AgencyPartnershipPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-600">Agency Program</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Una plataforma comercial para agencias que quieren vender más y operar mejor
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
                Registra tu agencia en Proactivitis y trabaja con reservas directas, AgencyPro, comisiones claras,
                control operativo y herramientas diseñadas para el trabajo comercial diario.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#partner-form"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                Registrar mi agencia
              </a>
              <Link
                href="/agency-program"
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
              >
                Ver tutorial completo
              </Link>
              <a
                href="#agency-benefits"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
              >
                Ver cómo funciona
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {highlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Pensado para agencias reales</p>
              <h2 className="mt-3 text-2xl font-semibold">Vende tours y traslados con más control comercial</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Gestiona clientes, reservas y seguimiento desde un mismo panel.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Comparte enlaces AgencyPro con tu propio precio final de venta.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Distingue reservas por comisión y reservas por margen comercial.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Ideal para</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Agencias de viajes, asesores y equipos comerciales</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Objetivo</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Vender más rápido, con mejor control y mejor presentación</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="agency-benefits"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Beneficios</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Qué obtiene tu agencia al entrar a Proactivitis</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              Más que acceso a productos, obtienes una estructura para vender, cobrar, organizar y dar seguimiento.
            </p>
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {benefits.map((feature) => (
              <article key={feature.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr,1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Herramientas</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Un espacio de trabajo para tu equipo comercial</h2>
            </div>
            <div className="mt-8 grid gap-4">
              {tools.map((tool) => (
                <article key={tool.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{tool.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{tool.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Proceso</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Cómo se activa una agencia</h2>
            </div>
            <div className="mt-8 space-y-4">
              {processSteps.map((step) => (
                <div key={step.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">Paso {step.step}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr] lg:items-start">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Requisitos básicos</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Qué revisamos antes de aprobar</h2>
            <div className="mt-6 space-y-3">
              {requirements.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <PartnerRequestForm
            id="partner-form"
            role="AGENCY"
            subtitle="Registra tu agencia y solicita acceso al panel comercial de Proactivitis."
          />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,0.9fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-300">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Lo que una agencia suele preguntar antes de entrar</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((item) => (
                <article key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="text-base font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
