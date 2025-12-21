import { CreditCard, Globe, ShieldCheck, Sparkles } from "lucide-react";
import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Conviértete en supplier · Proactivitis"
};

const heroContent = {
  title: "Optimice su Alcance Operativo con Proactivitis",
  subtitle:
    "Únase a la red de proveedores líderes en experiencias turísticas. Potenciamos su inventario con tecnología de vanguardia y exposición global.",
  primaryCTA: "Iniciar Registro Profesional",
  valueProposition: "Calidad, Seguridad y Crecimiento Sostenible."
};

const featureList = [
  {
    id: "fintech",
    title: "Liquidación de Activos",
    description:
      "Ciclos de pago garantizados y conciliación bancaria automatizada para mantener su flujo de caja optimizado.",
    icon: ShieldCheck
  },
  {
    id: "global_reach",
    title: "Exposición Multimercado",
    description:
      "Su oferta será presentada ante audiencias de alto valor en Norteamérica y Europa mediante estrategias de posicionamiento SEO y SEM.",
    icon: Globe
  },
  {
    id: "support",
    title: "Gestión de Cuentas",
    description:
      "Asistencia técnica y operativa personalizada para garantizar que sus estándares de servicio se reflejen en nuestra plataforma.",
    icon: Sparkles
  }
];

const complianceSteps = [
  { step: 1, label: "Registro y validación de credenciales corporativas." },
  { step: 2, label: "Auditoría de estándares de seguridad y calidad." },
  { step: 3, label: "Activación de inventario y acceso al panel de control." }
];

export default function BecomeSupplierPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
      <section className="space-y-6">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Colabora</p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{heroContent.title}</h1>
        <p className="text-lg font-semibold leading-relaxed text-slate-600">{heroContent.subtitle}</p>
        <p className="text-sm text-slate-500">{heroContent.valueProposition}</p>
        <div>
          <a
            href="#partner-form"
            className="button-hover-effect inline-flex items-center justify-center rounded-2xl border border-emerald-600 bg-emerald-50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700"
          >
            {heroContent.primaryCTA}
          </a>
        </div>
      </section>

      <section className="glass-card space-y-6 px-6 py-8 shadow-lg">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Beneficios en cada paso</h2>
        <p className="text-sm text-slate-500">
          Sumamos confianza y tecnología para que su operación crezca sin ceder el control de su marca.
        </p>
        <div className="flex flex-col gap-6 md:flex-row md:gap-4">
          {featureList.map((feature) => (
            <article
              key={feature.id}
              className="mb-6 flex-1 rounded-2xl border border-slate-200 bg-white/60 p-6 shadow-sm transition hover:shadow-lg md:mb-0"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/10 text-slate-900">
                <feature.icon className="h-5 w-5 text-slate-800" />
              </div>
              <p className="text-xl font-semibold tracking-tight text-slate-900">{feature.title}</p>
              <p className="mt-2 text-sm text-slate-500">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Proceso de activación</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {complianceSteps.map((step) => (
            <div
              key={step.step}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-900 shadow-sm"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Paso {step.step}</p>
              <p className="mt-2 text-base font-semibold leading-snug">{step.label}</p>
            </div>
          ))}
        </div>
      </section>

      <PartnerRequestForm id="partner-form" role="SUPPLIER" subtitle="Cuéntanos sobre tu operación y tus servicios" />

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <CreditCard className="h-5 w-5 text-slate-900" />
          <p className="text-base font-semibold text-slate-900">Sistema de pago y cobro garantizado por Stripe Connect Express</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {["Visa", "Mastercard", "American Express", "Discover"].map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold shadow-sm"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
