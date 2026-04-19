import type { ReactNode } from "react";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import { Header } from "@/components/shared/Header";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";
export type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";

export type PanelNavItem = {
  label: string;
  href: string;
};

type PanelShellProps = {
  title: string;
  roleLabel: string;
  navItems: PanelNavItem[];
  navDisplay?: "inline" | "dropdown";
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
  navDisplay,
  children,
  notifications,
  unreadCount = 0,
  notificationLink,
  accountId
}: PanelShellProps) => {
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

  const rightSlot = (
    <div className="flex w-full flex-wrap items-center justify-end gap-3 sm:w-auto sm:flex-nowrap sm:gap-4 lg:gap-6">
      <NotificationDropdown notifications={notifications} unreadCount={unreadCount} notificationLink={notificationLink} />
      <div className="hidden items-center gap-3 text-slate-600 md:flex">
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
          {roleLabel}
        </span>
        {displayAccount && <span className="text-xs text-slate-500">{displayAccount}</span>}
      </div>
      <DashboardUserMenu />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Header navItems={navItems} rightSlot={rightSlot} navDisplay={navDisplay} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 md:hidden">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">{roleLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          </div>
          {displayAccount ? (
            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
              {displayAccount}
            </span>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
};
