export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";

import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { authOptions } from "@/lib/auth";
import { getNotificationsForRecipient } from "@/lib/notificationService";

type SearchParams = {
  q?: string;
  state?: "all" | "read" | "unread";
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function SupplierNotificationsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const notifications = await getNotificationsForRecipient({ role: "SUPPLIER", userId, limit: 50 });
  const params = (searchParams ? await searchParams : undefined) ?? {};

  return (
    <NotificationCenter
      eyebrow="Alertas de proveedor"
      title="Centro de notificaciones"
      description="Controla reservas nuevas, cambios, cancelaciones y pagos desde una vista clara y accionable."
      centerHref="/supplier/notifications"
      relatedFallbackHref="/supplier/bookings"
      relatedFallbackLabel="Ver reservas"
      primaryActionHref="/supplier"
      primaryActionLabel="Volver al panel"
      notifications={notifications}
      query={params.q}
      state={params.state}
    />
  );
}
