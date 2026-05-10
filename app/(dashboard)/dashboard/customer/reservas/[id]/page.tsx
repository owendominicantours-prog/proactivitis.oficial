export const dynamic = "force-dynamic";

import Link from "next/link";
import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, CreditCard, Download, FileText, LifeBuoy, MapPin, XCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import Eticket from "@/components/booking/Eticket";
import { DynamicImage } from "@/components/shared/DynamicImage";
import { CustomerSupportForm } from "@/components/customer/CustomerSupportForm";
import { authOptions } from "@/lib/auth";
import { customerRequestCancellation } from "@/lib/actions/bookingCancellation";
import { buildBookingPresentation } from "@/lib/bookingPresentation";
import { formatDurationDisplay } from "@/lib/formatDuration";
import { prisma } from "@/lib/prisma";
import { BookingStatusEnum } from "@/lib/types/booking";

type Props = {
  params: Promise<{ id?: string }>;
};

const statusLabels: Record<string, string> = {
  CONFIRMED: "Confirmada",
  PAYMENT_PENDING: "Pendiente de pago",
  CANCELLATION_REQUESTED: "Cancelacion en revision",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada"
};

const paidStatuses = new Set(["paid", "succeeded", "requires_capture"]);

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(value);

const isPaymentDue = (booking: { status: string; paymentStatus?: string | null; paymentMethod?: string | null }) => {
  if (booking.status === BookingStatusEnum.CANCELLED || booking.status === BookingStatusEnum.COMPLETED) return false;
  if (booking.status === BookingStatusEnum.PAYMENT_PENDING) return true;
  if (booking.paymentMethod === "PAY_LATER") return true;
  if (!booking.paymentStatus) return false;
  return !paidStatuses.has(booking.paymentStatus.toLowerCase());
};

const blockedCancellationStatuses = new Set<string>([
  BookingStatusEnum.CANCELLED,
  BookingStatusEnum.COMPLETED,
  BookingStatusEnum.CANCELLATION_REQUESTED
]);
const canRequestCancel = (status: string) => !blockedCancellationStatuses.has(status);

