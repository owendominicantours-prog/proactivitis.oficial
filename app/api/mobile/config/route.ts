import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
    appUrl: process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") || "https://proactivitis.com"
  });
}
