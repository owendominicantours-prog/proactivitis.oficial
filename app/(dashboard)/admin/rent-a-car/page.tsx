import Image from "next/image";
import Link from "next/link";
import { getRentCarLocations, getRentCarOptions } from "@/data/rentCarFleet";

export const metadata = {
  title: "Rent a car | Admin Proactivitis"
};

export default function AdminRentCarPage() {
  const options = getRentCarOptions();
  const locations = getRentCarLocations();

  return (
    <main className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-700">Admin rent a car</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">Flota, zonas y precios publicados</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Por ahora la flota vive en <strong>data/rentCarFleet.ts</strong>. Ahi se editan zonas, modelos,
          imagenes, precios base y categorias. Esta pantalla sirve para revisar lo que ve el cliente y abrir
          rapidamente cada pagina publica.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-2xl font-black text-slate-950">{locations.length}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Zonas</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-2xl font-black text-emerald-700">{options.length}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Vehiculos</p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-4">
            <p className="text-2xl font-black text-sky-700">${Math.min(...options.map((option) => option.price))}</p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Desde</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="px-3 py-3">Vehiculo</th>
                <th className="px-3 py-3">Zona</th>
                <th className="px-3 py-3">Categoria</th>
                <th className="px-3 py-3">Precio</th>
                <th className="px-3 py-3">Imagen</th>
                <th className="px-3 py-3">Pagina</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option) => (
                <tr key={`${option.locationId}-${option.categorySlug}`} className="border-b border-slate-100">
                  <td className="px-3 py-3">
                    <p className="font-black text-slate-950">{option.model}</p>
                    <p className="text-xs font-semibold text-slate-500">{option.tag}</p>
                  </td>
                  <td className="px-3 py-3 font-bold text-slate-700">{option.locationName}</td>
                  <td className="px-3 py-3 font-bold text-slate-700">{option.categoryLabel}</td>
                  <td className="px-3 py-3 text-lg font-black text-emerald-700">${option.price}</td>
                  <td className="px-3 py-3">
                    <div className="relative h-14 w-24 rounded-xl bg-slate-50">
                      <Image src={option.image} alt={option.model} fill sizes="96px" className="object-contain p-2" />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={option.href}
                      className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
