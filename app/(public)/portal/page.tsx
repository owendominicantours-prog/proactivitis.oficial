import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
  robots: { index: false, follow: false }
};

const roleRedirects: Record<string, string> = {
  ADMIN: "/admin",
  SUPPLIER: "/supplier",
  AGENCY: "/agency",
  CUSTOMER: "/customer"
};

export default async function PortalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role) {
    redirect("/auth/login");
  }
  const destination = roleRedirects[session.user.role] ?? "/customer";
  redirect(destination);
}
