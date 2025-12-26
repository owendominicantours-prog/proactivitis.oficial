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
    <div className="flex items-center gap-6">
      <NotificationDropdown notifications={notifications} unreadCount={unreadCount} notificationLink={notificationLink} />
      <div className="flex items-center gap-3 text-slate-600">
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em]">
          {roleLabel}
        </span>
        {displayAccount && <span className="text-xs text-slate-500">{displayAccount}</span>}
      </div>
      <DashboardUserMenu />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header navItems={navItems} rightSlot={rightSlot} navDisplay={navDisplay} />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
