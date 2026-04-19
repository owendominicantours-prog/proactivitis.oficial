export const dynamic = "force-dynamic";

import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { getNotificationsForRecipient } from "@/lib/notificationService";

type SearchParams = {
  q?: string;
  state?: "all" | "read" | "unread";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminNotificationsPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const notifications = await getNotificationsForRecipient({ role: "ADMIN", limit: 300 });

  return (
    <NotificationCenter
      eyebrow="Control de alertas"
      title="Centro de notificaciones admin"
      description="Revisa alertas operativas, booking issues, pagos y notas internas sin salir del flujo del panel."
      centerHref="/admin/notifications"
      relatedFallbackHref="/admin/bookings"
      relatedFallbackLabel="Ver reservas"
      primaryActionHref="/admin/crm"
      primaryActionLabel="Abrir CRM"
      notifications={notifications}
      query={params.q}
      state={params.state}
    />
  );
}
