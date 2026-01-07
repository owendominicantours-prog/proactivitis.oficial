import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const roleRoutes = [
  { base: "/admin", roles: ["ADMIN"] },
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
  const match = roleRoutes.find((item) => normalized.startsWith(item.base));
  if (!match) return true;
  if (!role) return false;
  return match.roles.includes(role);
}

export default withAuth(
  (req) => {
    const { pathname } = req.nextUrl;
    const transferPrefix = "/transfer/punta-cana-international-airport-to-";
    if (pathname.startsWith(transferPrefix)) {
      const targetPath = pathname.replace(
        transferPrefix,
        "/transfer/punta-cana-international-airport-puj-to-"
      );
      const url = req.nextUrl.clone();
      url.pathname = targetPath;
      return NextResponse.redirect(url, 301);
    }
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
    "/transfer/:path*",
    "/admin/:path*",
    "/supplier/:path*",
    "/agency/:path*",
    "/customer/:path*",
    "/me/:path*",
    "/chat",
    "/portal/(admin|supplier|agency|customer)"
  ]
};
