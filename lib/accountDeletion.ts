import { prisma } from "@/lib/prisma";

const DELETED_ACCOUNT_DOMAIN = "deleted.proactivitis.local";

export type AccountDeletionResult = {
  userId: string;
  originalEmail: string;
  anonymizedEmail: string;
  stripeCustomerId?: string | null;
};

export async function anonymizeCustomerAccount(userId: string): Promise<AccountDeletionResult> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      accountStatus: true,
      CustomerPayment: {
        select: {
          stripeCustomerId: true
        }
      }
    }
  });

  if (!existing) {
    throw new Error("Cuenta no encontrada.");
  }

  if (existing.role !== "CUSTOMER") {
    throw new Error("Esta ruta solo elimina cuentas de cliente de la app.");
  }

  const anonymizedEmail = `deleted-${existing.id}@${DELETED_ACCOUNT_DOMAIN}`;
  const stripeCustomerId = existing.CustomerPayment?.stripeCustomerId ?? null;

  if (existing.accountStatus === "DELETED") {
    return {
      userId: existing.id,
      originalEmail: existing.email,
      anonymizedEmail: existing.email,
      stripeCustomerId
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.customerPayment.deleteMany({ where: { userId } });
    await tx.customerPreference.deleteMany({ where: { userId } });
    await tx.conversationParticipant.deleteMany({ where: { userId } });
    await tx.message.deleteMany({ where: { senderId: userId } });
    await tx.tourReview.updateMany({
      where: { userId },
      data: {
        userId: null,
        customerName: "Usuario eliminado",
        customerEmail: anonymizedEmail
      }
    });
    await tx.transferReview.updateMany({
      where: { userId },
      data: {
        userId: null,
        customerName: "Usuario eliminado",
        customerEmail: anonymizedEmail
      }
    });
    await tx.user.update({
      where: { id: userId },
      data: {
        name: "Cuenta eliminada",
        email: anonymizedEmail,
        emailVerified: null,
        image: null,
        password: null,
        supplierApproved: false,
        agencyApproved: false,
        accountStatus: "DELETED",
        statusMessage:
          "Cuenta eliminada por solicitud del cliente. Se retienen registros operativos cuando aplica por reservas, seguridad, impuestos o disputas."
      }
    });
  });

  return {
    userId: existing.id,
    originalEmail: existing.email,
    anonymizedEmail,
    stripeCustomerId
  };
}
