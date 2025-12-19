import Link from "next/link";
import Image from "next/image";
import { Notification } from "@prisma/client";
import { ReactNode } from "react";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import type { NotificationType } from "@/lib/types/notificationTypes";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import { NavMenu } from "@/components/dashboard/NavMenu";

export type PanelNavItem = {
  label: string;
  href: string;
};

export type NotificationMenuItem = Pick<
  Notification,
  "id" | "title" | "message" | "body" | "metadata" | "caseNumber" | "createdAt" | "isRead" | "type"
>;

const formatNotificationDate = (value: Date) =>
  new Intl.DateTimeFormat("es-ES", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(value);

const notificationGroupLabel = (value: Date) => {
  const diff = Date.now() - value.getTime();
  const day = 1000 * 60 * 60 * 24;
  if (diff < day) return "Hoy";
  if (diff < 2 * day) return "Ayer";
  if (diff < 7 * day) return "Esta semana";
  return "Anterior";
};

const sanitizeNotificationText = (value: string) =>
  value
    .replace(/\u0416\u042C/g, "\u00B7")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\w0-9\u00B7.,:;!?()\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const buildNotificationDetails = (notification: NotificationMenuItem, metadataLabel?: string) => {
  const raw = notification.message ?? notification.body ?? metadataLabel ?? "";
  const clean = sanitizeNotificationText(raw);
  return clean.length > 0 ? clean : undefined;
};

type PanelShellProps = {
  title: string;
  roleLabel: string;
  navItems: PanelNavItem[];
  children: ReactNode;
  notifications?: NotificationMenuItem[];
  unreadCount?: number;
  notificationLink?: string;
  accountId?: string | null;
};

export const PanelShell = ({
  title,
  roleLabel,
  navItems,
  children,
  notifications,
  unreadCount = 0,
  notificationLink,
  accountId
}: PanelShellProps) => {
  const hasNotifications = Boolean(notifications && notifications.length);
  const fallbackLink = notificationLink ?? "#";
  const groupOrder = ["Hoy", "Ayer", "Esta semana", "Anterior"];
  const groupedNotifications = (notifications ?? []).reduce<Record<string, NotificationMenuItem[]>>((acc, next) => {
    const label = notificationGroupLabel(new Date(next.createdAt));
    if (!acc[label]) acc[label] = [];
    acc[label].push(next);
    return acc;
  }, {});

  const formatAccount = () => {
    if (!accountId) return null;
    const clean = accountId.replace(/[^a-zA-Z0-9]/g, "");
    const short = clean.slice(0, 5) || clean;
    const label = roleLabel.toLowerCase();
    let prefix = "ID-";
    if (label.includes("proveedor") || label.includes("supplier")) prefix = "S-";
    else if (label.includes("agency") || label.includes("agencia")) prefix = "A-";
    else if (label.includes("customer") || label.includes("cliente")) prefix = "C-";
    else if (label.includes("afiliador") || label.includes("affiliate")) prefix = "AF-";
    return `${prefix}${short}`;
  };

  const displayAccount = formatAccount();

  const buildBookingDetailRoute = (bookingId: string | undefined, metadataRole: string | undefined, fallback: string) => {
    if (!bookingId) return fallback;
    const role = (metadataRole ?? "").toString().toUpperCase();
    if (role.includes("ADMIN")) return `/admin/bookings?bookingId=${bookingId}`;
    if (role.includes("SUPPLIER")) return `/supplier/bookings?bookingId=${bookingId}`;
    if (role.includes("AGENCY")) return `/agency/bookings?bookingId=${bookingId}`;
    if (role.includes("CUSTOMER")) return `/booking/confirmed?bookingId=${bookingId}`;
    return `/booking/confirmed?bookingId=${bookingId}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Proactivitis"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
              />
            </Link>
            <NavMenu navItems={navItems} />
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            {notificationLink ? (
              <div className="relative group focus-within:outline-none" tabIndex={0}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 transition hover:border-slate-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-slate-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.084-1.795-5-4.5-5S9 7.916 9 11v3.159c0 .538-.214 1.055-.595 1.436L7 17h5m0 0a3 3 0 1 0 6 0h-6z"
                    />
                  </svg>
                  {unreadCount ? (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[0.65rem] font-semibold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>
                <div className="pointer-events-auto invisible absolute right-0 z-50 mt-2 w-96 min-w-[20rem] rounded-lg border border-slate-200 bg-white opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="space-y-4 p-4">
                    {hasNotifications ? (
                      groupOrder.map((groupLabel) => {
                        const items = groupedNotifications[groupLabel];
                        if (!items?.length) return null;
                        return (
                          <div key={groupLabel} className="space-y-2">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-400">
                              {groupLabel}
                            </p>
                            <div className="space-y-2">
                              {items.map((notification) => {
                                const metadata = parseNotificationMetadata(notification.metadata);
                                const redirectUrl = metadata.referenceUrl ?? fallbackLink;
                                const notificationType = notification.type as NotificationType | undefined;
                                const display = getNotificationDisplayProps(notificationType);
                                const details = buildNotificationDetails(notification, metadata?.tourName);
                                return (
                                  <form
                                    key={notification.id}
                                    action={markNotificationReadAction}
                                    className="rounded-2xl border border-slate-100 bg-slate-50 transition hover:border-slate-300 hover:bg-white"
                                  >
                                    <input type="hidden" name="notificationId" value={notification.id} />
                                    <input type="hidden" name="redirectTo" value={redirectUrl} />
                                    <button type="submit" className="w-full text-left p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="relative">
                                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                                            {display.icon}
                                          </span>
                                          {!notification.isRead && (
                                            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-sky-500" />
                                          )}
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                              {notification.title ?? display.label}
                                              <span className={`text-[0.55rem] uppercase tracking-[0.35em] ${display.textClass} opacity-80`}>
                                                {display.label}
                                              </span>
                                            </p>
                                            <span className="text-[0.6rem] text-slate-400">{formatNotificationDate(notification.createdAt)}</span>
                                          </div>
                                          {details && <p className="text-xs text-slate-500">{details}</p>}
                                        </div>
                                        <span className="text-slate-400">→</span>
                                      </div>
                                    </button>
                                  </form>
                                );
                              })}

                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="text-lg text-slate-400">â€¢</span>
                          <p>No tienes notificaciones nuevas.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-100 px-4 py-4 text-right text-xs">
                    <Link
                      href={fallbackLink}
                      className="rounded-full border border-slate-200 bg-slate-900 px-4 py-1 text-white transition hover:bg-slate-800"
                    >
                      Ver todas
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <button className="rounded-md border border-slate-200 px-4 py-1.5 font-semibold text-slate-600 transition hover:border-slate-300">
                Notificaciones
              </button>
            )}
            <div className="flex items-center gap-3 text-slate-600">
              <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
                {roleLabel}
              </span>
              {displayAccount && <span className="text-xs text-slate-500">{displayAccount}</span>}
            </div>
            <DashboardUserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
