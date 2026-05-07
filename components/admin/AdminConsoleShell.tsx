"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";

type AdminNavItem = {
  label: string;
  href: string;
  description?: string;
};

export type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

type AdminConsoleShellProps = {
  title: string;
  roleLabel: string;
  navSections: AdminNavSection[];
  children: ReactNode;
  notifications?: NotificationMenuItem[];
  unreadCount?: number;
  notificationLink?: string;
  accountId?: string | null;
};

const primaryShortcuts = [
  { label: "Nueva reserva", href: "/admin/bookings" },
  { label: "Revisar tours", href: "/admin/tours" },
  { label: "Soporte", href: "/workplace/support" }
];

export function AdminConsoleShell({
  title,
  roleLabel,
  navSections,
  children,
  notifications,
  unreadCount = 0,
  notificationLink,
  accountId
}: AdminConsoleShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const flatItems = useMemo(() => navSections.flatMap((section) => section.items), [navSections]);
  const activeItem = flatItems
    .filter((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];

  const shortAccount = accountId ? `A-${accountId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6)}` : "Admin";

  return (
    <div className="min-h-screen bg-[#eefafa] text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-[292px] border-r border-white/10 bg-[#07111f] text-white shadow-2xl lg:flex lg:flex-col">
        <AdminSidebar
          navSections={navSections}
          pathname={pathname}
          roleLabel={roleLabel}
          shortAccount={shortAccount}
        />
      </div>

      <div className="lg:pl-[292px]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden"
                aria-label="Abrir menu admin"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-slate-400">
                  {activeItem?.label ?? title}
                </p>
                <h1 className="mt-1 truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  {activeItem?.description ?? "Centro operativo Proactivitis"}
                </h1>
              </div>
            </div>

            <div className="hidden min-w-[260px] max-w-md flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 xl:flex">
              <Search className="mr-3 h-4 w-4 text-slate-400" />
              Busca por modulo, reserva, tour o cliente
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <NotificationDropdown notifications={notifications} unreadCount={unreadCount} notificationLink={notificationLink} />
              <DashboardUserMenu />
            </div>
          </div>

          <div className="hidden border-t border-slate-100 bg-white/80 px-8 py-3 lg:block">
            <div className="flex flex-wrap items-center gap-2">
              {primaryShortcuts.map((shortcut) => (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700 shadow-sm transition hover:border-sky-300 hover:text-sky-700"
                >
                  {shortcut.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu admin"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[min(88vw,330px)] bg-[#07111f] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200">Admin</p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <AdminSidebar
              navSections={navSections}
              pathname={pathname}
              roleLabel={roleLabel}
              shortAccount={shortAccount}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminSidebar({
  navSections,
  pathname,
  roleLabel,
  shortAccount,
  onNavigate
}: {
  navSections: AdminNavSection[];
  pathname: string | null;
  roleLabel: string;
  shortAccount: string;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-cyan-950/30">
            <Image src="/icon.png" alt="Proactivitis" width={44} height={44} className="h-11 w-11 object-cover" />
          </span>
          <span>
            <span className="block text-sm font-black uppercase tracking-[0.18em]">Proactivitis</span>
            <span className="block text-[10px] font-black uppercase tracking-[0.34em] text-cyan-300">Admin OS</span>
          </span>
        </Link>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Sesion</p>
          <p className="mt-1 text-sm font-bold text-white">{roleLabel}</p>
          <p className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
            {shortAccount}
          </p>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-5">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-cyan-400/15 text-cyan-100 ring-1 ring-cyan-300/20"
                        : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 truncate">{item.label}</span>
                    <span className={`h-2 w-2 rounded-full ${active ? "bg-cyan-300" : "bg-white/10 group-hover:bg-white/30"}`} />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
