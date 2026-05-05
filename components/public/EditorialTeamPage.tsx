import type { Metadata } from "next";
import Link from "next/link";

const BASE_URL = "https://proactivitis.com";
const EDITORIAL_NAME = "Departamento de Inteligencia Editorial Proactivitis";
const CONTACT_EMAIL = "prensa@proactivitis.com";

type EditorialLocale = "es" | "en" | "fr";

const COPY = {
  es: {
    eyebrow: "Autoridad editorial",
    title: EDITORIAL_NAME,
    description:
      "Unidad central de analisis y difusion de informacion tecnica para el sector turismo global.",
    whoTitle: "Quienes somos",
    whoBody:
      "El Departamento de Inteligencia Editorial de Proactivitis es la unidad central de analisis y difusion de informacion tecnica para el sector turismo global. Nuestra mision es transformar datos complejos de logistica, mercado y tecnologia en informacion accionable para el viajero moderno y agencias aliadas.",
    approachTitle: "Nuestro Enfoque (E-E-A-T)",
    approachIntro:
      "Operamos bajo un modelo hibrido que combina sistemas avanzados de procesamiento de datos con supervision de especialistas en operaciones turisticas.",
    pillars: [
      {
        title: "Analisis Logistico",
        body: "Monitoreo constante de flujos de transporte y servicios de transferencia en los principales nodos turisticos del Caribe y destinos internacionales."
      },
      {
        title: "Auditoria de Mercado",
        body: "Verificacion de estandares de calidad y estructuras de costos en plataformas globales como Viator, GetYourGuide y sistemas B2B."
      },
      {
        title: "Innovacion Tecnologica",
        body: "Implementacion de arquitecturas de software y SEO programatico para garantizar que la informacion llegue al usuario con frescura y precision."
      }
    ],
    transparencyTitle: "Compromiso de Transparencia",
    transparencyBody:
      "Todo el contenido publicado bajo este sello editorial pasa por un proceso de verificacion de datos. Aunque utilizamos herramientas de automatizacion e inteligencia artificial para procesar grandes volumenes de datos, la integridad editorial y la precision de precios, horarios y rutas son prioridad absoluta.",
    contactTitle: "Contacto Institucional",
    contactBody:
      "Para consultas de prensa, colaboraciones editoriales o verificacion de datos, puede contactar a nuestro equipo de redaccion.",
    location: "Ubicacion de operaciones: Region Este, Republica Dominicana.",
    back: "Volver a noticias"
  },
  en: {
    eyebrow: "Editorial authority",
    title: "Proactivitis Editorial Intelligence Department",
    description:
      "Central analysis and technical publishing unit for the global tourism sector.",
    whoTitle: "Who we are",
    whoBody:
      "The Proactivitis Editorial Intelligence Department is the central unit for technical analysis and information distribution across the global tourism sector. Its mission is to turn complex logistics, market and technology data into actionable information for modern travelers and allied agencies.",
    approachTitle: "Our E-E-A-T approach",
    approachIntro:
      "The department operates through a hybrid model that combines advanced data-processing systems with supervision from tourism operations specialists.",
    pillars: [
      {
        title: "Logistics analysis",
        body: "Continuous monitoring of transportation flows and transfer services across key Caribbean tourism nodes and international destinations."
      },
      {
        title: "Market auditing",
        body: "Verification of quality standards and cost structures across global platforms such as Viator, GetYourGuide and B2B systems."
      },
      {
        title: "Technology innovation",
        body: "Implementation of software architecture and programmatic SEO systems to keep travel information fresh, precise and accessible."
      }
    ],
    transparencyTitle: "Transparency commitment",
    transparencyBody:
      "Content published under this editorial seal follows a fact-checking process. Automation and artificial intelligence may be used to process large data volumes, but editorial integrity and the accuracy of prices, schedules and routes remain the priority.",
    contactTitle: "Institutional contact",
    contactBody:
      "For press inquiries, editorial collaborations or data verification requests, contact the editorial team.",
    location: "Operations location: Eastern Region, Dominican Republic.",
    back: "Back to news"
  },
  fr: {
    eyebrow: "Autorite editoriale",
    title: "Departement d'intelligence editoriale Proactivitis",
    description:
      "Unite centrale d'analyse et de diffusion d'information technique pour le secteur touristique mondial.",
    whoTitle: "Qui sommes-nous ?",
    whoBody:
      "Le Departement d'intelligence editoriale de Proactivitis est l'unite centrale d'analyse et de diffusion d'information technique pour le secteur touristique mondial. Sa mission est de transformer des donnees complexes de logistique, de marche et de technologie en informations actionnables pour les voyageurs modernes et les agences partenaires.",
    approachTitle: "Notre approche E-E-A-T",
    approachIntro:
      "Le departement fonctionne avec un modele hybride qui combine des systemes avances de traitement de donnees et la supervision de specialistes en operations touristiques.",
    pillars: [
      {
        title: "Analyse logistique",
        body: "Surveillance continue des flux de transport et des services de transfert dans les principaux hubs touristiques des Caraibes et des destinations internationales."
      },
      {
        title: "Audit de marche",
        body: "Verification des standards de qualite et des structures de couts sur des plateformes globales comme Viator, GetYourGuide et les systemes B2B."
      },
      {
        title: "Innovation technologique",
        body: "Mise en place d'architectures logicielles et de SEO programmatique pour garantir une information fraiche, precise et accessible."
      }
    ],
    transparencyTitle: "Engagement de transparence",
    transparencyBody:
      "Les contenus publies sous ce sceau editorial suivent un processus de verification des donnees. Des outils d'automatisation et d'intelligence artificielle peuvent etre utilises pour traiter de grands volumes de donnees, mais l'integrite editoriale et la precision des prix, horaires et routes restent prioritaires.",
    contactTitle: "Contact institutionnel",
    contactBody:
      "Pour les demandes presse, collaborations editoriales ou verifications de donnees, contactez l'equipe editoriale.",
    location: "Lieu des operations : Region Est, Republique dominicaine.",
    back: "Retour aux actualites"
  }
} as const;

