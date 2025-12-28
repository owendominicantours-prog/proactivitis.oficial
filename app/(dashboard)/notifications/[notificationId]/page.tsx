export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(value);

const flattenMetadata = (metadata: Record<string, unknown>) =>
  Object.entries(metadata)
    .map(([key, value]) => ({ key, value }))
    .filter((entry) => entry.value !== null && entry.value !== undefined && String(entry.value).trim() !== "");

export default async function NotificationDetailPage(props: unknown) {
  const { params } = props as { params: { notificationId: string } };
  const notification = await prisma.notification.findUnique({
    where: { id: params.notificationId }
  });
  if (!notification) {
    notFound();
  }

  const metadata = parseNotificationMetadata(notification.metadata);
  const display = getNotificationDisplayProps(notification.type as any);
  const referenceUrl = metadata.referenceUrl ?? "/dashboard";
  const bookingId = metadata.bookingId ?? notification.bookingId ?? null;
  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Tour: true }
      })
    : null;

  return (
    <div className="space-y-6">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Vista detallada</p>
            <h1 className="text-2xl font-semibold text-slate-900">{display.label}</h1>
          </div>
          <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-500">Detalles completos de la alerta y rutas para revisar el booking.</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{display.icon}</span>
          <div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${display.badgeClass}`}>
              {display.label}
            </span>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">{notification.title}</h2>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">{notification.message ?? notification.body}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {booking ? (
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Booking relacionado</p>
              <p className="font-semibold text-slate-900">{booking.Tour?.title ?? "Tour sin título"}</p>
              <p>Cliente: {booking.customerName}</p>
              <p className="text-xs text-slate-500">Código: {booking.bookingCode}</p>
              <p className="text-xs text-slate-500">Total: ${booking.totalAmount.toFixed(2)}</p>
              <Link href={`/dashboard/bookings/${booking.id}`} className="mt-3 inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-sky-600 hover:text-sky-800">
                Ver booking completo
              </Link>
            </div>
          ) : null}
          <div className="space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Metadata</p>
            {flattenMetadata(metadata).length ? (
              <ul className="space-y-1">
                {flattenMetadata(metadata).map((entry) => (
                  <li key={entry.key}>
                    <span className="font-semibold text-slate-900">{entry.key}:</span> {String(entry.value)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">No hay datos extra.</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href={referenceUrl} className="font-semibold text-sky-600 hover:underline">
            Abrir ruta relacionada
          </Link>
          {!notification.isRead ? (
            <form action={markNotificationReadAction} method="post" className="flex items-center gap-2 text-xs">
              <input type="hidden" name="notificationId" value={notification.id} />
              <input type="hidden" name="redirectTo" value={referenceUrl} />
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
              >
                Marcar como leída y abrir
              </button>
            </form>
          ) : (
            <span className="text-emerald-500">Ya leída</span>
          )}
        </div>
      </section>
    </div>
  );
}
