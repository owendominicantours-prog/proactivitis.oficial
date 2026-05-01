import { NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";

const EXPORT_STATUSES = ["CONFIRMED", "COMPLETED", "PAYMENT_PENDING", "PENDING", "CANCELLED"] as const;

const parseDate = (value: string | null, fallback: Date) => {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const csvEscape = (value: unknown) => {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const startDate = parseDate(request.nextUrl.searchParams.get("startDate"), monthStart);
  const endDate = parseDate(request.nextUrl.searchParams.get("endDate"), today);
  const endExclusive = addDays(endDate, 1);
  const statusParam = request.nextUrl.searchParams.get("status");
  const status = statusParam && EXPORT_STATUSES.includes(statusParam as (typeof EXPORT_STATUSES)[number])
    ? statusParam
    : "all";

  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lt: endExclusive
      },
      ...(status !== "all" ? { status } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      Tour: {
        select: {
          title: true,
          SupplierProfile: {
            select: {
              company: true
            }
          }
        }
      },
      AgencyProLink: {
        select: {
          AgencyUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      AgencyTransferLink: {
        select: {
          AgencyUser: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  const header = [
    "booking_id",
    "booking_code",
    "created_at",
    "travel_date",
    "status",
    "payment_status",
    "flow_type",
    "customer_name",
    "customer_email",
    "tour",
    "supplier",
    "agency",
    "total_amount",
    "supplier_amount",
    "platform_fee",
    "agency_fee",
    "agency_markup",
    "stripe_payment_intent"
  ];

  const rows = bookings.map((booking) => {
    const agency =
      booking.AgencyProLink?.AgencyUser?.name ??
      booking.AgencyProLink?.AgencyUser?.email ??
      booking.AgencyTransferLink?.AgencyUser?.name ??
      booking.AgencyTransferLink?.AgencyUser?.email ??
      "";

    return [
      booking.id,
      booking.bookingCode ?? "",
      booking.createdAt.toISOString(),
      booking.travelDate.toISOString(),
      booking.status,
      booking.paymentStatus ?? "",
      booking.flowType ?? "",
      booking.customerName,
      booking.customerEmail,
      booking.Tour?.title ?? "",
      booking.Tour?.SupplierProfile?.company ?? "",
      agency,
      booking.totalAmount,
      booking.supplierAmount ?? 0,
      booking.platformFee ?? 0,
      booking.agencyFee ?? 0,
      booking.agencyMarkupAmount ?? 0,
      booking.stripePaymentIntentId ?? ""
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const filename = `proactivitis-finance-${startDate.toISOString().slice(0, 10)}-${endDate.toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`
    }
  });
}
