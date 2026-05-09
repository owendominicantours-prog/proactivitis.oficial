import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProDiscoveryFooter from "@/components/public/ProDiscoveryFooter";
import ProDiscoveryHeader from "@/components/public/ProDiscoveryHeader";
import StructuredData from "@/components/schema/StructuredData";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { localizedDestinationName } from "@/lib/localizedPlaces";
import { prisma } from "@/lib/prisma";
import { getProDiscoveryGroupTitleStore, resolveProDiscoveryGroupTitle } from "@/lib/prodiscoveryGroupTitles";
import { PROACTIVITIS_URL } from "@/lib/seo";
import type { Locale } from "@/lib/translations";

type Props = {
  locale: Locale;
  slug: string;
};

type Copy = {
  back: string;
  eyebrow: string;
  groupLabel: string;
  request: string;
  consult: string;
  snapshot: string;
  duration: string;
  destination: string;
  pickup: string;
  groupFit: string;
  privatePlan: string;
  privatePlanBody: string;
  howItWorks: string;
  included: string;
  adjust: string;
  logistics: string;
  gallery: string;
  related: string;
  relatedCta: string;
  noPublicPrice: string;
  baseExperience: string;
  fallbackDescription: string;
  details: string[];
};

const COPY: Record<Locale, Copy> = {
  es: {
    back: "Volver a ProDiscovery",
    eyebrow: "Experiencia base para grupos",
    groupLabel: "Version privada para grupos",
    request: "Solicitar propuesta para mi grupo",
    consult: "Consultar esta experiencia",
    snapshot: "Resumen para decidir",
    duration: "Duracion base",
    destination: "Destino",
    pickup: "Recogida o punto de encuentro",
    groupFit: "Ideal para",
    privatePlan: "Como se transforma para tu grupo",
    privatePlanBody:
      "Tomamos esta experiencia como punto de partida y la ajustamos con horarios, transporte, guia, comida, ritmo y nivel de privacidad segun el grupo.",
    howItWorks: "Como puede funcionar",
    included: "Base de la experiencia",
    adjust: "Ajustes para grupos",
    logistics: "Logistica que podemos coordinar",
    gallery: "Referencia visual",
    related: "Mas ideas para grupos",
    relatedCta: "Ver idea",
    noPublicPrice: "Sin precio publico: el presupuesto depende de personas, fecha, transporte y privacidad.",
    baseExperience: "Inspirado en un producto real de Proactivitis",
    fallbackDescription:
      "Esta experiencia se puede convertir en un plan privado para empresas, familias, bodas o grupos de amigos con una propuesta hecha a medida.",
    details: [
      "Horario privado o flexible",
      "Transporte coordinado para todo el grupo",
      "Guia lider segun idioma necesario",
      "Paradas y ritmo adaptados",
      "Opciones de comida, fotografia o celebracion"
    ]
  },
  en: {
    back: "Back to ProDiscovery",
    eyebrow: "Base experience for groups",
    groupLabel: "Private version for groups",
    request: "Request proposal for my group",
    consult: "Ask about this experience",
    snapshot: "Decision snapshot",
    duration: "Base duration",
    destination: "Destination",
    pickup: "Pickup or meeting point",
    groupFit: "Best for",
    privatePlan: "How it becomes private for your group",
    privatePlanBody:
      "We use this experience as a starting point and adjust timing, transport, guide, meals, rhythm and privacy level around the group.",
    howItWorks: "How it can work",
    included: "Experience base",
    adjust: "Group adjustments",
    logistics: "Logistics we can coordinate",
    gallery: "Visual reference",
    related: "More group ideas",
    relatedCta: "View idea",
    noPublicPrice: "No public price: the proposal depends on people, date, transport and privacy.",
    baseExperience: "Inspired by a real Proactivitis product",
    fallbackDescription:
      "This experience can become a private plan for companies, families, weddings or groups of friends with a tailored proposal.",
    details: [
      "Private or flexible timing",
      "Transport coordinated for the whole group",
      "Lead guide by required language",
      "Stops and pace adapted",
      "Meal, photography or celebration options"
    ]
  },
  fr: {
    back: "Retour a ProDiscovery",
    eyebrow: "Experience de base pour groupes",
    groupLabel: "Version privee pour groupes",
    request: "Demander proposition pour mon groupe",
    consult: "Consulter cette experience",
    snapshot: "Resume pour decider",
    duration: "Duree de base",
    destination: "Destination",
    pickup: "Pickup ou point de rencontre",
    groupFit: "Ideal pour",
    privatePlan: "Comment elle devient privee pour votre groupe",
    privatePlanBody:
      "Nous utilisons cette experience comme point de depart et ajustons horaires, transport, guide, repas, rythme et confidentialite selon le groupe.",
    howItWorks: "Comment cela peut fonctionner",
    included: "Base de l experience",
    adjust: "Ajustements groupe",
    logistics: "Logistique possible",
    gallery: "Reference visuelle",
    related: "Plus d idees groupe",
    relatedCta: "Voir idee",
    noPublicPrice: "Sans prix public: le budget depend des personnes, de la date, du transport et de la confidentialite.",
    baseExperience: "Inspire d un vrai produit Proactivitis",
    fallbackDescription:
      "Cette experience peut devenir un plan prive pour entreprises, familles, mariages ou groupes d amis avec une proposition sur mesure.",
    details: [
      "Horaire prive ou flexible",
      "Transport coordonne pour tout le groupe",
      "Guide leader selon la langue necessaire",
      "Arrets et rythme adaptes",
      "Options repas, photographie ou celebration"
    ]
  }
};

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const plainText = (value?: string | null) =>
  (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const parseGallery = (gallery?: string | null) => {
  if (!gallery) return [];
  const trimmed = gallery.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
    } catch {
      return [];
    }
  }
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const listFromJson = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
        .slice(0, 6)
    : [];

