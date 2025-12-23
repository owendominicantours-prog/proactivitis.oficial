import TransportSearch, { LocationOption } from "@/components/transport/TransportSearch";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Traslados Privados Aeropuerto Punta Cana | Proactivitis",
  description:
    "Reserva tu transporte privado desde el aeropuerto hasta tu hotel en 3 clics. Precios cerrados, sin esperas."
};

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <TransportSearch hotels={options} />
      </div>
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Preguntas frecuentes</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">Todo lo que debes saber antes de viajar</h2>
          <div className="mt-6 space-y-4">
            {[
              {
                q: "¿Dónde me espera el chofer?",
                a: "Estará en la salida de pasajeros con un cartel de Proactivitis y tu nombre."
              },
              {
                q: "¿Qué pasa si mi vuelo se retrasa?",
                a: "Monitoreamos tu número de vuelo en tiempo real. No tienes de qué preocuparte."
              }
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{item.q}</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
