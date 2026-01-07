"use server";

import { revalidatePath } from "next/cache";
import { getDynamicTransferLandingCombos } from "@/lib/transfer-landing-utils";

export async function refreshTransferLandingsAction() {
  const combos = await getDynamicTransferLandingCombos();
  combos.forEach((combo) => {
    revalidatePath(`/transfer/${combo.landingSlug}`);
    combo.aliasSlugs.forEach((aliasSlug) => {
      revalidatePath(`/transfer/${aliasSlug}`);
    });
  });
  revalidatePath("/sitemap-transfers.xml");
  revalidatePath("/sitemap-things-to-do.xml");
  return combos.map((combo) => combo.landingSlug);
}
