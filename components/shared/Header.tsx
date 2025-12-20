import Link from "next/link";
import Image from "next/image";
import { Notification } from "@prisma/client";
import { ReactNode } from "react";
import { parseNotificationMetadata } from "@/lib/notificationService";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";
import { getNotificationDisplayProps } from "@/lib/types/notificationTypes";
import type { NotificationType } from "@/lib/types/notificationTypes";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";

export type HeaderNotification = Pick<
  Notification,
  "id" | "title" | "message" | "body" | "metadata" | "createdAt" | "isRead" | "type"
>;

type HeaderProps = {
  navItems: { label: string; href: string }[];
  notifications?: HeaderNotification[];
  unreadCount?: number;
  notificationLink?: string;
  roleLabel: string;
  displayAccount?: string | null;
};

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

export const Header = ({
  navItems,
  notifications,
  unreadCount = 0,
  notificationLink,
  roleLabel,
  displayAccount
}: HeaderProps) => {
  const groupOrder = ["Hoy", "Ayer", "Esta semana", "Anterior"];

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6">
        
        {/* LOGO FIXED */}
        <Link href="/" className="flex items-center">
          <div className="relative h-16 w-[220px]">
            <Image
              src="/logo.png"
              alt="Proactivitis"
              fill
              priority
              sizes="220px"
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* NAV */}
        <div className="flex items-center gap-8 text-sm text-slate-700">
          <div className="flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 transition hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {notificationLink ? (
              <Link
                href={notificationLink}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-50"
              >
                Notificaciones
                {unreadCount ? (
                  <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            ) : null}
          </div>

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
  );
};
