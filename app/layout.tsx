import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { headers } from "next/headers";
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
  metadataBase: new URL("https://proactivitis.com"),
  title: "Proactivitis | Tours, Traslados y Actividades para Reservar",
  description:
    "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "shortcut icon", url: "/favicon.ico" },
    { rel: "icon", url: "/icon.png", sizes: "96x96" },
    { rel: "apple-touch-icon", url: "/apple-icon.png", sizes: "180x180" }
  ],
  openGraph: {
    title: "Proactivitis | Tours, Traslados y Actividades para Reservar",
    description:
      "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
    url: "https://proactivitis.com",
    siteName: "Proactivitis",
    type: "website",
    images: [
      {
        url: "https://www.proactivitis.com/logo.png",
        alt: "Proactivitis logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@proactivitis",
    title: "Proactivitis | Tours, Traslados y Actividades",
    description:
      "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
    images: ["https://www.proactivitis.com/logo.png"]
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-proactivitis-locale");
  const lang = localeHeader === "en" || localeHeader === "fr" ? localeHeader : "es";
  return (
    <html lang={lang} className={`${inter.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="min-h-full bg-[#F8FAFC] text-slate-900 antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
