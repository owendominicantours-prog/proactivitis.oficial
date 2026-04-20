"use server";

import type { ReactNode } from "react";
import Link from "next/link";
import { CalendarDays, ChevronDown } from "lucide-react";
import { getServerSession } from "next-auth";

import Eticket from "@/components/booking/Eticket";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PROACTIVITIS_WHATSAPP_LINK } from "@/lib/seo";
const statusMessages: Record<string, string> = {
  CONFIRMED: "Confirmada",
  CANCELLATION_REQUESTED: "Cancelación solicitada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
  PAYMENT_PENDING: "Pago pendiente",
  PENDING: "Pendiente"
};

export default async function CustomerPublicReservationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="travel-surface flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesión</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver tus reservas recientes.</p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white"
          >
            Ir al login
          </Link>
        </div>
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ customerEmail: session.user.email }, { userId: session.user.id ?? undefined }]
    },
    include: {
      Tour: {
        include: {
          SupplierProfile: true
        }
      },
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
      }
    },
    orderBy: { travelDate: "asc" }
  });

  const whatsappBase = process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? `${PROACTIVITIS_WHATSAPP_LINK}?text=Hola%20Proactivitis`;
  const buildWhatsappLink = (message: string) => {
    const hasQuery = whatsappBase.includes("?");
    const hasText = whatsappBase.includes("text=");
    if (hasText) {
      return `${whatsappBase}%0A${encodeURIComponent(message)}`;
    }
    return `${whatsappBase}${hasQuery ? "&" : "?"}text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="travel-surface min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-900">Mis reservas</h1>
          <p className="text-sm text-slate-500">Consulta tus servicios confirmados y gestiona cambios desde un solo lugar.</p>
        </header>

        <section className="space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              Aún no tienes reservas. Explora los tours disponibles y únete a una experiencia.
            </div>
          ) : null}

          {bookings.map((booking) => {
            const agencyUser = booking.AgencyProLink?.AgencyUser ?? (booking.source === "AGENCY" ? booking.User : null);
            const agencyApplication = agencyUser?.PartnerApplication?.[0] ?? null;
            const agencyName =
              agencyUser
                ? agencyUser.AgencyProfile?.companyName ?? agencyApplication?.companyName ?? agencyUser.name ?? "Agencia"
                : null;
            const agencyPhone = agencyApplication?.phone ?? null;
            const bookingTripType = (booking as any).tripType as string | null | undefined;
            const bookingReturnTravelDate = (booking as any).returnTravelDate as Date | null | undefined;
            const bookingReturnStartTime = (booking as any).returnStartTime as string | null | undefined;
            const isRoundTripTransfer = booking.flowType === "transfer" && bookingTripType === "round-trip";
            const totalPassengers = booking.paxAdults + booking.paxChildren;
            const headerDate = booking.travelDate.toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric"
            });
            const sentDate = booking.createdAt.toLocaleString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            const subtitle =
              booking.flowType === "transfer"
                ? `${booking.originAirport ?? "Origen pendiente"} / ${booking.hotel ?? booking.pickup ?? "Destino pendiente"}${
                    booking.startTime ? ` · ${booking.startTime}` : ""
                  }`
                : `${booking.Tour?.title ?? "Servicio"} ${booking.startTime ?? ""}`.trim();

            return (
              <article key={booking.id} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      <span>{headerDate}</span>
                    </div>
                    <span className="rounded bg-teal-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                      {statusMessages[booking.status] ?? booking.status}
                    </span>
                  </div>

                  <div className="mt-4 max-w-4xl">
                    <h2 className="text-3xl font-semibold leading-tight text-slate-950">{booking.Tour?.title ?? "Servicio"}</h2>
                    <p className="mt-3 text-[1.02rem] text-slate-500">{subtitle}</p>
                  </div>

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <p className="text-[1rem] text-slate-700">
                          <span className="font-semibold text-slate-950">Viajero principal:</span> {booking.customerName ?? "Pendiente"}
                        </p>
                        <p className="text-lg text-slate-700">
                          {totalPassengers} {totalPassengers === 1 ? "adulto" : "adultos"}
                        </p>
                      </div>

                      <div className="space-y-2 md:text-right">
                        <p className="text-[1.05rem] font-semibold text-slate-950">{booking.bookingCode ?? booking.id}</p>
                        <p className="text-lg text-slate-700">Enviada {sentDate}</p>
                      </div>
                    </div>

                    <details className="group mt-5">
                      <summary className="flex cursor-pointer list-none items-center gap-2 text-lg font-medium text-teal-700">
                        <span className="group-open:hidden">Mostrar detalles</span>
                        <span className="hidden group-open:inline">Ocultar detalles</span>
                        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                      </summary>

                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className="grid gap-8 md:grid-cols-2">
                          <div className="space-y-6">
                            <DetailGroup title="Datos de tu reserva">
                              <InfoLine label="Correo" value={booking.customerEmail} />
                              <InfoLine label="Total" value={`$${booking.totalAmount.toFixed(2)}`} />
                              <InfoLine
                                label={isRoundTripTransfer ? "Pickup ida" : "Pickup"}
                                value={booking.pickup ?? booking.originAirport ?? booking.hotel ?? "Por confirmar"}
                              />
                              {isRoundTripTransfer ? (
                                <InfoLine label="Pickup regreso" value={booking.hotel ?? "Por confirmar"} />
                              ) : null}
                              <InfoLine
                                label="Fecha ida"
                                value={`${booking.travelDate.toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric"
                                })}${booking.startTime ? ` · ${booking.startTime}` : ""}`}
                              />
                              <InfoLine
                                label="Agencia"
                                value={agencyName ? `${agencyName}${agencyPhone ? ` · ${agencyPhone}` : ""}` : "Reserva directa"}
                              />
                              <InfoLine
                                label="Códigos internos"
                                value={`${booking.bookingCode ?? booking.id} · ${booking.id.slice(0, 8).toUpperCase()}`}
                              />
                            </DetailGroup>

                            <DetailGroup title="Servicio">
                              <InfoLine
                                label="Servicios incluidos"
                                value={booking.Tour?.includes ?? booking.pickupNotes ?? "Servicio confirmado y coordinado con el operador"}
                              />
                              {isRoundTripTransfer ? (
                                <InfoLine
                                  label="Fecha de regreso"
                                  value={`${bookingReturnTravelDate ? bookingReturnTravelDate.toLocaleDateString("es-ES", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric"
                                  }) : "Pendiente"}${bookingReturnStartTime ? ` · ${bookingReturnStartTime}` : ""}`}
                                />
                              ) : null}
                            </DetailGroup>
                          </div>

                          <div className="space-y-6">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <Eticket
                                variant="compact"
                                booking={{
                                  id: booking.id,
                                  travelDate: booking.travelDate,
                                  startTime: booking.startTime,
                                  flowType: booking.flowType,
                                  tripType: bookingTripType ?? undefined,
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
                                  agencyName,
                                  agencyPhone
                                }}
                                tour={{
                                  id: booking.Tour?.id ?? "",
                                  slug: booking.Tour?.slug ?? "",
                                  title: booking.Tour?.title ?? "Tour",
                                  heroImage: booking.Tour?.heroImage,
                                  meetingPoint: booking.Tour?.meetingPoint,
                                  meetingInstructions: booking.Tour?.meetingInstructions,
                                  duration: booking.Tour?.duration
                                }}
                                supplierName={booking.Tour?.SupplierProfile?.company ?? booking.Tour?.SupplierProfile?.userId ?? undefined}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a
                      href={buildWhatsappLink(`Hola, necesito ayuda con la reserva ${booking.bookingCode ?? booking.id}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-slate-200 px-4 py-3 text-slate-700 transition hover:bg-slate-50"
                    >
                      Enviar mensaje
                    </a>
                    <a
                      href={buildWhatsappLink(`Quiero cambiar el punto de encuentro de la reserva ${booking.bookingCode ?? booking.id}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-emerald-200 px-4 py-3 text-emerald-700 transition hover:bg-emerald-50"
                    >
                      Cambiar pickup
                    </a>
                    <a
                      href={buildWhatsappLink(`Quiero solicitar la cancelación de la reserva ${booking.bookingCode ?? booking.id}.`)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-rose-200 px-4 py-3 text-rose-700 transition hover:bg-rose-50"
                    >
                      Cancelar
                    </a>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <Link href={`/tours/${booking.Tour?.slug ?? ""}`} className="rounded border border-slate-200 px-4 py-3 text-slate-700 transition hover:bg-slate-50">
                      Ver tour
                    </Link>
                    {booking.Tour?.slug ? (
                      <Link
                        href={`/tours/${booking.Tour.slug}#reviews`}
                        className="rounded border border-indigo-200 px-4 py-3 text-indigo-600 transition hover:bg-indigo-50"
                      >
                        Dejar reseña
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold uppercase tracking-[0.03em] text-slate-700">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[1rem] leading-7 text-slate-700">
      <span className="font-semibold text-slate-950">{label}:</span> {value}
    </p>
  );
}
