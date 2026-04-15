import { SITE_CONFIG } from "@/lib/site-config";

export type SiteBrandValue = "PROACTIVITIS" | "FUNJET";

export const getCurrentSiteBrand = (): SiteBrandValue =>
  SITE_CONFIG.variant === "funjet" ? "FUNJET" : "PROACTIVITIS";