const listFromText = (value?: string | null) =>
  plainText(value)
    .split(/\n|;|\.\s+|,\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2)
    .slice(0, 6);

const groupFitFor = (category: string | null | undefined, locale: Locale) => {
  const text = (category ?? "").toLowerCase();
  if (text.includes("buggy") || text.includes("atv") || text.includes("aventura")) {
    return locale === "en" ? "Active groups and incentives" : locale === "fr" ? "Groupes actifs et incentives" : "Grupos activos e incentivos";
  }
  if (text.includes("isla") || text.includes("playa") || text.includes("boat") || text.includes("catamaran")) {
    return locale === "en" ? "Celebrations, families and beach groups" : locale === "fr" ? "Celebrations, familles et groupes plage" : "Celebraciones, familias y grupos de playa";
  }
  if (text.includes("cultura") || text.includes("ciudad") || text.includes("santo domingo")) {
    return locale === "en" ? "Companies, culture groups and VIP guests" : locale === "fr" ? "Entreprises, groupes culturels et VIP" : "Empresas, grupos culturales e invitados VIP";
  }
  return locale === "en" ? "Private groups that need a custom rhythm" : locale === "fr" ? "Groupes prives avec rythme sur mesure" : "Grupos privados que necesitan ritmo propio";
};

async function getTour(slug: string, locale: Locale) {
  const tour = await prisma.tour.findFirst({
    where: { slug, status: { in: ["published", "seo_only"] } },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      shortDescription: true,
      description: true,
      duration: true,
      category: true,
      location: true,
      heroImage: true,
      gallery: true,
      includes: true,
      includesList: true,
      highlights: true,
      pickup: true,
      meetingPoint: true,
      requirements: true,
      physicalLevel: true,
      minAge: true,
      destinationId: true,
      destination: { select: { name: true, slug: true } },
      departureDestination: { select: { name: true, slug: true } },
      translations: { where: { locale }, select: { title: true, subtitle: true, shortDescription: true, description: true } }
    }
  });

  return tour;
}

