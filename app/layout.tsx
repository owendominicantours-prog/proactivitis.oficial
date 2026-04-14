import "@/styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { headers } from "next/headers";
import { Geist_Mono, Pacifico, Poppins } from "next/font/google";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_CONFIG } from "@/lib/site-config";

const siteLogoUrl = SITE_CONFIG.logoSrc.startsWith("http") ? SITE_CONFIG.logoSrc : `${SITE_CONFIG.url}${SITE_CONFIG.logoSrc}`;

const bodyFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap"
});

const brandFont = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-brand",
  display: "swap"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist-mono",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: `${SITE_CONFIG.siteName} | Tours, Traslados y Actividades para Reservar`,
  description:
    SITE_CONFIG.variant === "funjet"
      ? "Reserva tours y traslados con Funjet Tour Oprador. Atencion directa, confirmacion rapida y soporte por WhatsApp."
      : "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
  icons: {
    icon: [
      { url: SITE_CONFIG.logoSrc, type: "image/png" },
      { url: SITE_CONFIG.logoSrc, sizes: "96x96", type: "image/png" }
    ],
    shortcut: [SITE_CONFIG.logoSrc],
    apple: [{ url: SITE_CONFIG.logoSrc, sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: `${SITE_CONFIG.siteName} | Tours, Traslados y Actividades para Reservar`,
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva tours y traslados con Funjet Tour Oprador. Atencion directa, confirmacion rapida y soporte por WhatsApp."
        : "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.siteName,
    type: "website",
    images: [
      {
        url: siteLogoUrl,
        alt: `${SITE_CONFIG.siteName} logo`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_CONFIG.siteName} | Tours, Traslados y Actividades`,
    description:
      SITE_CONFIG.variant === "funjet"
        ? "Reserva tours y traslados con Funjet Tour Oprador. Atencion directa, confirmacion rapida y soporte por WhatsApp."
        : "Reserva tours, traslados privados y actividades con Proactivitis. Confirmacion inmediata, precios claros y soporte 24/7.",
    images: [siteLogoUrl]
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const localeHeader = requestHeaders.get("x-proactivitis-locale");
  const lang = localeHeader === "en" || localeHeader === "fr" ? localeHeader : "es";
  return (
    <html
      lang={lang}
      data-site-variant={SITE_CONFIG.variant}
      className={`${bodyFont.variable} ${brandFont.variable} ${geistMono.variable}`}
    >
      <body data-site-variant={SITE_CONFIG.variant} className="min-h-full bg-[#F8FAFC] text-slate-900 antialiased">
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
