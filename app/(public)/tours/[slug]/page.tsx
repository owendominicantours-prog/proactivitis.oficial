import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TourGalleryViewer from "@/components/shared/TourGalleryViewer";
import { notFound, redirect } from "next/navigation";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";
import { ItineraryTimeline, TimelineStop } from "@/components/itinerary/ItineraryTimeline";
import { parseAdminItinerary, parseItinerary, ItineraryStop } from "@/lib/itinerary";
import ReserveFloatingButton from "@/components/shared/ReserveFloatingButton";

type TourDetailProps = {
  params: {
    slug?: string;
  };
};

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

const parseDuration = (value?: string | null) => {
  if (!value) return { value: "8", unit: "horas" };
  try {
    return JSON.parse(value) as { value: string; unit: string };
  } catch {
    return { value: value ?? "8", unit: "horas" };
  }
};

const formatTimeSlot = (slot: PersistedTimeSlot) => {
  const minute = slot.minute.padStart(2, "0");
  return `${slot.hour.toString().padStart(2, "0")}:${minute} ${slot.period}`;
};

const breadcrumb = ["Home", "Tours", "Dominican Republic", "Safari Proactivitis"];
const itineraryMock: ItineraryStop[] = [
  { time: "08:00", title: "Hotel pickup", description: "We collect guests from Punta Cana hotels and drive toward the ranch." },
  { time: "10:30", title: "Safari route", description: "Thunder through countryside tracks with stops for photos." },
  { time: "12:30", title: "Village visit", description: "Meet locals, taste cocoa and enjoy folkloric presentation." },
  { time: "14:00", title: "Lunch & river stop", description: "Buffet lunch and manageable swim in the river." }
];
const additionalInfo = [
  "Confirmamos los puntos exactos de encuentro con 24h de antelación",
  "No apto para personas con movilidad reducida",
  "No recomendado para embarazadas",
  "Sillas infantiles disponibles bajo solicitud",
  "Reserva confirmada desde 2 huéspedes"
];
const packingList = [
  { icon: "👟", label: "Calzado cerrado", detail: "Protección en terrenos irregulares" },
  { icon: "🕶️", label: "Gafas de sol", detail: "Ideal para brisa marina y lodo reflejante" },
  { icon: "🧴", label: "Protector solar", detail: "Elige fórmula biodegradable" },
  { icon: "👕", label: "Ropa cómoda", detail: "Manga corta + ropa que se pueda ensuciar" }
];

