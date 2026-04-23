"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { deleteNotificationAction, markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { getNotificationDisplayProps, type NotificationType } from "@/lib/types/notificationTypes";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";
import {
  buildNotificationDetails,
  formatNotificationDate,
  notificationGroupLabel
} from "@/components/dashboard/notificationUtils";

type NotificationDropdownProps = {
  notifications?: NotificationMenuItem[];
  unreadCount: number;
  notificationLink?: string;
};

const GROUP_ORDER = ["Hoy", "Ayer", "Esta semana", "Anterior"];

export default function NotificationDropdown({
  notifications,
  unreadCount,
  notificationLink
}: NotificationDropdownProps) {
  const effectiveNotificationLink = notificationLink ?? "/dashboard/notifications";
  const [isOpen, setIsOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);
  const [hasMarked, setHasMarked] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || hasMarked) return;
    let canceled = false;
    fetch("/api/notifications/mark-as-seen", { method: "POST" })
      .then(() => {
        if (!canceled) {
          setLocalUnreadCount(0);
        }
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => {
        if (!canceled) {
          setHasMarked(true);
        }
      });
    return () => {
      canceled = true;
    };
  }, [isOpen, hasMarked]);

  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    setHasMarked(false);
  }, [notifications]);

  const groupedNotifications = useMemo(() => {
    return (notifications ?? []).reduce<Record<string, NotificationMenuItem[]>>((acc, next) => {
      const label = notificationGroupLabel(new Date(next.createdAt));
      if (!acc[label]) acc[label] = [];
      acc[label].push(next);
      return acc;
    }, {});
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  if (!notificationLink) return null;

  return (
    <div ref={containerRef} className="relative focus-within:outline-none" tabIndex={0}>
      <button
        type="button"
        onClick={toggleOpen}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
      >
        Notificaciones
        {localUnreadCount ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {localUnreadCount}
          </span>
        ) : null}
      </button>
      <div
        className={`absolute left-1/2 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white shadow-lg transition duration-150 sm:left-auto sm:right-0 sm:w-96 sm:min-w-[20rem] sm:translate-x-0 ${
          isOpen ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="max-h-[min(32rem,70vh)] space-y-4 overflow-y-auto p-4">
          {(notifications ?? []).length ? (
            GROUP_ORDER.map((groupLabel) => {
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
                      const redirectUrl = `/dashboard/notifications/${notification.id}`;
                      const notificationType = notification.type as NotificationType | undefined;
                      const display = getNotificationDisplayProps(notificationType);
                      const details = buildNotificationDetails(notification, metadata?.tourName);
                      return (
                        <div
                          key={notification.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 transition hover:border-slate-300 hover:bg-white"
                        >
                          <div className="flex items-start gap-2 p-2">
                            <form action={markNotificationReadAction} className="min-w-0 flex-1">
                              <input type="hidden" name="notificationId" value={notification.id} />
                              <input type="hidden" name="redirectTo" value={redirectUrl} />
                              <button type="submit" className="w-full rounded-2xl p-2 text-left" onClick={() => setIsOpen(false)}>
                                <div className="flex items-center gap-3">
                                  <div className="relative">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                                      {display.icon}
                                    </span>
                                    {!notification.isRead && (
                                      <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-sky-500" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                                        {notification.title ?? display.label}
                                        <span
                                          className={`text-[0.55rem] uppercase tracking-[0.35em] ${display.textClass} opacity-80`}
                                        >
                                          {display.label}
                                        </span>
                                      </p>
                                      <span className="text-[0.6rem] text-slate-400">
                                        {formatNotificationDate(notification.createdAt)}
                                      </span>
                                    </div>
                                    {details && <p className="mt-1 text-xs text-slate-500">{details}</p>}
                                  </div>
                                </div>
                              </button>
                            </form>
                            <form action={deleteNotificationAction} className="shrink-0">
                              <input type="hidden" name="notificationId" value={notification.id} />
                              <input type="hidden" name="returnTo" value={effectiveNotificationLink} />
                              <button
                                type="submit"
                                aria-label="Borrar notificación"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </form>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-lg text-slate-400">*</span>
                <p>No tienes notificaciones nuevas.</p>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-4 py-4 text-right text-xs">
          <Link
            href={effectiveNotificationLink}
            className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-slate-900 px-4 py-1 text-white transition hover:bg-slate-800"
          >
            Ver todas
          </Link>
        </div>
      </div>
    </div>
  );
}

