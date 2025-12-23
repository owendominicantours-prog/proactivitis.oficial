import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TourBookingWidget } from "@/components/tours/TourBookingWidget";

type PersistedTimeSlot = { hour: number; minute: string; period: "AM" | "PM" };

const parseJsonArray = <T,>(value?: string | null): T[] => {
  if (!value) return [];
  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
};

type TourHotelLandingParams = {
  params: Promise<{ slug: string; locationSlug: string }>;
  searchParams?: Promise<{ bookingCode?: string }>;
};

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locationSlug: string }>;
}) {
  const { slug, locationSlug } = await params;
  const tour = await prisma.tour.findUnique({
    where: { slug },
    select: { title: true, shortDescription: true }
  });
  const location = await prisma.location.findUnique({
    where: { slug: locationSlug },
    select: { name: true }
  });

  if (!tour || !location) {
    return {
      title: "Tour no encontrado | Proactivitis",
      description: "No pudimos encontrar la experiencia seleccionada."
    };
  }

  return {
    title: `${tour.title} con recogida en ${location.name} | Proactivitis`,
    description: tour.shortDescription ?? `Reserva ${tour.title} con recogida personalizada desde ${location.name}.`
  };
}

export default async function TourHotelLanding({ params, searchParams }: TourHotelLandingParams) {
  const { slug, locationSlug } = await params;
  const resolvedSearch = searchParams ? await searchParams : {};

  let tour = null;
  let location = null;
  try {
    [tour, location] = await Promise.all([
      prisma.tour.findUnique({
        where: { slug },
        include: {
          SupplierProfile: {
            include: { User: { select: { name: true } } }
          },
          country: true,
          destination: true,
          microZone: true
        }
      }),
      prisma.location.findUnique({
        where: { slug: locationSlug },
        include: { microZone: true, destination: true, country: true }
      })
    ]);
  } catch (error) {
        console.error("Error loading tour or location for landing page", {
          slug,
          locationSlug,
          error
        });
    throw error;
  }

  if (!tour) {
    console.error("Tour no encontrado para el slug", { slug, locationSlug });
    notFound();
  }

  if (!location) {
    console.error("Location no encontrada para el slug", { locationSlug, slug });
    notFound();
  }

  const persistedTimeSlots = parseJsonArray<PersistedTimeSlot>(tour.timeOptions);
  const timeSlots = persistedTimeSlots.length
    ? persistedTimeSlots
    : [{ hour: 9, minute: "00", period: "AM" }];
  const normalizedTimeSlots = timeSlots.map((slot) => ({
    hour: slot.hour,
    minute: slot.minute,
    period: slot.period as "AM" | "PM"
  }));

  const bookingCode = resolvedSearch.bookingCode;
  const heroImage = tour.heroImage ?? "/fototours/fotosimple.jpg";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <main className="mx-auto max-w-6xl space-y-8">
        <section className="space-y-3 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Tour + recogida</p>
          <h1 className="text-4xl font-semibold text-slate-900">
            {tour.title} con recogida en {location.name}
          </h1>
          <p className="text-sm text-slate-600">
            {location.microZone?.name ?? location.destination?.name} · {location.destination?.name ?? "Punta Cana"}
          </p>
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              <Image
                src={heroImage}
                alt={tour.title}
                width={800}
                height={450}
                className="h-[320px] w-full rounded-[26px] object-cover"
              />
              <p className="text-sm text-slate-700">{tour.shortDescription}</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="rounded-full border border-slate-200 px-3 py-1 uppercase tracking-[0.3em]">
                  {tour.category ?? "Experiencia"}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 uppercase tracking-[0.3em]">
                  {location.microZone?.name ?? location.destination?.name}
                </span>
                <span className="rounded-full border border-slate-200 px-3 py-1 uppercase tracking-[0.3em]">
                  {location.name}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-[26px] border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Proveedor</p>
                <p className="text-lg font-semibold text-slate-900">
                  {tour.SupplierProfile?.company ?? tour.SupplierProfile?.User?.name ?? "Proveedor local"}
                </p>
              </div>
              <TourBookingWidget
                tourId={tour.id}
                basePrice={tour.price}
                timeSlots={normalizedTimeSlots}
                supplierHasStripeAccount={Boolean(tour.SupplierProfile?.stripeAccountId)}
                platformSharePercent={tour.platformSharePercent ?? 20}
                tourTitle={tour.title}
                tourImage={heroImage}
                hotelSlug={location.slug}
                bookingCode={bookingCode ?? undefined}
                originHotelName={location.name}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