export default async function CustomerBookingDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/customer/reservas/${id}`)}`);
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      User: {
        include: {
          AgencyProfile: true,
          PartnerApplication: {
            orderBy: { updatedAt: "desc" },
            take: 1
          }
        }
      },
      AgencyProLink: {
        include: {
          AgencyUser: {
            include: {
              AgencyProfile: true,
              PartnerApplication: {
                orderBy: { updatedAt: "desc" },
                take: 1
              }
            }
          }
        }
      },
      AgencyTransferLink: {
        include: {
          AgencyUser: {
            include: {
              AgencyProfile: true,
              PartnerApplication: {
                orderBy: { updatedAt: "desc" },
                take: 1
              }
            }
          }
        }
      },
      Tour: {
        include: {
          SupplierProfile: true
        }
      },
      TourOption: true
    }
  });

  if (!booking || !booking.Tour) {
    notFound();
  }

  const ownsBooking =
    (session.user?.id && booking.userId === session.user.id) ||
    (session.user?.email && booking.customerEmail.toLowerCase() === session.user.email.toLowerCase());
  if (!ownsBooking) {
    notFound();
  }

  const agencyUser =
    booking.AgencyProLink?.AgencyUser ??
    booking.AgencyTransferLink?.AgencyUser ??
    (booking.source === "AGENCY" ? booking.User : null);
  const agencyApplication = agencyUser?.PartnerApplication?.[0] ?? null;
  const agencyLabel = agencyUser
    ? agencyUser.AgencyProfile?.companyName ?? agencyApplication?.companyName ?? agencyUser.name ?? "Agencia"
    : null;
  const agencyPhone = agencyApplication?.phone ?? null;
  const bookingTripType = (booking as any).tripType as string | null | undefined;
  const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
  const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
  const due = isPaymentDue(booking);
  const orderCode = booking.bookingCode ?? `#PR-${booking.id.slice(-4).toUpperCase()}`;
  const totalGuests = booking.paxAdults + booking.paxChildren;
  const presentation = buildBookingPresentation({
    flowType: booking.flowType,
    tripType: bookingTripType,
    originAirport: booking.originAirport,
    flightNumber: booking.flightNumber,
    hotel: booking.hotel,
    pickup: booking.pickup,
    pickupNotes: booking.pickupNotes,
    returnTravelDate: bookingReturnTravelDate,
    returnStartTime: bookingReturnStartTime,
    startTime: booking.startTime,
    travelDateValue: booking.travelDate,
    tourIncludes: booking.Tour.includes,
    language: booking.Tour.language,
    duration: booking.Tour.duration,
    meetingPoint: booking.Tour.meetingPoint
  });

  return (
    <section className="space-y-6">
      <Link href="/dashboard/customer" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      {due ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-950">Esta reserva tiene pago pendiente</p>
                <p className="mt-1 text-sm text-amber-800">
                  Completa el pago para confirmar el servicio y activar el e-ticket final.
                </p>
              </div>
            </div>
            <Link
              href={`/dashboard/customer/reservas/${booking.id}/pagar`}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
            >
              <CreditCard className="h-4 w-4" />
              Pagar ahora
            </Link>
          </div>
        </div>
      ) : null}

      <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <div className="relative min-h-[260px] bg-slate-100">
            <DynamicImage
              src={booking.Tour.heroImage ?? "/fototours/fototour.jpeg"}
              alt={booking.Tour.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="space-y-5 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">{orderCode}</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-950">{booking.Tour.title}</h1>
                <p className="mt-2 text-sm text-slate-500">
                  {formatDate(booking.travelDate)} - {booking.startTime ?? "Hora por confirmar"} - {booking.Tour.location}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${due ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                {statusLabels[booking.status] ?? booking.status}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <DetailMini label={due ? "Total pendiente" : "Total"} value={formatMoney(booking.totalAmount)} />
              <DetailMini label="Pasajeros" value={`${totalGuests} pax`} />
              <DetailMini label="Proveedor" value={booking.Tour.SupplierProfile?.company ?? "Proactivitis"} />
              <DetailMini label="Pago" value={booking.paymentStatus ?? (due ? "Pendiente" : "Confirmado")} />
            </div>

            <div className="flex flex-wrap gap-2">
              {!due && booking.status !== BookingStatusEnum.CANCELLED ? (
                <Link
                  href={`/api/bookings/${booking.id}/eticket`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
                >
                  <Download className="h-4 w-4" />
                  Descargar e-ticket
                </Link>
              ) : null}
              {booking.Tour.slug ? (
                <Link
                  href={`/tours/${booking.Tour.slug}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700"
                >
                  <FileText className="h-4 w-4" />
                  Ver tour
                </Link>
              ) : null}
              {booking.Tour.slug && booking.status === BookingStatusEnum.COMPLETED ? (
                <Link
                  href={`/tours/${booking.Tour.slug}#reviews`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-200 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700"
                >
                  Dejar resena
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoBox title="Cliente">
          <p className="font-semibold text-slate-950">{booking.customerName}</p>
          <p>{booking.customerEmail}</p>
          {booking.customerPhone ? <p>{booking.customerPhone}</p> : null}
        </InfoBox>
        <InfoBox title={presentation.primaryDetailsLabel}>
          <p>{presentation.primaryDetailsValue}</p>
          {presentation.kind === "activity" ? <p>{formatDurationDisplay(booking.Tour.duration)}</p> : null}
          {presentation.kind === "activity" ? <p>{booking.Tour.language}</p> : null}
        </InfoBox>
        <InfoBox title="Logistica">
          <p>{presentation.logisticsValue || "Operacion pendiente"}</p>
          {booking.originAirport ? <p>Origen: {booking.originAirport}</p> : null}
          {booking.flightNumber ? <p>Vuelo: {booking.flightNumber}</p> : null}
        </InfoBox>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoBox title="Pickup / hotel">
          <p>{booking.pickup ?? booking.hotel ?? booking.Tour.meetingPoint ?? "Por confirmar"}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4" />
            {presentation.routeValue}
          </p>
        </InfoBox>
        <InfoBox title="Agencia">
          <p>{agencyLabel ?? "Reserva directa"}</p>
          {agencyPhone ? <p>{agencyPhone}</p> : null}
        </InfoBox>
        <InfoBox title="Notas">
          <p>{booking.pickupNotes ?? "Sin instrucciones adicionales"}</p>
        </InfoBox>
      </div>

      {booking.status !== BookingStatusEnum.CANCELLED ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">E-ticket</p>
              <h2 className="text-xl font-semibold text-slate-950">Voucher digital</h2>
            </div>
            {due ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Se activa al completar el pago
              </span>
            ) : null}
          </div>
          <Eticket
            booking={{
              id: booking.id,
              travelDate: booking.travelDate,
              startTime: booking.startTime,
              flowType: booking.flowType,
              tripType: bookingTripType ?? undefined,
              paymentStatus: booking.paymentStatus,
              paymentMethod: booking.paymentMethod,
              returnTravelDate: bookingReturnTravelDate ?? undefined,
              returnStartTime: bookingReturnStartTime ?? undefined,
              totalAmount: booking.totalAmount,
              paxAdults: booking.paxAdults,
              paxChildren: booking.paxChildren,
              customerName: booking.customerName,
              customerEmail: booking.customerEmail,
              pickupNotes: booking.pickupNotes,
              hotel: booking.hotel,
              originAirport: booking.originAirport,
              flightNumber: booking.flightNumber,
              agencyName: agencyLabel,
              agencyPhone
            }}
            tour={{
              id: booking.Tour.id,
              slug: booking.Tour.slug,
              title: booking.Tour.title,
              heroImage: booking.Tour.heroImage,
              meetingPoint: booking.Tour.meetingPoint,
              meetingInstructions: booking.Tour.meetingInstructions,
              duration: booking.Tour.duration,
              language: booking.Tour.language
            }}
            supplierName={booking.Tour.SupplierProfile?.company ?? "Proactivitis"}
            orderCode={orderCode}
          />
        </section>
      ) : (
        <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
          <div className="flex gap-3">
            <XCircle className="h-5 w-5" />
            Esta reserva fue cancelada. El e-ticket ya no esta activo.
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Soporte web</p>
              <h2 className="text-lg font-semibold text-slate-950">Enviar mensaje sobre esta reserva</h2>
            </div>
          </div>
          <div className="mt-4">
            <CustomerSupportForm
              name={booking.customerName}
              email={booking.customerEmail}
              bookingCode={booking.bookingCode ?? booking.id}
              defaultTopic="Soporte de reserva"
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-600">Cancelacion</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">Solicitar cancelacion</h2>
          {canRequestCancel(booking.status) ? (
            <form action={customerRequestCancellation} className="mt-4 space-y-3">
              <input type="hidden" name="bookingId" value={booking.id} />
              <textarea
                name="reason"
                required
                minLength={8}
                rows={5}
                className="w-full rounded-2xl border border-rose-100 bg-rose-50/40 px-3 py-3 text-sm text-slate-900 outline-none focus:border-rose-300"
                placeholder="Explica el motivo de la cancelacion"
              />
              <button
                type="submit"
                className="rounded-2xl bg-rose-600 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Enviar solicitud
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              Estado actual: {statusLabels[booking.status] ?? booking.status}. No permite una nueva solicitud.
            </p>
          )}
        </div>
      </section>
    </section>
  );
}

function DetailMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{title}</p>
      <div className="mt-3 space-y-1">{children}</div>
    </article>
  );
}
