import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import Auth0Provider from "next-auth/providers/auth0";
import { prisma } from "./prisma";
import type { NextAuthOptions } from "next-auth";

const roleRedirects: Record<string, string> = {
  ADMIN: "/portal/admin",
  SUPPLIER: "/portal/supplier",
  AGENCY: "/portal/agency",
  CUSTOMER: "/portal/customer"
};

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  console.warn("NEXTAUTH_SECRET no está definido; configura un valor seguro en despliegue.");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: secret ?? "dev-secret",
  session: {
    strategy: "jwt"
  },
  providers: [
    Auth0Provider({
      clientId: process.env.AUTH0_CLIENT_ID ?? "",
      clientSecret: process.env.AUTH0_CLIENT_SECRET ?? "",
      issuer: process.env.AUTH0_ISSUER ?? ""
    }),
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
              ? "Su cuenta ha sido rechazada. Revisa tu correo para más detalles."
              : "Tu cuenta aún no ha sido aprobada.";
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
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.supplierApproved = (user as { supplierApproved?: boolean }).supplierApproved
          ? "true"
          : "false";
        return token;
      }
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.supplierApproved = dbUser.supplierApproved ? "true" : "false";
        }
      }
      return token;
    },
    async signIn({ user, account }) {
      if (account.provider === "auth0" && user?.email) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name ?? undefined,
            supplierApproved: true,
            accountStatus: "APPROVED"
          },
          create: {
            id: randomUUID(),
            name: user.name ?? "Aliado",
            email: user.email,
            role: "CUSTOMER",
            supplierApproved: true,
            agencyApproved: false,
            accountStatus: "APPROVED"
          }
        });
      }
      return true;
    },
    async redirect(params) {
      const { url, baseUrl } = params;
      const token = (params as { token?: { role?: string } }).token;
      const safeBase = baseUrl ?? "/";
      const safeUrl = typeof url === "string" && url.startsWith(safeBase) ? url : safeBase;
      if (!token?.role) return safeUrl;
      const mapped = roleRedirects[token.role as string];
      if (mapped) {
        return safeBase.endsWith("/") ? `${safeBase.slice(0, -1)}${mapped}` : `${safeBase}${mapped}`;
      }
      return safeUrl;
    }
  },
  pages: {
    signIn: "/auth/login"
  }
};
