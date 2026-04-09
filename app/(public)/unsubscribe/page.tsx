import Link from "next/link";
import { APP_BASE_URL, UNSUBSCRIBE_SCOPE, suppressEmail, verifyUnsubscribeToken } from "@/lib/emailUnsubscribe";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const readParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function UnsubscribePage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : {};
  const status = readParam(resolved.status);
  const email = readParam(resolved.email).trim().toLowerCase();
  const token = readParam(resolved.token).trim();
  const scope = readParam(resolved.scope).trim() || UNSUBSCRIBE_SCOPE;

  let finalStatus = status;
  if (!finalStatus && email && token) {
    if (verifyUnsubscribeToken(email, token, scope)) {
      await suppressEmail(email, scope, "public_page");
      finalStatus = "success";
    } else {
      finalStatus = "invalid";
    }
  }

  const title =
    finalStatus === "success"
      ? "Te dimos de baja correctamente"
      : finalStatus === "invalid"
        ? "El enlace de baja no es valido"
        : "Gestionar correos de Proactivitis";

  const body =
    finalStatus === "success"
      ? `El correo ${email || "indicado"} ya no recibira correos no esenciales de Proactivitis. Los mensajes operativos de reservas, pagos o seguridad podrian seguir llegando cuando sean necesarios.`
      : finalStatus === "invalid"
        ? "No pudimos validar ese enlace de baja. Intenta usar el ultimo correo recibido o escribe a soporte para que gestionemos la suscripcion manualmente."
        : "Usa el enlace que enviamos en el correo para darte de baja de mensajes no esenciales.";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Proactivitis</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Volver al sitio
          </Link>
          <a
            href={`mailto:support@proactivitis.com?subject=${encodeURIComponent("Gestion de correos")}&body=${encodeURIComponent(
              `Necesito ayuda con mis preferencias de correo. Referencia: ${APP_BASE_URL}/unsubscribe`
            )}`}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </main>
  );
}
