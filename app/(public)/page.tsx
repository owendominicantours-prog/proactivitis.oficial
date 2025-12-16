import Link from "next/link";
import { TourCard } from "@/components/public/TourCard";
import { getFeaturedTour } from "@/lib/publicTours";
import { logPrismaError, prisma } from "@/lib/prisma";

type ExtraTour = {
  slug: string;
  title: string;
  location: string;
  price: number;
  heroImage?: string | null;
};

const benefits = [
  {
    title: "Soporte local inmediato",
    description: "Equipos y operadores en cada destino resuelven imprevistos sin demoras."
  },
  {
    title: "Aliados verificados",
    description: "Partners auditados por Proactivitis en cada país."
  },
  {
    title: "Experiencias flexibles",
    description: "Cambios y cancelaciones suaves en tours seleccionados."
  }
];

export const runtime = "nodejs";

export default async function PublicHomePage() {
  let featuredTour = null;
  try {
    featuredTour = await getFeaturedTour();
  } catch (error) {
    logPrismaError("loading featured tour", error);
  }

  let extraTours: ExtraTour[] = [];
  try {
    extraTours = await prisma.tour.findMany({
      where: { status: "published" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { slug: true, title: true, location: true, price: true, heroImage: true }
    });
  } catch (error) {
    logPrismaError("loading extra tours", error);
  }

  return (
    <div className="space-y-12 bg-slate-50 text-slate-900">
      <section
        className="relative pt-16 pb-20 sm:pt-20 sm:pb-24"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(2,6,23,0.1),rgba(2,6,23,0.45)), url('${
            featuredTour?.heroImage ?? "/fototours/fotosimple.jpg"
          }')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-slate-900/10 to-slate-900/60" />
        <div className="relative mx-auto flex max-w-6xl flex-col px-4 sm:px-6 lg:px-0">
          <div className="space-y-5 text-white">
            <p className="text-xs uppercase tracking-[0.5em] text-white/70">Proactivitis</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Experiencias reales guiadas por locales que se preocupan.
            </h1>
            <p className="text-lg text-white/80">
              Recorridos confiables, gente real y momentos inolvidables listos para cualquier rincón del mundo.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/tours"
                className="w-full rounded-full bg-sky-500 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-sky-600 sm:w-auto"
              >
                Ver tours destacados
              </Link>
              <div className="w-full sm:w-[260px]">
                <input
                  type="text"
                  placeholder="Buscar por destino, tour o fecha"
                  className="w-full rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/60"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-4 px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Qué hacemos</p>
          <h2 className="text-2xl font-semibold text-slate-900">Hacemos que viajar sea fácil</h2>
          <p className="text-sm text-slate-600">
            Ayudamos a los viajeros a organizar y disfrutar experiencias auténticas sin complicaciones. Aquí encuentras
            tours confiables y soporte humano que te acompaña antes, durante y después de cada viaje.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Recomendado</p>
            <h2 className="text-3xl font-semibold text-slate-900">Tours más populares</h2>
          </div>
          <Link
            href="/tours"
            className="text-sm font-semibold text-slate-600 underline underline-offset-4 transition hover:text-slate-900"
          >
            Ver todo el catálogo
          </Link>
        </div>
        <p className="text-sm text-slate-600">
          No son solo tours. Son experiencias curadas por locales que saben lo que realmente funciona y cómo cuidar a los viajeros.
        </p>
        {extraTours.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {extraTours.map((tour) => (
              <TourCard
                key={tour.slug}
                slug={tour.slug}
                title={tour.title}
                location={`Desde ${tour.location}`}
                price={tour.price}
                image={tour.heroImage ?? "/fototours/fotosimple.jpg"}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Estamos preparando nuevas experiencias. Vuelve pronto.</p>
        )}
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
                <p className="text-sm text-slate-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl space-y-6 px-6 py-20">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">¿Por qué Proactivitis?</p>
            <h2 className="text-3xl font-semibold text-slate-900">Turismo hecho por gente que conoce el país</h2>
            <p className="text-lg text-slate-600">
              Trabajamos todos los días con viajeros y proveedores en el terreno. Esta plataforma surgió de necesidades
              reales, no de teorías, así que cada tour y cada soporte nace de personas que conocen lo que funciona de
              verdad.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/tours"
              className="inline-flex items-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Explorar tours
            </Link>
            <Link
              href="/contact"
              className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="rounded-[30px] border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-10 text-white shadow-2xl">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Viajes globales</p>
              <h3 className="text-3xl font-semibold">Listo para tu próxima aventura?</h3>
              <p className="text-sm text-slate-200">
                Explora fechas disponibles, combina experiencias y deja al equipo de Proactivitis coordinar todo donde
                quieras viajar.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/tours"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900"
              >
                Ver tours completos
              </Link>
              <span className="text-sm text-slate-200">Soporte global, 24/7.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
