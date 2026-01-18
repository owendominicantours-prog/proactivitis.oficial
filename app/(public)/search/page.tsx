import { getAllTours } from "@/lib/destinations";

export const metadata = {
  robots: { index: false, follow: false }
};

export default async function SearchPage() {
  const tours = await getAllTours();

  return (
    <div className="space-y-10 bg-slate-50 pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-3xl font-semibold text-slate-900">Buscador inteligente</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Filtra tours por destino, duración, idioma o proveedor. Los partners ven disponibilidad en tiempo real.
        </p>
      </div>
      <div className="mx-auto max-w-6xl space-y-4 px-6">
        {tours.map((tour) => (
          <div
            key={tour.id}
            className="rounded-[30px] bg-white p-6 shadow-card transition hover:border-slate-200 hover:bg-slate-50"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">{tour.title}</h2>
              <span className="text-sm font-semibold text-brand">
                ${tour.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>{tour.duration}</span>
              <span>{tour.location}</span>
            </div>
            {tour.departureDestination?.name ? (
              <p className="mt-3 text-sm font-semibold text-slate-900">
                Sale desde {tour.departureDestination.name}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
