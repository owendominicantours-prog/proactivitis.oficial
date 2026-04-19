export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { authOptions } from "@/lib/auth";
import { buildBookingDetailRoute } from "@/lib/bookingRoutes";
import { buildNotificationDetails, formatNotificationDate } from "@/components/dashboard/notificationUtils";
import {
  getNotificationForRecipient,
  parseNotificationMetadata
} from "@/lib/notificationService";
import { prisma } from "@/lib/prisma";
import {
  getNotificationDisplayProps,
  NotificationRole,
  type NotificationType
} from "@/lib/types/notificationTypes";

const formatLongDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(value);

const flattenMetadata = (metadata: Record<string, unknown>) =>
  Object.entries(metadata)
    .map(([key, value]) => ({ key, value }))
    .filter((entry) => entry.value !== null && entry.value !== undefined && String(entry.value).trim() !== "");

const buildNotificationCenterRoute = (role?: string | null) => {
  const normalizedRole = (role ?? "").toUpperCase();
  if (normalizedRole === "ADMIN") return "/admin/notifications";
  if (normalizedRole === "SUPPLIER") return "/supplier/notifications";
  if (normalizedRole === "AGENCY") return "/agency/notifications";
  if (normalizedRole === "CUSTOMER") return "/customer/notifications";
  return "/";
};

export default async function NotificationDetailPage(props: unknown) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  const { params } = props as { params: { notificationId: string } };
  const notification = await getNotificationForRecipient(params.notificationId, {
    role: session.user.role as NotificationRole | undefined,
    userId: session.user.id
  });

  if (!notification) {
    notFound();
  }

  const metadata = parseNotificationMetadata(notification.metadata);
  const display = getNotificationDisplayProps(notification.type as NotificationType | undefined);
  const notificationCenterRoute = buildNotificationCenterRoute(session.user.role);
  const referenceUrl = metadata.referenceUrl ?? notificationCenterRoute;
  const bookingId = metadata.bookingId ?? notification.bookingId ?? null;
  const bookingRoute = buildBookingDetailRoute({
    bookingId,
    metadataRole: metadata.role ?? notification.role,
    fallback: referenceUrl
  });

  const booking = bookingId
    ? await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { Tour: true }
      })
    : null;

  const metadataEntries = flattenMetadata(metadata);
  const detailText = buildNotificationDetails(notification, metadata.tourName);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">Detalle de notificación</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{notification.title ?? display.label}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {detailText ?? "Revisa el contexto de la alerta y desde aquí abre la reserva o la ruta relacionada sin perder el hilo."}
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">{display.label}</p>
            <p className="text-lg font-semibold">{notification.isRead ? "Leída" : "Pendiente"}</p>
            <p className="text-slate-300">{formatLongDate(notification.createdAt)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg">
              {display.icon}
            </span>
            <div className="min-w-0 flex-1">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${display.badgeClass}`}
              >
                {display.label}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{notification.message ?? notification.body ?? "Sin mensaje adicional."}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={referenceUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Abrir relacionado
            </Link>
            <Link
              href={notificationCenterRoute}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Volver al centro
            </Link>
            {!notification.isRead ? (
              <form action={markNotificationReadAction} method="post">
                <input type="hidden" name="notificationId" value={notification.id} />
                <input type="hidden" name="redirectTo" value={`/dashboard/notifications/${notification.id}`} />
                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100 sm:w-auto"
                >
                  Marcar como leída
                </button>
              </form>
            ) : (
              <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                Ya leída
              </span>
            )}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Resumen rápido</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{notification.isRead ? "Leída" : "Pendiente"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Fecha</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{formatNotificationDate(notification.createdAt)}</p>
            </div>
          </div>

          {booking ? (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Reserva relacionada</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{booking.Tour?.title ?? "Servicio sin título"}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Cliente:</span> {booking.customerName}</p>
                <p><span className="font-semibold text-slate-900">Código:</span> {booking.bookingCode ?? booking.id}</p>
                <p><span className="font-semibold text-slate-900">Total:</span> ${booking.totalAmount.toFixed(2)}</p>
              </div>
              <Link
                href={bookingRoute}
                className="mt-4 inline-flex min-h-10 items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-400 hover:bg-white"
              >
                Ver reserva completa
              </Link>
            </div>
          ) : null}

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Metadata</p>
            {metadataEntries.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {metadataEntries.map((entry) => (
                  <div key={entry.key} className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{entry.key}</p>
                    <p className="mt-1 break-words font-medium text-slate-900">{String(entry.value)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No hay datos extra para esta alerta.</p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
