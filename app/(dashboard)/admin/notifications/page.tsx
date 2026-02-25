export const dynamic = "force-dynamic"; // Notifications must be live.

import Link from "next/link";
import { getNotificationsForRecipient, parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/admin/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import type { NotificationType } from "@/lib/types/notificationTypes";

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);

type SearchParams = {
  q?: string;
  state?: "all" | "read" | "unread";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();
  const state = params.state ?? "all";

  const notifications = await getNotificationsForRecipient({ role: "ADMIN", limit: 300 });
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;

  let filtered = notifications;
  if (state !== "all") {
    const mustBeRead = state === "read";
    filtered = filtered.filter((notification) => notification.isRead === mustBeRead);
  }
  if (query) {
    filtered = filtered.filter((notification) =>
      [notification.title, notification.message, notification.body]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Notificaciones</p>
            <h1 className="text-2xl font-semibold text-slate-900">Centro de notificaciones</h1>
          </div>
          <Link href="/admin/bookings" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300">
            Ver reservas
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          Gestiona alertas del equipo, aplica filtros y marca como leidas sin salir del panel.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Total</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{notifications.length}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">No leidas</p>
          <p className="mt-2 text-3xl font-semibold text-amber-900">{unreadCount}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Leidas</p>
          <p className="mt-2 text-3xl font-semibold text-emerald-900">{readCount}</p>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-4">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Titulo o mensaje"
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-sm text-slate-600">
            Estado
            <select
              name="state"
              defaultValue={state}
              className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <option value="all">Todas</option>
              <option value="unread">No leidas</option>
              <option value="read">Leidas</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Filtrar
            </button>
            <Link
              href="/admin/notifications"
              className="w-full rounded-xl border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:border-slate-500"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {filtered.length ? (
          filtered.map((notification) => {
            const metadata = parseNotificationMetadata(notification.metadata);
            const redirectUrl = metadata.referenceUrl ?? "/admin/bookings";
            const notificationType = notification.type as NotificationType | undefined;
            const display = getNotificationDisplayProps(notificationType);
            const message = notification.message ?? notification.body ?? "";
            return (
              <article key={notification.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
                  <Link href={`/dashboard/notifications/${notification.id}`} className="font-semibold text-slate-900 hover:underline">
                    Ver detalles completos
                  </Link>
                  <Link href={redirectUrl} className="font-semibold text-sky-600 hover:underline">
                    Ver reserva relacionada
                  </Link>
                  {!notification.isRead ? (
                    <form action={markNotificationReadAction} method="post" className="flex items-center gap-2">
                      <input type="hidden" name="notificationId" value={notification.id} />
                      <input type="hidden" name="redirectTo" value={redirectUrl} />
                      <button
                        type="submit"
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                      >
                        Marcar como leida
                      </button>
                    </form>
                  ) : (
                    <span className="text-emerald-600">Leida</span>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No hay notificaciones para este filtro.
          </div>
        )}
      </section>
    </div>
  );
}
