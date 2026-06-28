import Link from "next/link";
import Image from "next/image";
import ProDiscoveryFooter from "@/components/public/ProDiscoveryFooter";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import ProDiscoveryPlannerForm from "@/components/public/ProDiscoveryPlannerForm";
import StructuredData from "@/components/schema/StructuredData";
import { getDominicanGroupIdeas } from "@/lib/prodiscoveryDominicanIdeas";
import { prisma } from "@/lib/prisma";
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

const getApprovedReviewTrust = async () => {
  const [tourReviews, transferReviews] = await Promise.all([
    prisma.tourReview.aggregate({
      where: { status: "APPROVED" },
      _count: { id: true },
      _avg: { rating: true }
    }),
    prisma.transferReview.aggregate({
      where: { status: "APPROVED" },
      _count: { id: true },
      _avg: { rating: true }
    })
  ]);
  const count = tourReviews._count.id + transferReviews._count.id;
  const tourTotal = (tourReviews._avg.rating ?? 0) * tourReviews._count.id;
  const transferTotal = (transferReviews._avg.rating ?? 0) * transferReviews._count.id;
  const average = count > 0 ? Math.round(((tourTotal + transferTotal) / count) * 10) / 10 : 5;
  return { count, average };
};

const absoluteImageUrl = (image: string) =>
  image.startsWith("http") ? image : `${PROACTIVITIS_URL}${image.startsWith("/") ? image : `/${image}`}`;

