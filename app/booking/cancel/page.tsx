import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default function BookingCancelPage() {
  const isFunjet = SITE_CONFIG.variant === "funjet";
  const primaryColor = isFunjet ? "#6A0DAD" : "#0f172a";
  const accentColor = isFunjet ? "#FFC300" : "#10b981";

  return (
    <main className="min-h-screen bg-slate-50">
      <section
        className="border-b text-white"
        style={{
          background: isFunjet
            ? "linear-gradient(135deg,#4c0685 0%,#6A0DAD 45%,#8b2bd6 100%)"
            : "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)"
        }}
      >
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">Pago cancelado</p>
          <h1 className="mt-4 text-4xl font-black">{isFunjet ? "Reserva cancelada en Funjet" : "Pago cancelado"}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80">
            No se procesó el pago. Tu reserva no quedó confirmada y no se emitió ningún cargo final.
            Si quieres, puedes volver al checkout y completar la compra cuando estés listo.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
          <article className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Qué pasó</p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">La operación se detuvo antes de confirmar el pago</h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <li>No se creó un e-ticket.</li>
              <li>No se confirmó la fecha ni el cupo del servicio.</li>
              <li>Puedes volver a pagar usando el mismo producto cuando quieras.</li>
              <li>Si viste un error, también puedes escribirnos por WhatsApp y te ayudamos manualmente.</li>
            </ul>
          </article>

          <aside className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Siguiente paso</p>
            <div className="mt-4 space-y-3">
              <Link
                href="/tours"
                className="block rounded-full px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.25em] text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Volver a tours
              </Link>
              <Link
                href="/traslado"
                className="block rounded-full border px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.25em]"
                style={{ borderColor: accentColor, color: primaryColor, backgroundColor: "#fff" }}
              >
                Ver traslados
              </Link>
              <a
                href={SITE_CONFIG.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="block rounded-full px-5 py-3 text-center text-sm font-semibold uppercase tracking-[0.25em] text-slate-900"
                style={{ backgroundColor: accentColor }}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
