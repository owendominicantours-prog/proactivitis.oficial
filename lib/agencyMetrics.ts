import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const agencyConfirmedStatuses: string[] = ["CONFIRMED", "COMPLETED"];

export const buildAgencyBookingWhere = (userId: string): Prisma.BookingWhereInput => ({
  source: "AGENCY",
  OR: [{ userId }, { AgencyProLink: { agencyUserId: userId } }, { AgencyTransferLink: { agencyUserId: userId } }]
});

export async function getAgencyWorkspaceMetrics(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  const baseWhere = buildAgencyBookingWhere(userId);
  const monthlyWhere: Prisma.BookingWhereInput = {
    ...baseWhere,
    createdAt: { gte: monthStart, lt: monthEnd }
  };

  const [activeBookings, cancellationsThisMonth, cancellationRequests, monthlyBookings, upcomingBookings] =
    await Promise.all([
      prisma.booking.count({
        where: {
          ...baseWhere,
          travelDate: { gte: now },
          status: { in: agencyConfirmedStatuses }
        }
      }),
      prisma.booking.count({
        where: {
          ...baseWhere,
          status: "CANCELLED",
          cancellationAt: { gte: monthStart, lt: monthEnd }
        }
      }),
      prisma.booking.count({
        where: {
          ...baseWhere,
          status: "CANCELLATION_REQUESTED"
        }
      }),
      prisma.booking.findMany({
        where: monthlyWhere,
        select: {
          id: true,
          totalAmount: true,
          agencyFee: true,
          agencyMarkupAmount: true,
          agencyProLinkId: true,
          agencyTransferLinkId: true,
          status: true
        }
      }),
      prisma.booking.count({
        where: {
          ...baseWhere,
          travelDate: { gte: now }
        }
      })
    ]);

  const confirmedMonthlyBookings = monthlyBookings.filter((booking) =>
    agencyConfirmedStatuses.includes(booking.status)
  );

  const directCommission = confirmedMonthlyBookings.reduce((sum, booking) => {
    const isDirect = !booking.agencyProLinkId && !booking.agencyTransferLinkId;
    return isDirect ? sum + (booking.agencyFee ?? 0) : sum;
  }, 0);

  const agencyProMargin = confirmedMonthlyBookings.reduce((sum, booking) => {
    const isAgencyPro = Boolean(booking.agencyProLinkId || booking.agencyTransferLinkId);
    return isAgencyPro ? sum + (booking.agencyMarkupAmount ?? 0) : sum;
  }, 0);

  const grossSales = confirmedMonthlyBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return {
    activeBookings,
    cancellationsThisMonth,
    cancellationRequests,
    estimatedCommission: directCommission + agencyProMargin,
    directCommission,
    agencyProMargin,
    grossSales,
    bookingsThisMonth: monthlyBookings.length,
    upcomingBookings
  };
}
