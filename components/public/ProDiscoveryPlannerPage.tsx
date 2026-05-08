import Link from "next/link";
import Image from "next/image";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import ProDiscoveryPlannerForm from "@/components/public/ProDiscoveryPlannerForm";
import StructuredData from "@/components/schema/StructuredData";
import { getDominicanGroupIdeas } from "@/lib/prodiscoveryDominicanIdeas";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  initialCity?: string;
  landingSlug?: string;
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);
const defaultPlannerCity = (locale: Locale) =>
  locale === "en" ? "Dominican Republic" : locale === "fr" ? "Republique dominicaine" : "Republica Dominicana";

const copy = {
  es: {
    eyebrow: "ProDiscovery Concierge",
    title: "Disena Republica Dominicana para tu grupo",
    body:
      "Dinos quien viaja, que quieren vivir y que nivel de servicio esperan. Te ayudamos a crear una propuesta privada para grupos, con guia, transporte y experiencias adaptadas.",
    proof: ["Empresas, familias y bodas", "Guia privado", "Experiencias sin ruta masiva"],
    primaryCta: "Empezar mi propuesta",
    secondaryCta: "Ver ideas en RD",
    cards: [
      {
        title: "Para grupos que quieren algo propio",
        body: "Viajes corporativos, bodas, familias, amigos y celebraciones que necesitan horarios, traslados y ritmo privado."
      },
      {
        title: "Experiencias dominicanas a medida",
        body: "Playas, islas, cultura, aventura, gastronomia y rutas privadas combinadas segun tu grupo."
      },
      {
        title: "Primero entendemos el viaje",
        body: "Nos cuentas la idea y recibes una propuesta inicial para afinarla con fechas, personas y preferencias reales."
      }
    ],
    sideTitle: "Tu grupo no tiene que adaptarse a una ruta estandar",
    sideBody:
      "ProDiscovery toma una idea amplia y la convierte en un viaje privado: que hacer, como moverse, cuanto tiempo dedicar y que estilo de experiencia conviene.",
    badgeLabel: "Viaje privado",
    socialTitle: "Casos de exito de grupos",
    socialCases: [
      "Grupo de 12 personas de Espana - Itinerario personalizado en Punta Cana - 5 estrellas",
      "Empresa de 28 invitados - Cena privada y experiencia en Santo Domingo - 5 estrellas",
      "Familia multigeneracional - Dia privado desde Bayahibe - 5 estrellas"
    ],
    ideasEyebrow: "Inspiracion Republica Dominicana",
    ideasTitle: "Ideas que podemos convertir en experiencia privada",
    ideasBody: "No mostramos precios aqui porque cada grupo cambia el transporte, horarios, guia, comida y nivel de privacidad.",
    ideaCta: "Solicitar algo parecido"
  },
  en: {
    eyebrow: "ProDiscovery Concierge",
    title: "Design the Dominican Republic for your group",
    body:
      "Tell us who is traveling, what they want to experience and the service level they expect. We help create a private group proposal with guide, transport and tailored experiences.",
    proof: ["Companies, families and weddings", "Private guide", "No mass-route experience"],
    primaryCta: "Start my proposal",
    secondaryCta: "See DR ideas",
    cards: [
      {
        title: "For groups that want something of their own",
        body: "Corporate trips, weddings, families, friends and celebrations that need private timing, transfers and rhythm."
      },
      {
        title: "Dominican experiences made private",
        body: "Beaches, islands, culture, adventure, gastronomy and private routes combined around your group."
      },
      {
        title: "First we understand the trip",
        body: "Share the idea and receive an initial proposal to refine with real dates, people and preferences."
      }
    ],
    sideTitle: "Your group does not need to fit a standard route",
    sideBody:
      "ProDiscovery turns a broad idea into a private trip: what to do, how to move, how much time to spend and what experience style fits.",
    badgeLabel: "Private trip",
    socialTitle: "Group success cases",
    socialCases: [
      "Group of 12 travelers from Spain - Custom itinerary in Punta Cana - 5 stars",
      "Company with 28 guests - Private dinner and Santo Domingo experience - 5 stars",
      "Multi-generation family - Private day from Bayahibe - 5 stars"
    ],
    ideasEyebrow: "Dominican Republic inspiration",
    ideasTitle: "Ideas we can turn into a private experience",
    ideasBody: "Prices are not shown here because every group changes transport, timing, guide, food and privacy level.",
    ideaCta: "Request something similar"
  },
  fr: {
    eyebrow: "ProDiscovery Concierge",
    title: "Concevoir la Republique dominicaine pour votre groupe",
    body:
      "Dites-nous qui voyage, ce que le groupe veut vivre et le niveau de service attendu. Nous creons une proposition privee avec guide, transport et experiences adaptees.",
    proof: ["Entreprises, familles et mariages", "Guide prive", "Pas de route massive"],
    primaryCta: "Commencer ma proposition",
    secondaryCta: "Voir idees RD",
    cards: [
      {
        title: "Pour les groupes qui veulent leur propre voyage",
        body: "Entreprises, mariages, familles, amis et celebrations avec horaires, transferts et rythme prives."
      },
      {
        title: "Experiences dominicaines sur mesure",
        body: "Plages, iles, culture, aventure, gastronomie et routes privees combinees pour votre groupe."
      },
      {
        title: "D abord comprendre le voyage",
        body: "Partagez l idee et recevez une premiere proposition a affiner avec dates, personnes et preferences reelles."
      }
    ],
    sideTitle: "Votre groupe ne doit pas s adapter a une route standard",
    sideBody:
      "ProDiscovery transforme une idee large en voyage prive : quoi faire, comment bouger, combien de temps prevoir et quel style choisir.",
    badgeLabel: "Voyage prive",
    socialTitle: "Cas de reussite groupes",
    socialCases: [
      "Groupe de 12 voyageurs d Espagne - Itineraire sur mesure a Punta Cana - 5 etoiles",
      "Entreprise de 28 invites - Diner prive et experience a Santo Domingo - 5 etoiles",
      "Famille multigeneration - Journee privee depuis Bayahibe - 5 etoiles"
    ],
    ideasEyebrow: "Inspiration Republique dominicaine",
    ideasTitle: "Idees que nous pouvons convertir en experience privee",
    ideasBody: "Les prix ne sont pas affiches car chaque groupe change transport, horaires, guide, repas et niveau de confidentialite.",
    ideaCta: "Demander une idee similaire"
  }
};