const copy = {
  es: {
    eyebrow: "ProDiscovery Concierge",
    title: "Diseña Republica Dominicana para tu grupo",
    body:
      "Dinos quien viaja, que quieren vivir y que nivel de servicio esperan. Te ayudamos a crear una propuesta privada para grupos, con guia, transporte y experiencias adaptadas.",
    proof: ["Empresas, familias y bodas", "Guia privado", "Experiencias sin ruta masiva"],
    primaryCta: "Empezar mi propuesta",
    secondaryCta: "Ver ideas en RD",
    readyTicketCta: "Quiero comprar un ticket listo en Proactivitis",
    visualCaption: "Una sola propuesta para transporte, guia, horarios, comidas y experiencia privada.",
    noTicket: "No vendemos tickets sueltos aqui. Diseñamos la experiencia completa para tu grupo.",
    searchLabel: "Buscador de destinos para grupos",
    searchPlaceholder: "Ej: Punta Cana, Santo Domingo, Bayahibe",
    searchButton: "Planificar destino",
    groupTypesEyebrow: "Empieza por el tipo de grupo",
    groupTypesTitle: "Cada grupo necesita una logistica distinta",
    groupTypesBody: "El mismo destino cambia por completo si viaja una empresa, una boda, una familia o un grupo VIP.",
    groupTypes: [
      {
        title: "Empresas e incentivos",
        body: "Agenda privada, traslados puntuales, guia lider y experiencias que representen bien a la marca.",
        href: "/prodiscovery/grupos-corporativos"
      },
      {
        title: "Bodas y celebraciones",
        body: "Planes para invitados, despedidas, cenas privadas, beach days y momentos fotograficos.",
        href: "/prodiscovery/bodas-y-celebraciones"
      },
      {
        title: "Familias y amigos",
        body: "Ritmo flexible, actividades para diferentes edades y menos improvisacion en destino.",
        href: "/prodiscovery/familias-y-amigos"
      },
      {
        title: "Concierge VIP",
        body: "Privacidad, transporte premium, horarios finos y detalles especiales para grupos exigentes.",
        href: "/prodiscovery?dest=Republica%20Dominicana#planner"
      }
    ],
    buildEyebrow: "Como funciona",
    buildTitle: "Detras del formulario hay un equipo preparando tu propuesta",
    buildBody:
      "No se queda en una solicitud fria. Usamos tus datos para preparar una propuesta y luego ajustamos guia, transporte, proveedores y tiempos con criterio local.",
    buildItems: [
      { title: "1. Cuentas tu wishlist", body: "Destino, fechas, personas, idiomas, presupuesto y lo que el grupo quiere vivir." },
      { title: "2. Recibes una propuesta", body: "Preparamos una ruta con ritmo, logistica y servicios recomendados para revisar contigo." },
      { title: "3. Confirmamos equipo local", body: "Ajustamos guia lider, transporte, proveedores, deposito y detalles finales." }
    ],
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
        body: "Nos cuentas la idea y recibes una propuesta para afinarla con fechas, personas y preferencias reales."
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
    ideasEyebrow: "Ideas base con fotos reales",
    ideasTitle: "Experiencias que podemos transformar para tu grupo",
    ideasBody: "Son puntos de partida, no paquetes cerrados. Cada idea se ajusta segun personas, fecha, transporte, guia, comida y privacidad.",
    ideaCta: "Usar esta idea como base"
  },
  en: {
    eyebrow: "ProDiscovery Concierge",
    title: "Design the Dominican Republic for your group",
    body:
      "Tell us who is traveling, what they want to experience and the service level they expect. We help create a private group proposal with guide, transport and tailored experiences.",
    proof: ["Companies, families and weddings", "Private guide", "No mass-route experience"],
    primaryCta: "Start my proposal",
    secondaryCta: "See DR ideas",
    readyTicketCta: "I want to buy a ready ticket on Proactivitis",
    visualCaption: "One proposal for transport, guide, timing, meals and a private experience.",
    noTicket: "We are not selling loose tickets here. We design the full experience for your group.",
    searchLabel: "Group destination search",
    searchPlaceholder: "Example: Punta Cana, Santo Domingo, Bayahibe",
    searchButton: "Plan destination",
    groupTypesEyebrow: "Start with the group type",
    groupTypesTitle: "Every group needs different logistics",
    groupTypesBody: "The same destination changes completely for a company, a wedding, a family or a VIP group.",
    groupTypes: [
      {
        title: "Companies and incentives",
        body: "Private agenda, punctual transfers, lead guide and experiences that represent the brand well.",
        href: "/prodiscovery/grupos-corporativos"
      },
      {
        title: "Weddings and celebrations",
        body: "Plans for guests, bachelor trips, private dinners, beach days and photo moments.",
        href: "/prodiscovery/bodas-y-celebraciones"
      },
      {
        title: "Families and friends",
        body: "Flexible pace, activities for different ages and less improvisation in destination.",
        href: "/prodiscovery/familias-y-amigos"
      },
      {
        title: "VIP concierge",
        body: "Privacy, premium transport, precise timing and special details for demanding groups.",
        href: "/prodiscovery?dest=Dominican%20Republic#planner"
      }
    ],
    buildEyebrow: "How it works",
    buildTitle: "Behind the form, a team prepares your proposal",
    buildBody:
      "This is not a cold request. We use your details to prepare a proposal, then adjust guide, transport, providers and timing with local judgment.",
    buildItems: [
      { title: "1. Share your wishlist", body: "Destination, dates, people, languages, budget and what the group wants to experience." },
      { title: "2. Receive a proposal", body: "We prepare a route with rhythm, logistics and recommended services to review with you." },
      { title: "3. Confirm the local team", body: "We adjust lead guide, transport, providers, deposit and final details." }
    ],
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
        body: "Share the idea and receive a proposal to refine with real dates, people and preferences."
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
    ideasEyebrow: "Base ideas with real photos",
    ideasTitle: "Experiences we can transform for your group",
    ideasBody: "These are starting points, not fixed packages. Each idea changes by people, date, transport, guide, meals and privacy.",
    ideaCta: "Use this idea as a base"
  },
  fr: {
    eyebrow: "ProDiscovery Concierge",
    title: "Concevoir la Republique dominicaine pour votre groupe",
    body:
      "Dites-nous qui voyage, ce que le groupe veut vivre et le niveau de service attendu. Nous creons une proposition privee avec guide, transport et experiences adaptees.",
    proof: ["Entreprises, familles et mariages", "Guide prive", "Pas de route massive"],
    primaryCta: "Commencer ma proposition",
    secondaryCta: "Voir idees RD",
    readyTicketCta: "Je veux acheter un ticket pret sur Proactivitis",
    visualCaption: "Une seule proposition pour transport, guide, horaires, repas et experience privee.",
    noTicket: "Nous ne vendons pas de tickets separes ici. Nous concevons l experience complete pour votre groupe.",
    searchLabel: "Recherche de destination groupe",
    searchPlaceholder: "Exemple : Punta Cana, Santo Domingo, Bayahibe",
    searchButton: "Planifier destination",
    groupTypesEyebrow: "Commencer par le type de groupe",
    groupTypesTitle: "Chaque groupe demande une logistique differente",
    groupTypesBody: "La meme destination change totalement pour une entreprise, un mariage, une famille ou un groupe VIP.",
    groupTypes: [
      {
        title: "Entreprises et incentives",
        body: "Agenda prive, transferts ponctuels, guide leader et experiences qui representent bien la marque.",
        href: "/prodiscovery/grupos-corporativos"
      },
      {
        title: "Mariages et celebrations",
        body: "Plans pour invites, enterrements, diners prives, journees plage et moments photo.",
        href: "/prodiscovery/bodas-y-celebraciones"
      },
      {
        title: "Familles et amis",
        body: "Rythme flexible, activites pour differents ages et moins d improvisation sur place.",
        href: "/prodiscovery/familias-y-amigos"
      },
      {
        title: "Concierge VIP",
        body: "Confidentialite, transport premium, horaires precis et details speciaux pour groupes exigeants.",
        href: "/prodiscovery?dest=Republique%20dominicaine#planner"
      }
    ],
    buildEyebrow: "Comment ca marche",
    buildTitle: "Derriere le formulaire, une equipe prepare votre proposition",
    buildBody:
      "Ce n est pas une demande froide. Nous utilisons vos details pour preparer une proposition, puis ajustons guide, transport, fournisseurs et horaires.",
    buildItems: [
      { title: "1. Partagez votre wishlist", body: "Destination, dates, personnes, langues, budget et envies du groupe." },
      { title: "2. Recevez une proposition", body: "Nous preparons une route avec rythme, logistique et services recommandes pour la revoir avec vous." },
      { title: "3. Confirmons l equipe locale", body: "Nous ajustons guide leader, transport, fournisseurs, depot et details finaux." }
    ],
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
        body: "Partagez l idee et recevez une proposition a affiner avec dates, personnes et preferences reelles."
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
    ideasEyebrow: "Idees de base avec photos reelles",
    ideasTitle: "Experiences que nous pouvons transformer pour votre groupe",
    ideasBody: "Ce sont des points de depart, pas des forfaits fixes. Chaque idee change selon personnes, date, transport, guide, repas et confidentialite.",
    ideaCta: "Utiliser cette idee comme base"
  }
};

