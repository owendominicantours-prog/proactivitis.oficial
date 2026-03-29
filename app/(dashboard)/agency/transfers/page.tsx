import { getServerSession } from "next-auth";

import { AgencyTransferWorkspace } from "@/components/agency/AgencyTransferWorkspace";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AgencyTransfersPage() {
  const session = await getServerSession(authOptions);

  const [agencyProfile, activeLocations, activeVehicles, activeRoutes] = await Promise.all([
    session?.user?.id
      ? prisma.agencyProfile.findUnique({
          where: { userId: session.user.id },
          select: { commissionPercent: true, companyName: true }
        })
      : Promise.resolve(null),
    prisma.transferLocation.count({ where: { active: true } }),
    prisma.transferVehicle.count({ where: { active: true } }),
    prisma.transferRoute.count({ where: { active: true } })
  ]);

  return (
    <section className="space-y-5">
      <AgencyTransferWorkspace
        commissionPercent={agencyProfile?.commissionPercent ?? 20}
        companyName={agencyProfile?.companyName ?? session?.user?.name ?? "Tu agencia"}
        stats={{
          activeLocations,
          activeVehicles,
          activeRoutes
        }}
      />
    </section>
  );
}
