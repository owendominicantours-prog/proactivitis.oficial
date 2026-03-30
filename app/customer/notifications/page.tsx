export const dynamic = "force-dynamic";

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { getNotificationDisplayProps, type NotificationType } from "@/lib/types/notificationTypes";
import { getNotificationsForRecipient, parseNotificationMetadata } from "@/lib/notificationService";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

export default async function CustomerNotificationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!session?.user?.email || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">Debes iniciar sesión</p>
          <p className="mt-2 text-sm text-slate-600">Accede para ver tus notificaciones.</p>
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

  const notifications = await getNotificationsForRecipient({ role: "CUSTOMER", userId, limit: 100 });

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notificaciones</p>
              <h1 className="text-2xl font-semibold text-slate-900">Actualizaciones de tus reservas</h1>
            </div>
            <Link
              href="/customer/reservations"
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
            >
              Ver reservas
            </Link>
          </div>
          <p className="text-sm text-slate-500">
            Aquí verás confirmaciones, cambios de estado y avisos importantes de tus servicios.
          </p>
        </section>

        <section className="space-y-4">
          {notifications.length ? (
            notifications.map((notification) => {
              const metadata = parseNotificationMetadata(notification.metadata);
              const redirectUrl =
                metadata.referenceUrl ??
                (metadata.bookingId ?? notification.bookingId
                  ? `/customer/reservations/${metadata.bookingId ?? notification.bookingId}`
                  : "/customer/reservations");
              const notificationType = notification.type as NotificationType | undefined;
              const display = getNotificationDisplayProps(notificationType);
              const message = notification.message ?? notification.body ?? "";

              return (
                <article key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{display.icon}</span>
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${display.badgeClass}`}
                        >
                          {display.label}
                        </span>
                        <h2 className="mt-2 text-lg font-semibold text-slate-900">{notification.title}</h2>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{message}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <Link
                      href={`/dashboard/notifications/${notification.id}`}
                      className="font-semibold text-slate-900 hover:underline"
                    >
                      Ver detalle
                    </Link>
                    <Link href={redirectUrl} className="font-semibold text-sky-600 hover:underline">
                      Abrir reserva
                    </Link>
                    {!notification.isRead ? (
                      <form action={markNotificationReadAction} method="post" className="flex items-center gap-2">
                        <input type="hidden" name="notificationId" value={notification.id} />
                        <input type="hidden" name="redirectTo" value={redirectUrl} />
                        <button
                          type="submit"
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                        >
                          Marcar como leída
                        </button>
                      </form>
                    ) : (
                      <span className="text-emerald-600">Leída</span>
                    )}
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              No tienes notificaciones nuevas.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
