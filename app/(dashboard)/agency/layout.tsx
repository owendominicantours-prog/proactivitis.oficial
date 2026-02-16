import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { PanelShell, type NotificationMenuItem } from "@/components/dashboard/PanelShell";
import { authOptions } from "@/lib/auth";
import { getNotificationUnreadCount, getNotificationsForRecipient } from "@/lib/notificationService";
import { SupportTicketButton } from "@/components/dashboard/SupportTicketButton";

const agencyNav = [
  { label: "Dashboard", href: "/agency" },
  { label: "Tours / Catalogo", href: "/agency/tours" },
  { label: "Reservas", href: "/agency/bookings" },
  { label: "Calendario", href: "/agency/calendar" },
  { label: "Comisiones", href: "/agency/commissions" },
  { label: "Reportes", href: "/agency/reports" },
  { label: "Sub-agentes", href: "/agency/subagents" },
  { label: "Mini-sitio", href: "/agency/minisite" },
  { label: "Promocodes", href: "/agency/promocodes" },
  { label: "Chat", href: "/agency/chat" },
  { label: "Notificaciones", href: "/agency/notifications" },
  { label: "Perfil", href: "/agency/profile" }
];

export const metadata = {
  title: "Agency | Proactivitis"
};

export default async function AgencyDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const isAgency = session?.user?.role === "AGENCY";
  let notifications: NotificationMenuItem[] = [];
  let unreadCount = 0;

  if (isAgency) {
    const userId = session?.user?.id;
    const [items, count] = await Promise.all([
      getNotificationsForRecipient({ role: "AGENCY", userId, limit: 5 }),
      getNotificationUnreadCount({ role: "AGENCY", userId })
    ]);
    notifications = items;
    unreadCount = count;
  }

  return (
    <>
      <PanelShell
        roleLabel="Agency"
        title="Panel Agency"
        navItems={agencyNav}
        notifications={notifications}
        unreadCount={unreadCount}
        notificationLink="/agency/notifications"
        accountId={session?.user?.id ?? null}
      >
        {children}
      </PanelShell>
      <SupportTicketButton name={session?.user?.name ?? null} email={session?.user?.email ?? null} roleLabel="Agencia" />
    </>
  );
}
