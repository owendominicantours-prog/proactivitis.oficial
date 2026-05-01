import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/adminAccess";

const ensureAdminResponse = async () => {
  try {
    await requireAdminSession();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
};

export async function GET() {
  const unauthorized = await ensureAdminResponse();
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    currency: "USD",
    payoutWindow: [5, 20],
    paymentProviders: ["Stripe", "PayPal"]
  });
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminResponse();
  if (unauthorized) return unauthorized;

  const payload = await request.json().catch(() => ({}));
  return NextResponse.json({ saved: true, payload });
}