export async function getProDiscoveryTourGroupMetadata(locale: Locale, slug: string): Promise<Metadata> {
  const t = COPY[locale] ?? COPY.es;
  const tour = await getTour(slug, locale);
  if (!tour) {
    return {
      title: "ProDiscovery",
      robots: { index: false, follow: false }
    };
  }
  const tr = tour.translations[0];
  const rawTitle = tr?.title || tour.title;
  const destination = tour.departureDestination ?? tour.destination;
  const destinationLabel = destination ? localizedDestinationName(destination, locale) : tour.location || "Republica Dominicana";
  const titleStore = await getProDiscoveryGroupTitleStore();
  const title = resolveProDiscoveryGroupTitle(
    {
      slug: tour.slug,
      title: rawTitle,
      category: tour.category,
      destination: destinationLabel,
      location: tour.location
    },
    locale,
    titleStore,
    "title"
  );
  const description = plainText(tr?.shortDescription || tour.shortDescription || tr?.description || tour.description || t.fallbackDescription).slice(0, 155);
  const canonicalPath = `${localePrefix(locale)}/prodiscovery/tour/${tour.slug}`;
  const canonical = `${PROACTIVITIS_URL}${canonicalPath}`;

  return {
    title: `${title} | ProDiscovery`,
    description: `${description} Propuesta privada para grupos, sin precio publico por ticket.`,
    alternates: {
      canonical,
      languages: {
        es: `/prodiscovery/tour/${tour.slug}`,
        en: `/en/prodiscovery/tour/${tour.slug}`,
        fr: `/fr/prodiscovery/tour/${tour.slug}`,
        "x-default": `/prodiscovery/tour/${tour.slug}`
      }
    },
    openGraph: {
      title: `${title} | ProDiscovery`,
      description,
      url: canonical,
      type: "website",
      images: tour.heroImage ? [{ url: tour.heroImage }] : undefined
    },
    robots: { index: true, follow: true }
  };
}

