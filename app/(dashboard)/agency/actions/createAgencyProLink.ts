import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { createAgencyProLinkRecord, CreateAgencyProLinkInput } from "@/lib/agencyPro";

export type AgencyProLinkResult = {
  slug: string;
  url: string;
};

export async function createAgencyProLink(formData: FormData): Promise<AgencyProLinkResult> {
  "use server";

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "AGENCY") {
    throw new Error("Debes iniciar sesión como agencia para generar un enlace.");
  }

  const tourId = formData.get("tourId");
  const priceRaw = formData.get("price");
  const noteRaw = formData.get("note");

  if (!tourId || typeof tourId !== "string") {
    throw new Error("Falta el tour al que se aplica el precio AgencyPro.");
  }
  const price = Number(priceRaw);
  if (Number.isNaN(price) || price <= 0) {
    throw new Error("Debes indicar un precio válido.");
  }

  const payload: CreateAgencyProLinkInput = {
    agencyUserId: session.user.id,
    tourId,
    price,
    note: typeof noteRaw === "string" && noteRaw.trim().length ? noteRaw.trim() : undefined
  };

  return createAgencyProLinkRecord(payload);
}
