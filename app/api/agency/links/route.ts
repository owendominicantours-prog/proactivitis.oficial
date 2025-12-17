import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAgencyProLinkRecord } from "@/lib/agencyPro";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    return NextResponse.json({ message: "Acceso no autorizado." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const tourId = body.tourId;
  const price = Number(body.price) || 0;
  const note = typeof body.note === "string" ? body.note : undefined;
  try {
    const link = await createAgencyProLinkRecord({
      agencyUserId: session.user.id,
      tourId,
      price,
      note
    });
    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "No se pudo crear el enlace."
      },
      { status: 400 }
    );
  }
}
