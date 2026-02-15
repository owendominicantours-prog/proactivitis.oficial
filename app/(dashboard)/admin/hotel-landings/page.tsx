import { prisma } from "@/lib/prisma";
import type { HotelLandingOverrides } from "@/lib/siteContent";
import { updateHotelLandingContentAction } from "./actions";

type SearchParams = {
  hotel?: string;
  locale?: "es" | "en" | "fr";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const toRoomTypesText = (rooms?: Array<{ name: string; priceFrom?: string; image?: string }>) =>
  (rooms ?? []).map((room) => [room.name, room.priceFrom ?? "", room.image ?? ""].join("|")).join("\n");

export default async function AdminHotelLandingsPage({ searchParams }: Props) {
  const resolved = searchParams ? await searchParams : undefined;
  const selectedLocale = resolved?.locale ?? "es";

  const [hotels, setting] = await Promise.all([
    prisma.transferLocation.findMany({
      where: { type: "HOTEL", active: true },
      select: { slug: true, name: true },
      orderBy: { name: "asc" }
    }),
    prisma.siteContentSetting.findUnique({ where: { key: "HOTEL_LANDING" } })
  ]);

  const selectedHotel = resolved?.hotel && hotels.some((item) => item.slug === resolved.hotel) ? resolved.hotel : hotels[0]?.slug;
  const content = (setting?.content as Record<string, Record<string, HotelLandingOverrides>> | null) ?? {};
  const defaults = (selectedHotel ? content[selectedHotel]?.[selectedLocale] : undefined) ?? {};

  return (
    <section className="space-y-8 rounded-[32px] border border-slate-200 bg-white p-10 shadow-sm">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Hotel Landings</h1>
        <p className="text-sm text-slate-500">Editor completo de paginas de hotel: SEO, fotos, widget, descripcion, habitaciones y politicas.</p>
      </header>

      <form method="GET" className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 md:grid-cols-3">
        <label className="text-sm text-slate-600">
          Hotel
          <select name="hotel" defaultValue={selectedHotel} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            {hotels.map((hotel) => (
              <option key={hotel.slug} value={hotel.slug}>
                {hotel.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-600">
          Idioma
          <select name="locale" defaultValue={selectedLocale} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
            <option value="es">Espanol</option>
            <option value="en">English</option>
            <option value="fr">Francais</option>
          </select>
        </label>
        <button type="submit" className="self-end rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Cargar
        </button>
      </form>

      {selectedHotel ? (
        <form action={updateHotelLandingContentAction} className="grid gap-6">
          <input type="hidden" name="hotelSlug" value={selectedHotel} />
          <input type="hidden" name="locale" value={selectedLocale} />

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">1. SEO</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                SEO Title
                <input name="seoTitle" defaultValue={defaults.seoTitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                SEO Description
                <input name="seoDescription" defaultValue={defaults.seoDescription ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">2. Hero y Visual</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Hero Title
                <input name="heroTitle" defaultValue={defaults.heroTitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Hero Subtitle
                <input name="heroSubtitle" defaultValue={defaults.heroSubtitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm text-slate-600">
                Estrellas (4 o 5)
                <input name="stars" defaultValue={defaults.stars ?? "5"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Ubicacion corta
                <input name="locationLabel" defaultValue={defaults.locationLabel ?? "Bavaro, Punta Cana"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                URL de mapa
                <input name="mapUrl" defaultValue={defaults.mapUrl ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <label className="text-sm text-slate-600">
              Hero Image URL
              <input name="heroImage" defaultValue={defaults.heroImage ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Gallery Images (URLs separadas por coma o salto de linea)
              <textarea name="galleryImages" rows={4} defaultValue={(defaults.galleryImages ?? []).join("\n")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">3. Widget de Cotizacion</h2>
            <div className="grid gap-4 md:grid-cols-4">
              <label className="text-sm text-slate-600">
                CTA del boton
                <input name="quoteCta" defaultValue={defaults.quoteCta ?? "Consultar Disponibilidad"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Precio desde (USD)
                <input name="priceFromUSD" defaultValue={defaults.priceFromUSD ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Rating (schema)
                <input name="reviewRating" defaultValue={defaults.reviewRating ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Numero de resenas
                <input name="reviewCount" defaultValue={defaults.reviewCount ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">4. Informacion del Hotel</h2>
            <label className="text-sm text-slate-600">
              Titulo de descripcion
              <input name="overviewTitle" defaultValue={defaults.overviewTitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Parrafo 1
              <textarea name="description1" rows={3} defaultValue={defaults.description1 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Parrafo 2
              <textarea name="description2" rows={3} defaultValue={defaults.description2 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Parrafo 3
              <textarea name="description3" rows={3} defaultValue={defaults.description3 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Highlights (uno por linea)
              <textarea name="highlights" rows={4} defaultValue={(defaults.highlights ?? []).join("\n")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">5. Habitaciones y Amenidades</h2>
            <label className="text-sm text-slate-600">
              Tipos de habitaciones (formato: Nombre|Desde $XXX|URL Imagen)
              <textarea name="roomTypes" rows={5} defaultValue={toRoomTypesText(defaults.roomTypes)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Amenidades (una por linea)
              <textarea name="amenities" rows={4} defaultValue={(defaults.amenities ?? []).join("\n")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">6. Politicas</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Check-in
                <input name="checkInTime" defaultValue={defaults.checkInTime ?? "3:00 PM"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Check-out
                <input name="checkOutTime" defaultValue={defaults.checkOutTime ?? "12:00 PM"} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
            <label className="text-sm text-slate-600">
              Politica de cancelacion
              <textarea name="cancellationPolicy" rows={3} defaultValue={defaults.cancellationPolicy ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Politica para grupos
              <textarea name="groupPolicy" rows={3} defaultValue={defaults.groupPolicy ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-900">7. Bloques Finales</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Tours Section Title
                <input name="toursTitle" defaultValue={defaults.toursTitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-600">
                Transfers Section Title
                <input name="transfersTitle" defaultValue={defaults.transfersTitle ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
              </label>
            </div>
          </div>

          <button type="submit" className="w-fit rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white">
            Guardar cambios
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">No hay hoteles activos para editar.</p>
      )}
    </section>
  );
}
