import { prisma } from "@/lib/prisma";
import {
  defaultRentCarFleetSettings,
  normalizeRentCarFleetSettings,
  type RentCarFleetSettings
} from "@/data/rentCarFleet";

export const RENT_CAR_FLEET_SETTING_KEY = "RENT_CAR_FLEET";

export async function getRentCarFleetSettings(): Promise<RentCarFleetSettings> {
  try {
    const record = await prisma.siteContentSetting.findUnique({
      where: { key: RENT_CAR_FLEET_SETTING_KEY }
    });

    return normalizeRentCarFleetSettings(record?.content);
  } catch (error) {
    console.error("[RentCar] Could not load editable fleet settings", error);
    return defaultRentCarFleetSettings;
  }
}

export async function saveRentCarFleetSettings(settings: RentCarFleetSettings) {
  const content = normalizeRentCarFleetSettings(settings);

  await prisma.siteContentSetting.upsert({
    where: { key: RENT_CAR_FLEET_SETTING_KEY },
    update: { content },
    create: { key: RENT_CAR_FLEET_SETTING_KEY, content }
  });

  return content;
}
