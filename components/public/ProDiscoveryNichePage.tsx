import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ProDiscoveryFooter from "@/components/public/ProDiscoveryFooter";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import ProDiscoveryPlannerForm from "@/components/public/ProDiscoveryPlannerForm";
import StructuredData from "@/components/schema/StructuredData";
import { getDominicanGroupIdeas } from "@/lib/prodiscoveryDominicanIdeas";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

export type ProDiscoveryNicheKey = "dominican" | "corporate" | "weddings" | "families";

type Props = {
  locale: Locale;
  niche: ProDiscoveryNicheKey;
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

type NichePageCopy = {
  path: string;
  eyebrow: string;
  title: string;
  body: string;
  proof: string[];
  plannerCity: string;
  sections: Array<{ title: string; body: string }>;
};

type LocalePageCopy = {
  cta: string;
  ideasEyebrow: string;
  ideasTitle: string;
  ideasBody: string;
  ideaCta: string;
  serviceType: string;
  areaServed: string;
  pages: Record<ProDiscoveryNicheKey, NichePageCopy>;
};

const COPY: Record<Locale, LocalePageCopy> = {
  es: {
    cta: "Solicitar propuesta",
    ideasEyebrow: "Inspiracion sin precio publicado",
    ideasTitle: "Ideas dominicanas para convertir en plan privado",
    ideasBody:
      "Estas experiencias sirven como punto de partida. Tu propuesta se ajusta segun cantidad de personas, fechas, transporte, guia, comida y nivel de privacidad.",
    ideaCta: "Solicitar algo parecido",
    serviceType: "Planificacion de viajes privados para grupos",
    areaServed: "Republica Dominicana",
    pages: {
      dominican: {
        path: "/prodiscovery/republica-dominicana",
        eyebrow: "Republica Dominicana privada",
        title: "Viajes de grupo en Republica Dominicana, disenados a medida",
        body:
          "Planificamos experiencias privadas para grupos que quieren playa, cultura, transporte, cenas, aventura o celebraciones con un ritmo propio.",
        proof: ["Punta Cana", "Bayahibe", "Santo Domingo", "Puerto Plata"],
        plannerCity: "Republica Dominicana",
        sections: [
          {
            title: "Un solo plan para todo el grupo",
            body: "Combinamos experiencias, traslados y tiempos libres para que todos sepan que pasara antes de viajar."
          },
          {
            title: "Privacidad cuando importa",
            body: "Adaptamos horarios, guia, paradas, comida y transporte para empresas, bodas, familias o amigos."
          },
          {
            title: "Ideas reales como punto de partida",
            body: "Tomamos experiencias dominicanas existentes y las convertimos en una propuesta privada para tu grupo."
          }
        ]
      },
      corporate: {
        path: "/prodiscovery/grupos-corporativos",
        eyebrow: "Empresas e incentivos",
        title: "Viajes corporativos en Republica Dominicana con experiencia privada",
        body:
          "Para equipos, incentivos, convenciones y clientes VIP que necesitan una agenda clara, buena imagen y momentos memorables.",
        proof: ["Incentivos", "Team building", "Clientes VIP", "Agenda privada"],
        plannerCity: "Republica Dominicana",
        sections: [
          {
            title: "Agenda que respeta el tiempo del equipo",
            body: "Proponemos actividades con ventanas realistas para reuniones, comidas, traslados y descansos."
          },
          {
            title: "Experiencias que se sienten profesionales",
            body: "Guias, transporte y espacios se seleccionan segun el tono del grupo: ejecutivo, relajado o celebracion."
          },
          {
            title: "Un viaje que representa a la empresa",
            body: "El plan puede incluir bienvenida, actividad principal, cena privada y cierre sin que el grupo se disperse."
          }
        ]
      },
      weddings: {
        path: "/prodiscovery/bodas-y-celebraciones",
        eyebrow: "Bodas y celebraciones",
        title: "Experiencias privadas para bodas, despedidas y celebraciones",
        body:
          "Creamos planes para invitados, grupos de amigos y familias que quieren celebrar en Republica Dominicana sin una ruta generica.",
        proof: ["Bodas", "Despedidas", "Cumpleanos", "Invitados"],
        plannerCity: "Republica Dominicana",
        sections: [
          {
            title: "Planes para antes y despues del evento",
            body: "Beach day, barco privado, cena, aventura suave o ruta cultural para que los invitados compartan mas que el hotel."
          },
          {
            title: "Ritmo pensado para celebracion",
            body: "Adaptamos musica, comida, transporte y tiempos para que la experiencia no se sienta apresurada."
          },
          {
            title: "Opciones para grupos mixtos",
            body: "Cuando viajan adultos, jovenes y familias, proponemos actividades que funcionen para todos."
          }
        ]
      },
      families: {
        path: "/prodiscovery/familias-y-amigos",
        eyebrow: "Familias y amigos",
        title: "Viajes privados para familias y grupos de amigos",
        body:
          "Disenamos experiencias para grupos que quieren moverse juntos, evitar esperas y tener un plan flexible en Republica Dominicana.",
        proof: ["Familias", "Amigos", "Multigeneracional", "Ritmo flexible"],
        plannerCity: "Republica Dominicana",
        sections: [
          {
            title: "Un plan facil de seguir",
            body: "La propuesta explica que se hace, cuanto dura, donde se recoge al grupo y como se adapta el ritmo."
          },
          {
            title: "Actividades para diferentes edades",
            body: "Equilibramos playa, cultura, aventura suave, comida y descanso para que nadie quede fuera."
          },
          {
            title: "Menos improvisacion en destino",
            body: "Llegan con una idea clara y un contacto preparado para ajustar detalles antes del viaje."
          }
        ]
      }
    }
  },
  en: {
    cta: "Request proposal",
    ideasEyebrow: "Inspiration without public prices",
    ideasTitle: "Dominican ideas we can turn into a private plan",
    ideasBody:
      "These experiences are starting points. Your proposal is adjusted by group size, dates, transport, guide, meals and privacy level.",
    ideaCta: "Request something similar",
    serviceType: "Private group travel planning",
    areaServed: "Dominican Republic",
    pages: {
      dominican: {
        path: "/prodiscovery/republica-dominicana",
        eyebrow: "Private Dominican Republic",
        title: "Custom group trips in the Dominican Republic",
        body:
          "We plan private experiences for groups that want beaches, culture, transport, dinners, adventure or celebrations with their own rhythm.",
        proof: ["Punta Cana", "Bayahibe", "Santo Domingo", "Puerto Plata"],
        plannerCity: "Dominican Republic",
        sections: [
          {
            title: "One plan for the whole group",
            body: "We combine experiences, transfers and free time so everyone understands the trip before arriving."
          },
          {
            title: "Privacy when it matters",
            body: "Timing, guide, stops, food and transport can adapt to companies, weddings, families or friends."
          },
          {
            title: "Real ideas as a starting point",
            body: "We take Dominican experiences and reshape them into a private proposal for your group."
          }
        ]
      },
      corporate: {
        path: "/prodiscovery/grupos-corporativos",
        eyebrow: "Companies and incentives",
        title: "Corporate trips in the Dominican Republic with a private experience",
        body:
          "For teams, incentives, conventions and VIP clients that need a clear agenda, strong presentation and memorable moments.",
        proof: ["Incentives", "Team building", "VIP clients", "Private agenda"],
        plannerCity: "Dominican Republic",
        sections: [
          {
            title: "An agenda that respects the team",
            body: "We propose activities with realistic windows for meetings, meals, transfers and rest."
          },
          {
            title: "Experiences that feel professional",
            body: "Guides, transport and spaces are selected around the group tone: executive, relaxed or celebratory."
          },
          {
            title: "A trip that represents the company",
            body: "The plan can include welcome moments, a main activity, private dinner and closing without losing the group."
          }
        ]
      },
      weddings: {
        path: "/prodiscovery/bodas-y-celebraciones",
        eyebrow: "Weddings and celebrations",
        title: "Private experiences for weddings, bachelor trips and celebrations",
        body:
          "We create plans for guests, friends and families that want to celebrate in the Dominican Republic without a generic route.",
        proof: ["Weddings", "Bachelor trips", "Birthdays", "Guests"],
        plannerCity: "Dominican Republic",
        sections: [
          {
            title: "Plans before and after the event",
            body: "Beach day, private boat, dinner, soft adventure or cultural route so guests share more than the hotel."
          },
          {
            title: "A rhythm made for celebration",
            body: "Music, food, transport and timing can adapt so the experience does not feel rushed."
          },
          {
            title: "Options for mixed groups",
            body: "When adults, young travelers and families travel together, we propose activities that work for everyone."
          }
        ]
      },
      families: {
        path: "/prodiscovery/familias-y-amigos",
        eyebrow: "Families and friends",
        title: "Private trips for families and groups of friends",
        body:
          "We design experiences for groups that want to move together, avoid waiting and keep a flexible plan in the Dominican Republic.",
        proof: ["Families", "Friends", "Multi-generation", "Flexible rhythm"],
        plannerCity: "Dominican Republic",
        sections: [
          {
            title: "A plan that is easy to follow",
            body: "The proposal explains what happens, how long it lasts, where pickup happens and how the pace can adapt."
          },
          {
            title: "Activities for different ages",
            body: "We balance beach, culture, soft adventure, food and rest so nobody is left out."
          },
          {
            title: "Less improvisation in destination",
            body: "The group arrives with a clear idea and a contact ready to adjust details before the trip."
          }
        ]
      }
    }
  },
  fr: {
    cta: "Demander proposition",
    ideasEyebrow: "Inspiration sans prix public",
    ideasTitle: "Idees dominicaines a transformer en plan prive",
    ideasBody:
      "Ces experiences sont des points de depart. Votre proposition s ajuste selon le nombre de personnes, les dates, le transport, le guide, les repas et le niveau de confidentialite.",
    ideaCta: "Demander une idee similaire",
    serviceType: "Planification de voyages prives pour groupes",
    areaServed: "Republique dominicaine",
    pages: {
      dominican: {
        path: "/prodiscovery/republica-dominicana",
        eyebrow: "Republique dominicaine privee",
        title: "Voyages de groupe sur mesure en Republique dominicaine",
        body:
          "Nous planifions des experiences privees pour groupes qui veulent plage, culture, transport, diners, aventure ou celebrations avec leur propre rythme.",
        proof: ["Punta Cana", "Bayahibe", "Santo Domingo", "Puerto Plata"],
        plannerCity: "Republique dominicaine",
        sections: [
          {
            title: "Un seul plan pour tout le groupe",
            body: "Nous combinons experiences, transferts et temps libres pour que chacun comprenne le voyage avant d arriver."
          },
          {
            title: "La confidentialite quand elle compte",
            body: "Horaires, guide, arrets, repas et transport peuvent s adapter aux entreprises, mariages, familles ou amis."
          },
          {
            title: "Des idees reelles comme point de depart",
            body: "Nous prenons des experiences dominicaines et les transformons en proposition privee pour votre groupe."
          }
        ]
      },
      corporate: {
        path: "/prodiscovery/grupos-corporativos",
        eyebrow: "Entreprises et incentives",
        title: "Voyages d entreprise en Republique dominicaine avec experience privee",
        body:
          "Pour equipes, incentives, conventions et clients VIP qui ont besoin d un agenda clair, d une belle presentation et de moments memorables.",
        proof: ["Incentives", "Team building", "Clients VIP", "Agenda prive"],
        plannerCity: "Republique dominicaine",
        sections: [
          {
            title: "Un agenda qui respecte l equipe",
            body: "Nous proposons des activites avec des fenetres realistes pour reunions, repas, transferts et repos."
          },
          {
            title: "Des experiences professionnelles",
            body: "Guides, transport et espaces sont choisis selon le ton du groupe: executif, detendu ou celebratif."
          },
          {
            title: "Un voyage qui represente l entreprise",
            body: "Le plan peut inclure accueil, activite principale, diner prive et cloture sans disperser le groupe."
          }
        ]
      },
      weddings: {
        path: "/prodiscovery/bodas-y-celebraciones",
        eyebrow: "Mariages et celebrations",
        title: "Experiences privees pour mariages, enterrements et celebrations",
        body:
          "Nous creons des plans pour invites, amis et familles qui veulent celebrer en Republique dominicaine sans route generique.",
        proof: ["Mariages", "Enterrements", "Anniversaires", "Invites"],
        plannerCity: "Republique dominicaine",
        sections: [
          {
            title: "Plans avant et apres l evenement",
            body: "Journee plage, bateau prive, diner, aventure douce ou route culturelle pour partager plus que l hotel."
          },
          {
            title: "Un rythme pense pour celebrer",
            body: "Musique, repas, transport et horaires peuvent s adapter pour que l experience ne semble pas pressee."
          },
          {
            title: "Options pour groupes mixtes",
            body: "Quand adultes, jeunes et familles voyagent ensemble, nous proposons des activites qui fonctionnent pour tous."
          }
        ]
      },
      families: {
        path: "/prodiscovery/familias-y-amigos",
        eyebrow: "Familles et amis",
        title: "Voyages prives pour familles et groupes d amis",
        body:
          "Nous concevons des experiences pour groupes qui veulent bouger ensemble, eviter les attentes et garder un plan flexible en Republique dominicaine.",
        proof: ["Familles", "Amis", "Multigeneration", "Rythme flexible"],
        plannerCity: "Republique dominicaine",
        sections: [
          {
            title: "Un plan facile a suivre",
            body: "La proposition explique quoi faire, combien de temps prevoir, ou le groupe est recupere et comment adapter le rythme."
          },
          {
            title: "Activites pour differents ages",
            body: "Nous equilibrons plage, culture, aventure douce, repas et repos pour que personne ne reste a l ecart."
          },
          {
            title: "Moins d improvisation sur place",
            body: "Le groupe arrive avec une idee claire et un contact pret a ajuster les details avant le voyage."
          }
        ]
      }
    }
  }
};

export async function ProDiscoveryNichePage({ locale, niche }: Props) {
  const t = COPY[locale] ?? COPY.es;
  const page = t.pages[niche];
  const ideas = await getDominicanGroupIdeas(locale, niche === "dominican" ? 9 : 6);
  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}${page.path}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: t.serviceType,
    areaServed: t.areaServed,
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    url: pageUrl,
    description: page.body
  };

  return (
    <main className="travel-surface bg-[#f5f7f9] pb-24">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{page.eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{page.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{page.body}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {page.proof.map((item) => (
                <span key={item} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {item}
                </span>
              ))}
            </div>
            <Link href="#planner" className="mt-6 w-fit rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
              {t.cta}
            </Link>
          </div>
          <div id="planner">
            <ProDiscoveryPlannerForm locale={locale} initialCity={page.plannerCity} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        {page.sections.map((section) => (
          <article key={section.title} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-black leading-snug text-slate-950">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{section.body}</p>
          </article>
        ))}
      </section>

      {ideas.length ? (
        <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.ideasEyebrow}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{t.ideasTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              {t.ideasBody}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ideas.map((idea) => (
                <article key={idea.slug} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50">
                  <div className="relative h-32 bg-slate-100">
                    <Image src={idea.image} alt={idea.title} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">{idea.destination}</p>
                    <h3 className="mt-2 line-clamp-2 text-base font-black leading-tight text-slate-950">{idea.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{idea.description}</p>
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-800">{idea.groupAngle}</p>
                    <Link href={`${localePrefix(locale)}/prodiscovery?dest=${encodeURIComponent(idea.destination)}#planner`} className="mt-3 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      {t.ideaCta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ProDiscoveryFooter locale={locale} />
    </main>
  );
}

export function getProDiscoveryNicheMetadata(niche: ProDiscoveryNicheKey, locale: Locale = "es"): Metadata {
  const page = (COPY[locale] ?? COPY.es).pages[niche];
  const canonicalPath = `${localePrefix(locale)}${page.path}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;
  return {
    title: `${page.title} | ProDiscovery`,
    description: page.body,
    alternates: {
      canonical,
      languages: {
        es: page.path,
        en: `/en${page.path}`,
        fr: `/fr${page.path}`,
        "x-default": page.path
      }
    },
    openGraph: {
      title: `${page.title} | ProDiscovery`,
      description: page.body,
      url: canonical,
      type: "website"
    },
    robots: { index: true, follow: true }
  };
}
