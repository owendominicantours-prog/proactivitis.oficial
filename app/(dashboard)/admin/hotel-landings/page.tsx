import type { ReactNode } from "react";
import {
  BedDouble,
  Globe,
  LayoutPanelTop,
  Megaphone,
  ScrollText,
  Search,
  ShieldCheck,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { HotelLandingOverrides } from "@/lib/siteContent";
import { updateHotelLandingContentAction } from "./actions";
import HotelImageManager from "@/components/admin/hotels/HotelImageManager";

type SearchParams = {
  hotel?: string;
  locale?: "es" | "en" | "fr";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

const toRoomTypesText = (rooms?: Array<{ name: string; priceFrom?: string; image?: string }>) =>
  (rooms ?? []).map((room) => [room.name, room.priceFrom ?? "", room.image ?? ""].join("|")).join("\n");

const SectionCard = ({
  id,
  icon: Icon,
  title,
  subtitle,
  children
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <section id={id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
    <div className="mb-6 flex items-start gap-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
    <div className="grid gap-4">{children}</div>
  </section>
);

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
    <section className="space-y-8 rounded-[32px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm md:p-10">
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
            Admin
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600">
            Hotel CMS
          </span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Editor profesional de hoteles</h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-600">
          Misma logica de calidad que los tours: contenido estructurado, SEO, visual, conversion y politicas.
          Todo editable sin tocar codigo.
        </p>
        <div className="mt-5 grid gap-3 text-xs text-slate-600 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">SEO + metadata por idioma</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Hero + galeria + puntos con iconos</div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">Widget + habitaciones + amenidades + politicas</div>
        </div>
      </header>

      <form method="GET" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
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

          <SectionCard
            id="seo"
            icon={Search}
            title="1) SEO y posicionamiento"
            subtitle="Titulo, descripcion y metadata para resultados de Google con alta conversion."
          >
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
          </SectionCard>

          <SectionCard
            id="hero"
            icon={LayoutPanelTop}
            title="2) Hero visual del hotel"
            subtitle="Primera impresion: titulo, subtitulo, estrellas, mapa y galeria principal."
          >
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
            <HotelImageManager heroValue={defaults.heroImage ?? ""} galleryValues={defaults.galleryImages ?? []} />
          </SectionCard>

          <SectionCard
            id="widget"
            icon={Megaphone}
            title="3) Conversion (widget de cotizacion)"
            subtitle="Configura CTA y senales de confianza que elevan conversion."
          >
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
          </SectionCard>

          <SectionCard
            id="overview"
            icon={ScrollText}
            title="4) Contenido editorial del hotel"
            subtitle="Texto comercial largo para posicionamiento y confianza."
          >
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
          </SectionCard>

          <SectionCard
            id="feature-icons"
            icon={Sparkles}
            title="5) Puntos clave con iconos"
            subtitle="Estos 4 bullets salen destacados en la landing para comunicar valor rapido."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Bullet 1
                <input name="bullet1" defaultValue={defaults.bullet1 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Frente a la playa" />
              </label>
              <label className="text-sm text-slate-600">
                Bullet 2
                <input name="bullet2" defaultValue={defaults.bullet2 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Todo incluido premium" />
              </label>
              <label className="text-sm text-slate-600">
                Bullet 3
                <input name="bullet3" defaultValue={defaults.bullet3 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Ideal para familias" />
              </label>
              <label className="text-sm text-slate-600">
                Bullet 4
                <input name="bullet4" defaultValue={defaults.bullet4 ?? ""} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" placeholder="Restaurantes y spa" />
              </label>
            </div>
          </SectionCard>

          <SectionCard
            id="rooms-amenities"
            icon={BedDouble}
            title="6) Habitaciones y amenidades"
            subtitle="Informacion util para que el cliente compare y decida rapido."
          >
            <label className="text-sm text-slate-600">
              Tipos de habitaciones (formato: Nombre|Desde $XXX|URL Imagen)
              <textarea name="roomTypes" rows={5} defaultValue={toRoomTypesText(defaults.roomTypes)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              Amenidades (una por linea, se muestran con iconos automaticos)
              <textarea name="amenities" rows={4} defaultValue={(defaults.amenities ?? []).join("\n")} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </SectionCard>

          <SectionCard
            id="policies"
            icon={ShieldCheck}
            title="7) Politicas del hotel"
            subtitle="Transparencia operativa: horarios, cancelacion y condiciones para grupos."
          >
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
          </SectionCard>

          <SectionCard
            id="final"
            icon={Globe}
            title="8) Bloques finales de la pagina"
            subtitle="Titulos de secciones inferiores para tours y traslados relacionados."
          >
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
          </SectionCard>

          <button type="submit" className="w-fit rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Guardar cambios
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">No hay hoteles activos para editar.</p>
      )}
    </section>
  );
}

