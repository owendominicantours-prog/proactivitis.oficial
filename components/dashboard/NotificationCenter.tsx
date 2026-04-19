import Link from "next/link";

import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { buildNotificationDetails, formatNotificationDate, notificationGroupLabel } from "@/components/dashboard/notificationUtils";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { getNotificationDisplayProps, type NotificationType } from "@/lib/types/notificationTypes";

type NotificationCenterItem = NotificationMenuItem & {
  role?: string | null;
};

type NotificationFilterState = "all" | "read" | "unread";

type NotificationCenterProps = {
  eyebrow: string;
  title: string;
  description: string;
  centerHref: string;
  relatedFallbackHref: string;
  relatedFallbackLabel: string;
  primaryActionHref: string;
  primaryActionLabel: string;
  notifications: NotificationCenterItem[];
  query?: string;
  state?: NotificationFilterState;
};

const STAT_CARD_STYLES = [
  "border-slate-200 bg-white text-slate-900",
  "border-amber-200 bg-amber-50 text-amber-950",
  "border-emerald-200 bg-emerald-50 text-emerald-950"
];

export function NotificationCenter({
  eyebrow,
  title,
  description,
  centerHref,
  relatedFallbackHref,
  relatedFallbackLabel,
  primaryActionHref,
  primaryActionLabel,
  notifications,
  query = "",
  state = "all"
}: NotificationCenterProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const filteredByState =
    state === "all"
      ? notifications
      : notifications.filter((notification) => notification.isRead === (state === "read"));

  const filtered = normalizedQuery
    ? filteredByState.filter((notification) =>
        [notification.title, notification.message, notification.body]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedQuery))
      )
    : filteredByState;

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const readCount = notifications.length - unreadCount;

  const grouped = filtered.reduce<Record<string, NotificationCenterItem[]>>((acc, notification) => {
    const group = notificationGroupLabel(new Date(notification.createdAt));
    acc[group] = acc[group] ?? [];
    acc[group].push(notification);
    return acc;
  }, {});

  const groupOrder = ["Hoy", "Ayer", "Esta semana", "Anterior"];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a,#1e293b)] px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-200">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">{description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={primaryActionHref}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              {primaryActionLabel}
            </Link>
            <Link
              href={relatedFallbackHref}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
            >
              {relatedFallbackLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Total", value: notifications.length, helper: "Alertas registradas en tu panel" },
          { label: "Pendientes", value: unreadCount, helper: "Requieren revisión o lectura" },
          { label: "Leídas", value: readCount, helper: "Ya procesadas por tu cuenta" }
        ].map((item, index) => (
          <article key={item.label} className={`rounded-3xl border p-5 shadow-sm ${STAT_CARD_STYLES[index]}`}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-70">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            <p className="mt-2 text-sm opacity-80">{item.helper}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-[1.4fr,1fr,auto,auto]" method="get">
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Buscar</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Título, mensaje o contexto"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
            />
          </label>
          <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Estado</span>
            <select
              name="state"
              defaultValue={state}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            >
              <option value="all">Todas</option>
              <option value="unread">Pendientes</option>
              <option value="read">Leídas</option>
            </select>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Filtrar
            </button>
          </div>
          <div className="flex items-end">
            <Link
              href={centerHref}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Limpiar
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-5">
        {filtered.length ? (
          groupOrder.map((groupLabel) => {
            const items = grouped[groupLabel];
            if (!items?.length) return null;

            return (
              <div key={groupLabel} className="space-y-3">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-400">{groupLabel}</p>
                <div className="space-y-3">
                  {items.map((notification) => {
                    const metadata = parseNotificationMetadata(notification.metadata);
                    const notificationType = notification.type as NotificationType | undefined;
                    const display = getNotificationDisplayProps(notificationType);
                    const details = buildNotificationDetails(notification, metadata.tourName);
                    const detailHref = `/dashboard/notifications/${notification.id}`;
                    const relatedHref = metadata.referenceUrl ?? relatedFallbackHref;
                    const metaPills = [metadata.tourName, metadata.status, notification.bookingId ? `Booking ${notification.bookingId.slice(0, 8)}` : null]
                      .filter(Boolean)
                      .slice(0, 3);

                    return (
                      <article
                        key={notification.id}
                        className={`rounded-3xl border bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md ${
                          notification.isRead ? "border-slate-200" : "border-sky-200 ring-1 ring-sky-100"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="relative">
                              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg">
                                {display.icon}
                              </span>
                              {!notification.isRead ? (
                                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sky-500" />
                              ) : null}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                  <span
                                    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ${display.badgeClass}`}
                                  >
                                    {display.label}
                                  </span>
                                  <h2 className="text-lg font-semibold leading-tight text-slate-900">
                                    {notification.title ?? display.label}
                                  </h2>
                                </div>
                                <div className="text-xs text-slate-400">{formatNotificationDate(notification.createdAt)}</div>
                              </div>

                              {details ? <p className="mt-3 text-sm leading-relaxed text-slate-600">{details}</p> : null}

                              {metaPills.length ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {metaPills.map((pill) => (
                                    <span
                                      key={pill}
                                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
                                    >
                                      {pill}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[220px]">
                            <Link
                              href={detailHref}
                              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              Abrir notificación
                            </Link>
                            <Link
                              href={relatedHref}
                              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              Abrir relacionado
                            </Link>
                            {!notification.isRead ? (
                              <form action={markNotificationReadAction} method="post">
                                <input type="hidden" name="notificationId" value={notification.id} />
                                <input type="hidden" name="redirectTo" value={centerHref} />
                                <button
                                  type="submit"
                                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:border-sky-300 hover:bg-sky-100"
                                >
                                  Marcar como leída
                                </button>
                              </form>
                            ) : (
                              <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                Leída
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-slate-900">No hay notificaciones para este filtro.</p>
            <p className="mt-2 text-sm text-slate-500">
              Cambia la búsqueda, limpia filtros o vuelve más tarde para revisar nuevas alertas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
