import Link from "next/link";
import { TrustBadges } from "@/components/shared/TrustBadges";

export const Footer = () => (
  <footer className="w-full border-t border-slate-200 bg-white/80 py-8">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p>(c) {new Date().getFullYear()} Proactivitis</p>
        <TrustBadges locale="es" compact />
      </div>
      <div className="flex gap-4">
        <Link href="/legal/privacy" className="hover:text-brand">
          Privacidad
        </Link>
        <Link href="/legal/terms" className="hover:text-brand">
          Terminos
        </Link>
        <Link href="/legal/refund-policy" className="hover:text-brand">
          Devoluciones
        </Link>
        <Link href="/legal/shipping-policy" className="hover:text-brand">
          Entrega
        </Link>
        <Link href="/account-deletion" className="hover:text-brand">
          Eliminar cuenta
        </Link>
      </div>
    </div>
  </footer>
);
