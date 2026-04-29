import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readMobileUserId, withMobileCors } from "@/lib/mobileAuth";

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

export function OPTIONS() {
  return withMobileCors(new NextResponse(null, { status: 204 }), "POST, OPTIONS");
}

export async function POST(request: Request) {
  try {
    const userId = readMobileUserId(request);
    if (!userId) {
      return withMobileCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }), "POST, OPTIONS");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, accountStatus: true }
    });
    if (!user || user.accountStatus === "DELETED") {
      return withMobileCors(NextResponse.json({ error: "Sesion expirada." }, { status: 401 }), "POST, OPTIONS");
    }

    const payload = (await request.json().catch(() => ({}))) as PreferencesPayload;
    const preferredCountries = normalizeList(payload.countries);
    const preferredDestinations = normalizeList(payload.destinations);
    const preferredProductTypes = normalizeList(payload.productTypes);
    const completed = Boolean(preferredCountries.length || preferredDestinations.length || preferredProductTypes.length);

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

    return withMobileCors(NextResponse.json({ ok: true, preference }), "POST, OPTIONS");
  } catch {
    return withMobileCors(NextResponse.json({ error: "No se pudieron guardar tus preferencias." }, { status: 500 }), "POST, OPTIONS");
  }
}