export default async function ProDiscoveryPlannerPage({ locale, initialCity, landingSlug }: Props) {
  const t = copy[locale] ?? copy.es;
  const [ideas, reviewTrust] = await Promise.all([getDominicanGroupIdeas(locale, 6), getApprovedReviewTrust()]);
  const heroImage = ideas[0]?.image ?? "/fototours/fotosimple.jpg";
  const pagePath = landingSlug ? `/prodiscovery/${landingSlug}` : "/prodiscovery";
  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}${pagePath}`;
  const imageUrl = absoluteImageUrl(heroImage);
  const serviceId = `${pageUrl}#prodiscovery-service`;
  const organizationId = `${PROACTIVITIS_URL}#organization`;
  const websiteId = `${PROACTIVITIS_URL}#website`;
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Proactivitis",
        url: PROACTIVITIS_URL,
        logo: `${PROACTIVITIS_URL}/icon.png`
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: PROACTIVITIS_URL,
        name: "Proactivitis",
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: `${PROACTIVITIS_URL}/prodiscovery?dest={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: initialCity ? `${t.title}: ${initialCity}` : t.title,
        description: t.body,
        inLanguage: locale,
        isPartOf: { "@id": websiteId },
        publisher: { "@id": organizationId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: imageUrl,
          thumbnailUrl: imageUrl
        },
        mainEntity: { "@id": serviceId },
        about: { "@id": serviceId }
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name: "ProDiscovery Concierge",
        serviceType: "Custom group travel planning",
        description: t.body,
        provider: { "@id": organizationId },
        url: pageUrl,
        image: imageUrl,
        thumbnailUrl: imageUrl,
        areaServed: {
          "@type": "Place",
          name: initialCity ?? "Dominican Republic"
        },
        availableLanguage: ["es", "en", "fr"]
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Proactivitis",
            item: PROACTIVITIS_URL
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "ProDiscovery",
            item: `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: initialCity ?? "Group planner",
            item: pageUrl
          }
        ]
      }
    ]
  };

  return (
    <main className="travel-surface bg-[#f5f7f9]">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} reviewTrust={reviewTrust} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_500px] lg:px-8 lg:py-8">
          <div className="flex flex-col">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
              {initialCity ? `${t.title}: ${initialCity}` : t.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">{t.body}</p>
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-black leading-6 text-emerald-950">{t.noTicket}</p>
              <Link href={`${localePrefix(locale)}/tours`} className="mt-2 inline-flex text-sm font-black text-emerald-900 underline decoration-emerald-500/40 underline-offset-4 hover:text-slate-950">
                {t.readyTicketCta}
              </Link>
            </div>
            <form action={`${localePrefix(locale)}/prodiscovery`} method="get" className="mt-4 grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]">
              <label className="block min-w-0">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t.searchLabel}</span>
                <input
                  name="dest"
                  defaultValue={initialCity ?? ""}
                  placeholder={t.searchPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none ring-emerald-200 focus:ring-2"
                />
              </label>
              <button className="self-end rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                {t.searchButton}
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-2">
              {t.proof.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="relative mt-5 min-h-[330px] overflow-hidden rounded-[28px] bg-slate-200">
              <Image src={heroImage} alt={t.title} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent p-5 text-white">
                <p className="max-w-xl text-xl font-black leading-tight">{t.visualCaption}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {t.socialCases.map((item) => (
                    <div key={item} className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <p className="text-xs font-semibold leading-5 text-white/90">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div id="planner" className="lg:sticky lg:top-40 lg:self-start">
            <ProDiscoveryPlannerForm locale={locale} initialCity={initialCity ?? defaultPlannerCity(locale)} />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.groupTypesEyebrow}</p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-slate-950">{t.groupTypesTitle}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{t.groupTypesBody}</p>
          </div>
          <Link href="#planner" className="w-fit rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
            {t.primaryCta}
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {t.groupTypes.map((item, index) => {
            const image = ideas[(index + 1) % Math.max(ideas.length, 1)]?.image ?? heroImage;
            const href = item.href.startsWith("/prodiscovery") ? `${localePrefix(locale)}${item.href}` : item.href;
            return (
              <Link key={item.title} href={href} className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm hover:border-emerald-300">
                <div className="relative h-44 bg-slate-100">
                  <Image src={image} alt={item.title} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black leading-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-7 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.buildEyebrow}</p>
            <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{t.buildTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t.buildBody}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {t.buildItems.map((item) => (
              <article key={item.title} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-base font-black leading-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {ideas.length ? (
        <section className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.ideasEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">{t.ideasTitle}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{t.ideasBody}</p>
            </div>
            <Link
              href={`${localePrefix(locale)}/prodiscovery/republica-dominicana`}
              className="w-fit rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-800 hover:border-slate-500"
            >
              {t.secondaryCta}
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <article key={idea.slug} className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
                <div className="relative h-44 bg-slate-100">
                  <Image
                    src={idea.image}
                    alt={idea.title}
                    fill
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-600">
                      {idea.destination}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">
                      {idea.category}
                    </span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-lg font-black leading-tight text-slate-950">{idea.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{idea.description}</p>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-slate-800">{idea.groupAngle}</p>
                  <Link href={`${localePrefix(locale)}/prodiscovery/tour/${idea.slug}`} className="mt-3 inline-flex rounded-2xl bg-slate-950 px-4 py-2 text-sm font-black text-white">
                    {t.ideaCta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <ProDiscoveryFooter locale={locale} />
    </main>
  );
}
