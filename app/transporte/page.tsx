import TransportSearch, { LocationOption } from "@/components/transport/TransportSearch";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Transporte privado en Punta Cana | Proactivitis",
  description:
    "Reserva un vehículo privado desde el aeropuerto hasta tu hotel favorito. Sedán, Van y SUV con Meet & Greet incluido."
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
    </div>
  );
}
