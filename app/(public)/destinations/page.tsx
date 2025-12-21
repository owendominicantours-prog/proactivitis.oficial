import Link from "next/link";

const destinationTiles = [
  {
    region: "Caribe",
    destination: "Dominican Republic",
    status: "Activo",
    stateTag: "Ver tours",
    action: "/tours?country=dominican-republic",
    description: "Playas de arena blanca, aventuras náuticas y joyas coloniales curadas con rigurosidad.",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    icons: ["🏝️", "🏙️"]
  },
  {
    region: "Caribe",
    destination: "Bahamas / Aruba",
    status: "Próximamente",
    stateTag: "Bajo auditoría",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    note: "Estamos verificando proveedores en esta zona.",
    isLead: true,
    icons: ["🏝️", "🏔️"]
  },
  {
    region: "Norteamérica",
    destination: "Estados Unidos (Miami/NYC)",
    status: "En proceso de auditoría",
    stateTag: "Servicios bajo revisión",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
    note: "Estamos verificando proveedores en esta zona.",
    isLead: true,
    icons: ["🏙️", "🏔️"]
  },
  {
    region: "Norteamérica",
    destination: "México (Cancún/Riviera Maya)",
    status: "Próximamente",
    stateTag: "Bajo auditoría",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    note: "Estamos verificando proveedores en esta zona.",
    isLead: true,
    icons: ["🏝️", "🏙️"]
  },
  {
    region: "Europa",
    destination: "España / Francia / Italia",
    status: "Expansión 2025",
    stateTag: "Selección manual",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    note: "Estamos verificando proveedores en esta zona.",
    isLead: true,
    icons: ["🏙️", "🏔️"]
  },
  {
    region: "Medio Oriente",
    destination: "Dubái / Abu Dabi",
    status: "Servicios bajo demanda",
    stateTag: "Solo por invitación",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=900&q=80",
    note: "Estamos verificando proveedores en esta zona.",
    isLead: true,
    icons: ["🏙️", "🏝️"]
  }
];

export const metadata = {
  title: "Destinos Curados | Proactivitis Global Destinations",
  description:
    "Explora nuestra lista VIP de destinos globales. Solo regiones auditadas y equipos locales verificados para experiencias premium."
};

export default function DestinationsPage() {
  return (
    <div className="bg-slate-50 pb-16">
      <main className="mx-auto max-w-6xl px-6 py-12 space-y-10">
        <section className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Destinos</p>
          <h1 className="text-4xl font-semibold text-slate-900">Explora nuestros destinos: Una red global de confianza</h1>
          <p className="text-sm text-slate-600">
            Auditamos cada destino para asegurar que tu experiencia sea perfecta, desde el Caribe hasta Europa.
          </p>
        </section>

        <section className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {destinationTiles.map((tile) => (
              <article
                key={tile.destination}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1"
              >
                <div
                  className={`relative h-52 bg-cover bg-center ${tile.isLead ? "hover:grayscale hover:brightness-75" : ""}`}
                  style={{ backgroundImage: `url(${tile.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/60" />
                  <p className="absolute left-4 top-4 rounded-full border border-white/70 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white">
                    {tile.region}
                  </p>
                </div>
                <div className="space-y-3 px-6 py-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    {tile.icons?.map((icon) => (
                      <span key={icon} aria-label="icon">
                        {icon}
                      </span>
                    ))}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{tile.destination}</h2>
                    <p className="text-sm text-slate-600">{tile.description ?? "Próximamente"}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    <span>{tile.status}</span>
                    <span className="text-sky-500">{tile.action ? "Ver tours" : tile.stateTag}</span>
                  </div>
                  {tile.note && <p className="text-xs text-slate-500">{tile.note}</p>}
                  {tile.action ? (
                    <Link
                      href={tile.action}
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                    >
                      Explorarlo
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700 transition hover:border-slate-400"
                    >
                      ¿Viajas aquí? Avísanos
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <p>
            Proactivitis opera bajo un modelo de expansión selectiva. No abrimos destinos de forma masiva; preferimos validar manualmente a cada transportista
            y guía local para asegurar que el estándar Proactivitis se mantenga intacto en los cinco continentes.
          </p>
        </section>
      </main>
    </div>
  );
}
