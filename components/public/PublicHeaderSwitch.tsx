"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import GlobalBanner from "@/components/public/GlobalBanner";

const shouldHidePublicHeader = (pathname: string | null) => {
  if (!pathname) return false;
  return pathname === "/prodiscovery" || pathname.startsWith("/prodiscovery/") || pathname === "/en/prodiscovery" || pathname.startsWith("/en/prodiscovery/") || pathname === "/fr/prodiscovery" || pathname.startsWith("/fr/prodiscovery/");
};

export default function PublicHeaderSwitch() {
  const pathname = usePathname();

  if (shouldHidePublicHeader(pathname)) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GlobalBanner />
      <PublicHeader />
    </Suspense>
  );
}
