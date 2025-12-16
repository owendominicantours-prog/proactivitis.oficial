import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import { PublicAuthButtons } from "@/components/public/PublicAuthButtons";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicNavMenu } from "@/components/public/PublicNav";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 text-slate-900"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Proactivitis" width="140" height="32" className="object-contain" />
          </Link>
          <div className="flex flex-1 items-center justify-center md:justify-start">
            <PublicNavMenu />
          </div>
          <div className="flex items-center">
            <PublicAuthButtons />
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <PublicFooter />
    </div>
  );
}
