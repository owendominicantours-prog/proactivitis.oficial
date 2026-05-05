import PartnerRequestForm from "@/components/public/PartnerRequestForm";

export const metadata = {
  title: "Publica tu hotel, apartamento o villa | Proactivitis",
  description:
    "Registra alojamientos en Proactivitis: hoteles, apartamentos, villas y casas vacacionales con revision humana y conexion a traslados y tours."
};

const propertyTracks = [
  {
    title: "Hoteles y resorts",
    body: "Ficha con habitaciones, politicas, servicios, ubicacion, cotizacion y paquetes con traslado."
  },
  {
    title: "Apartamentos",
    body: "Unidades independientes, aparta-hoteles y estancias por noche con reglas claras y disponibilidad revisada."
  },
  {
    title: "Casas vacacionales y villas",
    body: "Propiedades privadas para familias, grupos y viajes premium con capacidad, deposito y reglas de casa."
  }
];

const platformBenefits = [
  {
    title: "Pagina publica con SEO de hotel",
    body: "Ficha preparada con galeria, schema Hotel, servicios, politicas, mapa y contenido comercial."
  },
  {
    title: "Venta cruzada automatica",
    body: "El alojamiento se conecta con traslados privados desde aeropuerto y tours cercanos cuando aplica."
  },
  {
    title: "Cotizacion asistida",
    body: "Proactivitis filtra solicitudes, confirma datos y ayuda a convertir interesados en reservas reales."
  },
  {
    title: "Control por revision humana",
    body: "No publicamos inventario sensible sin validar fotos, tarifas, reglas y contacto operativo."
  }
];

const readinessChecklist = [
  "Fotos propias o con permiso comercial",
  "Precio base o rango por temporada",
  "Politicas claras de deposito y cancelacion",
  "Ubicacion verificable en mapa",
  "Contacto operativo por WhatsApp o email"
];

export default function HospitalityPartnersPage() {
  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-emerald-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[1fr_0.85fr] lg:items-start">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm md:p-9">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Hospitality partners</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Publica tu hotel, apartamento o casa vacacional en Proactivitis
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Creamos un flujo separado para alojamientos. Cuando aplicas como hotel, apartamento o villa, el equipo revisa
              tu propiedad con criterios de hospitalidad y la conecta con cotizacion, traslado, tours y soporte local.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#hospitality-form"
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Registrar alojamiento
              </a>
              <a
                href="/hoteles"
                className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
              >
                Ver pagina de hoteles
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {propertyTracks.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>

          <section className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">Como se activa</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                ["1", "Aplicacion", "Envias empresa, tipo de propiedad y datos operativos."],
                ["2", "Revision", "Validamos ubicacion, fotos, reglas, tarifas y contacto."],
                ["3", "Publicacion", "Activamos ficha publica y panel de alojamientos si aplica."]
              ].map(([step, title, body]) => (
                <div key={step} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="text-2xl font-semibold text-emerald-300">{step}</p>
                  <h3 className="mt-2 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {platformBenefits.map((item) => (
              <article key={item.title} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">Sistema Proactivitis</p>
                <h2 className="mt-2 text-lg font-semibold text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-800">Antes de publicar</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Lo que revisamos para activar un alojamiento</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {readinessChecklist.map((item) => (
                <div key={item} className="rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>

        <PartnerRequestForm
          id="hospitality-form"
          role="SUPPLIER"
          subtitle="Selecciona Hospitality y explica si eres hotel, apartamento o casa vacacional."
        />
      </div>
    </div>
  );
}
