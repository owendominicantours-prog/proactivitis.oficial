import Link from "next/link";
import Image from "next/image";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import ProDiscoveryPlannerForm from "@/components/public/ProDiscoveryPlannerForm";
import StructuredData from "@/components/schema/StructuredData";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  initialCity?: string;
  landingSlug?: string;
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const copy = {
  es: {
    eyebrow: "ProDiscovery Concierge",
    title: "Disena un viaje privado para tu grupo",
    body:
      "Cuentanos destino, tamano, presupuesto e idea. ProDiscovery convierte la solicitud en una oportunidad operativa con borrador inicial, proveedores y deposito estimado.",
    proof: ["Guia lider", "Logistica privada", "Deposito desde 20%"],
    catalog: "Ver comparador clasico",
    cards: [
      {
        title: "Para grupos que no encajan en un ticket",
        body: "Empresas, familias, bodas, despedidas y viajes con transporte o tiempos especiales."
      },
      {
        title: "Operacion antes que promesa",
        body: "El borrador separa experiencia, proveedores, rutas, riesgos y preguntas pendientes."
      },
      {
        title: "Sin pelear con Proactivitis",
        body: "Proactivitis sigue vendiendo servicios directos. ProDiscovery captura viajes a medida."
      }
    ],
    sideTitle: "De solicitud a propuesta inicial",
    sideBody:
      "El equipo recibe una oportunidad de grupo y el cliente obtiene un primer borrador por email. Luego se valida disponibilidad real antes de cotizar final.",
    adminLabel: "Oportunidades de grupo"
  },
  en: {
    eyebrow: "ProDiscovery Concierge",
    title: "Design a private trip for your group",
    body:
      "Share destination, size, budget and idea. ProDiscovery turns the request into an operational opportunity with an initial draft, suppliers and estimated deposit.",
    proof: ["Lead guide", "Private logistics", "Deposit from 20%"],
    catalog: "Open classic comparison",
    cards: [
      {
        title: "For groups that do not fit a ticket",
        body: "Companies, families, weddings, celebrations and trips with special transport or timing."
      },
      {
        title: "Operations before promises",
        body: "The draft separates experience, suppliers, routes, risks and pending questions."
      },
      {
        title: "No SEO fight with Proactivitis",
        body: "Proactivitis keeps direct services. ProDiscovery captures custom trips."
      }
    ],
    sideTitle: "From request to initial proposal",
    sideBody:
      "The team receives a group opportunity and the client gets a first email draft. Real availability is checked before final quoting.",
    adminLabel: "Group opportunities"
  },
  fr: {
    eyebrow: "ProDiscovery Concierge",
    title: "Concevoir un voyage prive pour votre groupe",
    body:
      "Partagez destination, taille, budget et idee. ProDiscovery transforme la demande en opportunite operationnelle avec ebauche initiale, fournisseurs et acompte estime.",
    proof: ["Guide leader", "Logistique privee", "Acompte des 20%"],
    catalog: "Ouvrir le comparateur",
    cards: [
      {
        title: "Pour les groupes hors ticket standard",
        body: "Entreprises, familles, mariages, celebrations et voyages avec transport ou horaires speciaux."
      },
      {
        title: "Operation avant promesse",
        body: "L ebauche separe experience, fournisseurs, routes, risques et questions restantes."
      },
      {
        title: "Sans conflit avec Proactivitis",
        body: "Proactivitis garde les services directs. ProDiscovery capte les voyages sur mesure."
      }
    ],
    sideTitle: "De la demande a la proposition initiale",
    sideBody:
      "L equipe recoit une opportunite groupe et le client recoit une premiere ebauche par email. La disponibilite reelle est ensuite verifiee.",
    adminLabel: "Opportunites de groupe"
  }
};

export default function ProDiscoveryPlannerPage({ locale, initialCity, landingSlug }: Props) {
  const t = copy[locale] ?? copy.es;
  const pagePath = landingSlug ? `/prodiscovery/${landingSlug}` : "/prodiscovery";
  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}${pagePath}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "ProDiscovery Concierge",
    serviceType: "Custom group travel planning",
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    areaServed: initialCity ?? "Global",
    url: pageUrl,
    description: t.body
  };

  return (
    <main className="travel-surface bg-[#f5f7f9] pb-24">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
              {initialCity ? `${t.title}: ${initialCity}` : t.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{t.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.proof.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href={`${localePrefix(locale)}/prodiscovery?view=catalog`}
                className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:border-slate-500"
              >
                {t.catalog}
              </Link>
            </div>
          </div>
          <ProDiscoveryPlannerForm locale={locale} initialCity={initialCity} />
        </div>
      </section>

      <section className="mx-auto mt-6 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="grid gap-4">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 text-white shadow-xl">
          <div className="relative h-64">
            <Image
              src="/fototours/fotosimple.jpg"
              alt="ProDiscovery custom travel"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          </div>
          <div className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-200">{t.adminLabel}</p>
            <h2 className="mt-2 text-2xl font-black">{t.sideTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{t.sideBody}</p>
          </div>
        </article>
      </section>
    </main>
  );
}
