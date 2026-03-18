"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import GlobalBanner from "@/components/public/GlobalBanner";

const shouldHidePublicHeader = (_pathname: string | null) => false;

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
