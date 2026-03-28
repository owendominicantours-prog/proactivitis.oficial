import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      role?: string;
      supplierApproved?: boolean;
      agencyApproved?: boolean;
      accountStatus?: string;
    };
  }

  interface User {
    role?: string;
    supplierApproved?: boolean;
    agencyApproved?: boolean;
    accountStatus?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    supplierApproved?: string;
    agencyApproved?: string;
    accountStatus?: string;
  }
}