export default async function ProDiscoveryPlannerPage({ locale, initialCity, landingSlug }: Props) {
  const t = copy[locale] ?? copy.es;
  const ideas = await getDominicanGroupIdeas(locale, 6);
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
    areaServed: initialCity ?? "Dominican Republic",
    url: pageUrl,
    description: t.body
  };

  return (
    <main className="travel-surface bg-[#f5f7f9] pb-24">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_460px] lg:px-8 lg:py-9">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#planner"
                className="inline-flex rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700"
              >
                {t.primaryCta}
              </Link>
              <Link
                href={`${localePrefix(locale)}/prodiscovery/republica-dominicana`}
                className="inline-flex rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:border-slate-500"
              >
                {t.secondaryCta}
              </Link>
            </div>
          </div>
          <div id="planner">
            <ProDiscoveryPlannerForm locale={locale} initialCity={initialCity ?? defaultPlannerCity(locale)} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          {t.cards.map((card) => (
            <article key={card.title} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-base font-black leading-snug text-slate-950">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
            </article>
          ))}
        </div>
        <article className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">{t.badgeLabel}</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">{t.socialTitle}</h2>
          <div className="mt-3 space-y-3">
            {t.socialCases.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t.sideBody}</p>
        </article>
      </section>

      {ideas.length ? (
        <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.ideasEyebrow}</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">{t.ideasTitle}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{t.ideasBody}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ideas.map((idea) => (
                <article key={idea.slug} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50">
                  <div className="relative h-32 bg-slate-100">
                    <Image
                      src={idea.image}
                      alt={idea.title}
                      fill
                      sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                        {idea.destination}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                        {idea.category}
                      </span>
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-slate-950">{idea.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{idea.description}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-800">{idea.groupAngle}</p>
                    <Link href="#planner" className="mt-3 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      {t.ideaCta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
