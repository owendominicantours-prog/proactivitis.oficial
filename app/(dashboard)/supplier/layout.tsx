import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { PanelShell, type NotificationMenuItem } from "@/components/dashboard/PanelShell";
import { authOptions } from "@/lib/auth";
import { getNotificationUnreadCount, getNotificationsForRecipient } from "@/lib/notificationService";
import { SupportTicketButton } from "@/components/dashboard/SupportTicketButton";

const supplierNav = [
  { label: "Panel principal", href: "/supplier" },
  { label: "Mis tours", href: "/supplier/tours" },
  { label: "Crear tour", href: "/supplier/tours/create" },
  { label: "Reservas", href: "/supplier/bookings" },
  { label: "Calendario", href: "/supplier/calendar" },
  { label: "Finanzas", href: "/supplier/finance" },
  { label: "Pagos", href: "/supplier/payouts" },
  { label: "Ofertas", href: "/supplier/offers" },
  { label: "Mini sitios", href: "/supplier/minisites" },
  { label: "Notificaciones", href: "/supplier/notifications" },
  { label: "Perfil", href: "/supplier/profile" }
];

export const metadata = {
  title: "Supplier · Proactivitis"
};

export default async function SupplierDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const isSupplier = session?.user?.role === "SUPPLIER";
  let notifications: NotificationMenuItem[] = [];
  let unreadCount = 0;

  if (isSupplier) {
    const [items, count] = await Promise.all([
      getNotificationsForRecipient({ role: "SUPPLIER", limit: 5 }),
      getNotificationUnreadCount({ role: "SUPPLIER" })
    ]);
    notifications = items;
    unreadCount = count;
  }

  return (
    <>
      <PanelShell
        roleLabel="Proveedor"
        title="Panel Proveedor"
        navItems={supplierNav}
        navDisplay="dropdown"
        notifications={notifications}
        unreadCount={unreadCount}
        notificationLink="/supplier/notifications"
        accountId={session?.user?.id ?? null}
      >
        {children}
      </PanelShell>
      <SupportTicketButton name={session?.user?.name ?? null} email={session?.user?.email ?? null} roleLabel="Proveedor" />
    </>
  );
}
