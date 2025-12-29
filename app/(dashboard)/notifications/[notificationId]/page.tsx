export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

export default function NotificationDetailRedirect(props: unknown) {
  const { params } = props as { params: { notificationId: string } };
  redirect(`/dashboard/notifications/${params.notificationId}`);
}
