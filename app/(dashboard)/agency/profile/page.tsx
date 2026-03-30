import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CustomerPaymentMethod from "@/components/customer/CustomerPaymentMethod";

export const dynamic = "force-dynamic";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const formatDate = (value: Date | null | undefined) => {
  if (!value) return "No disponible";
  return value.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

export default async function AgencyProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Inicia sesion para ver tu perfil.</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      AgencyProfile: true,
      PartnerApplication: {
        where: { role: "AGENCY" },
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!user) {
    return <div className="py-10 text-center text-sm text-slate-600">No encontramos tu cuenta de agencia.</div>;
  }

  const [links, transferLinks, bookings, payment] = await Promise.all([
    prisma.agencyProLink.findMany({
      where: { agencyUserId: userId },
      include: {
        Tour: { select: { title: true } },
        Booking: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.agencyTransferLink.findMany({
      where: { agencyUserId: userId },
      include: {
        originLocation: { select: { name: true } },
        destinationLocation: { select: { name: true } },
        Booking: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.booking.findMany({
      where: {
        source: "AGENCY",
        OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }, { AgencyTransferLink: { agencyUserId: userId } }]
      },
      include: {
        Tour: { select: { title: true } },
        AgencyProLink: {
          select: {
            slug: true,
            markup: true
          }
        },
        AgencyTransferLink: {
          select: {
            slug: true,
            markup: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.customerPayment.findUnique({
      where: { userId },
      select: { method: true, brand: true, last4: true, updatedAt: true, stripePaymentMethodId: true }
    })
  ]);

  const profile = user.AgencyProfile;
  const application = user.PartnerApplication[0] ?? null;
  const companyName = profile?.companyName ?? application?.companyName ?? user.name ?? "Agencia";
  const contactName = application?.contactName ?? user.name ?? "No definido";
  const contactRole = application?.contactRole ?? "No definido";
  const contactPhone = application?.phone ?? "No definido";
  const country = application?.country ?? "No definido";
  const website = application?.website ?? "No definida";
  const commissionPercent = profile?.commissionPercent ?? 20;
  const approved = Boolean(user.agencyApproved || profile?.approved || application?.status === "APPROVED");
  const totalSales = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
  const totalAgencyRevenue = bookings.reduce((sum, booking) => {
    return sum + (booking.agencyMarkupAmount ?? booking.agencyFee ?? 0);
  }, 0);
  const directBookings = bookings.filter((booking) => !booking.agencyProLinkId && !booking.agencyTransferLinkId).length;
  const agencyProBookings = bookings.filter((booking) => Boolean(booking.agencyProLinkId || booking.agencyTransferLinkId)).length;
  const lastBookingDate = bookings[0]?.createdAt ?? null;
  const latestLink = links[0] ?? null;
  const latestTransferLink = transferLinks[0] ?? null;
  const paymentSummary = payment
    ? {
        method: payment.method,
        brand: payment.brand,
        last4: payment.last4,
        updatedAt: payment.updatedAt?.toISOString(),
        isStripe: Boolean(payment.stripePaymentMethodId),
        stripePaymentMethodId: payment.stripePaymentMethodId
      }
    : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Ficha de agencia</p>
            <h1 className="mt-3 text-3xl font-semibold">{companyName}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Revisa el estado de tu cuenta, la comision directa, tu actividad comercial y el rendimiento de tus links
              de tours y traslados.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">Estado</p>
            <p className="mt-2 text-lg font-semibold">{approved ? "Agencia aprobada" : "Pendiente de aprobacion"}</p>
            <p className="mt-1 text-slate-300">Comision directa actual: {commissionPercent}%</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Reservas totales" value={String(bookings.length)} helper="Operaciones asociadas a tu cuenta" />
        <MetricCard label="Ventas brutas" value={formatCurrency(totalSales)} helper="Total vendido en esta cuenta" />
        <MetricCard label="Ingreso agencia" value={formatCurrency(totalAgencyRevenue)} helper="Markup AgencyPro o comision directa" />
        <MetricCard label="Links AgencyPro" value={String(links.length + transferLinks.length)} helper="Tours y traslados listos para compartir" />
        <MetricCard label="Ultima reserva" value={formatDate(lastBookingDate)} helper="Fecha de la actividad mas reciente" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Identidad comercial</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Datos de la agencia</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard label="Empresa" value={companyName} />
            <InfoCard label="Contacto principal" value={contactName} />
            <InfoCard label="Cargo" value={contactRole} />
            <InfoCard label="Correo" value={user.email ?? "No definido"} />
            <InfoCard label="Telefono" value={contactPhone} />
            <InfoCard label="Pais" value={country} />
            <InfoCard label="Web" value={website} />
            <InfoCard label="Cuenta creada" value={formatDate(user.createdAt)} />
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Control comercial</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Operacion actual</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InfoCard label="Comision directa" value={`${commissionPercent}%`} />
            <InfoCard label="Reservas directas" value={String(directBookings)} />
            <InfoCard label="Reservas AgencyPro" value={String(agencyProBookings)} />
            <InfoCard label="Solicitud" value={application?.status ?? (approved ? "APPROVED" : "PENDING")} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Lectura rapida</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              La comision directa se aplica cuando reservas desde tu cuenta. Los links AgencyPro de tours y traslados trabajan con tu propio margen y no con este porcentaje.
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Pago guardado</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Método de pago de la agencia</h2>
          <p className="mt-2 text-sm text-slate-600">
            Guarda la tarjeta de tu agencia en Stripe para no tener que introducirla en cada reserva directa.
          </p>
        </div>
        <CustomerPaymentMethod initialPayment={paymentSummary} title="Tarjeta guardada para reservas de agencia" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">Reservas recientes</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Actividad comercial</h2>
            </div>
            <span className="text-xs text-slate-500">{bookings.length} total</span>
          </div>

          <div className="mt-4 space-y-3">
            {bookings.slice(0, 8).map((booking) => {
              const channelLabel = booking.AgencyProLink
                ? "AgencyPro Tour"
                : booking.AgencyTransferLink
                  ? "AgencyPro Transfer"
                  : "Cuenta de agencia";
              const agencyRevenue = booking.agencyMarkupAmount ?? booking.agencyFee ?? 0;

              return (
                <div key={booking.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Reserva"}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.customerName} · {formatDate(booking.travelDate)} · {formatCurrency(booking.totalAmount)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{channelLabel}</span>
                    <span>Ingreso agencia: {formatCurrency(agencyRevenue)}</span>
                    <span>{booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>
              );
            })}

            {!bookings.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Aun no tienes reservas registradas en esta cuenta.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">AgencyPro</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">Links comerciales</h2>
            </div>
            <span className="text-xs text-slate-500">{links.length + transferLinks.length} total</span>
          </div>

          <div className="mt-4 space-y-3">
            {links.slice(0, 8).map((link) => (
              <div key={link.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{link.Tour?.title ?? "Tour"}</p>
                <p className="mt-1 text-sm text-slate-600">/agency-pro/{link.slug}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Precio final: {formatCurrency(link.price)}</span>
                  <span>Markup: {formatCurrency(link.markup)}</span>
                  <span>Reservas: {link.Booking.length}</span>
                </div>
              </div>
            ))}
            {transferLinks.slice(0, 8).map((link) => (
              <div key={link.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{link.originLocation.name} → {link.destinationLocation.name}</p>
                <p className="mt-1 text-sm text-slate-600">/agency-transfer/{link.slug}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Precio final: {formatCurrency(link.price)}</span>
                  <span>Markup: {formatCurrency(link.markup)}</span>
                  <span>Reservas: {link.Booking.length}</span>
                </div>
              </div>
            ))}

            {!links.length && !transferLinks.length && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                Todavia no has creado links AgencyPro.
              </div>
            )}
          </div>

          {latestLink || latestTransferLink ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Ultimo link creado</p>
              {latestTransferLink && (!latestLink || latestTransferLink.createdAt > latestLink.createdAt) ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-slate-900">/agency-transfer/{latestTransferLink.slug}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {latestTransferLink.originLocation.name} → {latestTransferLink.destinationLocation.name} · {formatCurrency(latestTransferLink.price)}
                  </p>
                </>
              ) : latestLink ? (
                <>
                  <p className="mt-2 text-sm font-semibold text-slate-900">/agency-pro/{latestLink.slug}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {latestLink.Tour?.title ?? "Tour"} · {formatCurrency(latestLink.price)}
                  </p>
                </>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>
    </div>
  );
}

const MetricCard = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    <p className="mt-2 text-sm text-slate-500">{helper}</p>
  </article>
);

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);
