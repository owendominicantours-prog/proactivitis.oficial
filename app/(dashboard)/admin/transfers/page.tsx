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
  deleteTransferZoneAction,
  toggleTransferLocationActiveAction,
  toggleTransferVehicleActiveAction,
  updateTransferZoneAction,
  upsertTransferRoutePriceAction
} from "./actions";
import LocationList from "@/components/admin/transfers/LocationList";
import TransferLocationImport from "@/components/admin/transfers/TransferLocationImport";
import VehicleImageField from "@/components/admin/transfers/VehicleImageField";
import { allLandings } from "@/data/transfer-landings";
import CollapsibleSection from "@/components/admin/CollapsibleSection";

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

  const landingLinkMap = new Map<string, string>();
  locations
    .filter((location) => location.type === TransferLocationType.HOTEL)
    .forEach((location) => {
      const landingSlug = `punta-cana-international-airport-to-${location.slug}`;
      landingLinkMap.set(landingSlug, location.name);
    });
  allLandings().forEach((landing) => {
    if (!landingLinkMap.has(landing.landingSlug)) {
      landingLinkMap.set(landing.landingSlug, landing.hotelName);
    }
  });

  const landingLinks = Array.from(landingLinkMap.entries()).sort(([slugA], [slugB]) =>
    slugA.localeCompare(slugB)
  );

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

      <CollapsibleSection
        title="Landing pages"
        description="Convierte cualquier slug de transfers en landing pública y revisa el tráfico."
        badge={`${landingLinks.length} disponibles`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Landing pages</p>
            <h2 className="text-lg font-semibold text-slate-900">Copias públicas disponibles</h2>
          </div>
          <p className="text-xs text-slate-500">
            Pulsa para abrir la landing correspondiente en producción (mismo slug que Google ya indexó).
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {landingLinks.map(([slug, label]) => (
            <a
              key={slug}
              href={`https://proactivitis.com/transfer/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-white/60 p-4 text-sm text-slate-600 transition hover:border-slate-400 hover:shadow-lg"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">/transfer/{slug}</p>
              <p className="font-semibold text-slate-900">{label}</p>
            </a>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Países"
        description="Registra países y edita su descripción."
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Zonas"
        description="Agrupa hoteles y aeropuertos por región."
      >
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
              <form action={updateTransferZoneAction} className="space-y-3">
                <input type="hidden" name="zoneId" value={zone.id} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{zone.slug}</p>
                    <h3 className="text-xl font-semibold text-slate-900">{zone.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500">{zone.country.code}</span>
                </div>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Nombre
                  <input
                    name="name"
                    defaultValue={zone.name}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Slug
                  <input
                    name="slug"
                    defaultValue={zone.slug}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Descripción
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={zone.description ?? ""}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                  >
                    Guardar cambios
                  </button>
                  <span className="text-xs text-slate-500">
                    {zone.locations.length} locations · {zone.active ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </form>
              <form action={deleteTransferZoneAction} className="mt-3 flex flex-col gap-2">
                <input type="hidden" name="zoneId" value={zone.id} />
                <button
                  type="submit"
                  disabled={zone.locations.length > 0}
                  className="rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 border border-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:border-rose-200 disabled:text-rose-500"
                >
                  {zone.locations.length > 0 ? "Desasocia locations antes" : "Eliminar zona"}
                </button>
                {zone.locations.length > 0 ? (
                  <p className="text-[0.65rem] text-rose-600">
                    No puedes borrar esta zona mientras tenga {zone.locations.length} locations asignadas.
                  </p>
                ) : null}
              </form>
            </article>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Locations"
        description="Importa hoteles, aeropuertos o lugares por CSV y controla su visibilidad."
      >
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
      </CollapsibleSection>

      <CollapsibleSection
        title="Vehículos"
        description="Administra tipos de vehículo y capacidades."
      >
        <h2 className="text-lg font-semibold text-slate-900">4. Vehículos</h2>
        <form action={addTransferVehicleAction} className="grid gap-4 md:grid-cols-5">
          <input type="hidden" name="vehicleId" value="" />
          <label className="text-sm font-semibold text-slate-700 md:col-span-2">
            Nombre
            <input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Slug
            <input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <div className="text-sm font-semibold text-slate-700">
            <VehicleImageField label="Imagen (URL)" supplierId="admin-transfer" />
          </div>
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
          <label className="text-sm font-semibold text-slate-700">
            Min pasajeros
            <input name="minPax" type="number" min={1} required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <label className="text-sm font-semibold text-slate-700">
            Máx pasajeros
            <input name="maxPax" type="number" min={1} required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
          </label>
          <button
            type="submit"
            className="md:col-span-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
          >
            Agregar vehículo
          </button>
        </form>
        <div className="space-y-4">
          {vehicles.map((vehicle) => (
            <article key={vehicle.id} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{vehicle.slug}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{vehicle.name}</h3>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[0.65rem] font-semibold ${
                    vehicle.active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {vehicle.active ? "Activo" : "Inactivo"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                {vehicle.category} · {vehicle.minPax}–{vehicle.maxPax} pax
              </p>
              {vehicle.imageUrl ? (
                <p className="text-xs text-slate-500">
                  Imagen: <a href={vehicle.imageUrl} target="_blank" rel="noreferrer" className="underline">{vehicle.imageUrl}</a>
                </p>
              ) : null}
              <form action={addTransferVehicleAction} className="space-y-3">
                <input type="hidden" name="vehicleId" value={vehicle.id} />
                <div className="grid gap-4 md:grid-cols-4">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Nombre
                    <input name="name" defaultValue={vehicle.name} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Slug
                    <input name="slug" defaultValue={vehicle.slug} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Min
                    <input name="minPax" type="number" defaultValue={vehicle.minPax} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
                  </label>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Máx
                    <input name="maxPax" type="number" defaultValue={vehicle.maxPax} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
                  </label>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Categoría
                    <select name="category" defaultValue={vehicle.category} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm">
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="VAN">Van</option>
                      <option value="BUS">MiniBus</option>
                    </select>
                  </label>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500 md:col-span-2">
                    <VehicleImageField
                      label="Imagen (URL)"
                      defaultValue={vehicle.imageUrl ?? ""}
                      supplierId="admin-transfer"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
              <form action={toggleTransferVehicleActiveAction} className="flex items-center gap-2">
                <input type="hidden" name="vehicleId" value={vehicle.id} />
                <button
                  type="submit"
                  className="rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-900 border border-slate-200 transition hover:border-slate-400"
                >
                  {vehicle.active ? "Marcar inactivo" : "Marcar activo"}
                </button>
              </form>
            </article>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Rutas y precios"
        description="Define rutas bidireccionales y precios por vehículo."
      >
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Bidireccional</p>
            <h2 className="text-lg font-semibold text-slate-900">5. Rutas y precios</h2>
          </div>
          <p className="text-xs text-slate-500">
            Las rutas siempre usan min/max de zoneId para garantizar una entrada única por par de zonas.
          </p>
        </div>
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
          {routes.map((route) => (
            <article key={route.id} className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{route.countryCode}</p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {route.zoneA.name} ↔ {route.zoneB.name}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Actualizado {new Date(route.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="grid gap-3">
                {vehicles.map((vehicle) => {
                  const priceEntry = route.prices.find((price) => price.vehicleId === vehicle.id);
                  return (
                    <form
                      key={`${route.id}-${vehicle.id}`}
                      action={upsertTransferRoutePriceAction}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm"
                    >
                      <input type="hidden" name="routeId" value={route.id} />
                      <input type="hidden" name="vehicleId" value={vehicle.id} />
                      <div className="flex-1 font-semibold text-slate-900">{vehicle.name}</div>
                      <label className="flex flex-1 flex-col text-xs uppercase tracking-[0.3em] text-slate-500">
                        Precio (USD)
                        <input
                          name="price"
                          type="number"
                          min={0}
                          step={0.5}
                          defaultValue={priceEntry?.price ?? ""}
                          required
                          className="mt-1 rounded-lg border border-slate-200 p-2 text-sm"
                        />
                      </label>
                      <button
                        type="submit"
                        className="rounded-full bg-slate-900 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-slate-800"
                      >
                        {priceEntry ? "Actualizar" : "Guardar precio"}
                      </button>
                    </form>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Overrides"
        description="Tarifas especiales por hotel, origen o destino."
      >
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
      </CollapsibleSection>
    </div>
  );
}
