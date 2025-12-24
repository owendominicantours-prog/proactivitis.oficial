import { Metadata } from "next";
import { notFound } from "next/navigation";

import TrasladoSearch, { LocationOption } from "@/components/traslado/TrasladoSearch";
import { prisma } from "@/lib/prisma";

const BASE_ORIGIN_CODE = "PUJ";
const BASE_ORIGIN_LABEL = "Aeropuerto de Punta Cana (PUJ)";

const buildTransportSeoText = (hotelName: string) => {
  const keywords = [
    "Punta Cana Transfer",
    `PUJ to ${hotelName}`,
    "Private Taxi Punta Cana",
    "Bavaro Shuttle"
  ];
  const paragraphOne = `Reserva tu Traslado Privado en Punta Cana directamente hacia el ${hotelName}. Olvídate de las esperas en el Aeropuerto de Punta Cana (PUJ) gracias a nuestro ${keywords[0]} que te lleva rápido y seguro. Nuestro equipo repite el mantra "${keywords[1]}" cada vez que planifica la ruta para que el conductor llegue antes de que aterrices.`;
  const paragraphTwo = `Las 100% unidades Originals Proactivitis operan como un ${keywords[2]} que mantiene señalizada la zona de Punta Cana, Cap Cana y Uvero Alto. Disfruta aire acondicionado, chofer bilingüe y respaldo en vivo porque así se diseñó nuestro ${keywords[0]} para no depender de taxis improvisados.`;
  const paragraphThree = `El estilo ${keywords[3]} combina confort, limpieza y conectividad con tu hotel favorito. Ya sea que te hospedes en ${hotelName} o en otra propiedad cercana, ofrecemos apoyo para cambiar tu vuelo o actualizar el número de vuelo y mantener la plaza reservada.`;
  const paragraphFour = `Selecciona el ${keywords[2]} desde el formulario y verás el precio transparente para Sedán, Van y SUV. Si requieres la reserva con copiloto o equipaje privado, solo confirma y el ${keywords[1]} seguirá el itinerario exacto.`;
  return [paragraphOne, paragraphTwo, paragraphThree, paragraphFour].join("\n\n");
};

const getDefaultDateTime = () => {
  const date = new Date();
  date.setMinutes(0, 0, 0);
  date.setHours(date.getHours() + 2);
  return date.toISOString().slice(0, 16);
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ hotelSlug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  if (!resolvedParams.hotelSlug) {
    return {
      title: "Transporte Punta Cana | Proactivitis",
      description: "Programmatic SEO para traslados premium desde Punta Cana"
    };
  }

  const hotel = await prisma.location.findUnique({
    where: { slug: resolvedParams.hotelSlug }
  });
  if (!hotel) {
    return {
      title: "Transporte Punta Cana | Proactivitis",
      description: "Programmatic SEO para traslados premium desde Punta Cana"
    };
  }
  return {
    title: `Transporte directo a ${hotel.name} | Proactivitis`,
    description: `Reserva tu traslado Premium desde PUJ hacia ${hotel.name} con tarifas claras en vehículos privados.`
  };
}

export async function generateStaticParams() {
  const hotels = await prisma.location.findMany({
    where: { countryId: "RD" },
    select: { slug: true }
  });
  return hotels.map((hotel) => ({ hotelSlug: hotel.slug }));
}

type TransportPageProps = {
  params: Promise<{ hotelSlug: string }>;
};

export default async function HotelTransportPage({ params }: TransportPageProps) {
  const resolvedParams = await params;
  if (!resolvedParams.hotelSlug) {
    notFound();
  }
  const hotel = await prisma.location.findUnique({
    where: { slug: resolvedParams.hotelSlug },
    include: {
      destination: { select: { name: true } }
    }
  });
  if (!hotel) {
    notFound();
  }

  const hotelOptions = await prisma.location.findMany({
    where: { countryId: "RD" },
    orderBy: { name: "asc" },
    select: {
      name: true,
      slug: true,
      destination: { select: { name: true } },
      microZone: { select: { name: true } }
    }
  });

  const options: LocationOption[] = hotelOptions.map((item) => ({
    name: item.name,
    slug: item.slug,
    destinationName: item.destination?.name ?? null,
    microZoneName: item.microZone?.name ?? null
  }));

  const seoCopy = buildTransportSeoText(hotel.name);
  const seoParagraphs = seoCopy.split("\n\n");
  const defaultDateTime = getDefaultDateTime();

  return (
    <div className="bg-slate-50">
      <section className="bg-gradient-to-br from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">Programmatic SEO · Transporte</p>
          <h1 className="text-4xl font-bold text-slate-900">Traslado directo a {hotel.name}</h1>
          <p className="max-w-3xl text-sm text-slate-600">
            Nuestro motor carga el destino ya seleccionado, elige el vehículo y presenta precios claros para Sedán, Van y SUV sin necesidad de buscar de nuevo.
          </p>
          <p className="text-sm text-slate-500 mt-2">Origen fijo: {BASE_ORIGIN_LABEL}</p>
        </div>
      </section>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10">
        <section className="rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-2xl">
          <TrasladoSearch
            hotels={options}
            initialHotelSlug={hotel.slug}
            initialOriginCode={BASE_ORIGIN_CODE}
            initialOriginLabel={BASE_ORIGIN_LABEL}
            initialDateTime={defaultDateTime}
            autoShowResults
          />
        </section>

        <section className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg">
          {seoParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm text-slate-600 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>
      </main>
    </div>
  );
}
