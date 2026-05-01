import {
  BarChart3,
  BadgeCheck,
  CreditCard,
  Globe,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  Ticket,
  Wand2
} from "lucide-react";
import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Conviértete en supplier | Proactivitis",
  description:
    "Publica tours y traslados en Proactivitis, recibe reservas, gestiona operación y cobra con herramientas profesionales para suppliers."
};

const highlights = [
  { value: "Tours + traslados", label: "Vende ambos servicios desde una sola cuenta" },
  { value: "Panel operativo", label: "Confirma reservas, tiempos y logística" },
  { value: "Cobros seguros", label: "Pagos procesados con Stripe Connect" },
  { value: "Más alcance", label: "Exposición web, SEO, agencias y venta directa" }
];

const benefits = [
  {
    id: "reach",
    title: "Más visibilidad para tu operación",
    description:
      "Tu oferta puede llegar a clientes directos, agencias y canales digitales sin que tengas que construir toda la infraestructura comercial por tu cuenta.",
    icon: Globe
  },
  {
    id: "operations",
    title: "Control operativo real",
    description:
      "Gestiona reservas, pasajeros, horarios, puntos de recogida, notas internas y seguimiento del servicio desde un panel pensado para operación diaria.",
    icon: ShieldCheck
  },
  {
    id: "payments",
    title: "Cobros y liquidación profesional",
    description:
      "Recibe reservas con procesos más claros, pagos seguros y visibilidad sobre lo vendido, lo confirmado y lo pendiente.",
    icon: CreditCard
  }
];

const tools = [
  {
    title: "Gestión de reservas",
    description: "Consulta reservas activas, datos del cliente, estado del servicio y evidencias operativas.",
    icon: Ticket
  },
  {
    title: "Panel financiero",
    description: "Revisa montos netos, pagos, historial y rendimiento sin depender de procesos manuales.",
    icon: BarChart3
  },
  {
    title: "Soporte comercial y técnico",
    description: "Te acompañamos en activación, publicación de productos y mejoras de tu operación dentro de la plataforma.",
    icon: LifeBuoy
  },
  {
    title: "Herramientas de publicación",
    description: "Crea o mejora tus productos con una estructura clara, contenido consistente e inventario mejor organizado.",
    icon: Wand2
  }
];

const processSteps = [
  {
    step: "01",
    title: "Solicita tu alta",
    description: "Completa el formulario con tu empresa, servicios, zona de operación y datos de contacto."
  },
  {
    step: "02",
    title: "Validamos tu operación",
    description: "Revisamos calidad, cumplimiento básico, capacidad operativa y tipo de servicio antes de activar."
  },
  {
    step: "03",
    title: "Activas tus productos",
    description: "Sube tours o traslados, ajusta tu operación y empieza a recibir reservas dentro del ecosistema."
  }
];

const requirements = [
  "Empresa o operador con actividad real en tours, traslados o experiencias turísticas.",
  "Capacidad para confirmar reservas y responder a la operación de forma puntual.",
  "Información comercial clara, datos de contacto válidos y servicio consistente.",
  "Compromiso con estándares de calidad, cumplimiento y buena atención al cliente."
];

const faqs = [
  {
    question: "¿Quién puede aplicar como supplier?",
    answer:
      "Operadores de tours, excursiones, actividades, transporte turístico y servicios relacionados que cuenten con operación real y capacidad de respuesta."
  },
  {
    question: "¿Puedo vender tours y traslados al mismo tiempo?",
    answer:
      "Sí. Proactivitis está diseñado para trabajar ambos modelos desde un mismo entorno operativo, siempre que tu perfil y tus productos sean aprobados."
  },
  {
    question: "¿Cómo se gestionan los cobros?",
    answer:
      "La plataforma utiliza Stripe Connect para estructurar el flujo de cobro y liquidación de forma más profesional y segura."
  },
  {
    question: "¿Debo esperar aprobación antes de publicar?",
    answer:
      "Sí. Revisamos la solicitud antes de activar el perfil para mantener un nivel de calidad y operación consistente dentro de la plataforma."
  }
];

type BecomeSupplierPageProps = {
  searchParams?: Promise<{
    opportunity?: string;
    category?: string;
    status?: string;
  }>;
};

export default async function BecomeSupplierPage({ searchParams }: BecomeSupplierPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const initialOpportunity = resolvedSearchParams.opportunity
    ? {
        name: resolvedSearchParams.opportunity,
        category: resolvedSearchParams.category,
        status: resolvedSearchParams.status
      }
    : undefined;

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16">
        <section className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-600">Supplier Program</p>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
                Lleva tu operación turística a un entorno más profesional, visible y rentable
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-600">
                Conviértete en supplier de Proactivitis y gestiona tours o traslados con una plataforma creada para vender,
                coordinar y crecer con mayor control.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="#partner-form"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
              >
                Solicitar alta
              </a>
              <a
                href="#supplier-benefits"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
              >
                Ver beneficios
              </a>
              <a
                href="/supplier-tour-opportunities"
                className="inline-flex items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
              >
                Ver tours buscados
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
              <p className="text-xs uppercase tracking-[0.4em] text-emerald-200">Por qué suppliers serios aplican</p>
              <h2 className="mt-3 text-2xl font-semibold">Una plataforma para operar mejor, no solo para aparecer</h2>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Mayor alcance comercial con estructura operativa más clara.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Reservas, logística, pagos y seguimiento desde un mismo entorno.</p>
                </div>
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <p className="text-sm text-slate-100">Proceso de activación pensado para operadores reales y servicio consistente.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Ideal para</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Tours, excursiones, actividades y traslados turísticos</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Objetivo</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Vender más y operar con mejor control</p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="supplier-benefits"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-500">Beneficios</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Lo que gana tu negocio al operar con Proactivitis</h2>
            <p className="text-sm leading-relaxed text-slate-500">
              No se trata solo de publicar un producto. Se trata de tener una estructura comercial y operativa que te
              permita crecer con más claridad.
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
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Un entorno pensado para suppliers que trabajan de verdad</h2>
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
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Cómo funciona la activación</h2>
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
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Qué evaluamos antes de aprobar</h2>
            <div className="mt-6 space-y-3">
              {requirements.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <PartnerRequestForm
            id="partner-form"
            role="SUPPLIER"
            initialOpportunity={initialOpportunity}
            subtitle="Cuéntanos sobre tu empresa, zona de operación y servicios para revisar tu solicitud."
          />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <CreditCard className="h-5 w-5 text-slate-900" />
            <p className="text-base font-semibold text-slate-900">
              Infraestructura de cobro respaldada por Stripe Connect Express
            </p>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            La plataforma está preparada para trabajar con una estructura de pagos más profesional, segura y escalable.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {["Visa", "Mastercard", "American Express", "Discover"].map((brand) => (
              <span key={brand} className="rounded-full border border-slate-200 px-4 py-2 font-semibold shadow-sm">
                {brand}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-slate-900 p-6 text-white shadow-xl md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr,0.9fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-emerald-300">Preguntas frecuentes</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Respuestas rápidas antes de aplicar</h2>
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
