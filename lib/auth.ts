import bcrypt from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import Auth0Provider from "next-auth/providers/auth0";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

const roleRedirects: Record<string, string> = {
  ADMIN: "/portal/admin",
  SUPPLIER: "/portal/supplier",
  AGENCY: "/portal/agency",
  CUSTOMER: "/portal/customer"
};

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.warn("NEXTAUTH_SECRET no esta definido; configura un valor seguro en despliegue.");
}

const oauthProviders = [];

if (process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_ISSUER) {
  oauthProviders.push(
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      issuer: process.env.AUTH0_ISSUER
    })
  );
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: secret ?? "dev-secret",
  session: {
    strategy: "jwt"
  },
  providers: [
    ...oauthProviders,
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) return null;

        const validPassword = await bcrypt.compare(credentials.password, user.password);
        if (!validPassword) {
          return null;
        }

        const needsApproval = ["SUPPLIER", "AGENCY"].includes(user.role ?? "");
        if (needsApproval && user.accountStatus !== "APPROVED") {
          const defaultMessage =
            user.accountStatus === "REJECTED"
              ? "Su cuenta ha sido rechazada. Revisa tu correo para mas detalles."
              : "Tu cuenta aun no ha sido aprobada.";
          throw new Error(user.statusMessage ?? defaultMessage);
        }

        return user;
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if (!session?.user) return session;
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.role = token.role as string;
      session.user.supplierApproved = token.supplierApproved === "true";
      session.user.agencyApproved = token.agencyApproved === "true";
      session.user.accountStatus = typeof token.accountStatus === "string" ? token.accountStatus : undefined;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.supplierApproved = (user as { supplierApproved?: boolean }).supplierApproved ? "true" : "false";
        token.agencyApproved = (user as { agencyApproved?: boolean }).agencyApproved ? "true" : "false";
        token.accountStatus = (user as { accountStatus?: string }).accountStatus ?? "APPROVED";
        return token;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.supplierApproved = dbUser.supplierApproved ? "true" : "false";
          token.agencyApproved = dbUser.agencyApproved ? "true" : "false";
          token.accountStatus = dbUser.accountStatus;
        }
      }

      return token;
    },
    async signIn({ user, account }) {
      const isOAuthProvider = account?.provider && account.provider !== "credentials";
      if (isOAuthProvider && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name ?? existingUser.name ?? undefined
            }
          });

          const needsApproval = ["SUPPLIER", "AGENCY"].includes(existingUser.role ?? "");
          if (needsApproval && existingUser.accountStatus !== "APPROVED") {
            const defaultMessage =
              existingUser.accountStatus === "REJECTED"
                ? "Su cuenta ha sido rechazada. Revisa tu correo para mas detalles."
                : "Tu cuenta aun no ha sido aprobada.";
            return `/auth/login?error=${encodeURIComponent(existingUser.statusMessage ?? defaultMessage)}`;
          }

          return true;
        }
      }

      return true;
    },
    async redirect(params) {
      const { url, baseUrl } = params;
      const token = (params as { token?: { role?: string } }).token;
      const safeBase = baseUrl ?? "/";
      const safeUrl = typeof url === "string" && url.startsWith(safeBase) ? url : safeBase;
      const safePath = safeUrl.startsWith(safeBase) ? safeUrl.slice(safeBase.length) || "/" : "/";

      if (
        safePath !== "/" &&
        !safePath.startsWith("/auth/login") &&
        !safePath.startsWith("/auth/register") &&
        !safePath.startsWith("/portal")
      ) {
        return safeUrl;
      }

      if (!token?.role) return safeUrl;

      const mapped = roleRedirects[token.role as string];
      if (mapped) {
        return safeBase.endsWith("/") ? `${safeBase.slice(0, -1)}${mapped}` : `${safeBase}${mapped}`;
      }

      return safeUrl;
    }
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "CUSTOMER",
          supplierApproved: false,
          agencyApproved: false,
          accountStatus: "APPROVED"
        }
      });
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};
