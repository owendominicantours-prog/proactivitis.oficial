"use server";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { addCountryAction, addDestinationAction } from "@/app/(dashboard)/admin/countries/actions";

type SearchParams = {
  q?: string;
};

type Props = {
  searchParams?: Promise<SearchParams>;
};

export default async function AdminCountriesPage({ searchParams }: Props) {
  const params = (searchParams ? await searchParams : undefined) ?? {};
  const query = (params.q ?? "").trim().toLowerCase();

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    include: { destinations: { orderBy: { name: "asc" } } }
  });

  const filtered = query
    ? countries.filter((country) =>
        [country.name, country.slug, country.code]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      )
    : countries;

  const destinationCount = countries.reduce((acc, country) => acc + country.destinations.length, 0);

  return (
    <div className="space-y-8 pb-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Geografia</p>
        <h1 className="text-3xl font-semibold text-slate-900">Paises y destinos</h1>
        <p className="text-sm text-slate-600">Base geografica para filtros, formularios y catalogo de tours.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-slate-500">Paises</p><p className="mt-2 text-3xl font-semibold text-slate-900">{countries.length}</p></article>
        <article className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-sky-700">Destinos</p><p className="mt-2 text-3xl font-semibold text-sky-900">{destinationCount}</p></article>
        <article className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm"><p className="text-xs uppercase tracking-[0.3em] text-indigo-700">Filtrados</p><p className="mt-2 text-3xl font-semibold text-indigo-900">{filtered.length}</p></article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col text-sm text-slate-600 md:col-span-2">
            Buscar pais
            <input name="q" defaultValue={params.q ?? ""} placeholder="Nombre, slug o codigo" className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Filtrar</button>
        </form>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agregar pais</h2>
          <form action={addCountryAction} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Nombre<input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <label className="block text-sm font-semibold text-slate-700">Slug<input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <label className="block text-sm font-semibold text-slate-700">Codigo ISO<input name="code" type="text" required maxLength={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm uppercase tracking-[0.3em]" /></label>
            <label className="block text-sm font-semibold text-slate-700">Descripcion corta<textarea name="shortDescription" rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Guardar pais</button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Agregar destino</h2>
          <form action={addDestinationAction} className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Pais<select name="countryId" defaultValue="" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm"><option value="" disabled>Selecciona</option>{countries.map((country) => (<option key={country.id} value={country.id}>{country.name}</option>))}</select></label>
            <label className="block text-sm font-semibold text-slate-700">Nombre<input name="name" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <label className="block text-sm font-semibold text-slate-700">Slug<input name="slug" type="text" required className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" /></label>
            <button type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Guardar destino</button>
          </form>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Listado de paises ({filtered.length})</h2>
          <Link href="/tours" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 hover:underline">Ver tours</Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((country) => (
            <article key={country.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{country.slug}</p>
                  <h3 className="text-lg font-semibold text-slate-900">{country.name}</h3>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">{country.code}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{country.shortDescription ?? "Sin descripcion"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {country.destinations.length ? country.destinations.map((destination) => (
                  <span key={destination.id} className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">{destination.name}</span>
                )) : <span className="text-xs text-slate-500">Sin destinos</span>}
              </div>
            </article>
          ))}
          {!filtered.length && <p className="text-sm text-slate-500">No hay paises para este filtro.</p>}
        </div>
      </section>
    </div>
  );
}
