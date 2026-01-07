import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LandingViewTracker from "@/components/transfers/LandingViewTracker";

type Params = {
  params: Promise<{ hotelSlug: string }>;
};

const BASE_URL = "https://proactivitis.com";
const SLUG_SUFFIX = "-protocolos-seguridad";

const normalizeHotelSlug = (value: string) =>
  value.endsWith(SLUG_SUFFIX) ? value.slice(0, -SLUG_SUFFIX.length) : value;

const buildTitle = (hotelName: string) =>
  `Protocolos de Seguridad y Guia de Transporte para Huespedes de ${hotelName}`;

export async function generateStaticParams() {
  const hotels = await prisma.transferLocation.findMany({
    where: { type: "HOTEL", active: true },
    select: { slug: true }
  });
  return hotels.map((hotel) => ({
    hotelSlug: `${hotel.slug}${SLUG_SUFFIX}`
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const resolved = await params;
  const baseSlug = normalizeHotelSlug(resolved.hotelSlug);
  const hotel = await prisma.transferLocation.findUnique({
    where: { slug: baseSlug },
    select: { name: true }
  });

  if (!hotel) {
    return { title: "Guia de seguridad no disponible" };
  }

  const title = buildTitle(hotel.name);
  const description = `Informacion clara sobre seguridad, licencias de transporte y buenas practicas para viajeros hospedados en ${hotel.name}.`;
  const canonical = `${BASE_URL}/excursiones-seguras-punta-cana/${baseSlug}${SLUG_SUFFIX}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical
    }
  };
}

export default async function HotelSafetyGuidePage({ params }: Params) {
  const resolved = await params;
  const baseSlug = normalizeHotelSlug(resolved.hotelSlug);
  if (!resolved.hotelSlug.endsWith(SLUG_SUFFIX)) {
    return notFound();
  }

  const hotel = await prisma.transferLocation.findUnique({
    where: { slug: baseSlug },
    select: { name: true, description: true }
  });

  if (!hotel) {
    return notFound();
  }

  const title = buildTitle(hotel.name);
  const canonical = `${BASE_URL}/excursiones-seguras-punta-cana/${baseSlug}${SLUG_SUFFIX}`;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-950 pb-20">
      <LandingViewTracker landingSlug={`excursiones-seguras-punta-cana/${baseSlug}${SLUG_SUFFIX}`} />

      <section className="mx-auto max-w-[1240px] px-4 pt-10">
        <div className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_rgba(0,0,0,0.06)]">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Guia de confianza</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base text-slate-600">
            Esta guia resume practicas verificables para moverte con seguridad en Punta Cana y tomar decisiones informadas
            durante tu estadia en {hotel.name}. {hotel.description ? hotel.description : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/thingtodo/tours/hip-hop-party-boat"
              className="rounded-3xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100"
            >
              Ver excursiones certificadas
            </Link>
            <a
              href="#checklist"
              className="rounded-3xl border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-900"
            >
              Ver checklist de seguridad
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500">URL oficial: {canonical}</p>
        </div>
      </section>

      <section id="checklist" className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Por que importa la licencia de transporte</h2>
            <p className="mt-3 text-sm text-slate-600">
              En Republica Dominicana, los servicios turisticos formales operan con autorizaciones del Ministerio de Turismo
              y seguros de responsabilidad civil vigentes. Esta documentacion protege al pasajero ante incidentes y permite
              verificar la trazabilidad del servicio.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Solicita el numero de licencia o registro del operador.</li>
              <li>Pregunta por la poliza de seguro vigente y el alcance de cobertura.</li>
              <li>Confirma que el vehiculo y el conductor esten identificados.</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Checklist para evitar estafas comunes</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>Reserva solo con confirmacion formal y comprobante de pago.</li>
              <li>Verifica punto de encuentro oficial y horario exacto.</li>
              <li>Evita pagos en efectivo sin recibo o contrato.</li>
              <li>Revisa reseñas y canales de atencion disponibles.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Como identificar un operador legal</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Operador legal</p>
              <ul className="mt-3 space-y-2">
                <li>Licencia del Ministerio de Turismo visible.</li>
                <li>Seguro de responsabilidad civil vigente.</li>
                <li>Ruta y horario confirmados por escrito.</li>
                <li>Atencion postventa y soporte 24/7.</li>
              </ul>
            </div>
            <div className="rounded-[20px] border border-rose-100 bg-rose-50/40 p-4 text-sm text-slate-700">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-600">Señales de alerta</p>
              <ul className="mt-3 space-y-2">
                <li>Sin recibo ni contrato.</li>
                <li>Pago en efectivo sin respaldo.</li>
                <li>Sin informacion de seguro o cobertura.</li>
                <li>Sin canal de soporte despues del tour.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Objetos perdidos: protocolo recomendado</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-700">
              <li>Reporta el extravio en recepcion del hotel y solicita el numero de caso.</li>
              <li>Informa al proveedor del tour con fecha, horario y descripcion del objeto.</li>
              <li>Conserva comprobantes o vouchers para agilizar la verificacion.</li>
            </ol>
            <p className="mt-4 text-sm text-slate-600">
              Nuestro Party Boat aplica un protocolo de revision de cabina al finalizar cada tour para evitar olvidos antes
              del retorno a {hotel.name}.
            </p>
          </div>
          <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">Certificaciones y trazabilidad</h2>
            <p className="mt-3 text-sm text-slate-600">
              Proactivitis opera con monitoreo GPS preventivo para seguridad del pasajero, seguimiento de rutas y cumplimiento
              de horarios. La trazabilidad permite validar tiempos y respaldar cualquier incidencia.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-700">
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">GPS Activo</p>
                <p className="mt-2 font-semibold">Monitoreo continuo de rutas</p>
              </div>
              <div className="rounded-[16px] border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Seguro vigente</p>
                <p className="mt-2 font-semibold">Cobertura de responsabilidad civil</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-slate-900">Transparencia de precios</h2>
          <p className="mt-3 text-sm text-slate-600">
            En Punta Cana los precios varian por distancia, horario, tipo de vehiculo y temporada. Para evitar sobrecostos,
            compara siempre lo siguiente:
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
            <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Servicio registrado</p>
              <ul className="mt-3 space-y-2">
                <li>Tarifa publicada y confirmada por escrito.</li>
                <li>Incluye seguro, impuestos y soporte.</li>
                <li>Recibo o factura disponible.</li>
              </ul>
            </div>
            <div className="rounded-[20px] border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Servicio informal</p>
              <ul className="mt-3 space-y-2">
                <li>Precio variable sin desglose.</li>
                <li>Sin confirmacion de cobertura.</li>
                <li>Sin soporte ni garantia.</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Consejo: Solicita siempre el detalle de lo que incluye la tarifa para comparar experiencias similares.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-[1240px] px-4">
        <div className="rounded-[28px] border border-slate-100 bg-white p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Recomendaciones verificadas</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Servicios con trazabilidad y soporte</h2>
          <p className="mt-3 text-sm text-slate-600">
            Si prefieres una opcion comprobable y con respaldo, aqui tienes alternativas seguras que siguen los mismos
            protocolos de monitoreo y documentacion.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Link
              href="/transfer"
              className="flex h-full flex-col justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-700 transition hover:border-slate-400"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Traslados privados</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Reserva con tarifas claras y verificacion</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Vehiculos registrados, conductores identificados y asistencia durante todo el trayecto.
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                Ver traslados
              </span>
            </Link>
            <Link
              href="/thingtodo/tours/hip-hop-party-boat"
              className="flex h-full flex-col justify-between gap-3 rounded-[20px] border border-slate-200 bg-slate-50/70 p-5 text-sm text-slate-700 transition hover:border-slate-400"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Excursion certificada</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Party Boat con protocolo de seguridad</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Monitoreo GPS preventivo, seguro vigente y revision de cabina al finalizar el tour.
                </p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
                Ver excursion
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
