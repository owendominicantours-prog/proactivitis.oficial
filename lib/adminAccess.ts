import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && session.user.role === "ADMIN" ? session : null;
}

export async function requireAdminSession(message = "No autorizado.") {
  const session = await getAdminSession();
  if (!session) {
    throw new Error(message);
  }
  return session;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin");
  }
  return session;
}
