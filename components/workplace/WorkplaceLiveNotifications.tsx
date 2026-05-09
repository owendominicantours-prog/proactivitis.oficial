"use client";

import Link from "next/link";
import useSWR from "swr";
import { AtSign, Bell } from "lucide-react";

import type { WorkplaceNotificationSummary } from "@/lib/workplaceNotifications";

type NotificationsResponse = {
  notifications: WorkplaceNotificationSummary;
};

type BadgeKind = "chat" | "support" | "prodiscovery";

const fetchNotifications = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudieron cargar las notificaciones.");
  }
  return (await response.json()) as NotificationsResponse;
};

const formatBadge = (value: number) => (value > 99 ? "99+" : String(value));

function useWorkplaceNotifications(initial: WorkplaceNotificationSummary) {
  const { data } = useSWR<NotificationsResponse>("/api/workplace/notifications", fetchNotifications, {
    fallbackData: { notifications: initial },
    refreshInterval: 5000,
    revalidateOnFocus: true
  });

  return data?.notifications ?? initial;
}

export function WorkplaceNavNotificationBadge({
  kind,
  initial
}: {
  kind: BadgeKind;
  initial: WorkplaceNotificationSummary;
}) {
  const notifications = useWorkplaceNotifications(initial);
  const value =
    kind === "chat" ? notifications.mentions : kind === "support" ? notifications.support : notifications.proDiscovery;

  if (!value) return null;

  return (
    <span className="rounded-full bg-cyan-300 px-2 py-0.5 text-[10px] font-black text-slate-950">
      {formatBadge(value)}
    </span>
  );
}

export function WorkplaceHeaderNotifications({ initial }: { initial: WorkplaceNotificationSummary }) {
  const notifications = useWorkplaceNotifications(initial);

  return (
    <>
      <Link
        href={notifications.primaryHref}
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10"
        aria-label="Notificaciones workplace"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {notifications.total ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950">
            {formatBadge(notifications.total)}
          </span>
        ) : null}
      </Link>
      {notifications.mentions ? (
        <Link
          href="/workplace/chat"
          className="hidden items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 sm:inline-flex"
        >
          <AtSign className="h-4 w-4" aria-hidden />
          {notifications.mentions} menciones
        </Link>
      ) : null}
    </>
  );
}
