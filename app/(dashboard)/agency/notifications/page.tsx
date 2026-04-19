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

export default async function AgencyNotificationsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const notifications = await getNotificationsForRecipient({ role: "AGENCY", userId, limit: 50 });
  const params = (searchParams ? await searchParams : undefined) ?? {};

  return (
    <NotificationCenter
      eyebrow="AgencyPro alerts"
      title="Centro de notificaciones AgencyPro"
      description="Sigue reservas, promociones, cambios operativos y alertas comerciales desde una vista clara para móvil y desktop."
      centerHref="/agency/notifications"
      relatedFallbackHref="/agency/bookings"
      relatedFallbackLabel="Ver reservas"
      primaryActionHref="/agency"
      primaryActionLabel="Volver al workspace"
      notifications={notifications}
      query={params.q}
      state={params.state}
    />
  );
}
