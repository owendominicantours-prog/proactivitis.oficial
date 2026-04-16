import type { ReactNode } from "react";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";
import NotificationDropdown from "@/components/dashboard/NotificationDropdown";
import { Header } from "@/components/shared/Header";
import { SITE_CONFIG } from "@/lib/site-config";
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
  const isFunjet = SITE_CONFIG.variant === "funjet";
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
    <div className="flex items-center gap-3 sm:gap-6">
      <NotificationDropdown notifications={notifications} unreadCount={unreadCount} notificationLink={notificationLink} />
      <div className={`hidden items-center gap-3 sm:flex ${isFunjet ? "text-white/80" : "text-slate-600"}`}>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
            isFunjet ? "border border-white/20 bg-white/10 text-white" : "border border-slate-200 text-slate-600"
          }`}
        >
          {roleLabel}
        </span>
        {displayAccount && <span className={`text-xs ${isFunjet ? "text-white/65" : "text-slate-500"}`}>{displayAccount}</span>}
      </div>
      <DashboardUserMenu />
    </div>
  );

  if (isFunjet) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6f0ff_0%,#fcfbff_220px,#f8fafc_100%)] text-slate-900">
        <header className="border-b border-violet-100 bg-[linear-gradient(135deg,#5b1199_0%,#7e22ce_52%,#9333ea_100%)] text-white shadow-[0_16px_40px_rgba(91,17,153,0.20)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 shadow-[0_18px_38px_rgba(20,2,35,0.18)]">
                <img src={SITE_CONFIG.logoOnDarkSrc} alt={SITE_CONFIG.logoAlt} className="h-12 w-auto object-contain" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/65">Admin Funjet</p>
                <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
                <p className="text-sm text-white/80">{roleLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">{rightSlot}</div>
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-5 sm:px-6">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/20 bg-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white transition hover:border-[#FFC300] hover:bg-white/20 hover:text-[#FFC300]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="rounded-[32px] border border-violet-100 bg-white/92 p-5 shadow-[0_24px_70px_rgba(91,17,153,0.10)] backdrop-blur sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <Header navItems={navItems} rightSlot={rightSlot} navDisplay={navDisplay} />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:py-10">{children}</main>
    </div>
  );
};
