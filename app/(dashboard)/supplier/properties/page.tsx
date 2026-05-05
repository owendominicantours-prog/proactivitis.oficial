import { getServerSession } from "next-auth";
import type { ReactNode } from "react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupplierPropertyDraftAction } from "./actions";

type SupplierPropertiesPageProps = {
  searchParams?: Promise<{ status?: string; type?: string }>;
};

type PropertyDraftData = {
  propertyType?: string;
  city?: string;
  country?: string;
  zone?: string;
  status?: string;
  priceFrom?: number | null;
  rooms?: number | null;
  maxGuests?: number | null;
  readinessScore?: number;
  reviewFlags?: string[];
};

const propertyTypes = [
  {
    value: "hotel",
    label: "Hotel / resort",
    helper: "Recepcion, habitaciones, desayuno, servicios, reglas y operacion por noche.",
    badge: "Operacion hotelera"
  },
  {
    value: "apartment",
    label: "Apartamento / aparthotel",
    helper: "Unidades independientes, condos, edificios de renta corta y estancias con cocina.",
    badge: "Unidad privada"
  },
  {
    value: "villa",
    label: "Casa vacacional / villa",
    helper: "Propiedades para familias, grupos, estadias premium y experiencias privadas.",
    badge: "Grupos y lujo"
  }
];

const readinessItems = [
  "Nombre comercial y tipo correcto",
  "Ubicacion precisa y zona",
  "Tarifa base o rango de precio",
  "Fotos propias o con permiso comercial",
  "Politicas de check-in, deposito y cancelacion",
  "Contacto operativo para confirmaciones"
];

const fieldClass =
  "mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
const labelClass = "text-xs font-semibold uppercase tracking-[0.22em] text-slate-500";

const readDraftData = (value: unknown): PropertyDraftData => {
  if (!value || typeof value !== "object") return {};
  return value as PropertyDraftData;
};

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

const getTypeLabel = (value?: string) =>
  propertyTypes.find((type) => type.value === value)?.label ?? "Alojamiento";

