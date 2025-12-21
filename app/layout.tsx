import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap"
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-geist",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Proactivitis | Global Travel Experience Platform: Tours & Transfers",
  description:
    "Reserve tours auténticos, traslados privados premium y experiencias exclusivas con confirmación inmediata. Seguridad de pago global y soporte 24/7 en los mejores destinos del mundo.",
  icons: [
    { rel: "icon", url: "/ico.ico" },
    { rel: "shortcut icon", url: "/ico.ico" },
    { rel: "apple-touch-icon", url: "/ico.ico" }
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
