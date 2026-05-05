import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupplierPropertyDraftAction } from "./actions";

type SupplierPropertiesPageProps = {
  searchParams?: Promise<{ status?: string }>;
};

const propertyTypes = [
  { value: "hotel", label: "Hotel", helper: "Recepcion, habitaciones, servicios y operacion hotelera." },
  { value: "apartment", label: "Apartamento", helper: "Unidad independiente, condo, aparta-hotel o estancia por noche." },
  { value: "villa", label: "Casa vacacional / villa", helper: "Propiedad privada para familias, grupos o estadias premium." }
];

const fieldClass =
  "mt-1 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200";
const labelClass = "text-xs font-semibold uppercase tracking-[0.26em] text-slate-500";

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

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="grid gap-6 p-6 md:p-8 xl:grid-cols-[1fr_0.72fr] xl:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Hospitality workspace</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Alojamientos para hoteles, apartamentos y casas vacacionales
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Sube tu propiedad con datos claros para que el equipo la revise, la convierta en pagina publica y la conecte
              con cotizacion, traslados y tours.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Borradores" value={String(propertyDrafts.length)} />
            <MiniMetric label="Revision" value="Humana" />
            <MiniMetric label="Tipos" value="3" />
          </div>
        </div>
      </section>

      {resolvedSearchParams.status === "sent" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          Alojamiento enviado a revision. El equipo puede convertirlo en ficha publica cuando valide datos y fotos.
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form action={createSupplierPropertyDraftAction} className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className={labelClass}>Nueva propiedad</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Ficha base para revision</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Este formulario no publica automaticamente. Deja la informacion ordenada para revision, SEO, fotos y activacion comercial.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Nombre del alojamiento</span>
              <input required name="propertyName" className={fieldClass} placeholder="Ej: Villa Serena Cap Cana" />
            </label>
            <label className="block">
              <span className={labelClass}>Tipo</span>
              <select required name="propertyType" className={fieldClass}>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Pais</span>
              <input required name="country" className={fieldClass} placeholder="Republica Dominicana" />
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
              <span className={labelClass}>Direccion</span>
              <input name="address" className={fieldClass} placeholder="Direccion visible o referencia" />
            </label>
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
              <span className={labelClass}>Website</span>
              <input name="website" className={fieldClass} placeholder="https://..." />
            </label>
          </div>

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

          <label className="block">
            <span className={labelClass}>Descripcion comercial</span>
            <textarea required name="description" rows={5} className={fieldClass} placeholder="Cuenta que hace especial esta propiedad, para quien es ideal y que experiencia ofrece." />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Amenidades</span>
              <textarea name="amenities" rows={4} className={fieldClass} placeholder="Piscina, playa, cocina, desayuno, Wi-Fi..." />
            </label>
            <label className="block">
              <span className={labelClass}>Habitaciones o unidades</span>
              <textarea name="roomTypes" rows={4} className={fieldClass} placeholder="Suite vista mar, apartamento 2 habitaciones..." />
            </label>
            <label className="block">
              <span className={labelClass}>Politicas</span>
              <textarea name="policies" rows={4} className={fieldClass} placeholder="Check-in, cancelacion, deposito, reglas de casa..." />
            </label>
            <label className="block">
              <span className={labelClass}>Links de fotos</span>
              <textarea name="imageLinks" rows={4} className={fieldClass} placeholder="Una URL por linea. Luego el equipo puede subirlas al CDN." />
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-white transition hover:bg-slate-800"
          >
            Enviar alojamiento a revision
          </button>
        </form>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className={labelClass}>Panel configurado</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">Cuando eliges hotel, apartamento o villa</h2>
            <div className="mt-4 space-y-3">
              {propertyTypes.map((type) => (
                <div key={type.value} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">{type.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{type.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className={labelClass}>Borradores recientes</p>
            <div className="mt-4 space-y-3">
              {propertyDrafts.length ? (
                propertyDrafts.slice(0, 8).map((draft) => {
                  const data = draft.data as { propertyType?: string; city?: string; status?: string };
                  return (
                    <div key={draft.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">{draft.title ?? "Alojamiento sin nombre"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                        {data.propertyType ?? "property"} · {data.city ?? "sin destino"} · {data.status ?? "review"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Actualizado {new Date(draft.updatedAt).toLocaleString("es-ES")}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Todavia no tienes alojamientos enviados.
                </p>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

const MiniMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
    <p className="text-2xl font-semibold">{value}</p>
    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-300">{label}</p>
  </div>
);
