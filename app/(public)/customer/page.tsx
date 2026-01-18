import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerPaymentMethod from "@/components/customer/CustomerPaymentMethod";
import { CustomerPreferencesForm } from "@/components/customer/CustomerPreferencesForm";

export const metadata = {
  robots: { index: false, follow: false }
};

export default async function CustomerPortal() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesion</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver tu panel de cliente.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true }
  });

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    include: { Tour: true },
    orderBy: { travelDate: "desc" },
    take: 8
  });
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }],
      travelDate: { gte: new Date() }
    },
    include: { Tour: true },
    orderBy: { travelDate: "asc" },
    take: 3
  });

  const payment = user
    ? await prisma.customerPayment.findUnique({
        where: { userId: user.id },
        select: { method: true, brand: true, last4: true, updatedAt: true, stripePaymentMethodId: true }
      })
    : null;
  const paymentSummary = payment
    ? {
        method: payment.method,
        brand: payment.brand,
        last4: payment.last4,
        updatedAt: payment.updatedAt.toISOString(),
        isStripe: Boolean(payment.stripePaymentMethodId)
      }
    : null;

  const preferredCountries = (preference?.preferredCountries as string[] | undefined) ?? [];
  const preferredDestinations = (preference?.preferredDestinations as string[] | undefined) ?? [];
  const recommended = await prisma.tour.findMany({
    where: {
      status: "published",
      slug: { not: "transfer-privado-proactivitis" },
      ...(preferredCountries.length || preferredDestinations.length
        ? {
            departureDestination: {
              is: {
                ...(preferredCountries.length ? { country: { slug: { in: preferredCountries } } } : {}),
                ...(preferredDestinations.length ? { slug: { in: preferredDestinations } } : {})
              }
            }
          }
        : {})
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: { id: true, slug: true, title: true, heroImage: true, price: true }
  });

  const customerName = user?.name ?? session.user.name ?? "Viajero";
  const preference = user
    ? await prisma.customerPreference.findUnique({
        where: { userId: user.id },
        select: {
          preferredCountries: true,
          preferredDestinations: true,
          preferredProductTypes: true,
          consentMarketing: true,
          completedAt: true
        }
      })
    : null;
  const showPreferenceForm = !preference?.completedAt;
  const [countries, destinations] = await Promise.all([
    prisma.country.findMany({
      select: { name: true, slug: true },
      orderBy: { name: "asc" }
    }),
    prisma.destination.findMany({
      select: { name: true, slug: true, country: { select: { name: true } } },
      orderBy: { name: "asc" }
    })
  ]);

  const statusLabels: Record<string, string> = {
    CONFIRMED: "Confirmada",
    PAYMENT_PENDING: "Pendiente de pago",
    CANCELLATION_REQUESTED: "Cancelacion en revision",
    CANCELLED: "Cancelada",
    COMPLETED: "Completada"
  };
  const notifications = bookings.slice(0, 4).map((booking) => ({
    id: booking.id,
    label: statusLabels[booking.status] ?? booking.status,
    text: booking.Tour?.title ?? "Tour",
    date: booking.travelDate
  }));
  const whatsappBase =
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/18093949877?text=Hola%20Proactivitis";
  const buildWhatsappLink = (message: string) => {
    const hasQuery = whatsappBase.includes("?");
    const hasText = whatsappBase.includes("text=");
    if (hasText) {
      return `${whatsappBase}%0A${encodeURIComponent(message)}`;
    }
    return `${whatsappBase}${hasQuery ? "&" : "?"}text=${encodeURIComponent(message)}`;
  };

  const nextBooking = upcomingBookings[0];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Tu cuenta</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Hola, {customerName}</h1>
              <p className="text-sm text-slate-500">Aqui encuentras tus reservas, pagos y recomendaciones.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/tours"
                className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
              >
                Explorar tours
              </Link>
              <Link
                href="/traslado"
                className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
              >
                Reservar traslado
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <p className="text-sm font-semibold text-slate-900">Sesión activa</p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{customerName}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <Link
                href="/customer/profile"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600"
              >
                Editar perfil
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Navegacion</p>
              <div className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
                <Link href="/customer" className="block rounded-xl border border-slate-100 px-4 py-3">
                  Inicio
                </Link>
                <Link href="/customer/reservations" className="block rounded-xl border border-slate-100 px-4 py-3">
                  Mis reservas
                </Link>
                <Link href="/customer/payments" className="block rounded-xl border border-slate-100 px-4 py-3">
                  Metodos de pago
                </Link>
                <a
                  href={buildWhatsappLink("Necesito ayuda con mi cuenta")}
                  className="block rounded-xl border border-emerald-200 px-4 py-3 text-emerald-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  Soporte 24/7
                </a>
              </div>
            </div>

            <div id="payment" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <CustomerPaymentMethod initialPayment={paymentSummary} />
            </div>
          </aside>

          <main className="space-y-6">
            {showPreferenceForm && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <CustomerPreferencesForm
                  countries={countries}
                  destinations={destinations.map((destination) => ({
                    name: destination.name,
                    slug: destination.slug,
                    country: destination.country.name
                  }))}
                  initial={
                    preference
                      ? {
                          preferredCountries: preference.preferredCountries as string[] | undefined,
                          preferredDestinations: preference.preferredDestinations as string[] | undefined,
                          preferredProductTypes: preference.preferredProductTypes as string[] | undefined,
                          consentMarketing: preference.consentMarketing ?? false,
                          completedAt: preference.completedAt?.toISOString()
                        }
                      : null
                  }
                />
              </section>
            )}
            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Reservas totales</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{bookings.length}</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Proximos viajes</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{upcomingBookings.length}</p>
              </article>
              <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Metodo de pago</p>
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {paymentSummary?.brand ? `${paymentSummary.brand} •••• ${paymentSummary.last4}` : "No registrado"}
                </p>
              </article>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Proxima reserva</p>
              {nextBooking ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{nextBooking.Tour?.title ?? "Tour"}</p>
                    <p className="text-sm text-slate-500">
                      {nextBooking.travelDate.toLocaleDateString("es-DO")} · {nextBooking.travelDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">
                      {statusLabels[nextBooking.status] ?? nextBooking.status}
                    </p>
                  </div>
                  <Link
                    href={`/customer/reservations/${nextBooking.id}`}
                    className="inline-flex items-center rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700"
                  >
                    Ver e-ticket
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">No tienes reservas futuras.</p>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mis reservas</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">E-tickets recientes</h2>
                </div>
                <Link
                  href="/customer/reservations"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {bookings.length === 0 && <p className="text-sm text-slate-500">Aun no tienes reservas activas.</p>}
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.Tour?.title ?? "Tour"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.travelDate.toLocaleDateString("es-DO")} - {booking.travelDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
                      <Link
                        href={`/customer/reservations/${booking.id}`}
                        className="rounded-full border border-emerald-200 px-3 py-1 text-emerald-700"
                      >
                        Ver e-ticket
                      </Link>
                      {booking.Tour?.slug && (
                        <Link
                          href={`/tours/${booking.Tour.slug}#reviews`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-slate-600"
                        >
                          Dejar resena
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.6fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recomendaciones</p>
                <div className="mt-4 space-y-3">
                  {recommended.map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-4 text-sm text-slate-700 hover:border-emerald-200"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {tour.heroImage ? (
                          <Image
                            src={tour.heroImage}
                            alt={tour.title}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase text-slate-400">
                            Tour
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">{tour.title}</p>
                        <p className="text-xs text-slate-500">Desde ${tour.price.toFixed(0)} USD</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notificaciones</p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {notifications.length === 0 && <p className="text-sm text-slate-500">No tienes notificaciones nuevas.</p>}
                  {notifications.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                      <p className="font-semibold text-slate-800">{item.text}</p>
                      <p className="text-xs text-slate-500">{item.date.toLocaleDateString("es-DO")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
