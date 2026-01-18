import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type PreferencesPayload = {
  countries?: string[];
  destinations?: string[];
  productTypes?: string[];
  consentMarketing?: boolean;
};

const normalizeList = (value?: string[]) =>
  (value ?? [])
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 20);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | null)?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as PreferencesPayload;
  const preferredCountries = normalizeList(payload.countries);
  const preferredDestinations = normalizeList(payload.destinations);
  const preferredProductTypes = normalizeList(payload.productTypes);
  const completed = Boolean(
    preferredCountries.length || preferredDestinations.length || preferredProductTypes.length
  );

  const existing = await prisma.customerPreference.findUnique({
    where: { userId },
    select: { discountRedeemedAt: true, discountEligible: true, discountGrantedAt: true }
  });

  const shouldGrantDiscount = completed && !existing?.discountRedeemedAt;

  const now = new Date();
  const discountGrantedAt = shouldGrantDiscount
    ? existing?.discountEligible
      ? existing?.discountGrantedAt ?? now
      : now
    : null;

  const preference = await prisma.customerPreference.upsert({
    where: { userId },
    create: {
      userId,
      preferredCountries,
      preferredDestinations,
      preferredProductTypes,
      consentMarketing: Boolean(payload.consentMarketing),
      completedAt: completed ? now : null,
      discountEligible: shouldGrantDiscount,
      discountGrantedAt
    },
    update: {
      preferredCountries,
      preferredDestinations,
      preferredProductTypes,
      consentMarketing: Boolean(payload.consentMarketing),
      completedAt: completed ? now : null,
      discountEligible: shouldGrantDiscount,
      discountGrantedAt
    }
  });

  return NextResponse.json({ ok: true, preference });
}
