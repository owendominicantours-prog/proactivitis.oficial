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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://www.proactivitis.com/#organization","name":"Proactivitis","url":"https://www.proactivitis.com/","description":"Created by locals for global travelers. Proactivitis was born in the Caribbean helping visitors and grew into a platform connecting travelers, providers, and agencies with booking, notifications, payments, and performance tools.","foundingLocation":{"@type":"Place","name":"Caribbean"},"knowsAbout":["Local travel experiences","Tours and activities","Booking platforms","Travel technology","Payments and reservations","Supplier management"],"contactPoint":{"@type":"ContactPoint","contactType":"Customer Support","email":"info@proactivitis.com","availableLanguage":["es","en"]},"logo":{"@type":"ImageObject","url":"https://www.proactivitis.com/logo.png","width":512,"height":512}},{"@type":"WebSite","@id":"https://www.proactivitis.com/#website","url":"https://www.proactivitis.com/","name":"Proactivitis","publisher":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es","en"]},{"@type":"AboutPage","@id":"https://www.proactivitis.com/about#webpage","url":"https://www.proactivitis.com/about","name":"About Proactivitis","isPartOf":{"@id":"https://www.proactivitis.com/#website"},"about":{"@id":"https://www.proactivitis.com/#organization"},"inLanguage":["es","en"],"description":"Proactivitis was born in the Caribbean to bring transparency, local-first operations, and modern product thinking to global travel experiences."}]}`
        }}
      />
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
