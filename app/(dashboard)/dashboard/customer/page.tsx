export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CreditCard,
  Download,
  FileText,
  LifeBuoy,
  MapPin,
  Receipt,
  Search,
  ShieldCheck
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { customerRequestCancellation } from "@/lib/actions/bookingCancellation";
import { getNotificationsForRecipient, parseNotificationMetadata } from "@/lib/notificationService";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import { BookingStatusEnum } from "@/lib/types/booking";
import { prisma } from "@/lib/prisma";
import { CustomerSupportForm } from "@/components/customer/CustomerSupportForm";
import CustomerPaymentMethod from "@/components/customer/CustomerPaymentMethod";
import { DynamicImage } from "@/components/shared/DynamicImage";

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmada",
  PAYMENT_PENDING: "Pendiente de pago",
  CANCELLATION_REQUESTED: "Cancelacion en revision",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada"
};

const paymentOk = new Set(["paid", "succeeded", "requires_capture"]);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);

const formatTime = (value: Date, fallback?: string | null) =>
  fallback ??
  new Intl.DateTimeFormat("es-DO", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const isPaymentDue = (booking: { status: string; paymentStatus?: string | null; paymentMethod?: string | null }) => {
  if (booking.status === BookingStatusEnum.CANCELLED || booking.status === BookingStatusEnum.COMPLETED) return false;
  if (booking.status === BookingStatusEnum.PAYMENT_PENDING) return true;
  if (booking.paymentMethod === "PAY_LATER") return true;
  if (!booking.paymentStatus) return false;
  return !paymentOk.has(booking.paymentStatus.toLowerCase());
};

const inactiveStatuses = new Set<string>([
  BookingStatusEnum.CANCELLED,
  BookingStatusEnum.COMPLETED,
  BookingStatusEnum.CANCELLATION_REQUESTED
]);
const finishedStatuses = new Set<string>([BookingStatusEnum.CANCELLED, BookingStatusEnum.COMPLETED]);
const canRequestCancel = (status: string) => !inactiveStatuses.has(status);

export default async function CustomerDashboardPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; tab?: string }>;
}) {
  const resolvedSearch = searchParams ? await searchParams : {};
  const query = (resolvedSearch.q ?? "").trim().toLowerCase();
  const tab = resolvedSearch.tab ?? "all";
  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        <p className="text-lg font-semibold text-slate-950">Inicia sesion para ver tu cuenta.</p>
        <Link
          href="/auth/login?callbackUrl=/dashboard/customer"
          className="mt-5 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white"
        >
          Entrar
        </Link>
      </div>
    );
  }

  const userEmail = session.user.email?.toLowerCase() ?? "";
  const userId = session.user.id;
  const [user, bookings, proDiscoveryOpportunities, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true, email: true }
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          userId ? { userId } : undefined,
          userEmail ? { customerEmail: userEmail } : undefined
        ].filter(Boolean) as any
      },
      include: {
        Tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            heroImage: true,
            location: true,
            meetingPoint: true,
            SupplierProfile: {
              select: {
                company: true
              }
            }
          }
        },
        TourOption: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: [{ travelDate: "asc" }, { createdAt: "desc" }]
    }),
    prisma.proDiscoveryGroupOpportunity.findMany({
      where: { contactEmail: userEmail },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    userId ? getNotificationsForRecipient({ role: "CUSTOMER", userId, limit: 5 }) : []
  ]);

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
        isStripe: Boolean(payment.stripePaymentMethodId),
        stripePaymentMethodId: payment.stripePaymentMethodId
      }
    : null;

  const filteredBookings = bookings.filter((booking) => {
    const haystack = [
      booking.bookingCode,
      booking.id,
      booking.Tour?.title,
      booking.Tour?.location,
      booking.status,
      booking.customerName,
      booking.customerEmail
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    const matchesTab =
      tab === "upcoming"
        ? booking.travelDate >= new Date() && booking.status !== BookingStatusEnum.CANCELLED
        : tab === "completed"
          ? booking.status === BookingStatusEnum.COMPLETED
          : tab === "cancelled"
            ? booking.status === BookingStatusEnum.CANCELLED
            : tab === "pending"
              ? isPaymentDue(booking)
              : true;
    return matchesQuery && matchesTab;
  });

  const now = new Date();
  const pendingPayment = bookings.filter(isPaymentDue);
  const upcoming = filteredBookings.filter((booking) => booking.travelDate >= now && booking.status !== BookingStatusEnum.CANCELLED);
  const past = filteredBookings.filter((booking) => booking.travelDate < now || booking.status === BookingStatusEnum.CANCELLED);
  const activeBookings = bookings.filter((booking) => !finishedStatuses.has(booking.status));
  const customerName = user?.name ?? session.user.name ?? "Cliente";
  const totalPending = pendingPayment.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_36%),linear-gradient(135deg,#ffffff,#f8fafc)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Cuenta global</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Hola, {customerName}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Tus reservas, pagos, e-tickets, cancelaciones y soporte viven aqui. No necesitas salir de la web para gestionar tu viaje.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tours" className="rounded-2xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700">
              Explorar tours
            </Link>
            <Link href="/prodiscovery" className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              Viaje a medida
            </Link>
          </div>
        </div>
        </div>
      </div>

      {pendingPayment.length ? (
        <section className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-950">Tienes {pendingPayment.length} reserva(s) pendiente(s) de pago</p>
                <p className="mt-1 text-sm text-amber-800">
                  Total pendiente: {formatMoney(totalPending)}. Completa el pago para confirmar el servicio y activar el e-ticket final.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/customer/reservas/${pendingPayment[0].id}/pagar`}
              className="inline-flex rounded-2xl bg-amber-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
            >
              Pagar ahora
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={<CalendarDays className="h-5 w-5" />} label="Proximas" value={upcoming.length.toString()} tone="sky" />
        <MetricCard icon={<CreditCard className="h-5 w-5" />} label="Pago pendiente" value={pendingPayment.length.toString()} tone="amber" />
        <MetricCard icon={<FileText className="h-5 w-5" />} label="Reservas reales" value={bookings.length.toString()} tone="slate" />
        <MetricCard icon={<ShieldCheck className="h-5 w-5" />} label="Activas" value={activeBookings.length.toString()} tone="emerald" />
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Gestion</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Buscar y filtrar reservas</h2>
          </div>
          <form className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[360px] sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={resolvedSearch.q ?? ""}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                placeholder="Codigo, tour, destino..."
              />
            </div>
            <input type="hidden" name="tab" value={tab} />
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              Buscar
            </button>
          </form>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em]">
          {[
            ["all", "Todas"],
            ["upcoming", "Proximas"],
            ["pending", "Pago pendiente"],
            ["completed", "Completadas"],
            ["cancelled", "Canceladas"]
          ].map(([value, label]) => (
            <Link
              key={value}
              href={`/dashboard/customer?tab=${value}${resolvedSearch.q ? `&q=${encodeURIComponent(resolvedSearch.q)}` : ""}`}
              className={`rounded-full border px-3 py-2 ${
                tab === value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-600"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AccountOption icon={<FileText className="h-5 w-5" />} title="Reservas y e-tickets" body="Ver detalles, voucher, QR, comprobante y estado." href="/dashboard/customer" />
        <AccountOption icon={<CreditCard className="h-5 w-5" />} title="Pagos" body="Metodos guardados, pagos pendientes y comprobantes." href="/customer/payments" />
        <AccountOption icon={<Bell className="h-5 w-5" />} title="Notificaciones" body="Cambios, respuestas y alertas de operacion." href="/customer/notifications" />
        <AccountOption icon={<LifeBuoy className="h-5 w-5" />} title="Soporte web" body="Mensajes internos sin salir de la plataforma." href="#support" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ReservationSection title="Proximas reservas" bookings={upcoming} />
          <ReservationSection title="Historial" bookings={past} compact />
        </div>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <CustomerPaymentMethod initialPayment={paymentSummary} title="Tarjeta guardada" />
          </div>

          <div id="support" className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Soporte web</p>
                <h2 className="text-lg font-semibold text-slate-950">Enviar mensaje</h2>
              </div>
            </div>
            <div className="mt-4">
              <CustomerSupportForm name={customerName} email={userEmail} />
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Notificaciones</p>
            <div className="mt-4 space-y-3">
              {notifications.length ? (
                notifications.map((notification) => {
                  const metadata = parseNotificationMetadata(notification.metadata);
                  const display = getNotificationDisplayProps(notification.type as any);
                  const target =
                    metadata.referenceUrl ??
                    (metadata.bookingId ?? notification.bookingId
                      ? `/dashboard/customer/reservas/${metadata.bookingId ?? notification.bookingId}`
                      : "/customer/notifications");
                  return (
                    <Link key={notification.id} href={target} className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:border-slate-200">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{display.label}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{notification.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{notification.message ?? notification.body}</p>
                    </Link>
                  );
                })
              ) : (
                <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No tienes notificaciones nuevas.</p>
              )}
            </div>
          </div>

          {proDiscoveryOpportunities.length ? (
            <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">ProDiscovery</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Solicitudes de grupo</h2>
              <div className="mt-4 space-y-3">
                {proDiscoveryOpportunities.map((opportunity) => {
                  const deposit =
                    opportunity.acceptedBudget && ["QUOTED", "ACCEPTED", "PAYMENT_STARTED", "WON"].includes(opportunity.status)
                      ? opportunity.depositAmount ?? opportunity.acceptedBudget * (opportunity.depositPercent / 100)
                      : null;
                  return (
                    <article key={opportunity.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{opportunity.city}</p>
                          <p className="text-xs text-slate-600">{opportunity.groupSize} personas - {opportunity.requestCode}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                          {opportunity.status}
                        </span>
                      </div>
                      {deposit ? (
                        <Link
                          href={`/api/prodiscovery/deposit-checkout?opportunityId=${opportunity.id}`}
                          className="mt-3 inline-flex rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Pagar deposito {formatMoney(deposit)}
                        </Link>
                      ) : (
                        <p className="mt-3 text-xs text-slate-500">Pago disponible cuando la propuesta este aprobada.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </aside>
      </section>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone = "slate"
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: "slate" | "sky" | "amber" | "emerald";
}) {
  const toneClass = {
    slate: "bg-slate-100 text-slate-700",
    sky: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700"
  }[tone];

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}>{icon}</span>
        <p className="text-3xl font-semibold text-slate-950">{value}</p>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{label}</p>
    </article>
  );
}

function AccountOption({
  icon,
  title,
  body,
  href
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:border-slate-300 hover:bg-slate-50">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">{icon}</span>
      <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
    </Link>
  );
}

function ReservationSection({
  title,
  bookings,
  compact = false
}: {
  title: string;
  bookings: Awaited<ReturnType<typeof prisma.booking.findMany>>;
  compact?: boolean;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Reservas</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{title}</h2>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {bookings.length ? (
          bookings.map((booking: any) => <ReservationCard key={booking.id} booking={booking} compact={compact} />)
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            No hay reservas en esta seccion.
          </div>
        )}
      </div>
    </section>
  );
}

function ReservationCard({ booking, compact }: { booking: any; compact?: boolean }) {
  const due = isPaymentDue(booking);
  const totalPax = (booking.paxAdults ?? 0) + (booking.paxChildren ?? 0);
  const image = booking.Tour?.heroImage ?? "/fototours/fototour.jpeg";
  const orderCode = booking.bookingCode ?? booking.id.slice(0, 8).toUpperCase();
  const supplier = booking.Tour?.SupplierProfile?.company ?? "Proactivitis";

  return (
    <article className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100 transition hover:border-slate-300">
      <div className="grid gap-4 p-4 md:grid-cols-[140px_1fr]">
        {!compact ? (
          <div className="relative h-32 overflow-hidden rounded-2xl bg-slate-100 md:h-full">
            <DynamicImage src={image} alt={booking.Tour?.title ?? "Servicio"} className="absolute inset-0 h-full w-full object-cover" />
          </div>
        ) : null}
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{orderCode}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">{booking.Tour?.title ?? "Servicio Proactivitis"}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" />
                {formatDate(booking.travelDate)} - {formatTime(booking.travelDate, booking.startTime)}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${due ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
              {statusLabels[booking.status] ?? booking.status}
            </span>
          </div>

          <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
            <InfoMini label="Pax" value={`${totalPax} persona${totalPax === 1 ? "" : "s"}`} />
            <InfoMini label="Total" value={formatMoney(booking.totalAmount)} />
            <InfoMini label="Proveedor" value={supplier} />
          </div>

          <div className="flex flex-wrap gap-2">
            {due ? (
              <Link
                href={`/dashboard/customer/reservas/${booking.id}/pagar`}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
              >
                <CreditCard className="h-4 w-4" />
                Pagar ahora
              </Link>
            ) : null}
            <Link
              href={`/dashboard/customer/reservas/${booking.id}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700"
            >
              <FileText className="h-4 w-4" />
              Ver reserva
            </Link>
            {!due && booking.status !== BookingStatusEnum.CANCELLED ? (
              <Link
                href={`/api/bookings/${booking.id}/eticket`}
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700"
              >
                <Download className="h-4 w-4" />
                E-ticket
              </Link>
            ) : null}
            <Link
              href={`/api/bookings/${booking.id}/receipt`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700"
            >
              <Receipt className="h-4 w-4" />
              Recibo
            </Link>
          </div>

          {canRequestCancel(booking.status) ? (
            <details className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3">
              <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
                Solicitar cancelacion
              </summary>
              <form action={customerRequestCancellation} className="mt-3 space-y-3">
                <input type="hidden" name="bookingId" value={booking.id} />
                <textarea
                  name="reason"
                  required
                  minLength={8}
                  rows={3}
                  className="w-full rounded-2xl border border-rose-100 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
                  placeholder="Explica el motivo de la cancelacion"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white"
                >
                  Enviar solicitud
                </button>
              </form>
            </details>
          ) : null}

          <p className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4" />
            {booking.pickup ?? booking.hotel ?? booking.Tour?.meetingPoint ?? "Punto por confirmar"}
          </p>
        </div>
      </div>
    </article>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
