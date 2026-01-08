import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerPaymentMethod from "@/components/customer/CustomerPaymentMethod";

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
    take: 6
  });

  const payment = user
    ? await prisma.customerPayment.findUnique({
        where: { userId: user.id }
      })
    : null;

  const recommended = await prisma.tour.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
    select: { id: true, slug: true, title: true, heroImage: true, price: true }
  });

  const customerName = user?.name ?? session.user.name ?? "Viajero";

  const messages = [
    bookings[0]
      ? `Tu reserva para ${bookings[0].Tour?.title ?? "tu tour"} esta en seguimiento.`
      : "Explora tours recomendados y activa alertas de nuevos destinos.",
    "Puedes guardar tu metodo de pago una sola vez y usarlo en cada reserva.",
    "Si necesitas ayuda, nuestro soporte 24/7 esta disponible por WhatsApp."
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <h1 className="text-2xl font-semibold text-slate-900">Hola, {customerName}</h1>
            </div>
            <p className="text-sm text-slate-600">
              Bienvenido a tu panel. Aqui puedes ver reservas, metodo de pago y tus e-tickets.
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mensajes</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                {messages.map((message) => (
                  <div key={message} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    {message}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">E-tickets</p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">Tus reservas recientes</h2>
                </div>
                <Link
                  href="/customer/reservations"
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600 hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="mt-4 space-y-3">
                {bookings.length === 0 && (
                  <p className="text-sm text-slate-500">Aun no tienes reservas activas.</p>
                )}
                {bookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {booking.Tour?.title ?? "Tour"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.travelDate.toLocaleDateString("es-DO")} ? {booking.travelDate.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
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
                          Dejar rese?a
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <CustomerPaymentMethod initialPayment={payment} />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recomendaciones</p>
              <div className="mt-4 space-y-3">
                {recommended.map((tour) => (
                  <Link
                    key={tour.id}
                    href={`/tours/${tour.slug}`}
                    className="block rounded-2xl border border-slate-100 p-4 text-sm text-slate-700 hover:border-emerald-200"
                  >
                    <p className="font-semibold text-slate-900">{tour.title}</p>
                    <p className="text-xs text-slate-500">Desde ${tour.price.toFixed(0)} USD</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
