import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTransferReviewReminder } from "@/lib/mailers/transferReviewReminder";

const EXPECTED_TOKEN = process.env.TRANSFER_REVIEW_CRON_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;
const DATE_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/Santo_Domingo"
});

const dateKey = (value: Date) => DATE_KEY_FORMATTER.format(value);

const authorize = async (request: NextRequest) => {
  const vercelCron = request.headers.get("x-vercel-cron") === "1";
  const authorization = request.headers.get("authorization");

  if (CRON_SECRET && authorization === `Bearer ${CRON_SECRET}`) {
    return true;
  }

  if (EXPECTED_TOKEN) {
    const token = request.headers.get("x-transfer-review-token");
    if (token === EXPECTED_TOKEN) {
      return true;
    }
  }

  if (vercelCron && !CRON_SECRET && !EXPECTED_TOKEN) {
    return true;
  }

  return false;
};

export async function POST(request: NextRequest) {
  if (!(await authorize(request))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayKey = dateKey(now);

  const bookings = await prisma.booking.findMany({
    where: {
      flowType: "transfer",
      status: { in: ["CONFIRMED", "COMPLETED"] },
      customerEmail: { not: "" },
      travelDate: { lt: now }
    },
    select: {
      id: true,
      travelDate: true,
      customerName: true,
      customerEmail: true,
      Tour: {
        select: {
          title: true
        }
      },
      TransferReviews: {
        select: { id: true },
        take: 1
      },
      TransferReviewReminder: {
        select: {
          id: true,
          sendCount: true,
          lastSentAt: true,
          stoppedAt: true
        }
      }
    },
    orderBy: { travelDate: "asc" },
    take: 500
  });

  let sent = 0;
  let skipped = 0;
  let stopped = 0;

  for (const booking of bookings) {
    const reminder = booking.TransferReviewReminder;
    const alreadyReviewed = booking.TransferReviews.length > 0;

    if (alreadyReviewed) {
      if (reminder && !reminder.stoppedAt) {
        await prisma.transferReviewReminder.update({
          where: { bookingId: booking.id },
          data: {
            stoppedAt: now,
            stopReason: "REVIEW_SUBMITTED"
          }
        });
        stopped += 1;
      } else {
        skipped += 1;
      }
      continue;
    }

    const travelDateKey = dateKey(booking.travelDate);
    if (todayKey <= travelDateKey) {
      skipped += 1;
      continue;
    }

    if (reminder?.stoppedAt) {
      skipped += 1;
      continue;
    }

    if (reminder?.lastSentAt && dateKey(reminder.lastSentAt) === todayKey) {
      skipped += 1;
      continue;
    }

    try {
      await sendTransferReviewReminder({
        to: booking.customerEmail,
        bookingId: booking.id,
        customerName: booking.customerName,
        tourTitle: booking.Tour.title,
        travelDate: booking.travelDate
      });

      await prisma.transferReviewReminder.upsert({
        where: { bookingId: booking.id },
        update: {
          sendCount: { increment: 1 },
          lastSentAt: now,
          stoppedAt: null,
          stopReason: null
        },
        create: {
          bookingId: booking.id,
          sendCount: 1,
          lastSentAt: now
        }
      });

      sent += 1;
    } catch (error) {
      console.error("transfer-review-reminder email failed", booking.id, error);
      skipped += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    total: bookings.length,
    sent,
    stopped,
    skipped
  });
}
