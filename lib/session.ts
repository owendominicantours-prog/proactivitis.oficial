import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type Role = "ADMIN" | "SUPPLIER" | "AGENCY" | "CUSTOMER";

export async function getSessionUser(): Promise<{ id: string; role: Role } | null> {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as Role | undefined;
  if (!session?.user?.id || !role) return null;
  return { id: session.user.id, role };
}

export function requireRole(user: { role: Role }, allowed: Role[]) {
  if (!allowed.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
}
