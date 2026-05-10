import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { DashboardUserMenu } from "@/components/dashboard/DashboardUserMenu";

export const metadata = {
  title: "Customer | Proactivitis"
};

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm">
            <Image src="/logo.png" alt="Proactivitis" width={155} height={46} className="h-8 w-auto object-contain" />
          </Link>
          <nav className="flex items-center gap-4 text-sm font-semibold text-slate-700">
            <Link href="/dashboard/customer" className="text-slate-900">
              Mis reservas
            </Link>
            <Link href="/customer/notifications" className="hidden text-slate-600 sm:inline">
              Notificaciones
            </Link>
            <DashboardUserMenu />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
