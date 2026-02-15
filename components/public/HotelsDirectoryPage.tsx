import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Locale } from "@/lib/translations";

const copy: Record<Locale, { title: string; subtitle: string; cta: string }> = {
  es: {
    title: "Alojamiento en Punta Cana",
    subtitle: "Selecciona tu hotel para ver informacion, traslados y cotizacion.",
    cta: "Ver hotel"
  },
  en: {
    title: "Accommodation in Punta Cana",
    subtitle: "Choose your hotel to view details, transfers, and quote options.",
    cta: "View hotel"
  },
  fr: {
    title: "Hebergement a Punta Cana",
    subtitle: "Selectionnez votre hotel pour voir les details, transferts et devis.",
    cta: "Voir hotel"
  }
};

const getHotelHref = (slug: string, locale: Locale) => {
  if (locale === "es") return `/hoteles/${slug}`;
  return `/${locale}/hotels/${slug}`;
};

export default async function HotelsDirectoryPage({ locale }: { locale: Locale }) {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" }
  });

  const t = copy[locale];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">{t.title}</h1>
        <p className="mt-2 text-sm text-slate-600">{t.subtitle}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((hotel) => (
          <Link
            key={hotel.slug}
            href={getHotelHref(hotel.slug, locale)}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="text-base font-semibold text-slate-900">{hotel.name}</h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{t.cta}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
