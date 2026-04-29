import Link from "next/link";
import { Car, CheckCircle2, Clock, Luggage, MessageCircle, Plane, ShieldCheck } from "lucide-react";
import StructuredData from "@/components/schema/StructuredData";
import type { TransferLandingData } from "@/data/transfer-landings";
import {
  fillGoldenTransferText,
  type GoldenTransferIntent
} from "@/lib/goldenTransferPages";
import type { Locale } from "@/lib/translations";

const BASE_URL = "https://proactivitis.com";

type Props = {
  locale: Locale;
  landing: TransferLandingData;
  intent: GoldenTransferIntent;
  pageSlug: string;
};

const copy = {
  es: {
    from: "Desde",
    service: "servicio privado",
    reserve: "Reservar traslado",
    whatsapp: "Confirmar por WhatsApp",
    facts: "Datos del traslado",
    route: "Ruta",
    airport: "Aeropuerto",
    destination: "Destino",
    price: "Precio desde",
    type: "Servicio",
    why: "Por que reservar este transfer",
    included: "Que incluye",
    before: "Antes de reservar",
    faq: "Preguntas frecuentes",
    related: "Despues del transfer",
    fixedPrice: "Precio claro",
    flightTracking: "Seguimiento de vuelo",
    support: "Soporte humano",
    privateRide: "Vehiculo privado",
    arrival: "Llegada",
    return: "Salida",
    roundtrip: "Ida y vuelta",
    meet: "Recogida coordinada",
    luggage: "Espacio para equipaje",
    noShared: "Sin transporte compartido"
  },
  en: {
    from: "From",
    service: "private service",
    reserve: "Book transfer",
    whatsapp: "Confirm on WhatsApp",
    facts: "Transfer details",
    route: "Route",
    airport: "Airport",
    destination: "Destination",
    price: "Starting price",
    type: "Service",
    why: "Why book this transfer",
    included: "What's included",
    before: "Before booking",
    faq: "Frequently asked questions",
    related: "After your transfer",
    fixedPrice: "Clear price",
    flightTracking: "Flight tracking",
    support: "Human support",
    privateRide: "Private vehicle",
    arrival: "Arrival",
    return: "Departure",
    roundtrip: "Round trip",
    meet: "Coordinated pickup",
    luggage: "Luggage space",
    noShared: "No shared shuttle"
  },
  fr: {
    from: "A partir de",
    service: "service prive",
    reserve: "Reserver transfert",
    whatsapp: "Confirmer WhatsApp",
    facts: "Details du transfert",
    route: "Route",
    airport: "Aeroport",
    destination: "Destination",
    price: "Prix de depart",
    type: "Service",
    why: "Pourquoi reserver ce transfert",
    included: "Ce qui est inclus",
    before: "Avant de reserver",
    faq: "Questions frequentes",
    related: "Apres votre transfert",
    fixedPrice: "Prix clair",
    flightTracking: "Suivi de vol",
    support: "Support humain",
    privateRide: "Vehicule prive",
    arrival: "Arrivee",
    return: "Depart",
    roundtrip: "Aller-retour",
    meet: "Pickup coordonne",
    luggage: "Espace bagages",
    noShared: "Pas de navette partagee"
  }
} as const;

const localePrefix = (locale: Locale) => (locale === "es" ? "" : `/${locale}`);

const directionLabel = (direction: GoldenTransferIntent["direction"], locale: Locale) => {
  const t = copy[locale];
  if (direction === "return") return t.return;
  if (direction === "roundtrip") return t.roundtrip;
  return t.arrival;
};

