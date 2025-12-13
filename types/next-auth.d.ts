import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
      supplierApproved?: boolean;
    };
  }

  interface User {
    role?: string;
    supplierApproved?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    supplierApproved?: string;
  }
}
