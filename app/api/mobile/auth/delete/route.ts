import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { anonymizeCustomerAccount } from "@/lib/accountDeletion";
import { sendEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

const withCors = (response: NextResponse) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
};

export function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

const readMobileUserId = (request: NextRequest) => {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : "";
  if (!token) return null;

  try {
    const secret = process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "proactivitis-default";
    const decoded = jwt.verify(token, secret) as { userId?: string };
    return decoded.userId ?? null;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  const userId = readMobileUserId(request);
  if (!userId) {
    return withCors(NextResponse.json({ error: "Sesion requerida." }, { status: 401 }));
  }

  try {
    const result = await anonymizeCustomerAccount(userId);

    if (result.stripeCustomerId) {
      try {
        await getStripe().customers.del(result.stripeCustomerId);
      } catch (error) {
        console.warn("No se pudo eliminar cliente Stripe durante eliminacion de cuenta", error);
      }
    }

    await sendEmail({
      to: result.originalEmail,
      subject: "Tu cuenta Proactivitis fue eliminada",
      category: "transactional",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h1>Cuenta eliminada</h1>
          <p>Confirmamos que la cuenta de cliente de la app Proactivitis asociada a este correo fue eliminada.</p>
          <p>Se eliminaron sesiones, acceso, preferencias y metodos de pago guardados. Podemos retener registros operativos de reservas, pagos, seguridad, impuestos o disputas cuando sea necesario.</p>
          <p>Si necesitas revisar una reserva activa, responde este correo o contacta a soporte.</p>
        </div>
      `
    }).catch((error) => {
      console.warn("No se pudo enviar confirmacion de eliminacion de cuenta", error);
    });

    return withCors(NextResponse.json({ ok: true }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo eliminar la cuenta.";
    return withCors(NextResponse.json({ error: message }, { status: 400 }));
  }
}
