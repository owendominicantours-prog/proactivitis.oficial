export const dynamic = "force-dynamic"; // Booking detail must reflect live cancellations or updates.

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { notFound } from "next/navigation";
import { DynamicImage } from "@/components/shared/DynamicImage";
import type { BookingStatus } from "@/lib/types/booking";
import { buildBookingPresentation } from "@/lib/bookingPresentation";

export default async function CustomerBookingDetailPage({ params }: { params: Promise<{ id?: string }> }) {
  const resolved = await params;
  if (!resolved?.id) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.email && !session?.user?.id) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm text-center text-sm text-slate-600">
        Inicia sesiÃ³n para ver el detalle de tu reserva.
      </div>
    );
  }

  const booking = await prisma.booking.findUnique({
    where: { id: resolved.id },
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
      Tour: {
        include: {
          SupplierProfile: true
        }
      }
    }
  });

  if (!booking) {
    notFound();
  }

  const isOwner =
    booking.customerEmail === session.user?.email || (session.user?.id && booking.userId === session.user.id);
  if (!isOwner) {
    notFound();
  }

  const travelDate = booking.travelDate.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const travelTime = booking.travelDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const agencyUser = booking.AgencyProLink?.AgencyUser ?? (booking.source === "AGENCY" ? booking.User : null);
  const agencyApplication = agencyUser?.PartnerApplication?.[0] ?? null;
  const agencyLabel =
    agencyUser
      ? agencyUser.AgencyProfile?.companyName ?? agencyApplication?.companyName ?? agencyUser.name ?? "Agencia"
      : null;
  const agencyPhone = agencyApplication?.phone ?? null;
  const bookingTripType = (booking as any).tripType as string | null | undefined;
  const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
  const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
  const returnDateLabel = bookingReturnTravelDate
    ? bookingReturnTravelDate.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    : null;
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
    tourIncludes: booking.Tour?.includes,
    language: booking.Tour?.language,
    duration: booking.Tour?.duration,
    meetingPoint: booking.Tour?.meetingPoint
  });

  const statusMessages: Record<string, string> = {
    CONFIRMED: "Tu reserva estÃ¡ confirmada.",
    CANCELLATION_REQUESTED: "Estamos revisando la cancelaciÃ³n solicitada.",
    CANCELLED: "La reserva fue cancelada.",
    COMPLETED: "Tu experiencia ya fue completada."
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Reserva {booking.id.slice(0, 8).toUpperCase()}</h1>
        <p className="text-sm text-slate-500">Todo lo que necesitas para tu tour estÃ¡ aquÃ­.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 lg:w-1/3">
            <DynamicImage
              src={booking.Tour?.heroImage ?? "/fototours/fototour.jpeg"}
              alt={booking.Tour?.title ?? "Tour"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-slate-900">{booking.Tour?.title ?? "Tour"}</h2>
              <BookingStatusBadge status={booking.status as BookingStatus} />
            </div>
            <p className="text-xs text-slate-500">{statusMessages[booking.status] ?? ""}</p>
            <p className="text-sm text-slate-500">
              {travelDate} Â· {travelTime} Â· {booking.Tour?.location}
            </p>
            <p className="text-sm text-slate-500">
              Proveedor: {booking.Tour?.SupplierProfile?.company ?? "No asignado"}
            </p>
            <p className="text-sm text-slate-500">Pax: {booking.paxAdults + booking.paxChildren}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`#ticket`}
                className="inline-flex items-center rounded-md bg-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white"
              >
                Ver ticket
              </Link>
              <button className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-700">
                Contactar soporte
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total pagado</p>
            <p className="text-xl font-semibold text-slate-900">${booking.totalAmount.toFixed(2)}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel / pickup</p>
            <p className="text-sm text-slate-700">{booking.hotel ?? "No aplica"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">InformaciÃ³n del cliente</p>
          <p className="text-base font-semibold text-slate-900">{booking.customerName}</p>
          <p>{booking.customerEmail}</p>
          {booking.customerPhone && <p>{booking.customerPhone}</p>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.primaryDetailsLabel}</p>
          <p className="text-sm text-slate-700">{presentation.primaryDetailsValue}</p>
          {presentation.kind === "activity" && <p className="text-sm text-slate-700">{booking.Tour?.duration}</p>}
          {presentation.kind === "activity" && <p className="text-sm text-slate-700">{booking.Tour?.language}</p>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Notas de recogida</p>
          <p>{booking.pickupNotes ?? "Sin instrucciones adicionales"}</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.logisticsLabel}</p>
          <p className="text-sm text-slate-700">{presentation.logisticsValue || "Operación pendiente"}</p>
          {booking.transferVehicleName && (
            <p className="text-sm text-slate-700">
              Vehículo: {booking.transferVehicleName}
              {booking.transferVehicleCategory ? ` · ${booking.transferVehicleCategory}` : ""}
            </p>
          )}
          {presentation.kind === "transfer" && <p className="text-sm text-slate-700">Origen: {booking.originAirport ?? "Pendiente"}</p>}
          {presentation.kind === "transfer" && <p className="text-sm text-slate-700">Vuelo: {booking.flightNumber ?? "Pendiente"}</p>}
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Regreso</p>
          <p className="text-sm text-slate-700">{returnDateLabel ?? "No aplica"}</p>
          <p className="text-sm text-slate-700">{bookingReturnStartTime ?? "Hora no registrada"}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Agencia</p>
          <p className="text-sm text-slate-700">{agencyLabel ?? "Reserva directa"}</p>
          <p className="text-sm text-slate-700">{agencyPhone ?? "Sin telÃƒÂ©fono registrado"}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Resumen operativo</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Pasajero principal</p>
            <p className="text-sm font-semibold text-slate-900">{booking.customerName}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fecha de ida</p>
            <p className="text-sm font-semibold text-slate-900">{travelDate}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Fecha de regreso</p>
            <p className="text-sm font-semibold text-slate-900">{returnDateLabel ?? "No aplica"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.routeLabel}</p>
            <p className="text-sm font-semibold text-slate-900">{presentation.routeValue}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Agencia</p>
            <p className="text-sm font-semibold text-slate-900">{agencyLabel ?? "Reserva directa"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CÃ³digos internos</p>
            <p className="text-sm font-semibold text-slate-900">{`${booking.bookingCode ?? booking.id} Â· ${booking.id.slice(0, 8).toUpperCase()}`}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{presentation.notesLabel}</p>
            <p className="text-sm font-semibold text-slate-900">{presentation.notesValue}</p>
          </div>
        </div>
      </div>

      <div id="ticket" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Voucher digital</h3>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-100 py-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">CÃ³digo</p>
          <p className="text-xl font-semibold text-slate-900">{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <p>Presenta este cÃ³digo y muestra tu confirmaciÃ³n al proveedor o guÃ­a.</p>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          QR en construcciÃ³n Â· lo tendrÃ¡s en la prÃ³xima versiÃ³n
        </div>
      </div>
    </section>
  );
}

