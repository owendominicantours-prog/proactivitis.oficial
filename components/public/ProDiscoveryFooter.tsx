import Link from "next/link";
import Image from "next/image";
import { PRODISCOVERY_LOGO_URL } from "@/lib/prodiscoveryBrand";
import type { Locale } from "@/lib/translations";

const copy = {
  es: {
    title: "Viajes privados para grupos",
    body:
      "Planificamos viajes privados para grupos en Republica Dominicana: empresas, familias, bodas, despedidas, incentivos y celebraciones con guia, transporte, cenas privadas, fotografia y logistica de grupo.",
    cta: "Diseñar mi viaje privado",
    signature: "Concierge para grupos privados, incentivos y celebraciones.",
    columns: [
      {
        title: "Planificacion",
        links: [
          ["Formulario maestro", "/prodiscovery#planner"],
          ["Republica Dominicana", "/prodiscovery/republica-dominicana"],
          ["Punta Cana para grupos", "/prodiscovery?dest=Punta%20Cana#planner"],
          ["Santo Domingo privado", "/prodiscovery?dest=Santo%20Domingo#planner"]
        ]
      },
      {
        title: "Tipos de grupo",
        links: [
          ["Empresas e incentivos", "/prodiscovery/grupos-corporativos"],
          ["Bodas y celebraciones", "/prodiscovery/bodas-y-celebraciones"],
          ["Familias y amigos", "/prodiscovery/familias-y-amigos"],
          ["Grupos VIP", "/prodiscovery?dest=Republica%20Dominicana#planner"]
        ]
      }
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, presupuesto viaje de incentivo Republica Dominicana."
  },
  en: {
    title: "Private group travel planning",
    body:
      "We plan private group trips in the Dominican Republic for companies, families, weddings, bachelor trips, incentives and celebrations with guide, transport, private dinners, photography and group logistics.",
    cta: "Design my private trip",
    signature: "Concierge for private groups, incentives and celebrations.",
    columns: [
      {
        title: "Planning",
        links: [
          ["Master planner", "/en/prodiscovery#planner"],
          ["Dominican Republic", "/en/prodiscovery/republica-dominicana"],
          ["Punta Cana for groups", "/en/prodiscovery?dest=Punta%20Cana#planner"],
          ["Private Santo Domingo", "/en/prodiscovery?dest=Santo%20Domingo#planner"]
        ]
      },
      {
        title: "Group types",
        links: [
          ["Companies and incentives", "/en/prodiscovery/grupos-corporativos"],
          ["Weddings and celebrations", "/en/prodiscovery/bodas-y-celebraciones"],
          ["Families and friends", "/en/prodiscovery/familias-y-amigos"],
          ["VIP groups", "/en/prodiscovery?dest=Dominican%20Republic#planner"]
        ]
      }
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, incentive travel budget Dominican Republic."
  },
  fr: {
    title: "Voyages prives pour groupes",
    body:
      "Nous planifions des voyages prives pour groupes en Republique dominicaine: entreprises, familles, mariages, enterrements, incentives et celebrations avec guide, transport, diners prives, photographie et logistique groupe.",
    cta: "Concevoir mon voyage prive",
    signature: "Concierge pour groupes prives, incentives et celebrations.",
    columns: [
      {
        title: "Planification",
        links: [
          ["Planificateur principal", "/fr/prodiscovery#planner"],
          ["Republique dominicaine", "/fr/prodiscovery/republica-dominicana"],
          ["Punta Cana groupes", "/fr/prodiscovery?dest=Punta%20Cana#planner"],
          ["Santo Domingo prive", "/fr/prodiscovery?dest=Santo%20Domingo#planner"]
        ]
      },
      {
        title: "Types de groupe",
        links: [
          ["Entreprises et incentives", "/fr/prodiscovery/grupos-corporativos"],
          ["Mariages et celebrations", "/fr/prodiscovery/bodas-y-celebraciones"],
          ["Familles et amis", "/fr/prodiscovery/familias-y-amigos"],
          ["Groupes VIP", "/fr/prodiscovery?dest=Republique%20dominicaine#planner"]
        ]
      }
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, budget voyage incentive Republique dominicaine."
  }
} as const;

export default function ProDiscoveryFooter({ locale }: { locale: Locale }) {
  const t = copy[locale] ?? copy.es;
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)]">
          <section>
            <Link href={locale === "es" ? "/prodiscovery" : `/${locale}/prodiscovery`} className="inline-flex bg-white px-3 py-2">
              <Image src={PRODISCOVERY_LOGO_URL} alt={t.title} width={220} height={68} className="h-14 w-auto object-contain" />
            </Link>
            <p className="mt-5 max-w-2xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">{t.title}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{t.body}</p>
            <div className="mt-6 border-l-2 border-emerald-400 pl-4">
              <p className="text-sm font-semibold leading-6 text-slate-200">{t.signature}</p>
              <Link
                href={locale === "es" ? "/prodiscovery#planner" : `/${locale}/prodiscovery#planner`}
                className="mt-3 inline-flex text-sm font-black text-emerald-300 underline decoration-emerald-300/40 underline-offset-4 hover:text-white"
              >
                {t.cta}
              </Link>
            </div>
          </section>

          <nav className="grid gap-8 sm:grid-cols-2">
            {t.columns.map((column) => (
              <div key={column.title}>
                <h2 className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="text-sm font-semibold leading-6 text-slate-300 hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <p className="max-w-5xl text-xs leading-6 text-slate-500">{t.seo}</p>
        </div>
      </div>
    </footer>
  );
}
