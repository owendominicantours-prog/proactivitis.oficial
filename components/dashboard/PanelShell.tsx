import { ReactNode } from "react";
import { Header, HeaderNotification } from "@/components/shared/Header";

export type PanelNavItem = {
  label: string;
  href: string;
};

type PanelShellProps = {
  title: string;
  roleLabel: string;
  navItems: PanelNavItem[];
  children: ReactNode;
  notifications?: HeaderNotification[];
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

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Header
        navItems={navItems}
        notifications={notifications}
        unreadCount={unreadCount}
        notificationLink={notificationLink}
        roleLabel={roleLabel}
        displayAccount={displayAccount}
      />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
};
