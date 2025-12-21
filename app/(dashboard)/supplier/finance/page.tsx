import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountProvider from "@/components/AccountProvider";
import SupplierFinanceScreen from "@/components/supplier/SupplierFinanceScreen";

export const metadata = {
  title: "Finanzas · Proactivitis"
};

export default async function SupplierFinancePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (!userId) {
    return <div className="py-10 text-center text-sm text-slate-600">Accede para administrar tus finanzas.</div>;
  }

  const supplier = await prisma.supplierProfile.findUnique({
    where: { userId }
  });

  if (!supplier) {
    return (
      <div className="py-10 text-center text-sm text-slate-600">
        No encontramos un perfil de proveedor vinculado a esta cuenta. Contacta al equipo para activarlo.
      </div>
    );
  }

  return (
    <AccountProvider initialAccountId={supplier.stripeAccountId}>
      <SupplierFinanceScreen supplierName={supplier.company} />
    </AccountProvider>
  );
}
