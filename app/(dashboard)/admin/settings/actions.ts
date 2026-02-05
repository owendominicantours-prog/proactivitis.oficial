"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { normalizeRecipients, notificationEmailDefaults, type NotificationEmailKey } from "@/lib/notificationEmailSettings";

const allowedKeys = new Set<NotificationEmailKey>(notificationEmailDefaults.map((entry) => entry.key));

export async function updateNotificationEmailSettingAction(formData: FormData) {
  const key = String(formData.get("key") ?? "").trim() as NotificationEmailKey;
  const recipientsRaw = String(formData.get("recipients") ?? "");

  if (!allowedKeys.has(key)) {
    throw new Error("Tipo de notificaci\u00f3n no v\u00e1lido.");
  }

  const config = notificationEmailDefaults.find((entry) => entry.key === key);
  if (!config) {
    throw new Error("Configuraci\u00f3n no encontrada.");
  }

  const recipients = normalizeRecipients(recipientsRaw);

  await prisma.notificationEmailSetting.upsert({
    where: { key },
    update: {
      label: config.label,
      description: config.description,
      recipients
    },
    create: {
      key,
      label: config.label,
      description: config.description,
      recipients
    }
  });

  revalidatePath("/admin/settings");
}
