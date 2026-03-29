import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { createAgencyTransferLinkRecord } from "@/lib/agencyTransferPro";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    return NextResponse.json({ message: "Acceso no autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const originLocationId = typeof body.originLocationId === "string" ? body.originLocationId : "";
  const destinationLocationId =
    typeof body.destinationLocationId === "string" ? body.destinationLocationId : "";
  const vehicleId = typeof body.vehicleId === "string" ? body.vehicleId : "";
  const passengers = Math.max(1, Number(body.passengers) || 1);
  const tripType = body.tripType === "round-trip" ? "round-trip" : "one-way";
  const price = Number(body.price) || 0;
  const basePrice = Number(body.basePrice) || 0;
  const note = typeof body.note === "string" ? body.note : undefined;

  try {
    if (price < basePrice) {
      return NextResponse.json(
        { message: "El precio final no puede ser menor al precio base del traslado." },
        { status: 400 }
      );
    }

    const link = await createAgencyTransferLinkRecord({
      agencyUserId: session.user.id,
      originLocationId,
      destinationLocationId,
      vehicleId,
      passengers,
      tripType,
      price,
      basePrice,
      note
    });
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "No se pudo crear el enlace." },
      { status: 400 }
    );
  }
}
