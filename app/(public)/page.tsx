import Image from "next/image";
import Link from "next/link";

const benefits = [
  {
    title: "Soporte local inmediato",
    description: "Equipos y operadores en cada destino resuelven imprevistos sin demoras.",
    icon: "✓"
  },
  {
    title: "Aliados verificados",
    description: "Partners auditados por Proactivitis para que tu viaje esté en buenas manos.",
    icon: "★"
  },
  {
    title: "Experiencias flexibles",
    description: "Cambios o cancelaciones en tours seleccionados sin papeleo innecesario.",
    icon: "↺"
  }
];

export const runtime = "nodejs";

export default function PublicHomePage() {
  return (
    <div className="space-y-16 bg-white text-slate-900">
      <section
        className="relative overflow-hidden rounded-b-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(4, 21, 45, 0.85), rgba(4, 21, 45, 0.35)), url('/mejorbanner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="h-[420px] w-full" />
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-0">
          <div className="max-w-4xl space-y-6 text-center text-white md:text-left">
            <p className="text-xs uppercase tracking-[0.8em] text-white/70">Proactivitis</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Experiencias reales guiadas por locales que se preocupan.
            </h1>
            <p className="text-lg text-white/90">
              Recorridos confiables, gente real y momentos inolvidables listos para cualquier rincón del mundo.
            </p>
            <div className="botones-banner">
              <Link href="/tours" className="boton-verde">
                Ver tours destacados
              </Link>
              <Link href="/tours" className="boton-naranja">
                Buscar por destino
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Qué hacemos</p>
          <h2 className="text-3xl font-semibold text-slate-900">Hacemos que viajar sea fácil</h2>
          <p className="text-sm text-slate-500">
            Elegimos tours auténticos, validamos a los proveedores y damos soporte humano antes, durante y después del viaje.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="space-y-3 rounded-3xl border border-slate-100 bg-white px-6 py-5 shadow-sm"
            >
              <div className="flex items-center gap-3 text-emerald-600">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-xl">
                  {benefit.icon}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">{benefit.title}</h3>
              </div>
              <p className="text-sm text-slate-500">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Recomendado</p>
          <h2 className="text-3xl font-semibold text-slate-900">Tours más populares</h2>
          <p className="text-sm text-slate-500">Aún estamos subiendo experiencias reales. Mientras tanto, estamos listos para ayudarte a crear la tuya.</p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white/80 p-8 text-center text-sm text-slate-500 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Próximamente verás lo mejor del catálogo aquí.</p>
          <p>Subiremos tours reales tan pronto como estén aprobados por el equipo.</p>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[32px] bg-slate-900">
            <Image
              src="/mini-portada.png"
              alt="Grupo de viajeros felices"
              width={900}
              height={600}
              className="object-cover"
              priority
            />
          </div>
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Por qué Proactivitis</p>
            <h2 className="text-3xl font-semibold text-slate-900">Turismo pensado por personas reales</h2>
            <p className="text-sm text-slate-600">
              Combinamos personas en el terreno, tecnología y procesos confiables para que cada viaje sea claro, humano y memorable.
            </p>
            <div className="flex flex-wrap gap-3">
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
        </div>
      </section>
    </div>
  );
}
