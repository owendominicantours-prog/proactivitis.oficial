"use client";

import { FocusEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
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
  if (!notificationLink) return null;
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

  const groupedNotifications = useMemo(() => {
    return (notifications ?? []).reduce<Record<string, NotificationMenuItem[]>>((acc, next) => {
      const label = notificationGroupLabel(new Date(next.createdAt));
      if (!acc[label]) acc[label] = [];
      acc[label].push(next);
      return acc;
    }, {});
  }, [notifications]);

  const handleFocus = () => setIsOpen(true);
  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (containerRef.current && event.relatedTarget && containerRef.current.contains(event.relatedTarget as Node)) {
      return;
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative focus-within:outline-none"
      tabIndex={0}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
      >
        Notificaciones
        {localUnreadCount ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            {localUnreadCount}
          </span>
        ) : null}
      </button>
      <div
        className={`absolute right-0 z-50 mt-2 w-96 min-w-[20rem] rounded-lg border border-slate-200 bg-white shadow-lg transition duration-150 ${
          isOpen ? "visible opacity-100 pointer-events-auto" : "invisible opacity-0 pointer-events-none"
        }`}
      >
        <div className="space-y-4 p-4">
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
                      const redirectUrl = metadata.referenceUrl ?? notificationLink;
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
                <span className="text-lg text-slate-400">’'?ถซ</span>
                <p>No tienes notificaciones nuevas.</p>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-4 py-4 text-right text-xs">
          <Link
            href={notificationLink}
            className="rounded-full border border-slate-200 bg-slate-900 px-4 py-1 text-white transition hover:bg-slate-800"
          >
            Ver todas
          </Link>
        </div>
      </div>
    </div>
  );
}
