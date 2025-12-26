"use server";

import { TransferLocationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addTransferCountryAction,
  addTransferLocationAction,
  addTransferRouteAction,
  addTransferRouteOverrideAction,
  addTransferVehicleAction,
  addTransferZoneAction,
  toggleTransferLocationActiveAction,
  upsertTransferRoutePriceAction
} from "./actions";
import LocationList from "@/components/admin/transfers/LocationList";
import TransferLocationImport from "@/components/admin/transfers/TransferLocationImport";

const TRANSFERS_ENABLED = process.env.TRANSFERS_V2_ENABLED === "true";

const LOCATION_TYPE_OPTIONS: { value: TransferLocationType; label: string }[] = [
  { value: TransferLocationType.HOTEL, label: "Hotel" },
  { value: TransferLocationType.AIRPORT, label: "Aeropuerto" },
  { value: TransferLocationType.PLACE, label: "Lugar" }
];

export default async function TransfersAdminPage() {
  if (!TRANSFERS_ENABLED) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
        <p className="font-semibold text-rose-700">Transfierencias V2 desactivadas</p>
        <p>
          Define `TRANSFERS_V2_ENABLED=true` en el entorno para acceder al nuevo backend de transfers.
          Mientras tanto, la web pública sigue usando el sistema legacy.
        </p>
        <p className="text-xs text-rose-500">Puedes activar la variable y volver a cargar este panel.</p>
      </div>
    );
  }

  const [countries, zones, locations, vehicles, routes] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
      include: { transferZonesV2: { include: { locations: { orderBy: { name: "asc" } }, country: true } } }
    }),
    prisma.transferZoneV2.findMany({
      orderBy: { name: "asc" },
      include: {
        country: true,
        locations: { orderBy: { name: "asc" } }
      }
    }),
    prisma.transferLocation.findMany({
      orderBy: { name: "asc" },
      include: { zone: true }
    }),
    prisma.transferVehicle.findMany({ orderBy: { name: "asc" } }),
    prisma.transferRoute.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        zoneA: { include: { country: true } },
        zoneB: { include: { country: true } },
        prices: { include: { vehicle: true }, orderBy: { vehicle: { name: "asc" } } },
        overrides: {
          include: { vehicle: true, originLocation: true, destinationLocation: true },
          orderBy: { updatedAt: "desc" }
        }
      }
    })
  ]);

  return (
    <div className="space-y-10 pb-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Transfers V2</p>
        <h1 className="text-3xl font-semibold text-slate-900">Administra rutas, zonas y ubicaciones</h1>
        <p className="text-sm text-slate-600">
          Paso a paso: crea países, zonas, agrega hoteles/aeropuertos y define las rutas con vehículos.
          El formulario público consumirá los locations y precios una vez que actives el flag.
        </p>
      </header>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">1. Países</h2>
          <span className="text-xs text-slate-500">Los países alimentan las zonas.</span>
        </div>
        <form action={addTransferCountryAction} className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            Nombre
            <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Slug
            <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Código ISO
            <input
              name="code"
              type="text"
              required
              maxLength={2}
              className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm uppercase tracking-[0.3em]"
            />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Descripción corta
            <input name="shortDescription" type="text" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <button
            type="submit"
            className="md:col-span-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Guardar país
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {countries.map((country) => (
            <article key={country.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{country.code}</p>
              <h3 className="text-xl font-semibold text-slate-900">{country.name}</h3>
              <p className="text-sm text-slate-600">{country.shortDescription ?? "Sin descripción."}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                {country.transferZonesV2.length} zonas registradas
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">2. Zonas por país</h2>
        <form action={addTransferZoneAction} className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            País
            <select name="countryId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona un país
              </option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Nombre de zona
            <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Slug
            <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-3">
            Descripción
            <textarea name="description" rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"></textarea>
          </label>
          <button
            type="submit"
            className="md:col-span-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Guardar zona
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {zones.map((zone) => (
            <article key={zone.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{zone.slug}</p>
                  <h3 className="text-xl font-semibold text-slate-900">{zone.name}</h3>
                </div>
                <span className="text-xs text-slate-500">{zone.country.code}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{zone.description ?? "Sin descripción."}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{zone.locations.length} locations</span>
                <span>{zone.active ? "Activa" : "Inactiva"}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">3. Locations (hoteles / aeropuertos)</h2>
        <form action={addTransferLocationAction} className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">
            Nombre del location
            <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Slug
            <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Tipo
            <select name="type" required defaultValue={TransferLocationType.HOTEL} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              {LOCATION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Zona
            <select name="zoneId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona zona
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.country.code})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Dirección (opcional)
            <input name="address" type="text" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-3">
            Descripción breve
            <textarea name="description" rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"></textarea>
          </label>
          <button
            type="submit"
            className="md:col-span-3 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Guardar location
          </button>
        </form>
        <TransferLocationImport
          zones={zones.map((zone) => ({
            id: zone.id,
            name: zone.name,
            slug: zone.slug,
            countryCode: zone.country.code
          }))}
        />
        <LocationList locations={locations} toggleAction={toggleTransferLocationActiveAction} />
        <div className="grid gap-4 lg:grid-cols-2">
          {zones.map((zone) => (
            <article key={zone.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{zone.name}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{zone.country.code}</span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                {zone.locations.length ? (
                  zone.locations.map((location) => (
                    <p key={location.id}>
                      <strong className="font-semibold text-slate-900">{location.name}</strong> · {location.type} ·{" "}
                      {location.active ? (
                        <span className="text-emerald-600">Activa</span>
                      ) : (
                        <span className="text-rose-600">Inactiva</span>
                      )}
                    </p>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Aún no tiene locations.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">4. Vehículos</h2>
        <form action={addTransferVehicleAction} className="grid gap-4 md:grid-cols-4">
          <label className="text-sm font-semibold text-slate-700">
            Nombre
            <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Slug
            <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Min pasajeros
            <input name="minPax" type="number" min={1} required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Máx pasajeros
            <input name="maxPax" type="number" min={1} required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Categoría
            <select name="category" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona categoría
              </option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="VAN">Van</option>
              <option value="BUS">MiniBus</option>
            </select>
          </label>
          <button
            type="submit"
            className="md:col-span-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Guardar vehículo
          </button>
        </form>
        <div className="grid gap-4 md:grid-cols-2">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">{vehicle.category}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                {vehicle.minPax}–{vehicle.maxPax} pasajeros
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">5. Rutas y precios</h2>
        <form action={addTransferRouteAction} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Zona A
            <select name="zoneAId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona una zona
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.country.code})
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Zona B
            <select name="zoneBId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona una zona
              </option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.country.code})
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Crear ruta
          </button>
        </form>

        <div className="space-y-6">
          {routes.map((route) => {
            const pricedVehicleIds = new Set(route.prices.map((price) => price.vehicleId));
            const unpricedVehicles = vehicles.filter((vehicle) => !pricedVehicleIds.has(vehicle.id));

            return (
              <article key={route.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {route.zoneA.name} ↔ {route.zoneB.name}
                  </h3>
                  <span className="text-xs text-slate-500">{route.countryCode}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Precios actuales</p>
                <div className="mt-3 space-y-3">
                  {route.prices.length ? (
                    route.prices.map((price) => (
                      <form key={price.id} action={upsertTransferRoutePriceAction} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                        <input type="hidden" name="routeId" value={route.id} />
                        <input type="hidden" name="vehicleId" value={price.vehicle.id} />
                        <div className="flex-1 text-sm font-semibold text-slate-900">{price.vehicle.name}</div>
                        <label className="flex flex-1 flex-col text-sm text-slate-600">
                          Precio (USD)
                          <input
                            name="price"
                            type="number"
                            min={0}
                            step={0.5}
                            defaultValue={price.price}
                            required
                            className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                          />
                        </label>
                        <button
                          type="submit"
                          className="whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                        >
                          Actualizar
                        </button>
                      </form>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">{route.zoneA.name} y {route.zoneB.name} aún no tienen precios.</p>
                  )}
                  {unpricedVehicles.length ? (
                    <form action={upsertTransferRoutePriceAction} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center">
                      <input type="hidden" name="routeId" value={route.id} />
                      <label className="flex flex-1 flex-col text-sm text-slate-600">
                        Vehículo
                        <select name="vehicleId" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
                          {unpricedVehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="flex flex-1 flex-col text-sm text-slate-600">
                        Precio (USD)
                        <input
                          name="price"
                          type="number"
                          min={0}
                          step={0.5}
                          className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                          required
                        />
                      </label>
                      <button
                        type="submit"
                        className="whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                      >
                        Crear precio
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">6. Overrides</h2>
          <p className="text-xs text-slate-500">Prioridad: pair exacto → solo origen → solo destino → base.</p>
        </div>
        <form action={addTransferRouteOverrideAction} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Ruta
            <select name="routeId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona una ruta
              </option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.zoneA.name} ↔ {route.zoneB.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Vehículo
            <select name="vehicleId" required defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="" disabled>
                Selecciona vehículo
              </option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Origen (opcional)
            <select name="originLocationId" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="">Cualquier origen</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} · {location.type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Destino (opcional)
            <select name="destinationLocationId" defaultValue="" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
              <option value="">Cualquier destino</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} · {location.type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Precio override (USD)
            <input name="price" type="number" min={0} step={0.5} required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Notas (opcional)
            <input name="notes" type="text" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <button
            type="submit"
            className="md:col-span-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Guardar override
          </button>
        </form>

        <div className="grid gap-4 lg:grid-cols-2">
          {routes.flatMap((route) =>
            route.overrides.map((override) => (
              <article key={override.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {route.zoneA.name} ↔ {route.zoneB.name}
                  </p>
                  <span className="text-xs text-slate-500">{override.vehicle.name}</span>
                </div>
                <p className="mt-2 text-sm text-slate-900">${override.price.toFixed(2)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Origen: {override.originLocation?.name ?? "cualquiera"} · Destino: {override.destinationLocation?.name ?? "cualquiera"}
                </p>
                {override.notes ? <p className="mt-1 text-xs text-slate-500">{override.notes}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
