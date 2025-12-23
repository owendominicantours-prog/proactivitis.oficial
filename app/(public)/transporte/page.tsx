import Link from "next/link";
import TransportSearch, { LocationOption } from "@/components/transport/TransportSearch";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Traslados Privados Aeropuerto Punta Cana | Proactivitis",
  description:
    "Reserva tu transporte privado con chofer bilingüe, precios cerrados y flexibilidad total. Proactivitis conecta vuelos, hoteles y proveedores en tiempo real."
};

const faqItems = [
  {
    q: "¿Dónde me espera el chofer?",
    a: "En el aeropuerto te acompañamos hasta la salida de llegadas con un cartel de Proactivitis y tu nombre. En hoteles, el punto de encuentro es el lobby principal."
  },
  {
    q: "¿Qué pasa si mi vuelo se retrasa?",
    a: "Monitoreamos tu número de vuelo en vivo y vamos ajustando la llegada sin costo adicional. Tienes 60 min gratis de espera."
  },
  {
    q: "¿Puedo cancelar?",
    a: "Cancelación gratuita hasta 24 horas antes del servicio. Si necesitas cambiar la hora, lo hacemos por ti."
  }
];

const heroStats = [
  { label: "Transferencias confirmadas", value: "5.000+" },
  { label: "Choferes certificados", value: "120" },
  { label: "Soporte 24/7", value: "en español e inglés" }
];

export default async function TransportePage() {
  const hotels = await prisma.location.findMany({
    where: { countryId: "RD" },
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      destination: { select: { name: true } },
      microZone: { select: { name: true } }
    }
  });

  const options: LocationOption[] = hotels.map((hotel) => ({
    name: hotel.name,
    slug: hotel.slug,
    destinationName: hotel.destination?.name ?? null,
    microZoneName: hotel.microZone?.name ?? null
  }));

  return (
    <div className="bg-gradient-to-b from-[#E2FFF8] via-white to-[#F8FAFC]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-10">
        <section className="space-y-6 rounded-[36px] border border-white/60 bg-white/80 p-8 shadow-xl backdrop-blur">
          <p className="text-xs uppercase tracking-[0.5em] text-emerald-600">Proactivitis Transport</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-black leading-tight text-slate-900 md:text-5xl">
                Traslados privados desde el aeropuerto hasta tu hotel
              </h1>
              <p className="text-base text-slate-600">
                Todo incluido, chofer bilingüe y confirmación inmediata. Desde el aterrizaje hasta el lobby del hotel, tu viaje comienza con confianza.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.4em]">
                <Link href="/" className="text-emerald-600 underline decoration-emerald-300 decoration-2 underline-offset-4 transition hover:text-emerald-500">
                  Ir a Proactivitis
                </Link>
                <Link href="/tours" className="text-slate-500 transition hover:text-slate-900">
                  Ver tours y experiencias
                </Link>
              </div>
            </div>
            <div className="grid w-full max-w-xs grid-cols-1 gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-center text-slate-700 shadow-sm md:max-w-[320px]">
              {heroStats.map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-100 bg-white/90 p-6 shadow-2xl">
          <TransportSearch hotels={options} />
        </section>

        <section className="space-y-6 rounded-[32px] border border-slate-100 bg-white/90 p-8 shadow-lg">
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Preguntas frecuentes</p>
            <h2 className="text-2xl font-bold text-slate-900">Todo lo que debes saber antes de viajar</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {faqItems.map((item) => (
              <div key={item.q} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-5 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.q}</p>
                <p className="font-semibold text-slate-900">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