export default async function SupplierPropertiesPage({ searchParams }: SupplierPropertiesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para gestionar alojamientos.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({ where: { userId } });

  if (!supplier) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        No hay un perfil supplier asociado a esta cuenta.
      </div>
    );
  }

  const propertyDrafts = await prisma.tourDraft.findMany({
    where: {
      supplierId: supplier.id,
      draftKey: { startsWith: "property-" }
    },
    orderBy: { updatedAt: "desc" }
  });

  const activeType = resolvedSearchParams.type ?? "";
  const filteredDrafts = activeType
    ? propertyDrafts.filter((draft) => readDraftData(draft.data).propertyType === activeType)
    : propertyDrafts;
  const draftTypeCounts = propertyTypes.map((type) => ({
    ...type,
    count: propertyDrafts.filter((draft) => readDraftData(draft.data).propertyType === type.value).length
  }));
  const averageReadiness =
    propertyDrafts.length > 0
      ? Math.round(
          propertyDrafts.reduce((sum, draft) => sum + (readDraftData(draft.data).readinessScore ?? 0), 0) /
            propertyDrafts.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[1fr_420px] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Hospitality workspace</p>
            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight md:text-4xl">
              Alojamientos listos para venta: hoteles, apartamentos y villas
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Envia una ficha ordenada para revision humana. El equipo puede convertirla en pagina publica, conectarla a
              cotizacion, traslados desde aeropuerto, tours cercanos y SEO de hoteles.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Revision humana", "Fotos verificadas", "Schema Hotel", "Transfer + tours"].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MiniMetric label="Borradores" value={String(propertyDrafts.length)} />
            <MiniMetric label="Preparacion media" value={`${averageReadiness}%`} />
            <MiniMetric label="Revision" value={supplier.approved ? "Activa" : "Pendiente"} />
          </div>
        </div>
      </section>

      {resolvedSearchParams.status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Alojamiento enviado a revision. El equipo lo revisara para fotos, reglas, precio, SEO y activacion comercial.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {draftTypeCounts.map((type) => {
          const active = activeType === type.value;
          const href = active ? "/supplier/properties" : `/supplier/properties?type=${type.value}`;
          return (
            <a
              key={type.value}
              href={href}
              className={`rounded-[1.6rem] border p-5 shadow-sm transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-400"
              }`}
            >
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${active ? "text-emerald-300" : "text-emerald-700"}`}>
                {type.badge}
              </p>
              <h2 className="mt-2 text-lg font-semibold">{type.label}</h2>
              <p className={`mt-2 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}>{type.helper}</p>
              <p className="mt-4 text-sm font-semibold">{type.count} enviados</p>
            </a>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <form action={createSupplierPropertyDraftAction} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className={labelClass}>Nueva propiedad</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ficha profesional para revision</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              No se publica automaticamente. La informacion queda lista para que Proactivitis valide, edite y conecte la
              propiedad con ventas.
            </p>
          </div>

          <FormBlock title="1. Identidad comercial" subtitle="Lo que el cliente vera primero.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Nombre del alojamiento</span>
                <input required name="propertyName" className={fieldClass} placeholder="Ej: Villa Serena Cap Cana" />
              </label>
              <label className="block">
                <span className={labelClass}>Tipo</span>
                <select required name="propertyType" defaultValue={activeType || "hotel"} className={fieldClass}>
                  {propertyTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Marca legal / operador</span>
                <input name="legalName" className={fieldClass} placeholder="Empresa o propietario responsable" />
              </label>
              <label className="block">
                <span className={labelClass}>Website o perfil</span>
                <input name="website" className={fieldClass} placeholder="https://..." />
              </label>
            </div>
          </FormBlock>

          <FormBlock title="2. Ubicacion y mapa" subtitle="Necesario para filtros, transfers y tours cercanos.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Pais</span>
                <input required name="country" className={fieldClass} defaultValue="Republica Dominicana" />
              </label>
              <label className="block">
                <span className={labelClass}>Ciudad / destino</span>
                <input required name="city" className={fieldClass} placeholder="Punta Cana" />
              </label>
              <label className="block">
                <span className={labelClass}>Zona</span>
                <input name="zone" className={fieldClass} placeholder="Bavaro, Cap Cana, Uvero Alto..." />
              </label>
              <label className="block">
                <span className={labelClass}>Google Maps / coordenadas</span>
                <input name="mapUrl" className={fieldClass} placeholder="Link de Google Maps o coordenadas" />
              </label>
              <label className="block md:col-span-2">
                <span className={labelClass}>Direccion o referencia</span>
                <input name="address" className={fieldClass} placeholder="Direccion visible o punto de referencia" />
              </label>
            </div>
          </FormBlock>

          <FormBlock title="3. Inventario y precio" subtitle="Datos base para cotizacion y conversion.">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className={labelClass}>Precio desde USD</span>
                <input min={0} type="number" name="priceFrom" className={fieldClass} placeholder="180" />
              </label>
              <label className="block">
                <span className={labelClass}>Habitaciones / unidades</span>
                <input min={0} type="number" name="rooms" className={fieldClass} placeholder="24" />
              </label>
              <label className="block">
                <span className={labelClass}>Capacidad maxima</span>
                <input min={0} type="number" name="maxGuests" className={fieldClass} placeholder="8" />
              </label>
              <label className="block">
                <span className={labelClass}>Check-in</span>
                <input name="checkIn" className={fieldClass} placeholder="3:00 PM" />
              </label>
              <label className="block">
                <span className={labelClass}>Check-out</span>
                <input name="checkOut" className={fieldClass} placeholder="12:00 PM" />
              </label>
              <label className="block">
                <span className={labelClass}>Modelo de pago</span>
                <select name="paymentModel" className={fieldClass}>
                  <option value="quote">Cotizacion manual</option>
                  <option value="deposit">Deposito para reservar</option>
                  <option value="full-prepay">Pago total anticipado</option>
                  <option value="pay-at-property">Pago en propiedad</option>
                </select>
              </label>
            </div>
          </FormBlock>

          <FormBlock title="4. Contenido y servicios" subtitle="La base para SEO, filtros y confianza.">
            <label className="block">
              <span className={labelClass}>Descripcion comercial</span>
              <textarea
                required
                name="description"
                rows={5}
                className={fieldClass}
                placeholder="Cuenta que hace especial esta propiedad, para quien es ideal y que experiencia ofrece."
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Amenidades</span>
                <textarea name="amenities" rows={4} className={fieldClass} placeholder="Piscina, playa, cocina, desayuno, Wi-Fi..." />
              </label>
              <label className="block">
                <span className={labelClass}>Habitaciones o unidades</span>
                <textarea name="roomTypes" rows={4} className={fieldClass} placeholder="Suite vista mar, apartamento 2 habitaciones..." />
              </label>
              <label className="block">
                <span className={labelClass}>Ideal para</span>
                <textarea name="bestFor" rows={4} className={fieldClass} placeholder="Familias, parejas, adultos, grupos, lujo, playa..." />
              </label>
              <label className="block">
                <span className={labelClass}>Idiomas de atencion</span>
                <textarea name="languages" rows={4} className={fieldClass} placeholder="Espanol, English, Francais..." />
              </label>
            </div>
          </FormBlock>

          <FormBlock title="5. Operacion y fotos" subtitle="Lo que evita problemas antes de publicar.">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Politicas</span>
                <textarea name="policies" rows={4} className={fieldClass} placeholder="Cancelacion, deposito, reglas de casa, danos..." />
              </label>
              <label className="block">
                <span className={labelClass}>Disponibilidad / temporadas</span>
                <textarea name="availabilityNotes" rows={4} className={fieldClass} placeholder="Fechas abiertas, minimo de noches, temporada alta..." />
              </label>
              <label className="block">
                <span className={labelClass}>Links de fotos</span>
                <textarea name="imageLinks" rows={4} className={fieldClass} placeholder="Una URL por linea. Fotos con permiso comercial." />
              </label>
              <label className="block">
                <span className={labelClass}>Notas internas</span>
                <textarea name="internalNotes" rows={4} className={fieldClass} placeholder="Cualquier detalle que Proactivitis debe saber antes de publicar." />
              </label>
            </div>
          </FormBlock>

          <FormBlock title="6. Contacto operativo" subtitle="A quien contactamos para confirmar disponibilidad.">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className={labelClass}>Contacto</span>
                <input required name="contactName" className={fieldClass} placeholder="Nombre" />
              </label>
              <label className="block">
                <span className={labelClass}>WhatsApp</span>
                <input required name="contactPhone" className={fieldClass} placeholder="+1..." />
              </label>
              <label className="block">
                <span className={labelClass}>Email</span>
                <input type="email" name="contactEmail" className={fieldClass} placeholder="reservas@..." />
              </label>
            </div>
          </FormBlock>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
          >
            Enviar alojamiento a revision
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className={labelClass}>Checklist de publicacion</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Antes de activar una propiedad</h2>
            <div className="mt-4 space-y-2">
              {readinessItems.map((item) => (
                <div key={item} className="flex gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className={labelClass}>Borradores recientes</p>
            <div className="mt-4 space-y-3">
              {filteredDrafts.length ? (
                filteredDrafts.slice(0, 10).map((draft) => {
                  const data = readDraftData(draft.data);
                  const score = data.readinessScore ?? 0;
                  return (
                    <div key={draft.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{draft.title ?? "Alojamiento sin nombre"}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
                            {getTypeLabel(data.propertyType)} - {data.city ?? "sin destino"}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">{score}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(5, Math.min(100, score))}%` }} />
                      </div>
                      {data.reviewFlags?.length ? (
                        <p className="mt-2 text-xs leading-5 text-amber-700">{data.reviewFlags.join(" - ")}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-500">Actualizado {formatDate(draft.updatedAt)}</p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Todavia no tienes alojamientos en esta vista.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}

const FormBlock = ({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <section className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 md:p-5">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
    </div>
    {children}
  </section>
);

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
    <p className="text-2xl font-semibold">{value}</p>
    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</p>
  </div>
);
