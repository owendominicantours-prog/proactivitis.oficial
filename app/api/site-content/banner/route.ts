import { NextRequest, NextResponse } from "next/server";
import { getGlobalBannerOverrides } from "@/lib/siteContent";
import type { Locale } from "@/lib/translations";

const isLocale = (value: string): value is Locale => ["es", "en", "fr"].includes(value);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const localeParam = searchParams.get("locale") ?? "es";
  const locale = isLocale(localeParam) ? localeParam : "es";
  const banner = await getGlobalBannerOverrides(locale);

  return NextResponse.json({
    enabled: Boolean(banner.enabled),
    message: banner.message ?? "",
    link: banner.link ?? "",
    linkLabel: banner.linkLabel ?? "",
    tone: banner.tone ?? "info"
  });
}
