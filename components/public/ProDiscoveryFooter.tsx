import Link from "next/link";
import type { Locale } from "@/lib/translations";

const copy = {
  es: {
    title: "ProDiscovery: Custom Group Planner",
    body:
      "Planificamos viajes privados para grupos en Republica Dominicana: empresas, familias, bodas, despedidas, incentivos y celebraciones con guia, transporte, cenas privadas, fotografia y logistica de grupo.",
    links: [
      ["Republica Dominicana", "/prodiscovery/republica-dominicana"],
      ["Empresas", "/prodiscovery/grupos-corporativos"],
      ["Bodas", "/prodiscovery/bodas-y-celebraciones"],
      ["Familias", "/prodiscovery/familias-y-amigos"]
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, presupuesto viaje de incentivo Republica Dominicana."
  },
  en: {
    title: "ProDiscovery: Custom Group Planner",
    body:
      "We plan private group trips in the Dominican Republic for companies, families, weddings, bachelor trips, incentives and celebrations with guide, transport, private dinners, photography and group logistics.",
    links: [
      ["Dominican Republic", "/en/prodiscovery/republica-dominicana"],
      ["Companies", "/en/prodiscovery/grupos-corporativos"],
      ["Weddings", "/en/prodiscovery/bodas-y-celebraciones"],
      ["Families", "/en/prodiscovery/familias-y-amigos"]
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, incentive travel budget Dominican Republic."
  },
  fr: {
    title: "ProDiscovery: Custom Group Planner",
    body:
      "Nous planifions des voyages prives pour groupes en Republique dominicaine: entreprises, familles, mariages, enterrements, incentives et celebrations avec guide, transport, diners prives, photographie et logistique groupe.",
    links: [
      ["Republique dominicaine", "/fr/prodiscovery/republica-dominicana"],
      ["Entreprises", "/fr/prodiscovery/grupos-corporativos"],
      ["Mariages", "/fr/prodiscovery/bodas-y-celebraciones"],
      ["Familles", "/fr/prodiscovery/familias-y-amigos"]
    ],
    seo:
      "Custom itinerary builder Dominican Republic, private tour guide for groups in Punta Cana, group travel logistics Santo Domingo, budget voyage incentive Republique dominicaine."
  }
} as const;

export default function ProDiscoveryFooter({ locale }: { locale: Locale }) {
  const t = copy[locale] ?? copy.es;
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{t.title}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{t.body}</p>
          <p className="mt-3 max-w-4xl text-xs leading-6 text-slate-400">{t.seo}</p>
        </div>
        <nav className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
          {t.links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-emerald-300 hover:text-emerald-700">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
