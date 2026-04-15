"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { getNotificationDisplayProps, type NotificationType } from "@/lib/types/notificationTypes";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";
import { SITE_CONFIG } from "@/lib/site-config";
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
  const isFunjet = SITE_CONFIG.variant === "funjet";
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
        className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
          isFunjet
            ? "border border-white/15 bg-white/8 text-white hover:border-white/25 hover:bg-white/12"
            : "border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        Notificaciones
        {localUnreadCount ? (
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
              isFunjet ? "bg-[#FFC300] text-[#4c0685]" : "bg-emerald-500 text-white"
            }`}
          >
            {localUnreadCount}
          </span>
        ) : null}
      </button>
      <div
        className={`absolute right-0 z-50 mt-2 w-96 min-w-[20rem] transition duration-150 ${
          isFunjet
            ? "rounded-3xl border border-white/10 bg-[#4c0685] text-white shadow-[0_22px_50px_rgba(20,2,35,0.28)]"
            : "rounded-lg border border-slate-200 bg-white shadow-lg"
        } ${
          isOpen ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div className="space-y-4 p-4">
          {(notifications ?? []).length ? (
            GROUP_ORDER.map((groupLabel) => {
              const items = groupedNotifications[groupLabel];
              if (!items?.length) return null;
              return (
                <div key={groupLabel} className="space-y-2">
                  <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.35em] ${isFunjet ? "text-white/50" : "text-slate-400"}`}>
                    {groupLabel}
                  </p>
                  <div className="space-y-2">
                    {items.map((notification) => {
                      const metadata = parseNotificationMetadata(notification.metadata);
                      const redirectUrl = metadata.referenceUrl ?? effectiveNotificationLink;
                      const notificationType = notification.type as NotificationType | undefined;
                      const display = getNotificationDisplayProps(notificationType);
                      const details = buildNotificationDetails(notification, metadata?.tourName);
                      return (
                        <form
                          key={notification.id}
                          action={markNotificationReadAction}
                          className={`rounded-2xl transition ${
                            isFunjet
                              ? "border border-white/8 bg-white/6 hover:border-white/20 hover:bg-white/10"
                              : "border border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white"
                          }`}
                        >
                          <input type="hidden" name="notificationId" value={notification.id} />
                          <input type="hidden" name="redirectTo" value={redirectUrl} />
                          <button type="submit" className="w-full p-3 text-left" onClick={() => setIsOpen(false)}>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <span
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
                                    isFunjet ? "border border-white/10 bg-white/10" : "border border-slate-200 bg-white"
                                  }`}
                                >
                                  {display.icon}
                                </span>
                                {!notification.isRead && (
                                  <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-sky-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    {notification.title ?? display.label}
                                    <span className={`text-[0.55rem] uppercase tracking-[0.35em] ${display.textClass} opacity-80`}>
                                      {display.label}
                                    </span>
                                  </p>
                                  <span className={`text-[0.6rem] ${isFunjet ? "text-white/45" : "text-slate-400"}`}>
                                    {formatNotificationDate(notification.createdAt)}
                                  </span>
                                </div>
                                {details && <p className={`text-xs ${isFunjet ? "text-white/65" : "text-slate-500"}`}>{details}</p>}
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
            <div
              className={`rounded-lg p-4 text-sm ${
                isFunjet
                  ? "border border-dashed border-white/15 bg-white/6 text-white/70"
                  : "border border-dashed border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg ${isFunjet ? "text-white/40" : "text-slate-400"}`}>*</span>
                <p>No tienes notificaciones nuevas.</p>
              </div>
            </div>
          )}
        </div>
        <div className={`px-4 py-4 text-right text-xs ${isFunjet ? "border-t border-white/10" : "border-t border-slate-100"}`}>
          <Link
            href={effectiveNotificationLink}
            className={`rounded-full px-4 py-1 transition ${
              isFunjet
                ? "border border-[#FFC300] bg-[#FFC300] text-[#4c0685] hover:brightness-95"
                : "border border-slate-200 bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            Ver todas
          </Link>
        </div>
      </div>
    </div>
  );
}
