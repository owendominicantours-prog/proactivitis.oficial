"use server";

import { revalidatePath } from "next/cache";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";

export async function refreshTransferLandingsAction() {
  const combos = await getDynamicTransferLandingCombos();
  combos.forEach((combo) => {
    revalidatePath(`/transfer/${combo.landingSlug}`);
  });
  revalidatePath("/sitemap-transfers.xml");
  return combos.map((combo) => combo.landingSlug);
}