export default function GoldenTransferLandingPage({ locale, landing, intent, pageSlug }: Props) {
  const t = copy[locale];
  const prefix = localePrefix(locale);
  const headline = fillGoldenTransferText(intent.headline[locale], landing.hotelName);
  const keyword = fillGoldenTransferText(intent.keyword[locale], landing.hotelName);
  const targetSlug = intent.direction === "return" ? landing.reverseSlug : landing.landingSlug;
  const bookingHref = `${prefix}/transfer/${targetSlug}`;
  const pageUrl = `${BASE_URL}${prefix}/punta-cana/transfer/${pageSlug}`;
  const whatsappText = encodeURIComponent(`${headline} - ${pageUrl}`);
  const whatsappHref = `https://wa.me/18293939757?text=${whatsappText}`;
  const facts = [
    { label: t.airport, value: "Punta Cana International Airport (PUJ)" },
    { label: t.destination, value: landing.hotelName },
    { label: t.price, value: `USD ${Math.round(landing.priceFrom)}` },
    { label: t.type, value: directionLabel(intent.direction, locale) }
  ];
  const inclusions = [t.flightTracking, t.meet, t.privateRide, t.luggage, t.support, t.noShared];
  const faqs = [
    {
      q:
        locale === "es"
          ? `El transfer aplica para ${landing.hotelName}?`
          : locale === "fr"
            ? `Ce transfert est-il disponible pour ${landing.hotelName} ?`
            : `Is this transfer available for ${landing.hotelName}?`,
      a:
        locale === "es"
          ? `Si. Esta pagina esta enfocada en la ruta entre PUJ y ${landing.hotelName}, con precio desde y reserva directa.`
          : locale === "fr"
            ? `Oui. Cette page couvre la route entre PUJ et ${landing.hotelName}, avec prix de depart et reservation directe.`
            : `Yes. This page covers the route between PUJ and ${landing.hotelName}, with starting price and direct booking.`
    },
    {
      q: locale === "es" ? "El chofer espera si mi vuelo se retrasa?" : locale === "fr" ? "Le chauffeur attend si mon vol est en retard ?" : "Will the driver wait if my flight is delayed?",
      a:
        locale === "es"
          ? "Monitoreamos el vuelo y coordinamos la recogida para reducir esperas y confusion al llegar."
          : locale === "fr"
            ? "Nous suivons le vol et coordonnons le pickup pour reduire attente et confusion."
            : "We track the flight and coordinate pickup to reduce waiting and confusion on arrival."
    },
    {
      q: locale === "es" ? "Puedo pedir ida y vuelta?" : locale === "fr" ? "Puis-je demander aller-retour ?" : "Can I book round trip?",
      a:
        locale === "es"
          ? "Si. Puedes reservar llegada y salida, o confirmar detalles por WhatsApp antes de pagar."
          : locale === "fr"
            ? "Oui. Vous pouvez reserver arrivee et depart, ou confirmer par WhatsApp avant paiement."
            : "Yes. You can book arrival and departure, or confirm details by WhatsApp before paying."
    }
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: headline,
        description: intent.promise[locale],
        provider: {
          "@type": "Organization",
          name: "Proactivitis",
          url: BASE_URL
        },
        areaServed: "Punta Cana",
        serviceType: "Private airport transfer",
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: landing.priceFrom,
          availability: "https://schema.org/InStock",
          url: pageUrl
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a
          }
        }))
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Proactivitis", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Punta Cana Transfer", item: `${BASE_URL}${prefix}/transfer` },
          { "@type": "ListItem", position: 3, name: headline, item: pageUrl }
        ]
      }
    ]
  };

  return (
    <main className="bg-[#f5faf8] text-slate-950">
      <StructuredData data={schema} />
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-45">
          <img src={landing.heroImage} alt={landing.heroImageAlt} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/75 to-slate-950" />
        <div className="relative mx-auto grid min-h-[650px] max-w-6xl content-end gap-8 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:py-16">
          <div>
            <p className="inline-flex rounded-full border border-sky-200/30 bg-sky-300/15 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-sky-100 backdrop-blur">
              {intent.badge[locale]}
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">{headline}</h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold text-sky-100">{intent.promise[locale]}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">{intent.buyer[locale]}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={bookingHref}
                className="rounded-full bg-sky-400 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-slate-950 transition hover:bg-sky-300"
              >
                {intent.cta[locale] || t.reserve}
              </Link>
              <a
                href={whatsappHref}
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-slate-950"
              >
                {t.whatsapp}
              </a>
            </div>
          </div>
          <aside className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-100">{t.from}</p>
            <p className="mt-2 text-5xl font-black">USD {Math.round(landing.priceFrom)}</p>
            <p className="text-sm font-semibold text-slate-200">{t.service}</p>
            <div className="mt-6 grid gap-3">
              {[t.fixedPrice, t.flightTracking, t.support, t.privateRide].map((item) => (
                <p key={item} className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold text-white">
                  <CheckCircle2 className="h-4 w-4 text-sky-200" />
                  {item}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <article key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-500">{fact.label}</p>
            <p className="mt-2 text-base font-black text-slate-950">{fact.value}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-4 lg:grid-cols-[1fr_0.85fr]">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-sky-700">{keyword}</p>
          <h2 className="mt-3 text-3xl font-black text-slate-950">{t.why}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Plane, title: t.flightTracking, body: intent.proof[locale] },
              { icon: ShieldCheck, title: t.fixedPrice, body: locale === "es" ? "Ves precio desde y pasas al checkout para calcular el total segun pasajeros." : locale === "fr" ? "Vous voyez le prix de depart et le checkout calcule le total selon passagers." : "You see a starting price and checkout calculates final total by passengers." },
              { icon: MessageCircle, title: t.support, body: locale === "es" ? "Puedes confirmar dudas por WhatsApp antes de pagar." : locale === "fr" ? "Vous pouvez confirmer vos questions par WhatsApp avant paiement." : "You can confirm questions on WhatsApp before payment." }
            ].map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <card.icon className="h-6 w-6 text-sky-600" />
                <h3 className="mt-3 text-lg font-black text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.body}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.included}</h2>
          <div className="mt-5 grid gap-3">
            {inclusions.map((item) => (
              <p key={item} className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900">
                {item}
              </p>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">{t.before}</h2>
          <div className="mt-5 grid gap-4">
            {[
              { icon: Clock, text: locale === "es" ? "Indica fecha, hora y numero de pasajeros." : locale === "fr" ? "Indiquez date, heure et nombre de passagers." : "Enter date, time and passenger count." },
              { icon: Luggage, text: locale === "es" ? "Agrega equipaje y detalles especiales si aplica." : locale === "fr" ? "Ajoutez bagages et details speciaux si besoin." : "Add luggage and special details if needed." },
              { icon: Car, text: locale === "es" ? "El equipo confirma vehiculo y punto de encuentro." : locale === "fr" ? "L equipe confirme vehicule et point de rencontre." : "The team confirms vehicle and meeting point." }
            ].map((item) => (
              <div key={item.text} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <item.icon className="h-5 w-5 shrink-0 text-sky-600" />
                <p className="text-sm font-semibold leading-6 text-slate-700">{item.text}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-black">{t.faq}</h2>
          <div className="mt-5 space-y-4">
            {faqs.map((item) => (
              <div key={item.q} className="rounded-2xl bg-white/10 p-4">
                <p className="font-black">{item.q}</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{item.a}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="rounded-[28px] bg-sky-500 p-6 text-slate-950 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em]">Proactivitis Transfer</p>
            <h2 className="mt-2 text-3xl font-black">{headline}</h2>
          </div>
          <Link
            href={bookingHref}
            className="mt-5 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white sm:mt-0"
          >
            {t.reserve}
          </Link>
        </div>
      </section>
    </main>
  );
}