export function buildEditorialTeamMetadata(locale: EditorialLocale): Metadata {
  const copy = COPY[locale];
  const path = locale === "es" ? "/es/equipo-editorial" : locale === "fr" ? "/fr/equipe-editoriale" : "/en/editorial-team";
  return {
    title: `${copy.title} | Proactivitis`,
    description: copy.description,
    alternates: {
      canonical: `${BASE_URL}${path}`,
      languages: {
        es: `${BASE_URL}/es/equipo-editorial`,
        en: `${BASE_URL}/en/editorial-team`,
        fr: `${BASE_URL}/fr/equipe-editoriale`
      }
    }
  };
}

export default function EditorialTeamPage({ locale }: { locale: EditorialLocale }) {
  const copy = COPY[locale];
  const pageUrl = `${BASE_URL}${locale === "es" ? "/es/equipo-editorial" : locale === "fr" ? "/fr/equipe-editoriale" : "/en/editorial-team"}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/en/editorial-team#editorial-organization`,
    name: EDITORIAL_NAME,
    alternateName: "Proactivitis Editorial Intelligence Department",
    url: pageUrl,
    email: CONTACT_EMAIL,
    parentOrganization: {
      "@type": "Organization",
      name: "Proactivitis",
      url: BASE_URL
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "Region Este",
      addressCountry: "DO"
    }
  };

  return (
    <div className="bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-700">{copy.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">{copy.description}</p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <section id="who-we-are" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{copy.whoTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{copy.whoBody}</p>
        </section>

        <section id="approach" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{copy.approachTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{copy.approachIntro}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {copy.pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-950">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="transparency" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{copy.transparencyTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{copy.transparencyBody}</p>
        </section>

        <section id="contact" className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">{copy.contactTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">{copy.contactBody}</p>
          <p className="mt-4 text-sm font-bold text-slate-950">
            Email: <a className="text-sky-700 underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <p className="mt-2 text-sm text-slate-600">{copy.location}</p>
        </section>

        <Link href={locale === "es" ? "/news" : `/${locale}/news`} className="inline-flex rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:text-sky-700">
          {copy.back}
        </Link>
      </main>
    </div>
  );
}
