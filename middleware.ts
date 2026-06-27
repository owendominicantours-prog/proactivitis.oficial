import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const roleRoutes = [
  { base: "/admin", roles: ["ADMIN"] },
  { base: "/workplace", roles: ["EMPLOYEE", "ADMIN"] },
  { base: "/supplier", roles: ["SUPPLIER"] },
  { base: "/agency", roles: ["AGENCY"] },
  { base: "/customer", roles: ["CUSTOMER"] },
  { base: "/me", roles: ["CUSTOMER"] },
  { base: "/chat", roles: ["ADMIN", "SUPPLIER", "AGENCY", "CUSTOMER"] },
  { base: "/portal/admin", roles: ["ADMIN"] },
  { base: "/portal/supplier", roles: ["SUPPLIER"] },
  { base: "/portal/agency", roles: ["AGENCY"] },
  { base: "/portal/customer", roles: ["CUSTOMER"] }
];

function matchAllowed(pathname: string, role?: string) {
  const normalized = pathname.toLowerCase();
  if (normalized === "/workplace/register" || normalized.startsWith("/workplace/register/")) {
    return true;
  }
  const match = roleRoutes.find((item) => {
    const base = item.base.toLowerCase();
    return normalized === base || normalized.startsWith(`${base}/`);
  });
  if (!match) return true;
  if (!role) return false;
  return match.roles.includes(role);
}

export default withAuth(
  (req) => {
    const { pathname } = req.nextUrl;
    const locale = pathname.startsWith("/en") ? "en" : pathname.startsWith("/fr") ? "fr" : "es";
    const currentLocaleCookie = req.cookies.get("proactivitis-language")?.value;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-proactivitis-locale", locale);
    if (pathname === "/tours/atv-punta-cana-single") {
      const url = req.nextUrl.clone();
      url.pathname = "/tours/excursion-en-buggy-y-atv-en-punta-cana";
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/transfers/aeropuerto-punta-cana-a-bavaro") {
      const url = req.nextUrl.clone();
      url.pathname = "/transfer/punta-cana-airport-to-bavaro-transfer";
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/transfers" || pathname.startsWith("/transfers/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/traslado";
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/en/transfers" || pathname.startsWith("/en/transfers/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/en/transfer";
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/fr/transfers" || pathname.startsWith("/fr/transfers/")) {
      const url = req.nextUrl.clone();
      url.pathname = "/fr/transfer";
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/en/hoteles" || pathname.startsWith("/en/hoteles/")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace("/en/hoteles", "/en/hotels");
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    if (pathname === "/fr/hoteles" || pathname.startsWith("/fr/hoteles/")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.replace("/fr/hoteles", "/fr/hotels");
      const response = NextResponse.redirect(url, 301);
      if (currentLocaleCookie !== locale) {
        response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
      }
      return response;
    }
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    if (currentLocaleCookie !== locale) {
      response.cookies.set("proactivitis-language", locale, { path: "/", sameSite: "lax" });
    }
    return response;
  },
  {
    callbacks: {
      authorized({ token, req }) {
        return matchAllowed(req.nextUrl.pathname, token?.role as string);
      }
    }
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.*\\.xml|.*\\.(?:png|jpg|jpeg|webp|avif|gif|svg|ico|css|js|map|txt|xml|woff|woff2|ttf)$).*)"
  ]
};
