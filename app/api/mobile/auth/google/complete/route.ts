import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const signMobileToken = (user: { id: string; email: string }) => {
  const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
  return jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "30d" });
};

const appRedirect = (params: Record<string, string>) => {
  const search = new URLSearchParams(params);
  return new NextResponse(null, {
    status: 302,
    headers: {
      Location: `proactivitis://auth/google?${search.toString()}`
    }
  });
};

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user?.id || !user.email) {
    return appRedirect({ error: "google_session_missing" });
  }

  return appRedirect({
    token: signMobileToken({ id: user.id, email: user.email }),
    userId: user.id,
    email: user.email,
    name: user.name ?? "",
    role: user.role ?? "CUSTOMER"
  });
}