export default async function ProDiscoveryTourDetailPage({ locale, slug }: Props) {
  const t = COPY[locale] ?? COPY.es;
  const tour = await getTour(slug, locale);
  if (!tour) return notFound();

  const tr = tour.translations[0];
  const rawTitle = tr?.title || tour.title;
  const description = plainText(tr?.shortDescription || tour.shortDescription || tr?.description || tour.description || t.fallbackDescription);
  const destination = tour.departureDestination ?? tour.destination;
  const destinationLabel = destination ? localizedDestinationName(destination, locale) : tour.location || "Republica Dominicana";
  const titleStore = await getProDiscoveryGroupTitleStore();
  const title = resolveProDiscoveryGroupTitle(
    {
      slug: tour.slug,
      title: rawTitle,
      category: tour.category,
      destination: destinationLabel,
      location: tour.location
    },
    locale,
    titleStore,
    "title"
  );
  const subtitle =
    resolveProDiscoveryGroupTitle(
      {
        slug: tour.slug,
        title: rawTitle,
        category: tour.category,
        destination: destinationLabel,
        location: tour.location
      },
      locale,
      titleStore,
      "subtitle"
    ) ||
    tr?.subtitle ||
    tour.subtitle ||
    t.groupLabel;
  const gallery = [tour.heroImage, ...parseGallery(tour.gallery)].filter(Boolean) as string[];
  const hero = gallery[0] || "/fototours/fotosimple.jpg";
  const includes = listFromJson(tour.includesList);
  const highlights = listFromJson(tour.highlights);
  const baseItems = highlights.length ? highlights : includes.length ? includes : listFromText(tour.includes || tour.description);
  const requestHref = `${localePrefix(locale)}/prodiscovery?dest=${encodeURIComponent(destinationLabel)}#planner`;
  const pageUrl = `${PROACTIVITIS_URL}${localePrefix(locale)}/prodiscovery/tour/${tour.slug}`;

  const relatedWhere =
    tour.destinationId || tour.location
      ? {
          status: { in: ["published", "seo_only"] },
          slug: { not: tour.slug },
          OR: [
            ...(tour.destinationId ? [{ destinationId: tour.destinationId }] : []),
            ...(tour.location ? [{ location: tour.location }] : [])
          ]
        }
      : {
          status: { in: ["published", "seo_only"] },
          slug: { not: tour.slug }
        };

  const relatedTours = await prisma.tour.findMany({
    where: {
      ...relatedWhere
    },
    select: { id: true, slug: true, title: true, heroImage: true, category: true },
    take: 3
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    serviceType: "Custom group travel planning",
    provider: {
      "@type": "Organization",
      name: "Proactivitis",
      url: PROACTIVITIS_URL
    },
    areaServed: destinationLabel,
    image: hero.startsWith("http") ? hero : `${PROACTIVITIS_URL}${hero.startsWith("/") ? hero : `/${hero}`}`,
    url: pageUrl,
    description
  };

  return (
    <main className="travel-surface bg-[#f5f7f9]">
      <StructuredData data={schema} />
      <ProDiscoveryHeader locale={locale} />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <Link href={`${localePrefix(locale)}/prodiscovery`} className="text-sm font-black text-emerald-700 hover:text-emerald-800">
            {t.back}
          </Link>

          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
              <div className="relative h-[360px] bg-slate-200">
                <Image src={hero} alt={title} fill priority sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover" />
              </div>
              <div className="p-5 sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700">{t.eyebrow}</p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-5xl">{title}</h1>
                <p className="mt-3 text-lg font-semibold leading-8 text-slate-700">{subtitle}</p>
                <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">{description}</p>
              </div>
            </div>

            <aside className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{t.snapshot}</p>
              <div className="mt-4 space-y-3">
                <InfoRow label={t.destination} value={destinationLabel} />
                <InfoRow label={t.duration} value={formatDurationDisplay(tour.duration, locale === "fr" ? "Duree flexible" : locale === "en" ? "Flexible duration" : "Duracion flexible")} />
                <InfoRow label={t.pickup} value={tour.pickup || tour.meetingPoint || (locale === "en" ? "To coordinate with the group" : locale === "fr" ? "A coordonner avec le groupe" : "A coordinar con el grupo")} />
                <InfoRow label={t.groupFit} value={groupFitFor(tour.category, locale)} />
              </div>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-black leading-6 text-emerald-950">{t.noPublicPrice}</p>
              </div>
              <Link href={requestHref} className="mt-4 inline-flex w-full justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700">
                {t.request}
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-5 grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">{t.baseExperience}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{t.privatePlan}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{t.privatePlanBody}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {t.details.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold leading-6 text-slate-800">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-5 md:grid-cols-2">
            <DetailPanel title={t.howItWorks} items={baseItems.length ? baseItems : [description]} />
            <DetailPanel
              title={t.adjust}
              items={[
                locale === "en" ? "Private start time according to the group agenda" : locale === "fr" ? "Heure de depart privee selon l agenda" : "Hora de salida privada segun la agenda",
                locale === "en" ? "Route and stops adjusted before confirming" : locale === "fr" ? "Route et arrets ajustes avant confirmation" : "Ruta y paradas ajustadas antes de confirmar",
                locale === "en" ? "Support for bilingual or mixed-language groups" : locale === "fr" ? "Support pour groupes bilingues" : "Soporte para grupos bilingues"
              ]}
            />
          </div>
        </div>

        <aside className="space-y-5">
          <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-950">{t.logistics}</h2>
            <ul className="mt-4 space-y-3">
              {[
                tour.requirements,
                tour.physicalLevel ? `${locale === "en" ? "Activity level" : locale === "fr" ? "Niveau" : "Nivel"}: ${tour.physicalLevel}` : "",
                tour.minAge ? `${locale === "en" ? "Minimum age" : locale === "fr" ? "Age minimum" : "Edad minima"}: ${tour.minAge}` : "",
                locale === "en" ? "Deposit and final budget are defined after proposal" : locale === "fr" ? "Depot et budget final apres proposition" : "Deposito y presupuesto final se definen en la propuesta"
              ]
                .filter(Boolean)
                .map((item) => (
                  <li key={item} className="border-b border-slate-100 pb-3 text-sm font-semibold leading-6 text-slate-700 last:border-0 last:pb-0">
                    {plainText(item)}
                  </li>
                ))}
            </ul>
          </article>

          {gallery.length > 1 ? (
            <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{t.gallery}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {gallery.slice(1, 5).map((image) => (
                  <div key={image} className="relative h-28 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={image} alt={title} fill sizes="180px" className="object-cover" />
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </aside>
      </section>

      {relatedTours.length ? (
        <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{t.related}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {relatedTours.map((item) => (
                <Link key={item.id} href={`${localePrefix(locale)}/prodiscovery/tour/${item.slug}`} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50 hover:border-emerald-300">
                  <div className="relative h-28 bg-slate-100">
                    <Image src={item.heroImage || "/fototours/fotosimple.jpg"} alt={item.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">{item.category || t.groupLabel}</p>
                    <h3 className="mt-2 line-clamp-2 text-sm font-black leading-6 text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm font-black text-slate-700">{t.relatedCta}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">{t.groupLabel}</p>
              <h2 className="mt-2 text-2xl font-black">{t.consult}</h2>
            </div>
            <Link href={requestHref} className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 hover:bg-slate-100">
              {t.request}
            </Link>
          </div>
        </div>
      </section>

      <ProDiscoveryFooter locale={locale} />
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-black leading-6 text-slate-950">{value}</p>
    </div>
  );
}

function DetailPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.slice(0, 6).map((item) => (
          <li key={item} className="text-sm font-semibold leading-7 text-slate-700">
            {plainText(item)}
          </li>
        ))}
      </ul>
    </article>
  );
}
