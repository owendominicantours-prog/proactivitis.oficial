import Link from "next/link";
import { Mail, MessageCircle, Phone, Smartphone } from "lucide-react";

export const metadata = {
  title: "Contacto | Proactivitis — Global Support",
  description:
    "Asistencia profesional directa con nuestros correos oficiales, WhatsApp Business y atención telefónica 24/7. | Direct professional support with official emails, WhatsApp Business, and 24/7 phone availability."
};

const contactEmails = [
  { label: "E-mail General", value: "info@proactivitis.com" },
  { label: "Departamento de Reservas", value: "bookings@proactivitis.com" },
  { label: "Soporte a Proveedores", value: "suppliers@proactivitis.com" }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 lg:px-0">
        <section className="space-y-4 rounded-3xl bg-white p-10 shadow-xl">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Asistencia Global</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">Soporte profesional directo</h1>
          <p className="text-lg text-slate-600">
            Nuestro equipo de atención responde rápidamente por correo, WhatsApp Business y teléfono en el +1 (809) 394-9877.
            La línea está disponible 24/7 y mantenemos el formato internacional para que te ubicamos desde cualquier país.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <Phone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-slate-500">Línea de atención directa</p>
                <p className="text-xl font-semibold">+1 (809) 394-9877</p>
                <p className="text-sm text-slate-500">Formato internacional +1</p>
              </div>
            </div>
            <Link href="https://wa.me/18093949877" className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">WhatsApp Business</p>
                <p className="text-lg font-semibold text-slate-900">Chatea con nosotros 24/7</p>
              </div>
            </Link>
            <div className="space-y-3">
              {contactEmails.map((email) => (
                <div key={email.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{email.label}</p>
                    <p className="text-sm font-semibold text-slate-900">{email.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-slate-700" />
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-500">Formulario inteligente</p>
            </div>
            <form className="mt-6 space-y-4" method="POST" action="/api/contact">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Nombre</label>
                <input
                  name="name"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Ej. Ana Pérez"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="tú@correo.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Asunto</label>
                <select
                  name="subject"
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="" disabled>
                    Selecciona un motivo
                  </option>
                  <option value="Reserva">Reserva</option>
                  <option value="Proveedor">Proveedor</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-600">Mensaje</label>
                <textarea
                  name="message"
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  placeholder="Cuéntanos en detalle cómo podemos ayudarte."
                />
              </div>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-emerald-500"
              >
                Enviar consulta
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
