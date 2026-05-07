import { ReactNode } from "react";

import { AdminConsoleShell, type AdminNavSection } from "@/components/admin/AdminConsoleShell";
import type { NotificationMenuItem } from "@/components/dashboard/notificationTypes";
import { requireAdminPage } from "@/lib/adminAccess";
import { getNotificationUnreadCount, getNotificationsForRecipient } from "@/lib/notificationService";

const adminNavSections: AdminNavSection[] = [
  {
    label: "Centro",
    items: [
      { label: "Dashboard", href: "/admin", description: "Vista general de la operacion" },
      { label: "Workplace", href: "/admin/workplace", description: "Empleados, roles y permisos" },
      { label: "Reservas", href: "/admin/bookings", description: "Control de reservas y clientes" },
      { label: "Calendario", href: "/admin/calendar", description: "Operaciones por fecha" },
      { label: "Alertas", href: "/admin/alerts", description: "Riesgos operativos activos" },
      { label: "Notificaciones", href: "/admin/notifications", description: "Centro de avisos" }
    ]
  },
  {
    label: "Productos",
    items: [
      { label: "Tours", href: "/admin/tours", description: "Moderacion y catalogo de tours" },
      { label: "Variantes", href: "/admin/tour-variants", description: "Variantes comerciales de tours" },
      { label: "Transfer", href: "/admin/transfers", description: "Rutas, zonas, vehiculos y tarifas" },
      { label: "Rent a car", href: "/admin/rent-a-car", description: "Flota, zonas y precios de renta" },
      { label: "Hoteles", href: "/admin/hoteles", description: "Alojamientos y contenido hotelero" },
      { label: "Resorts", href: "/admin/resorts", description: "Resorts y paginas de hoteles" },
      { label: "Hotel landings", href: "/admin/hotel-landings", description: "Landings de hoteles" },
      { label: "App recomendados", href: "/admin/app-recommendations", description: "Tours destacados en la app" }
    ]
  },
  {
    label: "Crecimiento",
    items: [
      { label: "Landings", href: "/admin/landings", description: "Paginas SEO y programaticas" },
      { label: "SEO Factory", href: "/admin/landings/seo-factory", description: "Generacion con IA" },
      { label: "Keyword Planner", href: "/admin/landings/keyword-planner", description: "Palabras clave importadas" },
      { label: "SEO Cleanup", href: "/admin/seo-cleanup", description: "URLs a limpiar o revisar" },
      { label: "SEO", href: "/admin/seo", description: "Herramientas tecnicas SEO" },
      { label: "Schema", href: "/admin/seo/schema", description: "Datos estructurados" },
      { label: "Blog", href: "/admin/blog", description: "Newsroom y articulos" }
    ]
  },
  {
    label: "Relaciones",
    items: [
      { label: "Suplidores", href: "/admin/suppliers", description: "Proveedores y productos" },
      { label: "Agencias", href: "/admin/agencies", description: "Agencias y aliados B2B" },
      { label: "Solicitudes", href: "/admin/partner-applications", description: "Aplicaciones pendientes" },
      { label: "Clientes de Honor", href: "/admin/honor-clients", description: "Clientes destacados" },
      { label: "Resenas", href: "/admin/reviews", description: "Moderacion de opiniones" },
      { label: "CRM", href: "/admin/crm", description: "Seguimiento comercial" },
      { label: "Chat", href: "/admin/chat", description: "Mensajeria con clientes" }
    ]
  },
  {
    label: "Sistema",
    items: [
      { label: "Finanzas", href: "/admin/finance", description: "Ingresos, pagos y exportaciones" },
      { label: "Reportes", href: "/admin/reports", description: "Analitica del negocio" },
      { label: "Paises", href: "/admin/countries", description: "Paises, ciudades y destinos" },
      { label: "Usuarios", href: "/admin/users", description: "Cuentas y roles web" },
      { label: "Ajustes", href: "/admin/settings", description: "Configuracion global" },
      { label: "IA Tools", href: "/admin/ai", description: "Herramientas internas de IA" },
      { label: "Developer/Logs", href: "/admin/logs", description: "Auditoria tecnica" }
    ]
  }
];

export const metadata = {
  title: "Admin OS Proactivitis"
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();

  const [notifications, unreadCount]: [NotificationMenuItem[], number] = await Promise.all([
    getNotificationsForRecipient({ role: "ADMIN", limit: 5 }),
    getNotificationUnreadCount({ role: "ADMIN" })
  ]);

  return (
    <AdminConsoleShell
      roleLabel="Administracion"
      title="Dashboard"
      navSections={adminNavSections}
      notifications={notifications}
      unreadCount={unreadCount}
      notificationLink="/admin/notifications"
      accountId={session?.user?.id ?? null}
    >
      {children}
    </AdminConsoleShell>
  );
}