export default async function TourDetailPage({ params }: TourDetailProps) {
  const { slug } = await params;
  if (!slug) notFound();

  const tour = await prisma.tour.findFirst({
    where: { slug },
    include: {
      SupplierProfile: {
        include: {
          User: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  if (!tour) {
    const fallback = await prisma.tour.findUnique({ where: { id: slug } });
    if (fallback?.slug) redirect(`/tours/${fallback.slug}`);
    notFound();
  }

  if (tour.status !== "published") {
    notFound();
  }

  const gallery = (tour.gallery ? JSON.parse(tour.gallery as string) : [tour.heroImage ?? "/fototours/fotosimple.jpg"]) as string[];
  const includes = tour.includes
    ? tour.includes.split(";").map((item) => item.trim()).filter(Boolean)
    : ["Transport", "Guide", "Lunch"];
  const excludes = ["Gratuities", "Drinks", "Photos"];

  const shortDescription = tour.shortDescription?.trim() ?? "";
  const detailedDescription = tour.description ?? "";
  const categories = (tour.category ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const languages = (tour.language ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const operatingDays = parseJsonArray<string>(tour.operatingDays);
  const blackoutDates = parseJsonArray<string>(tour.blackoutDates);
  const timeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const durationValue = parseDuration(tour.duration);
  const durationLabel = `${durationValue.value} ${durationValue.unit}`;
  const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const allDaysSelected =
    WEEK_DAYS.length > 0 && WEEK_DAYS.every((day) => operatingDays.includes(day));
  const detailRows = [
    { label: "Categorías", values: categories },
    { label: "Idiomas", values: languages },
    {
      label: "Días operativos",
      value: allDaysSelected ? "Todos los días" : undefined,
      values: allDaysSelected ? undefined : operatingDays
    },
    { label: "Fechas bloqueadas", values: blackoutDates },
    { label: "Nivel físico", value: tour.physicalLevel },
    { label: "Capacidad máxima", value: tour.capacity ? `${tour.capacity} personas` : undefined },
    { label: "Cancelación", value: tour.cancellationPolicy },
    { label: "Requisitos", value: tour.requirements }
  ].filter((row) => (row.values ? row.values.length > 0 : Boolean(row.value)));

  const parsedAdminItinerary = parseAdminItinerary(tour.adminNote ?? "");
  const itinerarySource = parsedAdminItinerary.length ? parsedAdminItinerary : parseItinerary(tour.adminNote ?? "");
  const finalItinerary = itinerarySource.length ? itinerarySource : itineraryMock;
  const timelineStops: TimelineStop[] = finalItinerary.map((stop) => ({
    label: stop.title,
    description: stop.description,
    duration: stop.time
  }));

  const priceLabel = `Desde $${tour.price.toFixed(0)} USD`;

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${gallery[0]})` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/70" />
        <div className="relative mx-auto max-w-6xl px-6 py-12">
          <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <div className="space-y-5 text-white">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">{tour.location}, Dominican Republic</p>
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{tour.title}</h1>
              <p className="text-sm text-white/80">{shortDescription || "Experiencia guiada por proveedores locales certificados."}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="#booking"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-sky-600"
                >
                  Reserva ahora
                </Link>
                <Link
                  href="#gallery"
                  className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 transition hover:text-white"
                >
                  Ver fotos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Precio base</p>
            <p className="text-xl font-semibold text-slate-900">{priceLabel}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Duración</p>
            <p className="text-xl font-semibold text-slate-900">{durationLabel}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Idiomas</p>
            <p className="text-sm font-semibold text-slate-900">{languages.length ? languages.join(" · ") : "Por confirmar"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Horarios</p>
            <p className="text-sm font-semibold text-slate-900">{timeSlots.length ? timeSlots.map(formatTimeSlot).join(" · ") : "Por confirmar"}</p>
          </div>
        </div>
      </section>

      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:max-w-7xl lg:flex-row lg:items-start">
        <div className="space-y-8 lg:w-3/5">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Gallery</h3>
            <div className="mt-4">
              <TourGalleryViewer
                images={gallery.map((img: string, index: number) => ({
                  url: img,
                  label: `${tour.title} ${index + 1}`
                }))}
              />
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Overview</h2>
            <p className="text-sm text-slate-600">{shortDescription || "Descripción breve no disponible."}</p>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Descripción completa</h2>
            <p className="text-sm text-slate-600">{detailedDescription || "La descripción completa estará disponible pronto."}</p>
          </section>

          {detailRows.length > 0 && (
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-900">Detalles clave</h3>
                <span className="text-xs uppercase tracking-[0.4em] text-slate-400">Información resumida</span>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {detailRows.map((row) => (
                  <div key={row.label} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500">
                      {row.label}
                    </p>
                    {row.values ? (
                      <div className="flex flex-wrap gap-2">
                        {row.values.map((value) => (
                          <span
                            key={value}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-900">{row.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">What’s included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-sky-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">What’s not included</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {excludes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-rose-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-baseline justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Meeting & pickup</h3>
              <span className="text-xs text-slate-500">Start time: 08:00</span>
            </div>
            <p className="text-sm text-slate-600">
              Pickup available at select Punta Cana resorts. Confirm exact location and time after booking.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Hotel pickup, meeting point details, and optional transfers included.
            </div>
          </section>

          <ItineraryTimeline
            stops={timelineStops}
            startDescription={
              tour.meetingPoint ? `Encuentro en ${tour.meetingPoint}.` : undefined
            }
            finishDescription={tour.meetingInstructions || undefined}
          />

          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Additional info</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {additionalInfo.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Cancellation policy</h3>
            <p className="text-sm text-slate-600">
              You can cancel up to 24 hours in advance of the experience for a full refund.
            </p>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Reviews</h3>
              <div className="text-sm text-slate-500">★ 4.9 · 1,230 reviews</div>
            </div>
            <div className="grid gap-4">
              {["Rebecca", "James", "Anna"].map((name) => (
                <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">March 2025 · Verified traveller</p>
                  <p>“Amazing safari experience, comfortable transport and knowledgeable guides.”</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Related experiences</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {["Safari + Catamaran", "Sunset Cruise"].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{item}</p>
                  <p>More adventures coming soon.</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
        <div id="booking" className="lg:sticky top-24 space-y-5">
          <TourBookingWidget tourId={tour.id} basePrice={tour.price} timeSlots={timeSlots} />
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Supplier</p>
            <p className="text-lg font-semibold text-slate-900">{tour.SupplierProfile?.User?.name ?? "Local partner"}</p>
            <p className="text-sm text-slate-600">Certified by Proactivitis.</p>
          </div>
        </div>
        </aside>
      </main>
      <ReserveFloatingButton targetId="booking" priceLabel={priceLabel} />
    </div>
  );
}

