import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { PanelShell, NotificationMenuItem } from "@/components/dashboard/PanelShell";
import { authOptions } from "@/lib/auth";
import { getNotificationUnreadCount, getNotificationsForRecipient } from "@/lib/notificationService";

const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Landings", href: "/admin/landings" },
  { label: "Resorts", href: "/admin/resorts" },
  { label: "Variantes", href: "/admin/tour-variants" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Resenas", href: "/admin/reviews" },
  { label: "Tours", href: "/admin/tours" },
  { label: "Transfer", href: "/admin/transfers" },
  { label: "Suplidores", href: "/admin/suppliers" },
  { label: "Agencias", href: "/admin/agencies" },
  { label: "Reservas", href: "/admin/bookings" },
  { label: "Finanzas", href: "/admin/finance" },
  { label: "Reportes", href: "/admin/reports" },
  { label: "Solicitudes", href: "/admin/partner-applications" },
  { label: "CRM", href: "/admin/crm" },
  { label: "Paises", href: "/admin/countries" },
  { label: "Usuarios", href: "/admin/users" },
  { label: "Ajustes", href: "/admin/settings" },
  { label: "Notificaciones", href: "/admin/notifications" }
];

export const metadata = {
  title: "Admin Space Proactivitis"
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  let notifications: NotificationMenuItem[] = [];
  let unreadCount = 0;

  if (isAdmin) {
    const [fetched, count] = await Promise.all([
      getNotificationsForRecipient({ role: "ADMIN", limit: 5 }),
      getNotificationUnreadCount({ role: "ADMIN" })
    ]);
    notifications = fetched;
    unreadCount = count;
  }

  return (
    <PanelShell
      roleLabel="Administracion"
      title="Dashboard"
      navItems={adminNav}
      navDisplay="dropdown"
      notifications={notifications}
      unreadCount={unreadCount}
      notificationLink={isAdmin ? "/admin/notifications" : undefined}
      accountId={session?.user?.id ?? null}
    >
      {children}
    </PanelShell>
  );
}
