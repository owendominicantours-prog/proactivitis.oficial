import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Open_Sans } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Proactivitis Marketplace",
  description:
    "Marketplace turístico integral de Owen Dominicanproactivitis. Tours, proveedores, agencias y CRM en un solo lugar.",
  icons: [
    { rel: "icon", url: "/ico.ico" },
    { rel: "shortcut icon", url: "/ico.ico" },
    { rel: "apple-touch-icon", url: "/ico.ico" }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={openSans.variable}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 antialiased font-slate">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
