import Link from "next/link";
import RentCarVehicleImageField from "@/components/admin/rentcar/RentCarVehicleImageField";
import { getRentCarFleetSettings } from "@/lib/rentCarSettings";
import { getRentCarOptions, rentCarMarginTypes } from "@/data/rentCarFleet";
import {
  resetRentCarFleetSettingsAction,
  updateRentCarLocationAction,
  updateRentCarVehicleAction
} from "./actions";

export const metadata = {
  title: "Rent a car | Admin Proactivitis"
};

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100";
const labelClass = "text-[10px] font-black uppercase tracking-[0.18em] text-slate-500";

export default async function AdminRentCarPage() {
  const settings = await getRentCarFleetSettings();
  const options = getRentCarOptions(undefined, settings);
  const activeVehicles = settings.vehicles.filter((vehicle) => vehicle.active);
  const activeLocations = settings.locations.filter((location) => location.active);
  const cheapest = options.length ? Math.min(...options.map((option) => option.price)) : 0;

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700">Admin rent a car</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950">Editor de flota, zonas, precios e imagenes</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              Lo que edites aqui alimenta las paginas publicas de rent car, el buscador, los widgets y el sitemap.
              Si algo falla en base de datos, la web conserva la flotilla base como respaldo.
            </p>
          </div>
          <form action={resetRentCarFleetSettingsAction}>
            <button className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              Restaurar base
            </button>
          </form>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-950">{activeLocations.length}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Zonas activas</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-2xl font-black text-emerald-700">{activeVehicles.length}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Vehiculos activos</p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="text-2xl font-black text-sky-700">${cheapest}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Precio desde</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-2xl font-black text-amber-700">{settings.lastUpdate}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-700">Ultima edicion</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Vehiculos</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Editar modelos, precios, fotos y prioridad</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            En imagen pega una ruta publica como <strong>/rent-a-car/fleet/01-kia-picanto-2025.webp</strong> o una URL permitida.
          </p>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {settings.vehicles.map((vehicle) => (
            <form
              key={vehicle.slug}
              action={updateRentCarVehicleAction}
              className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4"
            >
              <input type="hidden" name="slug" value={vehicle.slug} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-slate-950">{vehicle.model}</p>
                  <p className="text-xs font-bold text-slate-500">{vehicle.slug}</p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                  <input type="checkbox" name="active" defaultChecked={vehicle.active} />
                  Activo
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[170px_minmax(0,1fr)]">
                <RentCarVehicleImageField defaultValue={vehicle.image} vehicleSlug={vehicle.slug} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className={labelClass}>Modelo</span>
                    <input name="model" defaultValue={vehicle.model} className={inputClass} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelClass}>Categoria visible</span>
                    <input name="label" defaultValue={vehicle.label} className={inputClass} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelClass}>Nombre marketing</span>
                    <input name="displayName" defaultValue={vehicle.displayName} className={inputClass} />
                  </label>
                  <label className="space-y-1">
                    <span className={labelClass}>Badge</span>
                    <input name="tag" defaultValue={vehicle.tag} className={inputClass} />
                  </label>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="space-y-1">
                  <span className={labelClass}>Precio base USD</span>
                  <input name="basePrice" type="number" min="0" step="1" defaultValue={vehicle.basePrice} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Margen</span>
                  <select name="margin" defaultValue={vehicle.margin} className={inputClass}>
                    {rentCarMarginTypes.map((margin) => (
                      <option key={margin} value={margin}>{margin}</option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Asientos</span>
                  <input name="seats" type="number" min="1" step="1" defaultValue={vehicle.seats} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Maletas</span>
                  <input name="luggage" type="number" min="0" step="1" defaultValue={vehicle.luggage} className={inputClass} />
                </label>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_120px]">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold leading-5 text-slate-500">
                  La foto se sube desde el boton de arriba. Se optimiza y queda conectada al vehiculo automaticamente.
                </div>
                <label className="space-y-1">
                  <span className={labelClass}>Prioridad</span>
                  <input name="priority" type="number" step="1" defaultValue={vehicle.priority} className={inputClass} />
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href={`/en/rent-a-car/${activeLocations[0]?.id ?? "puj-cap-cana"}/${vehicle.slug}`}
                  className="text-xs font-black uppercase tracking-[0.16em] text-sky-700 hover:text-sky-900"
                >
                  Ver pagina
                </Link>
                <button className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  Guardar vehiculo
                </button>
              </div>
            </form>
          ))}

          <form action={updateRentCarVehicleAction} className="rounded-[1.7rem] border border-dashed border-sky-300 bg-sky-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-slate-950">Agregar nuevo vehiculo</p>
                <p className="text-xs font-bold text-slate-500">Usa slug limpio, por ejemplo mercedes-benz-glc.</p>
              </div>
              <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                <input type="checkbox" name="active" defaultChecked />
                Activo
              </label>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className={labelClass}>Slug</span>
                <input name="slug" placeholder="mercedes-benz-glc" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Modelo</span>
                <input name="model" placeholder="Mercedes-Benz GLC" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Categoria visible</span>
                <input name="label" placeholder="Premium SUV" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Nombre marketing</span>
                <input name="displayName" placeholder="Premium SUV Rental" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Badge</span>
                <input name="tag" placeholder="Boss Mode" className={inputClass} />
              </label>
              <div className="sm:col-span-2">
                <span className={labelClass}>Imagen</span>
                <div className="mt-1 max-w-xs">
                  <RentCarVehicleImageField defaultValue="" vehicleSlug="nuevo-rent-car" />
                </div>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <label className="space-y-1">
                <span className={labelClass}>Precio base</span>
                <input name="basePrice" type="number" min="0" step="1" defaultValue={90} className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Margen</span>
                <select name="margin" defaultValue="premium" className={inputClass}>
                  {rentCarMarginTypes.map((margin) => (
                    <option key={margin} value={margin}>{margin}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Asientos</span>
                <input name="seats" type="number" min="1" step="1" defaultValue={5} className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Maletas</span>
                <input name="luggage" type="number" min="0" step="1" defaultValue={3} className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Prioridad</span>
                <input name="priority" type="number" step="1" defaultValue={90} className={inputClass} />
              </label>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="rounded-full bg-sky-700 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                Crear vehiculo
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Zonas</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">Editar aeropuertos, multiplicador y busqueda</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            El multiplicador ajusta la zona completa. Ejemplo: <strong>1.08</strong> sube todos los vehiculos 8% antes del margen.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {settings.locations.map((location) => (
            <form
              key={location.id}
              action={updateRentCarLocationAction}
              className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4"
            >
              <input type="hidden" name="id" value={location.id} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black text-slate-950">{location.name}</p>
                  <p className="text-xs font-bold text-slate-500">{location.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                    <input type="checkbox" name="active" defaultChecked={location.active} />
                    Activa
                  </label>
                  <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-sky-700">
                    <input type="checkbox" name="highProfile" defaultChecked={location.highProfile} />
                    Premium
                  </label>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className={labelClass}>Nombre</span>
                  <input name="name" defaultValue={location.name} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Codigo interno</span>
                  <input name="code" defaultValue={location.code} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Region ID</span>
                  <input name="regionId" defaultValue={location.regionId} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Aeropuerto</span>
                  <input name="airportLabel" defaultValue={location.airportLabel} className={inputClass} />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Multiplicador</span>
                  <input name="multiplier" type="number" min="0" step="0.01" defaultValue={location.multiplier} className={inputClass} />
                </label>
              </div>

              <label className="mt-3 block space-y-1">
                <span className={labelClass}>Terminos de busqueda</span>
                <textarea
                  name="searchTerms"
                  defaultValue={location.searchTerms.join("\n")}
                  className={`${inputClass} min-h-28 resize-y`}
                />
              </label>

              <div className="mt-4 flex justify-end">
                <button className="rounded-full bg-slate-950 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                  Guardar zona
                </button>
              </div>
            </form>
          ))}

          <form action={updateRentCarLocationAction} className="rounded-[1.7rem] border border-dashed border-sky-300 bg-sky-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base font-black text-slate-950">Agregar nueva zona</p>
                <p className="text-xs font-bold text-slate-500">La zona crea URLs nuevas en los 3 idiomas.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                  <input type="checkbox" name="active" defaultChecked />
                  Activa
                </label>
                <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.15em] text-sky-700">
                  <input type="checkbox" name="highProfile" />
                  Premium
                </label>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="space-y-1">
                <span className={labelClass}>ID URL</span>
                <input name="id" placeholder="mexico-cancun" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Nombre</span>
                <input name="name" placeholder="Cancun / Riviera Maya" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Codigo interno</span>
                <input name="code" placeholder="CUN" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Region ID</span>
                <input name="regionId" placeholder="CUN_RIVIERA_MAYA" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Aeropuerto</span>
                <input name="airportLabel" placeholder="CUN" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Multiplicador</span>
                <input name="multiplier" type="number" min="0" step="0.01" defaultValue={1} className={inputClass} />
              </label>
            </div>

            <label className="mt-3 block space-y-1">
              <span className={labelClass}>Terminos de busqueda</span>
              <textarea
                name="searchTerms"
                placeholder={"cancun\nriviera maya\ncun"}
                className={`${inputClass} min-h-28 resize-y`}
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button className="rounded-full bg-sky-700 px-5 py-2.5 text-xs font-black uppercase tracking-[0.18em] text-white">
                Crear zona
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
